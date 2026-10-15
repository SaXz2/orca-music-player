import type { MusicTrack } from "../types/music";
import { parseTrackFromBlock } from "./musicParser";

/**
 * 扫描虎鲸笔记库中所有带「音乐」、「bgm」、「网易云」标签或符合音乐 URL 特征的块
 */
export async function loadTracksFromLibrary(): Promise<MusicTrack[]> {
  const tracks: MusicTrack[] = [];
  const seenUrls = new Set<string>();

  try {
    // 1. 查询带 #音乐、#music、#bgm 等标签的块
    const taggedBlocks: Array<{ id: number; text?: string }> =
      (await orca.invokeBackend("get-blocks-with-tags", ["音乐"])) ?? [];

    for (const b of taggedBlocks) {
      const track = parseTrackFromBlock(b);
      if (track && !seenUrls.has(track.url)) {
        seenUrls.add(track.url);
        tracks.push(track);
      }
    }

    // 2. 补充查询可能带其他音乐标签或包含主流音乐域名的块
    const otherTagged: Array<{ id: number; text?: string }> =
      (await orca.invokeBackend("get-blocks-with-tags", ["music"])) ?? [];

    for (const b of otherTagged) {
      const track = parseTrackFromBlock(b);
      if (track && !seenUrls.has(track.url)) {
        seenUrls.add(track.url);
        tracks.push(track);
      }
    }
  } catch (err) {
    console.error("[orca-music-player] loadTracksFromLibrary error:", err);
  }

  return tracks;
}
