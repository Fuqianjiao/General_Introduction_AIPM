// app/layout.tsx
import type { Metadata } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import { CopilotProviders } from "@/components/CopilotProviders";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "傅倩娇 · AI产品经理",
  description: "2年AI产品经验，擅长用AI工具链解决真实问题，自建多Agent系统并推动项目落地",
};

const BGM_PRELOAD_HREF =
  process.env.NEXT_PUBLIC_AUDIO_SRC?.trim() || "/audio/prosecco.mp3";
const BGM_PRELOAD_CROSS_ORIGIN = BGM_PRELOAD_HREF.startsWith("http")
  ? ("anonymous" as const)
  : undefined;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preload"
          href={BGM_PRELOAD_HREF}
          as="audio"
          type="audio/mpeg"
          {...(BGM_PRELOAD_CROSS_ORIGIN
            ? { crossOrigin: BGM_PRELOAD_CROSS_ORIGIN }
            : {})}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BackgroundMusic />
        <CopilotProviders>{children}</CopilotProviders>
      </body>
    </html>
  );
}
