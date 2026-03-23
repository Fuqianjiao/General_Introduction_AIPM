"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 全站背景音乐（Prosecco - Patrik Jean）
 *
 * - **默认**：同源 `/audio/prosecco.mp3`（文件放在 `public/audio/` 并提交到 Git，部署后与站点同域，利于缓存、少卡顿）。
 * - **可选**：`NEXT_PUBLIC_AUDIO_SRC` 设为绝对 URL（如 GitHub raw / jsDelivr 指向仓库内 `prosecco.mp3`），用于固定 CDN 地址。
 * - **仅 MP3 单源**：`<audio>` 只设一个 `src`，与 `NEXT_PUBLIC_AUDIO_SRC` 一致，避免多格式/错误地址带来的额外请求与解码卡顿。
 *
 * 进入页面会尝试自动播放；若被浏览器拦截，点喇叭或面板内「开始播放」。
 */
const DEFAULT_AUDIO_PATH = "/audio/prosecco.mp3";

/** 缓冲足够再播，减少刚开播时的断续（同源 MP3 + preload 后通常很快 resolve） */
function waitUntilPlayable(el: HTMLAudioElement): Promise<void> {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      el.removeEventListener("canplay", done);
      el.removeEventListener("canplaythrough", done);
      resolve();
    };
    el.addEventListener("canplay", done);
    el.addEventListener("canplaythrough", done);
    window.setTimeout(done, 15_000);
  });
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [open, setOpen] = useState(false);
  /** 音频文件 404 或解码失败（仓库需自带 public/audio/prosecco.mp3） */
  const [loadError, setLoadError] = useState(false);

  const audioSrc = useMemo(() => {
    const fromEnv = process.env.NEXT_PUBLIC_AUDIO_SRC?.trim();
    if (fromEnv) return fromEnv;
    return DEFAULT_AUDIO_PATH;
  }, []);

  const isExternalSrc = useMemo(
    () => audioSrc.startsWith("http://") || audioSrc.startsWith("https://"),
    [audioSrc],
  );

  const tryPlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      await waitUntilPlayable(el);
      el.volume = volume;
      el.muted = muted;
      await el.play();
      setPlaying(true);
      setBlocked(false);
    } catch {
      setBlocked(true);
      setPlaying(false);
    }
  }, [muted, volume]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void (async () => {
        const el = audioRef.current;
        if (!el) return;
        try {
          await waitUntilPlayable(el);
          el.volume = 0.35;
          el.muted = false;
          await el.play();
          setPlaying(true);
          setBlocked(false);
        } catch {
          setBlocked(true);
          setPlaying(false);
        }
      })();
    }, 400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const root = document.getElementById("bg-music-root");
      if (root && !root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  const toggleMute = () => {
    setMuted((m) => !m);
    if (audioRef.current) audioRef.current.muted = !muted;
    if (!playing) void tryPlay();
  };

  const onVolumeChange = (v: number) => {
    setVolume(v);
    if (v === 0) setMuted(true);
    else if (muted) setMuted(false);
    if (!playing) void tryPlay();
  };

  return (
    <>
      <audio
        ref={audioRef}
        key={audioSrc}
        src={audioSrc}
        loop
        preload="auto"
        playsInline
        crossOrigin={isExternalSrc ? "anonymous" : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setLoadError(true);
          setBlocked(true);
          setPlaying(false);
        }}
      />

      <div
        id="bg-music-root"
        style={{
          position: "fixed",
          left: 20,
          bottom: 28,
          zIndex: 250,
          fontFamily: "'Noto Sans SC', system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="背景音乐"
          title="背景音乐"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "1px solid rgba(0,229,255,0.35)",
            background: loadError
              ? "rgba(248,113,113,0.1)"
              : blocked
                ? "rgba(240,160,64,0.12)"
                : "rgba(0,229,255,0.08)",
            boxShadow: loadError
              ? "0 0 14px rgba(248,113,113,0.25)"
              : blocked
                ? "0 0 16px rgba(240,160,64,0.25)"
                : "0 0 14px rgba(0,229,255,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: loadError ? "#f87171" : blocked ? "#f0a040" : muted ? "#7a8090" : "#7df4ff",
            transition: "all 0.2s",
          }}
        >
          {muted || blocked ? <SpeakerMutedIcon /> : <SpeakerIcon />}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 52,
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(13,15,20,0.95)",
              border: "1px solid rgba(0,229,255,0.22)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
              minWidth: 220,
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              背景音乐 · Prosecco
            </div>

            {(blocked || loadError) && (
              <p
                style={{
                  fontSize: 11,
                  color: loadError ? "rgba(248,113,113,0.95)" : "rgba(240,160,64,0.95)",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                {loadError
                  ? `无法加载音频：请确认 ${audioSrc === DEFAULT_AUDIO_PATH ? "public/audio/prosecco.mp3 已提交到仓库" : "NEXT_PUBLIC_AUDIO_SRC 地址可访问（需支持 CORS）"}。`
                  : "浏览器拦截了自动播放，请先点下面「开始播放」。"}
              </p>
            )}

            {blocked && !loadError && (
              <button
                type="button"
                onClick={() => void tryPlay()}
                style={{
                  width: "100%",
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #7b61ff, #00e5ff)",
                  color: "#0a0c10",
                }}
              >
                开始播放
              </button>
            )}

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                }}
              >
                音量
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#00e5ff", height: 4 }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'Space Mono',monospace",
                    color: "#7df4ff",
                    width: 38,
                    textAlign: "right",
                  }}
                >
                  {Math.round((muted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMute}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "#c8cacc",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {muted ? "取消静音" : "静音"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.54 8.46a5 5 0 010 7.07M17.66 6.34a8 8 0 010 11.32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerMutedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9l5 5M21 9l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
