/**
 * 音乐条目与解析器类型定义
 */

export interface MusicTrack {
  id: number;
  title: string;
  url: string;
  platform: "ncm" | "bilibili" | "youtube" | "other";
  embedUrl: string;
  sourceText?: string;
}

export type PlayMode = "order" | "random" | "single";

export interface PlayerState {
  playlist: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  mode: PlayMode;
  isExpanded: boolean;
  isPlaylistOpen: boolean;
}
