import React from "react";
import ReactDOM from "react-dom/client";
import { setupL10N, t } from "./libs/l10n";
import zhCN from "./translations/zhCN";
import { loadTracksFromLibrary } from "./services/libraryService";
import { playerActions } from "./store/playerStore";
import { FloatingPlayer } from "./components/FloatingPlayer";
import "./styles/player.css";

let pluginName: string;
let rootElement: HTMLElement | null = null;
let reactRoot: ReactDOM.Root | null = null;

export async function load(_name: string) {
  pluginName = _name;
  setupL10N(orca.state.locale, { "zh-CN": zhCN });

  console.log(`[${pluginName}] 加载中...`);

  // 1. 扫描库中带有音乐标签的块，填充歌单
  try {
    const tracks = await loadTracksFromLibrary();
    playerActions.setPlaylist(tracks);
    console.log(`[${pluginName}] 已解析加载 ${tracks.length} 首音乐`);
  } catch (err) {
    console.warn(`[${pluginName}] 扫描音乐库出错:`, err);
  }

  // 2. 注册顶部栏快捷按钮：一键切换显示/隐藏播放器面板
  try {
    orca.headbar.registerHeadbarButton(`${pluginName}.toggleBtn`, () => (
      <orca.components.Button
        variant="plain"
        onClick={() => playerActions.toggleExpanded()}
        title={t("音乐播放器")}
      >
        <i className="ti ti-music" />
      </orca.components.Button>
    ));
  } catch (err) {
    console.warn(`[${pluginName}] 注册 HeadbarButton 出错:`, err);
  }

  // 3. 挂载常驻浮动播放器 DOM
  try {
    rootElement = document.createElement("div");
    rootElement.id = "orca-music-player-root";
    document.body.appendChild(rootElement);
    reactRoot = ReactDOM.createRoot(rootElement);
    reactRoot.render(<FloatingPlayer />);
  } catch (err) {
    console.error(`[${pluginName}] 挂载浮动播放器出错:`, err);
  }

  // 4. 注册命令与快捷键
  try {
    orca.commands.registerCommand(
      `${pluginName}.togglePlay`,
      () => playerActions.togglePlay(),
      "音乐: 播放/暂停"
    );
    orca.commands.registerCommand(
      `${pluginName}.nextTrack`,
      () => playerActions.next(),
      "音乐: 下一首"
    );
    orca.commands.registerCommand(
      `${pluginName}.prevTrack`,
      () => playerActions.prev(),
      "音乐: 上一首"
    );
  } catch (err) {
    console.warn(`[${pluginName}] 注册命令出错:`, err);
  }

  console.log(`${pluginName} loaded.`);
}

export async function unload() {
  console.log(`[${pluginName}] 卸载中...`);

  // 1. 卸载顶部按钮
  try {
    orca.headbar.unregisterHeadbarButton(`${pluginName}.toggleBtn`);
  } catch (e) {
    // ignore
  }

  // 2. 卸载命令
  try {
    orca.commands.unregisterCommand(`${pluginName}.togglePlay`);
    orca.commands.unregisterCommand(`${pluginName}.nextTrack`);
    orca.commands.unregisterCommand(`${pluginName}.prevTrack`);
  } catch (e) {
    // ignore
  }

  // 3. 卸载并清理 DOM
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (rootElement && rootElement.parentElement) {
    rootElement.parentElement.removeChild(rootElement);
    rootElement = null;
  }
}
