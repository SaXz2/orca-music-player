import type { MusicTrack } from "../types/music";

/**
 * 从文本中提取标准 Markdown 链接 [title](url)
 */
export function extractMarkdownLink(text: string): { title?: string; url: string } | null {
  const linkPattern = /\[([^\]]*)\]\((https?:\/\/[^\)\s]+)\)/;
  const match = linkPattern.exec(text);
  if (match) {
    return {
      title: match[1].trim() || undefined,
      url: match[2].trim(),
    };
  }

  // 裸 URL
  const barePattern = /(https?:\/\/[^\s\)\],，;；"]+)/;
  const bareMatch = barePattern.exec(text);
  if (bareMatch) {
    return {
      url: bareMatch[1].trim(),
    };
  }

  return null;
}

/**
 * 根据 URL 转换为对应平台的免广告无障碍内嵌音视频播放地址
 */
export function getEmbedUrl(url: string): { embedUrl: string; platform: MusicTrack["platform"] } | null {
  // 1. 网易云音乐 (music.163.com/song?id=xxx)
  const ncmMatch = /id=(\d+)/.exec(url);
  if (/music\.163\.com/i.test(url) && ncmMatch) {
    return {
      embedUrl: `https://music.163.com/outchain/player?type=2&id=${ncmMatch[1]}&auto=1&height=66`,
      platform: "ncm",
    };
  }

  // 2. 哔哩哔哩 (bilibili.com/video/BVxxx)
  const bvidMatch = /(BV[a-zA-Z0-9]+)/i.exec(url);
  if (/bilibili\.com/i.test(url) && bvidMatch) {
    return {
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bvidMatch[1]}&autoplay=1&muted=0&page=1&high_quality=1`,
      platform: "bilibili",
    };
  }

  // 3. YouTube (youtube.com/watch?v=xxx 或 youtu.be/xxx)
  const ytMatch = /(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/.exec(url);
  if ((/youtube\.com/i.test(url) || /youtu\.be/i.test(url)) && ytMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      platform: "youtube",
    };
  }

  return null;
}

/**
 * 判断一个文本或块是否符合音乐条目要求
 */
export function parseTrackFromBlock(block: { id: number; text?: string }): MusicTrack | null {
  const text = block.text ?? "";
  if (!text) return null;

  const link = extractMarkdownLink(text);
  if (!link) return null;

  const embedInfo = getEmbedUrl(link.url);
  if (!embedInfo) return null;

  let title = link.title;
  if (!title) {
    // 尝试清理出纯标题
    const clean = text
      .replace(/https?:\/\/[^\s\)\],，;；"]+/g, "")
      .replace(/\[|\]|\(|\)/g, "")
      .replace(/#[^\s,#，]+/g, "")
      .replace(/[,，;；\s]+/g, " ")
      .trim();
    title = clean || link.url;
  }

  return {
    id: block.id,
    title,
    url: link.url,
    platform: embedInfo.platform,
    embedUrl: embedInfo.embedUrl,
    sourceText: text,
  };
}
