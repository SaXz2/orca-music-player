import { proxy } from "valtio";
import type { PlayerState } from "../types/music";

export const playerStore = proxy<PlayerState>({
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  mode: "order",
  isExpanded: false,
  isPlaylistOpen: false,
});

export const playerActions = {
  setPlaylist(tracks: PlayerState["playlist"]) {
    playerStore.playlist = tracks;
  },

  play(index?: number) {
    if (typeof index === "number") {
      if (index >= 0 && index < playerStore.playlist.length) {
        playerStore.currentIndex = index;
      }
    }
    playerStore.isPlaying = true;
  },

  pause() {
    playerStore.isPlaying = false;
  },

  togglePlay() {
    if (playerStore.isPlaying) {
      playerStore.isPlaying = false;
    } else {
      if (playerStore.playlist.length > 0) {
        playerStore.isPlaying = true;
      }
    }
  },

  next() {
    if (!playerStore.playlist.length) return;
    if (playerStore.mode === "random") {
      let nextIdx = Math.floor(Math.random() * playerStore.playlist.length);
      if (playerStore.playlist.length > 1 && nextIdx === playerStore.currentIndex) {
        nextIdx = (nextIdx + 1) % playerStore.playlist.length;
      }
      playerStore.currentIndex = nextIdx;
    } else {
      playerStore.currentIndex = (playerStore.currentIndex + 1) % playerStore.playlist.length;
    }
    playerStore.isPlaying = true;
  },

  prev() {
    if (!playerStore.playlist.length) return;
    playerStore.currentIndex =
      (playerStore.currentIndex - 1 + playerStore.playlist.length) % playerStore.playlist.length;
    playerStore.isPlaying = true;
  },

  toggleMode() {
    if (playerStore.mode === "order") {
      playerStore.mode = "random";
    } else if (playerStore.mode === "random") {
      playerStore.mode = "single";
    } else {
      playerStore.mode = "order";
    }
  },

  toggleExpanded() {
    playerStore.isExpanded = !playerStore.isExpanded;
  },

  togglePlaylistOpen() {
    playerStore.isPlaylistOpen = !playerStore.isPlaylistOpen;
  },
};
