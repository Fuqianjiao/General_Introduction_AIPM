"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 全站背景音乐（Prosecco - Patrik Jean · FLAC）
 * 进入页面会尝试自动播放；若被浏览器拦截，点喇叭或面板内「开始播放」。
 */
export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [open, setOpen] = useState(false);

  const tryPlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
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
        src="/audio/prosecco.flac"
        loop
        preload="auto"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
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
            background: blocked ? "rgba(240,160,64,0.12)" : "rgba(0,229,255,0.08)",
            boxShadow: blocked
              ? "0 0 16px rgba(240,160,64,0.25)"
              : "0 0 14px rgba(0,229,255,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: blocked ? "#f0a040" : muted ? "#7a8090" : "#7df4ff",
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

            {blocked && (
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(240,160,64,0.95)",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                浏览器拦截了自动播放，请先点下面「开始播放」。
              </p>
            )}

            {blocked && (
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
