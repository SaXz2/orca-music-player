import React from "react";
import { useSnapshot } from "valtio";
import { playerStore, playerActions } from "../store/playerStore";
import type { MusicTrack, PlayMode } from "../types/music";

const modeIcons: Record<PlayMode, string> = {
  order: "🔁 顺序",
  random: "🔀 随机",
  single: "🔂 单曲",
};

export const FloatingPlayer: React.FC = () => {
  const snap = useSnapshot(playerStore);

  const currentTrack = (snap.playlist as MusicTrack[])[snap.currentIndex];

  return (
    <>
      {/* 1. 常驻悬浮底栏（胶囊模式） */}
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

      {/* 2. 展开的播放器主面板 */}
      {snap.isExpanded && (
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
              ✕
            </button>
          </div>

          <div className="omp-controls">
            <button
              className="omp-btn"
              type="button"
              onClick={() => playerActions.toggleMode()}
              title="切换播放模式"
            >
              {modeIcons[snap.mode as PlayMode] || "🔁 顺序"}
            </button>
            <button
              className="omp-btn"
              type="button"
              onClick={() => playerActions.prev()}
              title="上一首"
            >
              ⏮ 上一首
            </button>
            <button
              className="omp-btn omp-btn--primary"
              type="button"
              onClick={() => playerActions.togglePlay()}
              title={snap.isPlaying ? "暂停" : "播放"}
            >
              {snap.isPlaying ? "⏸ 暂停" : "▶ 播放"}
            </button>
            <button
              className="omp-btn"
              type="button"
              onClick={() => playerActions.next()}
              title="下一首"
            >
              下一首 ⏭
            </button>
            <button
              className="omp-btn"
              type="button"
              onClick={() => playerActions.togglePlaylistOpen()}
              title="展开/收起歌曲清单"
            >
              📜 歌单 ({snap.playlist.length})
            </button>
          </div>

          {/* 歌单列表 */}
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
                <div className="omp-empty">未发现带 #音乐 标签的笔记条目</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. 音频/视频真实嵌入视口：始终常驻在 DOM 中，保证切换折叠/展开时不销毁 iframe 导致断音 */}
      <div
        className="omp-viewport-host"
        style={{
          display: snap.isPlaying && currentTrack ? "block" : "none",
        }}
      >
        {currentTrack && (
          <iframe
            key={currentTrack.embedUrl}
            src={currentTrack.embedUrl}
            allow="autoplay; encrypted-media; picture-in-picture"
            title={currentTrack.title}
            onError={() => playerActions.next()}
          />
        )}
      </div>
    </>
  );
};
