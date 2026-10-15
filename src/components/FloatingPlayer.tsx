import React from "react";
import { useSnapshot } from "valtio";
import { playerStore, playerActions } from "../store/playerStore";
import type { MusicTrack, PlayMode } from "../types/music";

const modeIcons: Record<PlayMode, string> = {
  order: "🔁",
  random: "🔀",
  single: "🔂",
};

export const FloatingPlayer: React.FC = () => {
  const snap = useSnapshot(playerStore);

  const currentTrack = (snap.playlist as MusicTrack[])[snap.currentIndex];

  if (!snap.isExpanded) {
    return (
      <div
        className="omp-floating-bar"
        onClick={() => playerActions.toggleExpanded()}
        title="点击展开音乐播放器"
      >
        <div className={`omp-disc ${snap.isPlaying ? "omp-disc--spin" : ""}`}>
          🎵
        </div>
        <div className="omp-floating-title">
          {currentTrack ? currentTrack.title : "暂无播放音乐"}
        </div>
        <button
          className="omp-btn omp-btn--sm"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playerActions.togglePlay();
          }}
        >
          {snap.isPlaying ? "⏸" : "▶"}
        </button>
      </div>
    );
  }

  return (
    <div className="omp-panel-container">
      <div className="omp-header">
        <div className="omp-header__info">
          <div className="omp-title" title={currentTrack?.title || "未播放"}>
            {currentTrack ? currentTrack.title : "虎鲸音乐播放器"}
          </div>
          <div className="omp-meta">
            {currentTrack
              ? `[${currentTrack.platform.toUpperCase()}] ${snap.currentIndex + 1}/${snap.playlist.length}`
              : "准备就绪"}
          </div>
        </div>
        <button
          className="omp-btn omp-btn--icon"
          type="button"
          onClick={() => playerActions.toggleExpanded()}
          title="最小化"
        >
          ─
        </button>
      </div>

      <div className="omp-controls">
        <button
          className="omp-btn"
          type="button"
          onClick={() => playerActions.toggleMode()}
          title="切换播放模式"
        >
          {modeIcons[snap.mode as PlayMode] || "🔁"}
        </button>
        <button
          className="omp-btn"
          type="button"
          onClick={() => playerActions.prev()}
          title="上一首"
        >
          ⏮
        </button>
        <button
          className="omp-btn omp-btn--primary"
          type="button"
          onClick={() => playerActions.togglePlay()}
          title={snap.isPlaying ? "暂停" : "播放"}
        >
          {snap.isPlaying ? "⏸" : "▶"}
        </button>
        <button
          className="omp-btn"
          type="button"
          onClick={() => playerActions.next()}
          title="下一首"
        >
          ⏭
        </button>
        <button
          className="omp-btn"
          type="button"
          onClick={() => playerActions.togglePlaylistOpen()}
          title="歌单列表"
        >
          📜 ({snap.playlist.length})
        </button>
      </div>

      {/* 音频/视频真实嵌入播放视口 */}
      <div className="omp-viewport">
        {snap.isPlaying && currentTrack ? (
          <iframe
            key={currentTrack.embedUrl}
            src={currentTrack.embedUrl}
            allow="autoplay; encrypted-media; picture-in-picture"
            title={currentTrack.title}
            onError={() => playerActions.next()}
          />
        ) : (
          <div className="omp-placeholder">音乐已暂停</div>
        )}
      </div>

      {snap.isPlaylistOpen && (
        <div className="omp-playlist">
          {(snap.playlist as MusicTrack[]).map((track: MusicTrack, idx: number) => (
            <div
              key={`${track.id}-${track.url}`}
              className={`omp-playlist__item ${idx === snap.currentIndex ? "omp-playlist__item--active" : ""}`}
              onClick={() => playerActions.play(idx)}
            >
              <div className="omp-playlist__item-title">{track.title}</div>
              <div className="omp-playlist__item-tag">{track.platform}</div>
            </div>
          ))}
          {snap.playlist.length === 0 && (
            <div className="omp-empty">未发现带音乐标签的笔记条目</div>
          )}
        </div>
      )}
    </div>
  );
};
