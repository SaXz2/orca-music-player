import React from "react";
import { setupL10N, t } from "./libs/l10n";
import zhCN from "./translations/zhCN";
import { loadTracksFromLibrary } from "./services/libraryService";
import { playerActions } from "./store/playerStore";
import { FloatingPlayer } from "./components/FloatingPlayer";

let pluginName: string;
let rootElement: HTMLElement | null = null;
let rootInstance: any = null;

function mountFloatingPlayer(): void {
  if (rootInstance != null) return;

  const createRootFn = (window as any).createRoot;
  if (typeof createRootFn !== "function") {
    console.warn(`[${pluginName}] window.createRoot 尚未就绪，100ms 后重试...`);
    window.setTimeout(() => mountFloatingPlayer(), 100);
    return;
  }

  try {
    rootElement = document.createElement("div");
    rootElement.id = "orca-music-player-root";
    document.body.appendChild(rootElement);

    rootInstance = createRootFn(rootElement);
    rootInstance.render(React.createElement(FloatingPlayer, null));
    console.log(`[${pluginName}] 悬浮播放器组件已成功挂载到界面`);
  } catch (err) {
    console.error(`[${pluginName}] 挂载悬浮播放器组件失败:`, err);
  }
}

export async function load(_name: string) {
  pluginName = _name;
  setupL10N(orca.state.locale, { "zh-CN": zhCN });

  console.log(`[${pluginName}] 加载中...`);

  // 1. 注入专属 CSS 样式表（确保样式在虎鲸笔记中实时生效）
  try {
    orca.themes.injectCSSResource(`${pluginName}/dist/index.css`, pluginName);
  } catch (e) {
    console.warn(`[${pluginName}] 注入样式失败:`, e);
  }

  // 2. 扫描库中带有音乐标签的笔记条目，预加载歌单
  try {
    const tracks = await loadTracksFromLibrary();
    playerActions.setPlaylist(tracks);
    console.log(`[${pluginName}] 扫描加载歌单成功，共 ${tracks.length} 首条目`);
  } catch (err) {
    console.warn(`[${pluginName}] 扫描音乐库出错:`, err);
  }

  // 3. 注册顶部栏快捷按钮（Headbar Button）
  try {
    orca.headbar.registerHeadbarButton(`${pluginName}.toggleBtn`, () => (
      <orca.components.Button
        variant="plain"
        onClick={() => {
          playerActions.toggleExpanded();
        }}
        title={t("音乐播放器")}
      >
        <i className="ti ti-music" />
      </orca.components.Button>
    ));
  } catch (err) {
    console.warn(`[${pluginName}] 注册 HeadbarButton 出错:`, err);
  }

  // 4. 挂载常驻悬浮播放器界面
  mountFloatingPlayer();

  // 5. 注册原生快捷命令
  try {
    orca.commands.registerCommand(
      `${pluginName}.togglePlay`,
      () => playerActions.togglePlay(),
      "音乐: 播放/暂停"
    );
    orca.commands.registerCommand(
      `${pluginName}.toggleExpanded`,
      () => playerActions.toggleExpanded(),
      "音乐: 展开/收起播放器"
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

  console.log(`[${pluginName}] 加载完成.`);
}

export async function unload() {
  console.log(`[${pluginName}] 卸载中...`);

  // 1. 移除样式表
  try {
    orca.themes.removeCSSResources(pluginName);
  } catch (e) {
    // ignore
  }

  // 2. 卸载顶部栏按钮
  try {
    orca.headbar.unregisterHeadbarButton(`${pluginName}.toggleBtn`);
  } catch (e) {
    // ignore
  }

  // 3. 卸载注册的命令
  try {
    orca.commands.unregisterCommand(`${pluginName}.togglePlay`);
    orca.commands.unregisterCommand(`${pluginName}.toggleExpanded`);
    orca.commands.unregisterCommand(`${pluginName}.nextTrack`);
    orca.commands.unregisterCommand(`${pluginName}.prevTrack`);
  } catch (e) {
    // ignore
  }

  // 4. 卸载并清理 DOM
  if (rootInstance) {
    try {
      rootInstance.unmount();
    } catch (e) {
      // ignore
    }
    rootInstance = null;
  }
  if (rootElement && rootElement.parentElement) {
    rootElement.parentElement.removeChild(rootElement);
    rootElement = null;
  }
}
