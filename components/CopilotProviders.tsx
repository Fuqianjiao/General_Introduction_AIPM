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
 */
export function CopilotProviders({ children }: { children: ReactNode }) {
  /** 浏览器覆盖；null = 交给服务端环境变量 */
  const [overrideKey, setOverrideKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SILICONFLOW_USER_KEY_STORAGE)?.trim();
      setOverrideKey(raw || null);
    } catch {
      /* private 模式等 */
    }
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
    () => ({ userApiKey: overrideKey, setUserApiKey }),
    [overrideKey, setUserApiKey],
  );

  return (
    <SiliconflowKeyContext.Provider value={ctx}>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        enableInspector={false}
        headers={headers}
      >
        {children}
      </CopilotKit>
    </SiliconflowKeyContext.Provider>
  );
}
