# 背景音乐文件

组件默认请求同源 **`/audio/prosecco.mp3`**（仅此一条，避免多格式切换导致卡顿）。

1. 将 **`prosecco.mp3`** 放在本目录并 **提交到 Git**，部署后由站点直接提供，稳定省流量。
2. 可选：在 `.env.local` 设置 `NEXT_PUBLIC_AUDIO_SRC` 为绝对地址（如 jsDelivr / GitHub raw 指向仓库里的同一文件），需该地址允许跨域播放。

本地可从 FLAC 转 MP3：

```bash
ffmpeg -i prosecco.flac -q:a 2 public/audio/prosecco.mp3
```
