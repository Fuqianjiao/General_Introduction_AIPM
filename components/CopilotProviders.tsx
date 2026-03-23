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
import {
  SILICONFLOW_API_KEY_HEADER,
  SILICONFLOW_DEFAULT_API_KEY,
  SILICONFLOW_USER_KEY_STORAGE,
} from "@/lib/siliconflow-defaults";

type Ctx = {
  /**
   * 用户在「API」里保存的 Key；null 表示未覆盖，请求头仍会自动带站点内置默认 Key。
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
 * 进页即绑定：Copilot 所有请求默认携带 x-siliconflow-api-key（内置 Key 或与 localStorage 覆盖值）。
 * 未登录用户也会带上内置 Key（注意用量与公开仓库风险）。
 */
export function CopilotProviders({ children }: { children: ReactNode }) {
  /** 仅表示用户是否在本地覆盖 Key；null = 用内置默认 */
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
    const pub = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY?.trim();
    const effective =
      overrideKey?.trim() ||
      pub ||
      SILICONFLOW_DEFAULT_API_KEY.trim();
    if (!effective) return {};
    return { [SILICONFLOW_API_KEY_HEADER]: effective };
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
