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
  SILICONFLOW_USER_KEY_STORAGE,
} from "@/lib/siliconflow-defaults";

type Ctx = {
  /** 用户自填 Key；null 表示用服务端默认 / .env */
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

/** 可选：AiBot 在 Provider 外时降级 */
export function useSiliconflowUserKeyOptional(): Ctx | null {
  return useContext(SiliconflowKeyContext);
}

export function CopilotProviders({ children }: { children: ReactNode }) {
  const [userApiKey, setUserKeyState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SILICONFLOW_USER_KEY_STORAGE)?.trim();
      setUserKeyState(raw || null);
    } catch {
      /* private模式等 */
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
    setUserKeyState(trimmed);
  }, []);

  const headers = useMemo(() => {
    if (!userApiKey) return {};
    return { [SILICONFLOW_API_KEY_HEADER]: userApiKey };
  }, [userApiKey]);

  const ctx = useMemo(
    () => ({ userApiKey, setUserApiKey }),
    [userApiKey, setUserApiKey],
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
