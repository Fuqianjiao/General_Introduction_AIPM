"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { SILICONFLOW_API_KEY_HEADER, SILICONFLOW_USER_KEY_STORAGE } from "@/lib/siliconflow-defaults";

type Ctx = {
  /**
   * 用户在「API」里保存的 Key；null 表示使用服务端环境变量 SILICONFLOW_API_KEY（.env.local / Vercel），不在浏览器暴露。
   */
  userApiKey: string | null;
  setUserApiKey: (key: string | null) => void;
  /**
   * GET /api/copilotkit：服务端是否已有可用 Key（环境变量或代码兜底）。
   * null 表示尚未拉取完成。
   */
  serverKeyConfigured: boolean | null;
};

const SiliconflowKeyContext = createContext<Ctx | null>(null);

export function useSiliconflowUserKey(): Ctx {
  const v = useContext(SiliconflowKeyContext);
  if (!v) {
    throw new Error("useSiliconflowUserKey must be used under CopilotProviders");
  }
  return v;
}

export function useSiliconflowUserKeyOptional(): Ctx | null {
  return useContext(SiliconflowKeyContext);
}

/**
 * 默认不往浏览器塞 Key：请求 /api/copilotkit 时不带头，服务端用 SILICONFLOW_API_KEY（本地 .env.local、Vercel 环境变量）。
 * 仅在用户在「API」面板保存 Key 时带头（localStorage），方便自带 Key 的高级用户。
 *
 * `showDevConsole` 须显式为 false：CopilotKit 在未传该属性时会在 localhost 上默认开启开发台，
 * 任何底层 SyntaxError（如 JSON 解析）都会以红色横幅弹出「Unexpected end of JSON input」。
 */
export function CopilotProviders({ children }: { children: ReactNode }) {
  /** 浏览器覆盖；null = 交给服务端环境变量 */
  const [overrideKey, setOverrideKey] = useState<string | null>(null);
  const [serverKeyConfigured, setServerKeyConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SILICONFLOW_USER_KEY_STORAGE)?.trim();
      setOverrideKey(raw || null);
    } catch {
      /* private 模式等 */
    }
  }, []);

  /** 若某次 GraphQL 返回 Content-Length: 0，urql 解析会抛 SyntaxError；补成合法 JSON，且不消费流式正文 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const orig = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await orig(input, init);
      const url =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : String(input);
      if (!url.includes("/api/copilotkit")) return res;
      if (res.ok && res.headers.get("content-length") === "0") {
        return new Response(JSON.stringify({ errors: [{ message: "Empty runtime response" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return res;
    };
    return () => {
      window.fetch = orig;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/copilotkit")
      .then(async (r) => {
        if (!r.ok) return null;
        const text = await r.text();
        const trimmed = text.trim();
        if (!trimmed) return null;
        try {
          return JSON.parse(trimmed) as { serverKeyConfigured?: boolean };
        } catch {
          return null;
        }
      })
      .then((j: { serverKeyConfigured?: boolean } | null) => {
        if (cancelled || !j || typeof j.serverKeyConfigured !== "boolean") return;
        setServerKeyConfigured(j.serverKeyConfigured);
      })
      .catch(() => {
        if (!cancelled) setServerKeyConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUserApiKey = useCallback((key: string | null) => {
    const trimmed = key?.trim() || null;
    try {
      if (trimmed) localStorage.setItem(SILICONFLOW_USER_KEY_STORAGE, trimmed);
      else localStorage.removeItem(SILICONFLOW_USER_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setOverrideKey(trimmed);
  }, []);

  const headers = useMemo(() => {
    const fromPanel = overrideKey?.trim();
    if (fromPanel) return { [SILICONFLOW_API_KEY_HEADER]: fromPanel };
    /** 可选：构建时注入，会打进前端包，仅自用/调试 */
    const pub = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY?.trim();
    if (pub) return { [SILICONFLOW_API_KEY_HEADER]: pub };
    return {};
  }, [overrideKey]);

  const ctx = useMemo(
    () => ({
      userApiKey: overrideKey,
      setUserApiKey,
      serverKeyConfigured,
    }),
    [overrideKey, setUserApiKey, serverKeyConfigured],
  );

  return (
    <SiliconflowKeyContext.Provider value={ctx}>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        enableInspector={false}
        showDevConsole={false}
        headers={headers}
      >
        {children}
      </CopilotKit>
    </SiliconflowKeyContext.Provider>
  );
}
