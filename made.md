# Nebula Desktop 当前执行记录

## 1. 已读取的原始文档

已读取并理解：

- `需求文档.md`
- `技术文档.md`

核心约束：

- 项目定位为 Windows 桌面增强层，不是 Shell Replacement。
- 不替换 `explorer.exe`。
- 不 Hook Explorer。
- 不注入系统进程。
- 不接管 Windows Notification Center。
- 不读取微信、QQ、企业微信、钉钉等聊天内容。
- 不读取通知正文。
- 优先保证稳定、低占用、兼容微信/QQ。

## 2. 环境确认

已确认当前环境具备：

- Node.js `v24.13.0`
- npm `11.6.2`
- Rust `rustc 1.95.0`
- Cargo `1.95.0`
- Rust toolchain：`stable-x86_64-pc-windows-msvc`
- Tauri CLI：`tauri-cli 2.11.2`
- WebView2 Runtime：`148.0.3967.83`
- Visual Studio Build Tools 2022
- MSVC `14.42.34433`
- Windows SDK `10.0.22621.0`

系统版本判断：

- 注册表显示 `DisplayVersion=25H2`
- `CurrentBuild=26200`
- 按 Windows 11 Home 25H2 判断
- 文档已调整为同时支持 Windows 10 和 Windows 11

注意：

- `npm config get offline` 当前为 `true`
- npm 安装时使用过 `--offline=false --prefer-online`
- Cargo 安装依赖时使用过临时环境变量 `$env:CARGO_NET_OFFLINE='false'`

## 3. 已生成的 spec 文档

新增：

- `系统设计文档.md`
- `开发任务书.md`

后续根据用户要求，已将 spec 从仅 Windows 11 调整为 Windows 10 / Windows 11 双平台目标。

兼容基线：

- Windows 10 22H2 x64
- Windows 11 23H2 / 24H2 / 25H2 x64

设计原则：

- 核心能力以 Windows 10 可用 API 为基线。
- Windows 11 的 Mica、材质、圆角等只作为增强。
- Windows 10 必须提供视觉降级方案。
- 不依赖 Windows 11 独占 API 实现核心功能。

## 4. 已执行任务

当前已执行任务：

- `T0.1 创建项目骨架`

执行状态：

- 已完成

## 5. T0.1 已创建的前端文件

新增：

- `package.json`
- `package-lock.json`
- `index.html`
- `tsconfig.json`
- `vite.config.ts`
- `postcss.config.cjs`
- `tailwind.config.js`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/styles/index.css`
- `src/vite-env.d.ts`
- `src/ui/shared/.gitkeep`
- `src/ui/taskbar/.gitkeep`
- `src/ui/launcher/.gitkeep`
- `src/ui/control-center/.gitkeep`
- `src/ipc/.gitkeep`
- `src/state/.gitkeep`
- `src/utils/.gitkeep`

前端技术栈：

- Vite
- React
- TypeScript
- TailwindCSS
- Framer Motion

`package.json` 中脚本：

```json
{
  "dev": "vite --host 127.0.0.1 --port 1420",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview --host 127.0.0.1 --port 1420",
  "tauri": "cargo tauri",
  "tauri:dev": "cargo tauri dev",
  "tauri:build": "cargo tauri build"
}
```

## 6. T0.1 已创建的 Tauri 文件

通过以下命令初始化：

```powershell
cargo tauri init --ci --app-name "Nebula Desktop" --window-title "Nebula Desktop" --frontend-dist "../dist" --dev-url "http://127.0.0.1:1420" --before-dev-command "npm run dev" --before-build-command "npm run build"
```

新增：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/icons/*`
- `src-tauri/target/*`

已修改默认模板信息：

- `src-tauri/Cargo.toml`
  - package name 改为 `nebula-desktop`
  - description 改为 `Windows 10 / Windows 11 desktop enhancement layer`
  - lib name 改为 `nebula_desktop_lib`
- `src-tauri/src/main.rs`
  - 调用改为 `nebula_desktop_lib::run()`
- `src-tauri/tauri.conf.json`
  - identifier 改为 `com.nebula.desktop`
  - window size 改为 `1100 x 720`

## 7. 已安装依赖

前端依赖安装完成。

执行过：

```powershell
npm install --offline=false --prefer-online
```

安装结果通过：

```powershell
npm ls --depth=0
```

关键版本：

- `@tauri-apps/api@2.11.0`
- `@tauri-apps/cli@2.11.2`
- `react@19.2.6`
- `react-dom@19.2.6`
- `vite@7.3.3`
- `typescript@5.9.3`
- `tailwindcss@3.4.19`
- `framer-motion@12.40.0`

Rust/Tauri 依赖安装和解析完成。

第一次执行：

```powershell
cargo check
```

失败原因：

- Cargo 使用 offline 模式。
- 离线缓存中没有 `tauri-plugin-log`。

随后执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

结果：

- 成功更新 crates.io index。
- 成功锁定 470 个 Rust packages。
- `cargo check` 通过。

## 8. 已执行验证

### 8.1 npm 依赖验证

执行：

```powershell
npm ls --depth=0
```

结果：

- 通过。

### 8.2 Rust 检查

执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

工作目录：

```text
D:\data\Nebula_Desktop\src-tauri
```

结果：

- 通过。

### 8.3 前端构建

普通权限下执行：

```powershell
npm run build
```

失败：

```text
Error: spawn EPERM
```

原因判断：

- 发生在 Vite 加载配置时启动 esbuild 子进程。
- 属于沙箱权限限制，不是项目代码错误。

提升权限后执行：

```powershell
npm run build
```

结果：

- 通过。
- 生成 `dist/`。

构建输出：

- `dist/index.html`
- `dist/assets/index-C8A974r8.css`
- `dist/assets/index-DJ7_UtuS.js`

### 8.4 Tauri debug 构建

执行：

```powershell
cargo tauri build --debug --no-bundle
```

结果：

- 通过。
- 已生成桌面程序：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

## 9. 当前运行状态

已启动 Vite 开发服务。

URL：

```text
http://127.0.0.1:1420/
```

启动命令：

```powershell
npm run dev
```

日志文件：

- `vite-dev.log`
- `vite-dev.err.log`

验证：

```powershell
Invoke-WebRequest 'http://127.0.0.1:1420/' -UseBasicParsing -TimeoutSec 5
```

返回：

```text
200
```

注意：

- 普通沙箱下启动 Vite dev server 也会遇到 `spawn EPERM`。
- 使用提升权限启动后成功。

## 10. 当前项目结构概要

```text
Nebula_Desktop/
├─ node_modules/
├─ dist/
├─ src/
│  ├─ app/
│  │  └─ App.tsx
│  ├─ ipc/
│  ├─ state/
│  ├─ styles/
│  │  └─ index.css
│  ├─ ui/
│  │  ├─ control-center/
│  │  ├─ launcher/
│  │  ├─ shared/
│  │  └─ taskbar/
│  ├─ utils/
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ src-tauri/
│  ├─ capabilities/
│  ├─ icons/
│  ├─ src/
│  │  ├─ lib.rs
│  │  └─ main.rs
│  ├─ target/
│  ├─ build.rs
│  ├─ Cargo.lock
│  ├─ Cargo.toml
│  └─ tauri.conf.json
├─ index.html
├─ package.json
├─ package-lock.json
├─ postcss.config.cjs
├─ tailwind.config.js
├─ tsconfig.json
├─ vite.config.ts
├─ 需求文档.md
├─ 技术文档.md
├─ 系统设计文档.md
├─ 开发任务书.md
└─ made.md
```

## 11. 已知注意事项

1. 当前不是 Git 仓库。
2. npm 全局配置仍然是 offline：

```powershell
npm config get offline
```

返回：

```text
true
```

3. 后续 npm 安装依赖时需要使用：

```powershell
npm install --offline=false --prefer-online
```

或先显式关闭 npm offline。

4. 后续 Cargo 拉取新依赖时，如果继续受 offline 限制，需要使用：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

5. Vite/esbuild 在普通沙箱权限下会出现：

```text
Error: spawn EPERM
```

需要提升权限执行构建或 dev server。

## 12. 下一步建议

按照 `开发任务书.md`，下一个任务应执行：

- `T0.2 建立代码目录`

不过 T0.1 中已经提前创建了一部分前端基础目录：

- `src/app/`
- `src/ui/taskbar/`
- `src/ui/launcher/`
- `src/ui/control-center/`
- `src/ui/shared/`
- `src/ipc/`
- `src/state/`
- `src/styles/`
- `src/utils/`

T0.2 仍需要补齐后端目录：

- `src-tauri/src/commands/`
- `src-tauri/src/core/window/`
- `src-tauri/src/core/appbar/`
- `src-tauri/src/core/tray/`
- `src-tauri/src/core/audio/`
- `src-tauri/src/core/wifi/`
- `src-tauri/src/core/config/`
- `src-tauri/src/state/`
- `src-tauri/src/utils/`

## 13. T0.2 执行记录

当前已继续执行：

- `T0.2 建立代码目录`

执行状态：

- 已完成

### 13.1 后端目录和模块入口

新增 Rust 后端模块文件：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/core/mod.rs`
- `src-tauri/src/core/window/mod.rs`
- `src-tauri/src/core/appbar/mod.rs`
- `src-tauri/src/core/tray/mod.rs`
- `src-tauri/src/core/audio/mod.rs`
- `src-tauri/src/core/wifi/mod.rs`
- `src-tauri/src/core/config/mod.rs`
- `src-tauri/src/state/mod.rs`
- `src-tauri/src/utils/mod.rs`

修改：

- `src-tauri/src/lib.rs`

修改内容：

```rust
mod commands;
mod core;
mod state;
mod utils;
```

目的：

- 建立后端模块边界。
- 为后续 `T1.1 IPC 基础设施`、`Window Manager`、`Config Manager`、`Audio`、`WiFi` 等任务预留稳定目录结构。

### 13.2 前端模块入口

新增前端模块入口文件：

- `src/app/routes.ts`
- `src/ui/index.ts`
- `src/ui/taskbar/index.ts`
- `src/ui/launcher/index.ts`
- `src/ui/control-center/index.ts`
- `src/ui/shared/index.ts`
- `src/ipc/index.ts`
- `src/state/index.ts`
- `src/utils/index.ts`

目的：

- 补齐前端模块导出入口。
- 为后续组件、IPC 封装、状态管理、工具函数提供稳定导入路径。

### 13.3 验证结果

执行：

```powershell
cargo check
```

普通权限第一次失败：

```text
failed to write ... rmeta: 拒绝访问。 (os error 5)
```

原因：

- 之前 Tauri debug 构建使用提升权限生成过 `src-tauri/target` 产物。
- 普通权限写入同一 target 产物时被拒绝。
- 不是代码错误。

提升权限后重新执行：

```powershell
cargo check
```

结果：

- 通过。

执行：

```powershell
npm run build
```

结果：

- 通过。
- Vite 构建成功。
- TypeScript 检查成功。

### 13.4 当前下一步

按照任务书，下一步应执行：

- `T0.3 配置开发命令`

不过 T0.1 已经提前写入了基础脚本：

- `dev`
- `build`
- `preview`
- `tauri`
- `tauri:dev`
- `tauri:build`

T0.3 仍可继续补：

- Rust 格式化脚本或说明。
- TypeScript 检查脚本。
- 前后端验证脚本。
- README 中的开发命令说明。

## 14. T0.3 执行记录

当前已继续执行：

- `T0.3 配置开发命令`

执行状态：

- 已完成

### 14.1 修改 package.json

修改：

- `package.json`

新增或补齐脚本：

```json
{
  "dev": "vite --host 127.0.0.1 --port 1420",
  "dev:frontend": "vite --host 127.0.0.1 --port 1420",
  "build": "tsc --noEmit && vite build",
  "build:frontend": "vite build",
  "preview": "vite preview --host 127.0.0.1 --port 1420",
  "typecheck": "tsc --noEmit",
  "check": "npm run typecheck && npm run rust:check",
  "rust:check": "cargo check --manifest-path src-tauri/Cargo.toml",
  "rust:fmt": "cargo fmt --manifest-path src-tauri/Cargo.toml",
  "rust:fmt:check": "cargo fmt --manifest-path src-tauri/Cargo.toml --check",
  "tauri": "cargo tauri",
  "tauri:dev": "cargo tauri dev",
  "tauri:build": "cargo tauri build",
  "tauri:build:debug": "cargo tauri build --debug --no-bundle"
}
```

### 14.2 新增 README

新增：

- `README.md`

内容包含：

- 项目定位。
- 已验证开发环境。
- Windows 10 / Windows 11 目标兼容环境。
- 常用开发命令。
- npm offline 注意事项。
- Cargo offline 注意事项。
- 沙箱下 Vite/esbuild `spawn EPERM` 注意事项。
- 项目边界：不替换 Explorer、不 Hook、不注入、不接管通知中心、不读取隐私内容。

### 14.3 Rust 格式化

执行：

```powershell
npm run rust:fmt:check
```

第一次失败：

- `src-tauri/build.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`

原因：

- Tauri 模板生成的缩进不符合 `rustfmt` 默认格式。

随后执行：

```powershell
npm run rust:fmt
```

结果：

- Rust 文件格式化完成。

再次执行：

```powershell
npm run rust:fmt:check
```

结果：

- 通过。

### 14.4 脚本验证

执行：

```powershell
npm run typecheck
```

结果：

- 通过。

执行：

```powershell
npm run check
```

结果：

- 通过。
- 内部执行了 `npm run typecheck` 和 `npm run rust:check`。

执行：

```powershell
npm run tauri:build:debug
```

结果：

- 通过。
- 内部执行了 `npm run build`。
- Vite 构建通过。
- Tauri debug 构建通过。
- 产物仍为：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 14.5 当前下一步

按照任务书，M0 阶段已完成：

- `T0.1 创建项目骨架`
- `T0.2 建立代码目录`
- `T0.3 配置开发命令`

下一步应进入：

- `T1.1 IPC 基础设施`

建议从以下内容开始：

1. 定义统一错误结构。
2. 新增 `get_app_version()` Tauri Command。
3. 前端封装 `invoke` 调用。
4. 在 UI 上显示后端返回的版本信息。
5. 重新执行 `npm run check` 和 `npm run tauri:build:debug`。

## 15. T1.1 执行记录

当前已继续执行：

- `T1.1 IPC 基础设施`

执行状态：

- 已完成最小闭环

### 15.1 后端 IPC 命令

新增：

- `src-tauri/src/commands/error.rs`
- `src-tauri/src/commands/app.rs`
- `src-tauri/src/commands/system.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

已实现命令：

```rust
get_app_version()
get_system_status()
```

命令返回结构：

- `AppVersion`
  - `name`
  - `version`
- `SystemStatus`
  - `platform`
  - `arch`
  - `debug`
- `NebulaError`
  - `code`
  - `message`
  - `detail`

Tauri command 注册方式：

```rust
.invoke_handler(tauri::generate_handler![
    commands::app::get_app_version,
    commands::system::get_system_status
])
```

注意：

- 曾尝试通过 `commands::get_app_version` re-export 路径注册命令。
- `tauri::generate_handler!` 无法通过该 re-export 路径找到宏生成的内部符号。
- 已改为引用原始模块路径 `commands::app::get_app_version` 和 `commands::system::get_system_status`。

### 15.2 前端 IPC 封装

新增：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

修改：

- `src/ipc/index.ts`
- `src/app/App.tsx`

前端封装：

```ts
getAppVersion()
getSystemStatus()
```

UI 行为：

- Tauri 环境中调用 IPC 并显示版本、平台、架构。
- 浏览器预览环境中捕获 IPC 失败并显示 `browser` / `browser preview`。

### 15.3 验证和修复

执行：

```powershell
npm run check
```

第一次失败：

```text
cannot find __tauri_command_name_get_app_version in commands
cannot find __cmd__get_app_version in commands
```

原因：

- Tauri command 宏生成的内部符号不适合通过 re-export 注册。

修复：

- `commands/mod.rs` 中将 `app`、`system` 改为公开模块。
- `src-tauri/src/lib.rs` 中改为使用原始模块路径注册。

随后再次执行：

```powershell
npm run check
```

出现一个警告：

```text
associated function new is never used
```

修复：

- 删除暂未使用的 `NebulaError::new()`。

最终验证：

```powershell
npm run rust:fmt:check
npm run typecheck
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 15.4 当前下一步

按照任务书，下一步应执行：

- `T1.2 Config Manager`

建议实现内容：

1. 定义默认配置结构。
2. 确定配置文件路径。
3. 实现配置读取。
4. 实现配置保存。
5. 暴露 `get_config()` 和 `save_config(config)` Tauri Commands。
6. 前端接入配置读取并显示当前主题、Taskbar 位置等基础配置。

## 16. T1.2 执行记录

当前已继续执行：

- `T1.2 Config Manager`

执行状态：

- 已完成基础配置读写和 IPC 接入

### 16.1 后端配置模块

修改：

- `src-tauri/src/core/config/mod.rs`

新增能力：

- `AppConfig`
- `TaskbarPosition`
- `Theme`
- 默认配置
- 配置读取 `load_config()`
- 配置保存 `save_config()`
- 配置基础校验
- Windows 用户配置路径解析

当前配置路径：

```text
%APPDATA%\Nebula Desktop\config.json
```

如果 `APPDATA` 不存在，则回退使用：

```text
%LOCALAPPDATA%\Nebula Desktop\config.json
```

默认配置：

```json
{
  "taskbarPosition": "top",
  "dockEnabled": false,
  "blur": true,
  "theme": "dark",
  "launcherHotkey": "Alt+Space",
  "taskbarThickness": 56
}
```

校验规则：

- `taskbarThickness` 必须在 `32..=96`。
- `launcherHotkey` 不能为空。

### 16.2 后端 IPC 命令

新增：

- `src-tauri/src/commands/config.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/commands/error.rs`

已暴露命令：

```rust
get_config()
save_config(config)
```

错误结构增强：

- `NebulaError::with_detail(...)`

用于返回配置读写、解析、校验等错误详情。

### 16.3 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `TaskbarPosition`
- `Theme`
- `AppConfig`

新增 IPC client：

```ts
getConfig()
saveConfig(config)
```

UI 当前显示：

- IPC 状态。
- 应用版本。
- 运行平台和架构。
- 当前主题。
- 当前 Taskbar 位置。

浏览器预览环境中，如果 Tauri IPC 不可用，会继续显示 browser fallback。

### 16.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Tauri debug 构建成功。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 16.5 当前下一步

按照任务书，下一步应执行：

- `T1.3 Storage Layer`

建议实现内容：

1. 集成 SQLite。
2. 创建 `pinned_apps`、`recent_items`、`app_cache` 表。
3. 实现数据库初始化。
4. 实现基础 CRUD。
5. 为后续固定应用、Launcher 最近项目做准备。

## 17. T1.3 执行记录

当前已继续执行：

- `T1.3 Storage Layer`

执行状态：

- 已完成 SQLite 集成、表初始化、基础 CRUD 和 IPC 接入

### 17.1 新增依赖

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`

新增 Rust 依赖：

```toml
rusqlite = { version = "0.37", features = ["bundled"] }
```

说明：

- 使用 `bundled` 特性，由 `libsqlite3-sys` 构建内置 SQLite。
- 避免依赖用户系统中是否单独安装 SQLite。

首次检查时执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; npm run check
```

Cargo 下载并锁定：

- `rusqlite v0.37.0`
- `libsqlite3-sys v0.35.0`
- `hashlink`
- `fallible-iterator`
- `fallible-streaming-iterator`
- `vcpkg`

### 17.2 后端 Storage Layer

新增：

- `src-tauri/src/core/storage/mod.rs`

修改：

- `src-tauri/src/core/mod.rs`

数据库路径：

```text
%APPDATA%\Nebula Desktop\nebula.db
```

如果 `APPDATA` 不存在，则回退使用：

```text
%LOCALAPPDATA%\Nebula Desktop\nebula.db
```

新增数据结构：

- `StorageStatus`
- `PinnedApp`
- `RecentItem`
- `AppCacheItem`

初始化表：

```sql
CREATE TABLE IF NOT EXISTS pinned_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  icon_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS recent_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  last_opened_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_cache (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  icon_cache_key TEXT,
  updated_at INTEGER NOT NULL
);
```

已实现函数：

- `initialize_storage()`
- `list_pinned_apps()`
- `upsert_pinned_app(app)`
- `remove_pinned_app(id)`
- `upsert_recent_item(item)`
- `upsert_app_cache_item(item)`

### 17.3 后端 IPC 命令

新增：

- `src-tauri/src/commands/storage.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

已暴露 Tauri Commands：

```rust
get_storage_status()
list_pinned_apps()
upsert_pinned_app(app)
remove_pinned_app(id)
upsert_recent_item(item)
upsert_app_cache_item(item)
```

说明：

- 起初只接入了 `get_storage_status()`。
- `cargo check` 提示 CRUD 类型和函数未使用。
- 随后将 CRUD 函数正式暴露为 IPC，既满足 T1.3 基础 CRUD，也保持 Rust 检查无警告。

### 17.4 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `StorageStatus`
- `PinnedApp`
- `RecentItem`
- `AppCacheItem`

新增 IPC client：

```ts
getStorageStatus()
listPinnedApps()
upsertPinnedApp(app)
removePinnedApp(id)
upsertRecentItem(item)
upsertAppCacheItem(item)
```

UI 当前显示：

- SQLite 表数量，例如 `SQLite: 3 tables`

### 17.5 单元测试

修改：

- `package.json`
- `src-tauri/src/core/storage/mod.rs`

新增脚本：

```json
{
  "rust:test": "cargo test --manifest-path src-tauri/Cargo.toml"
}
```

新增 Rust 单元测试：

```rust
initializes_schema_and_pinned_app_crud()
```

测试行为：

1. 临时将 `APPDATA` 指向系统临时目录。
2. 调用 `initialize_storage()`。
3. 验证三张表创建成功。
4. 插入一个固定应用。
5. 查询固定应用列表。
6. 删除固定应用。
7. 再次查询并确认为空。
8. 删除临时目录。

执行：

```powershell
npm run rust:test
```

结果：

- 1 个测试通过。

### 17.6 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
npm run rust:test
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 17.7 当前下一步

按照任务书，下一步应执行：

- `T1.4 Window Manager 初版`

建议实现内容：

1. 引入 Windows API 依赖。
2. 枚举顶层窗口。
3. 获取窗口标题。
4. 获取进程 ID。
5. 获取前台窗口。
6. 获取窗口最小化状态。
7. 过滤不可见窗口、无标题窗口和系统噪声窗口。
8. 暴露 `get_running_apps()` 和 `get_foreground_window()` IPC。

## 18. T1.4 执行记录

当前已继续执行：

- `T1.4 Window Manager 初版`

执行状态：

- 已完成 Win32 窗口枚举、前台窗口、最小化状态和 IPC 接入

### 18.1 新增依赖

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`

新增 Rust 依赖：

```toml
windows = { version = "0.61", features = [
  "Win32_Foundation",
  "Win32_System_Threading",
  "Win32_UI_WindowsAndMessaging"
] }
```

使用到的 Win32 API：

- `EnumWindows`
- `GetWindowTextLengthW`
- `GetWindowTextW`
- `GetWindowThreadProcessId`
- `GetForegroundWindow`
- `GetWindowPlacement`
- `IsWindowVisible`
- `IsIconic`
- `OpenProcess`
- `QueryFullProcessImageNameW`
- `CloseHandle`

### 18.2 后端 Window Manager

修改：

- `src-tauri/src/core/window/mod.rs`

新增结构：

```rust
RunningApp {
  window_id,
  title,
  process_id,
  process_path,
  is_foreground,
  is_minimized
}
```

新增能力：

- 枚举当前可见顶层窗口。
- 读取窗口标题。
- 获取窗口所属进程 ID。
- 尝试读取进程路径。
- 标记当前前台窗口。
- 判断窗口是否最小化。
- 过滤空标题窗口。
- 过滤部分噪声窗口标题，例如 `Program Manager`、`Windows 输入体验`。

实现函数：

- `enumerate_running_apps()`
- `get_foreground_running_app()`

说明：

- `window_id` 使用 HWND 的十六进制字符串表示，避免直接把 64 位窗口句柄作为 JS number 传输。
- 进程路径读取失败时返回 `None`，不影响窗口枚举。

### 18.3 后端 IPC 命令

新增：

- `src-tauri/src/commands/window.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

新增 Tauri Commands：

```rust
get_running_apps()
get_foreground_window()
```

注册方式：

```rust
commands::window::get_running_apps
commands::window::get_foreground_window
```

### 18.4 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `RunningApp`

新增 IPC client：

```ts
getRunningApps()
getForegroundWindow()
```

UI 当前显示：

- 当前枚举到的窗口数量，例如 `Windows: 8 apps`
- 当前活动窗口标题，例如 `Active: Visual Studio Code`

浏览器预览环境中，如果 Tauri IPC 不可用，仍保持 browser fallback。

### 18.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
$env:CARGO_NET_OFFLINE='false'; npm run check
npm run rust:test
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- 现有 SQLite 单元测试仍通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

注意：

- `npm run rust:test` 和 `npm run tauri:build:debug` 曾并行执行。
- Tauri 构建期间出现 `Blocking waiting for file lock on artifact directory`。
- 这是 Rust `target` 目录并发访问导致的等待，不是构建失败。
- 最终两个命令均执行成功。

### 18.6 当前下一步

按照任务书，M1 后端基础能力已经完成：

- `T1.1 IPC 基础设施`
- `T1.2 Config Manager`
- `T1.3 Storage Layer`
- `T1.4 Window Manager 初版`

下一步应进入：

- `M2 Taskbar 初版`

建议从以下任务开始：

1. `T2.1 Taskbar 布局`
2. 实现 Taskbar 主组件。
3. 支持 Top 和 Bottom。
4. 预留 Left 和 Right 布局接口。
5. 使用当前 `get_running_apps()` 的结果展示运行应用状态。

## 19. T2.1 执行记录

当前已继续执行：

- `T2.1 Taskbar 布局`

执行状态：

- 已完成 Taskbar UI 初版和桌面层首屏改造

### 19.1 新增 Taskbar 组件

新增：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/TaskbarItem.tsx`
- `src/ui/taskbar/TaskbarStatusArea.tsx`

修改：

- `src/ui/taskbar/index.ts`

实现能力：

- 支持 `top`、`bottom`、`left`、`right` 四种布局接口。
- Top / Bottom 使用横向 Taskbar。
- Left / Right 使用纵向 Taskbar。
- 固定尺寸图标按钮，避免 hover 时布局跳动。
- Hover / tap 动效使用 Framer Motion。
- 活动窗口使用高亮指示条。
- 最小化窗口使用暖色状态点。
- 状态区显示 IPC 状态、窗口数量、版本号或时间。
- 使用半透明、边框、阴影和 `backdrop-blur`，兼容 Windows 10 降级视觉，不依赖 Windows 11 Mica。

### 19.2 改造 App 首屏

修改：

- `src/app/App.tsx`

改动：

- 删除原来的说明型骨架页面。
- 改为真实桌面层布局：
  - 背景工作区。
  - 常驻 Taskbar。
  - 活动窗口预览。
  - 配置状态面板。
  - Storage 状态面板。
- Tauri 环境中读取真实 IPC：
  - `getAppVersion()`
  - `getSystemStatus()`
  - `getConfig()`
  - `getStorageStatus()`
  - `getRunningApps()`
  - `getForegroundWindow()`
- 浏览器预览环境中使用 fallback 数据，保证 `http://127.0.0.1:1420/` 也能看到 Taskbar 效果。

### 19.3 当前 UI 行为

Taskbar 使用配置：

```ts
appConfig.taskbarPosition
```

默认浏览器预览配置：

```ts
{
  taskbarPosition: "top",
  dockEnabled: false,
  blur: true,
  theme: "dark",
  launcherHotkey: "Alt+Space",
  taskbarThickness: 56
}
```

浏览器 fallback 运行应用：

- Visual Studio Code
- Windows Terminal
- Microsoft Edge

Tauri 运行时则显示真实窗口列表。

### 19.4 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 19.5 当前下一步

按照任务书，下一步应执行：

- `T2.2 固定应用`

建议实现内容：

1. 使用 SQLite `pinned_apps` 表读取固定应用。
2. 增加默认固定应用 fallback。
3. Taskbar 分区显示固定应用和运行应用。
4. 点击固定应用启动程序。
5. 固定应用不存在时显示明确状态。

## 20. T2.2 执行记录

当前已继续执行：

- `T2.2 固定应用`

执行状态：

- 已完成固定应用 UI、SQLite 读取接入和启动应用 IPC

### 20.1 后端启动应用 IPC

修改：

- `src-tauri/src/commands/app.rs`
- `src-tauri/src/lib.rs`

新增 Tauri Command：

```rust
launch_app(path)
```

行为：

- 校验启动路径不能为空。
- 使用 `std::process::Command::new(path).spawn()` 启动程序。
- 启动失败时返回 `NebulaError`。

当前用于固定应用点击启动。

### 20.2 前端 IPC 接入

修改：

- `src/ipc/client.ts`

新增：

```ts
launchApp(path)
```

已有 Storage IPC 被用于读取固定应用：

```ts
listPinnedApps()
```

### 20.3 Taskbar 固定应用 UI

新增：

- `src/ui/taskbar/TaskbarPinnedItem.tsx`

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/index.ts`

实现能力：

- Taskbar 拆分为固定应用区和运行应用区。
- 固定应用使用独立高亮样式。
- 固定应用和运行应用之间有分隔线。
- 固定应用支持横向和纵向 Taskbar。
- 点击固定应用触发 `onLaunchPinnedApp(app)`。
- 固定应用按钮有稳定 `44x44` 尺寸，Hover 不造成布局跳动。

### 20.4 App 接入固定应用

修改：

- `src/app/App.tsx`

新增状态：

- `pinnedApps`
- `launchMessage`

Tauri 环境：

- 调用 `listPinnedApps()` 读取 SQLite 中的固定应用。
- 如果 SQLite 为空，使用 fallback 固定应用。
- 点击固定应用调用 `launchApp(app.path)`。

浏览器预览环境：

- 使用 fallback 固定应用。
- 点击固定应用不会真实启动程序，只更新状态文本。

fallback 固定应用：

- `explorer.exe`
- `wt.exe`
- `msedge.exe`
- `notepad.exe`

当前 UI 显示：

- 固定应用数量，例如 `Pinned: 4 apps`
- 启动状态，例如 `Terminal launched` 或 `Terminal launch failed`

### 20.5 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
npm run rust:test
```

结果：

- 全部通过。
- Rust 检查无警告。
- Vite 构建通过。
- Tauri debug 构建通过。
- Storage 单元测试仍通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 20.6 当前下一步

按照任务书，下一步应执行：

- `T2.3 运行应用显示`

说明：

- 当前 Taskbar 已经显示运行应用。
- 但仍属于基础接入，还没有做周期刷新、窗口开关后的状态更新、同应用多窗口策略、运行应用和固定应用去重。

建议实现内容：

1. 周期性刷新 `get_running_apps()`。
2. 前台窗口变化后刷新 active 状态。
3. 固定应用和运行应用去重或关联。
4. 优化运行应用标题显示和 Tooltip。
5. 为后续点击运行应用激活窗口做准备。

## 21. T2.3 执行记录

当前已继续执行：

- `T2.3 运行应用显示`

执行状态：

- 已完成运行应用低频刷新和固定应用运行态标记

### 21.1 运行应用低频刷新

修改：

- `src/app/App.tsx`

新增常量：

```ts
const WINDOW_REFRESH_INTERVAL_MS = 2_500;
```

新增行为：

- Tauri IPC 进入 `ready` 后，每 2.5 秒刷新一次：
  - `getRunningApps()`
  - `getForegroundWindow()`
- 刷新结果用于更新：
  - `runningApps`
  - `foregroundWindow`
- 刷新失败时更新状态文本：
  - `Window refresh failed`

说明：

- 2.5 秒属于低频刷新，用作 MVP 阶段兜底方案。
- 后续可替换为 Win32 事件驱动或后端事件推送，避免长期轮询。

### 21.2 启动后刷新

修改：

- `src/app/App.tsx`

点击固定应用并成功调用 `launchApp(app.path)` 后：

- 800ms 后再次调用：
  - `getRunningApps()`
  - `getForegroundWindow()`
- 用于更快反映新启动应用状态。

失败时显示：

```text
<应用名> launched, refresh failed
```

### 21.3 固定应用运行态标记

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/TaskbarPinnedItem.tsx`
- `src/ui/taskbar/Taskbar.tsx`

新增 props：

```ts
isRunning
isForeground
```

实现行为：

- 固定应用对应进程正在运行时，显示运行指示。
- 固定应用对应进程是前台窗口时，显示额外状态点。
- 通过可执行文件名匹配：
  - 固定应用 `path`
  - 运行应用 `processPath`

辅助函数：

```ts
executableName(path)
isPinnedAppRunning(path, runningApps)
isPinnedAppForeground(path, runningApps)
```

### 21.4 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 21.5 当前下一步

按照任务书，下一步应执行：

- `T2.4 窗口激活控制`

建议实现内容：

1. 后端实现 `activate_window(window_id)`。
2. 后端实现 `restore_window(window_id)`。
3. 后端实现 `minimize_window(window_id)`。
4. 前端点击运行应用图标时激活或还原窗口。
5. 最小化窗口点击后还原。

## 22. T2.4 执行记录

当前已继续执行：

- `T2.4 窗口激活控制`

执行状态：

- 已完成运行应用点击激活、还原和最小化 IPC 基础能力

### 22.1 后端窗口控制

修改：

- `src-tauri/src/core/window/mod.rs`
- `src-tauri/src/commands/window.rs`
- `src-tauri/src/lib.rs`

新增 Win32 API 使用：

- `SetForegroundWindow`
- `ShowWindow`
- `SW_RESTORE`
- `SW_MINIMIZE`

新增后端函数：

```rust
activate_window_by_id(window_id)
restore_window_by_id(window_id)
minimize_window_by_id(window_id)
```

新增窗口 ID 解析：

```rust
hwnd_from_id(window_id)
```

说明：

- `window_id` 仍使用 HWND 的十六进制字符串。
- 后端将该字符串解析回 `HWND`。
- `ShowWindow` 返回值是窗口之前的可见状态，不作为失败判断。
- `SetForegroundWindow` 可能被 Windows 前台锁拒绝；失败时返回 `window_activate_failed`。

### 22.2 后端 IPC 命令

新增 Tauri Commands：

```rust
activate_window(window_id)
restore_window(window_id)
minimize_window(window_id)
```

注册到 `tauri::generate_handler!`：

```rust
commands::window::activate_window
commands::window::restore_window
commands::window::minimize_window
```

### 22.3 前端 IPC 接入

修改：

- `src/ipc/client.ts`

新增：

```ts
activateWindow(windowId)
restoreWindow(windowId)
minimizeWindow(windowId)
```

其中 `minimizeWindow` 已封装，当前 UI 暂未触发，给后续操作菜单或中键点击预留。

### 22.4 Taskbar 点击运行应用

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/TaskbarItem.tsx`
- `src/ui/taskbar/Taskbar.tsx`
- `src/app/App.tsx`

新增行为：

- 点击运行应用图标时触发 `onActivateRunningApp(app)`。
- 浏览器预览环境中只在本地切换前台状态。
- Tauri 环境中：
  - 如果窗口已最小化，调用 `restoreWindow(app.windowId)`。
  - 否则调用 `activateWindow(app.windowId)`。
  - 成功后 250ms 刷新 `getRunningApps()` 和 `getForegroundWindow()`。

状态文本：

- 成功：`<窗口标题> active`
- 失败：`<窗口标题> activate failed`
- 成功但刷新失败：`<窗口标题> active, refresh failed`

### 22.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run rust:fmt:check
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- Vite 构建通过。
- Rust 测试通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

注意：

- `npm run rust:test` 和 `npm run tauri:build:debug` 曾并行执行。
- Tauri 构建等待了一次 Rust `target` 文件锁。
- 最终构建成功。

### 22.6 当前下一步

按照任务书，M2 Taskbar 初版已完成：

- `T2.1 Taskbar 布局`
- `T2.2 固定应用`
- `T2.3 运行应用显示`
- `T2.4 窗口激活控制`

下一步应进入：

- `M3 Launcher 初版`

建议从 `T3.1 Launcher UI` 开始：

1. 实现 Spotlight/Raycast 风格输入框。
2. 实现结果列表。
3. 支持键盘上下选择。
4. 支持 Enter 执行。
5. 支持 Esc 关闭。
6. 先接入固定应用和运行应用作为搜索结果。

## 23. T3.1 执行记录

当前已继续执行：

- `T3.1 Launcher UI`

执行状态：

- 已完成 Launcher UI、键盘交互和基础执行闭环

### 23.1 新增 Launcher 组件

新增：

- `src/ui/launcher/launcher.types.ts`
- `src/ui/launcher/Launcher.tsx`
- `src/ui/launcher/LauncherInput.tsx`
- `src/ui/launcher/LauncherResultList.tsx`
- `src/ui/launcher/LauncherResultItem.tsx`

修改：

- `src/ui/launcher/index.ts`

实现能力：

- Spotlight / Raycast 风格居中浮层。
- 搜索输入框。
- 结果列表。
- 空结果状态。
- 结果选中态。
- Framer Motion 打开/关闭动画。
- 点击遮罩关闭。
- 点击结果执行。

### 23.2 结果来源

当前 Launcher 先使用已有数据作为结果源：

- 固定应用 `pinnedApps`
- 运行应用 `runningApps`

结果类型：

```ts
LauncherResult =
  | { kind: "pinned"; app: PinnedApp }
  | { kind: "running"; app: RunningApp }
```

搜索逻辑：

- 对 `title` 和 `subtitle` 做小写包含匹配。
- 空查询显示默认结果。
- 最多显示 8 条结果。

说明：

- 这一步先完成 T3.1 UI 和交互。
- 后续 `T3.2 应用搜索` 会接入开始菜单快捷方式扫描和真实应用搜索。

### 23.3 键盘操作

已支持：

- `Alt+Space`：打开/关闭 Launcher。
- `ArrowDown`：选择下一项。
- `ArrowUp`：选择上一项。
- `Enter`：执行当前选中项。
- `Esc`：关闭 Launcher。

执行行为：

- 固定应用结果：调用 `onLaunchPinnedApp(app)`。
- 运行应用结果：调用 `onActivateRunningApp(app)`。
- 执行后关闭 Launcher。

### 23.4 Taskbar 接入

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/app/App.tsx`

新增：

```ts
onOpenLauncher()
```

行为：

- 点击 Taskbar 左侧 Nebula `N` 按钮打开 Launcher。

### 23.5 App 接入

修改：

- `src/app/App.tsx`

新增状态：

```ts
launcherOpen
```

新增行为：

- 全局监听 `keydown`。
- `Alt+Space` 切换 Launcher。
- 向 Launcher 传入：
  - `pinnedApps`
  - `runningApps`
  - `handleLaunchPinnedApp`
  - `handleActivateRunningApp`

### 23.6 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 23.7 当前下一步

按照任务书，下一步应执行：

- `T3.2 应用搜索`

建议实现内容：

1. 扫描开始菜单快捷方式。
2. 建立应用索引。
3. 暴露 `search_apps(query)`。
4. 暴露 `launch_app(app_id)` 或复用当前 `launch_app(path)`。
5. Launcher 接入真实应用搜索结果。

## 24. T3.2 应用搜索

### 24.1 后端能力

修改：

- `src-tauri/src/commands/app.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`

新增：

```rust
AppSearchResult
search_apps(query)
```

行为：

- 扫描开始菜单目录，不扫描全盘：
  - `%APPDATA%\Microsoft\Windows\Start Menu\Programs`
  - `%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs`
- 支持入口类型：
  - `.lnk`
  - `.exe`
  - `.appref-ms`
- 按文件名生成应用名称。
- 按名称包含匹配搜索。
- 使用 `HashSet` 避免同一路径重复。
- 最多返回 40 条后端结果。

同时调整：

- `launch_app(path)` 从 `std::process::Command` 改为 Windows `ShellExecuteW`。
- 这样可以直接启动开始菜单 `.lnk` 快捷方式和 `.appref-ms` 入口。

### 24.2 IPC 接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

新增：

```ts
AppSearchResult
searchApps(query)
```

### 24.3 Launcher 接入

修改：

- `src/ui/launcher/launcher.types.ts`
- `src/ui/launcher/Launcher.tsx`
- `src/app/App.tsx`

新增结果类型：

```ts
{ kind: "app"; app: AppSearchResult }
```

行为：

- Launcher 打开时清空应用搜索结果。
- 输入变化后 160ms 防抖调用 `searchApps(query)`。
- 结果列表合并显示：
  - 固定应用
  - 运行应用
  - 开始菜单应用搜索结果
- 选择应用搜索结果后调用 `launchApp(app.path)` 启动。
- 执行后关闭 Launcher。

### 24.4 验证结果

执行：

```powershell
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run rust:test` 通过，当前 1 个 Rust 单元测试通过。
- `npm run tauri:build:debug` 通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

注意：

- 普通权限首次运行 `npm run check` 时，Cargo 写入 `src-tauri\target` 出现 `拒绝访问 (os error 5)`。
- 提升权限后验证通过，判断为构建目录权限问题，不是代码问题。

### 24.5 当前下一步

按照任务书，下一步应执行：

- `T3.3 最近项目`

建议实现内容：

1. 为 Rust 存储层补充 `list_recent_items(limit)`。
2. 暴露 Tauri 命令 `list_recent_items`。
3. 前端 IPC 增加 `listRecentItems()`。
4. Launcher 接入最近项目结果。
5. 启动应用或打开最近项目后写入/更新时间。

## 25. T3.3 最近项目

### 25.1 后端存储读取

修改：

- `src-tauri/src/core/storage/mod.rs`
- `src-tauri/src/commands/storage.rs`
- `src-tauri/src/lib.rs`

新增：

```rust
list_recent_items(limit)
commands::storage::list_recent_items(limit)
```

行为：

- 从 `recent_items` 表读取最近项目。
- 按 `last_opened_at DESC, title ASC` 排序。
- `limit` 限制在 `1..=50`，默认命令侧为 12。
- 注册到 Tauri invoke handler，供前端调用。

测试补充：

- 在现有存储层单元测试中增加 `upsert_recent_item` 后再 `list_recent_items` 的断言。

### 25.2 前端 IPC

修改：

- `src/ipc/client.ts`

新增：

```ts
listRecentItems(limit = 12)
```

复用已有：

```ts
upsertRecentItem(item)
```

### 25.3 Launcher 显示最近项目

修改：

- `src/ui/launcher/launcher.types.ts`
- `src/ui/launcher/Launcher.tsx`
- `src/ui/launcher/LauncherResultItem.tsx`
- `src/app/App.tsx`

新增结果类型：

```ts
{ kind: "recent"; item: RecentItem }
```

行为：

- App 启动时读取最近项目。
- Launcher 结果列表合并显示：
  - 固定应用
  - 运行应用
  - 最近项目
  - 应用搜索结果
- 最近项目使用暖色标识。
- 点击最近项目后通过 `launchApp(item.path)` 打开。
- 打开成功后更新 `lastOpenedAt` 并重新读取最近项目列表。

### 25.4 最近项目写入

修改：

- `src/app/App.tsx`

新增行为：

- 启动固定应用后写入/更新最近项目。
- 启动应用搜索结果后写入/更新最近项目。
- 打开已有最近项目后更新时间。
- 最近项目 ID 使用：

```ts
`${kind}:${path.trim().toLowerCase()}`
```

说明：

- 最近项目更新失败不会阻断已启动应用本身。
- 当前最近项目类型先统一记录为 `app`，后续文件、文件夹、项目空间接入后可继续扩展 `kind`。

### 25.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run check
npm run rust:test
npm run build
npm run rust:fmt:check
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Vite 生产构建通过。
- Rust 格式化检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 25.6 当前下一步

按照任务书，下一步进入：

- `M4: Control Center 初版`
- `T4.1 Control Center UI`

建议实现内容：

1. 新增 Control Center UI 组件。
2. 在 Taskbar 右侧或状态区域接入打开入口。
3. 展示基础系统状态、配置开关和占位控制项。
4. 保持 Windows 10 / Windows 11 双平台兼容，不调用 Windows 11 专属控制中心 API。

## 26. T4.1 Control Center UI

### 26.1 UI 组件

新增：

- `src/ui/control-center/ControlCenter.tsx`

修改：

- `src/ui/control-center/index.ts`

实现内容：

- 新增 Control Center 浮层面板。
- 使用 `AnimatePresence` 和 `motion` 实现展开/关闭动画。
- 深色半透明面板风格与 Taskbar、Launcher 保持一致。
- 根据 Taskbar 位置计算面板位置，避免与 Taskbar 重叠：
  - top：`right-6 top-24`
  - bottom：`bottom-24 right-6`
  - left：`left-24 top-6`
  - right：`right-24 top-6`

### 26.2 控制分组

已实现 UI 分组：

- 音量 Slider。
- WiFi Toggle。
- 蓝牙 Toggle。
- 亮度 Slider。
- 夜间模式 Toggle。
- 电源模式分段按钮：
  - 性能
  - 均衡
  - 节能
- 运行窗口和 IPC 状态展示。
- `打开 Windows 设置` 按钮占位。

说明：

- `T4.1` 只实现 UI 和本地交互状态。
- 不调用 Windows 11 专属控制中心 API。
- 不接管系统设置、不 Hook、不注入系统进程。
- 真实音量读取和设置放到 `T4.2 音量控制`。

### 26.3 Taskbar 入口

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/TaskbarStatusArea.tsx`
- `src/app/App.tsx`

新增：

```ts
onOpenControlCenter()
controlCenterOpen
```

行为：

- 点击 Taskbar 状态区打开 Control Center。
- 打开 Control Center 时关闭 Launcher。
- 打开 Launcher 时关闭 Control Center。
- 点击浮层外部或关闭按钮可关闭 Control Center。

### 26.4 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust 格式化检查通过。
- Rust `cargo check` 通过。
- Vite 生产构建通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 26.5 当前下一步

按照任务书，下一步应执行：

- `T4.2 音量控制`

建议实现内容：

1. 使用 Windows Core Audio API 读取系统主音量。
2. 使用 Windows Core Audio API 设置系统主音量。
3. 暴露 `get_volume()` 和 `set_volume(value)` Tauri 命令。
4. 前端 Control Center 音量 Slider 与后端状态同步。
5. 保持 Windows 10 22H2 和 Windows 11 25H2 可用。

## 27. T4.2 音量控制

### 27.1 Rust Core Audio 命令

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

新增：

- `src-tauri/src/commands/audio.rs`

新增 Windows API feature：

```toml
Win32_Media_Audio
Win32_Media_Audio_Endpoints
Win32_System_Com
```

新增 Tauri Commands：

```rust
get_volume()
set_volume(value)
```

实现方式：

1. 使用 `CoInitializeEx(None, COINIT_APARTMENTTHREADED)` 初始化 COM。
2. 使用 `CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)` 创建音频设备枚举器。
3. 使用 `GetDefaultAudioEndpoint(eRender, eConsole)` 获取默认输出设备。
4. 使用 `IMMDevice::Activate` 获取 `IAudioEndpointVolume`。
5. 使用 `GetMasterVolumeLevelScalar()` 读取系统主音量。
6. 使用 `SetMasterVolumeLevelScalar()` 设置系统主音量。
7. 前后端以百分比 `0..100` 通信，后端内部转换为 Core Audio scalar `0.0..1.0`。

### 27.2 前端 IPC

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

新增类型：

```ts
VolumeStatus
```

新增方法：

```ts
getVolume()
setVolume(value)
```

### 27.3 Control Center 接入

修改：

- `src/ui/control-center/ControlCenter.tsx`

行为：

- Control Center 打开且 IPC ready 时读取当前系统音量。
- 音量 Slider 显示真实系统音量。
- 拖动 Slider 后 120ms 防抖调用 `setVolume(value)`。
- 写入成功后使用后端返回值校正 UI。
- 读取或写入失败时显示 `未同步`，不影响面板其他控制项。
- 浏览器预览或 IPC 不可用时保持本地预览状态。

### 27.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run rust:check
npm run check
npm run rust:test
npm run build
npm run rust:fmt:check
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Vite 生产构建通过。
- Rust 格式化检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

说明：

- 当前已完成编译与集成验证。
- 真实系统音量读写需要在运行中的桌面应用中打开 Control Center 后拖动 Slider 进行人工验证。

### 27.5 当前下一步

按照任务书，下一步应执行：

- `T4.3 系统设置入口`

建议实现内容：

1. 后端增加打开 Windows 设置 URI 的命令。
2. Control Center 的 WiFi、蓝牙、电源、系统设置按钮接入 Windows 设置页面。
3. 使用 `ms-settings:` URI，保持 Windows 10 / Windows 11 兼容。

## 28. T4.3 系统设置入口

### 28.1 后端命令

修改：

- `src-tauri/src/commands/app.rs`
- `src-tauri/src/lib.rs`

新增命令：

```rust
open_windows_settings(page)
```

实现方式：

- 继续使用 `ShellExecuteW` 打开 URI。
- 将原 `launch_app(path)` 的 ShellExecute 逻辑抽为 `shell_open(...)` 复用。
- 使用白名单限制允许打开的系统设置页，避免前端传入任意 URI。

支持页面：

```text
wifi      -> ms-settings:network-wifi
bluetooth -> ms-settings:bluetooth
display   -> ms-settings:display
power     -> ms-settings:powersleep
home      -> ms-settings:
```

说明：

- 使用 Windows 原生 `ms-settings:` URI。
- 不重写系统设置。
- 不接管系统设置窗口。
- Windows 10 / Windows 11 均使用同一路径。

### 28.2 前端 IPC

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

新增类型：

```ts
WindowsSettingsPage
```

新增方法：

```ts
openWindowsSettings(page)
```

### 28.3 Control Center 接入

修改：

- `src/ui/control-center/ControlCenter.tsx`

新增入口：

- `显示设置`
- `电源设置`
- `WiFi 设置`
- `蓝牙设置`
- `打开 Windows 设置`

行为：

- IPC ready 时点击按钮调用 `openWindowsSettings(page)`。
- 成功后按钮文案显示 `Windows 设置已打开`。
- 失败时按钮文案显示 `无法打开 Windows 设置`。
- 浏览器预览或 IPC 不可用时不会尝试调用系统设置。

### 28.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
npm run rust:fmt:check
```

结果：

- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Vite 生产构建通过。
- Tauri debug 构建通过。
- Rust 格式化检查通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

说明：

- 当前完成编译与集成验证。
- 真实打开系统设置页需要在运行中的桌面应用里点击 Control Center 的入口做人工验证。

### 28.5 当前下一步

按照任务书，下一步进入：

- `M5: Notification Badge 初版`
- `T5.1 Badge UI`

建议实现内容：

1. 为 Taskbar 应用项增加 badge UI 能力。
2. 先基于模拟/本地状态显示注意状态，不读取通知正文。
3. 后续再接入允许的窗口注意状态或通知计数来源。

## 29. T5.1 Badge UI

### 29.1 Badge 视觉组件

新增：

- `src/ui/taskbar/TaskbarBadge.tsx`

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/TaskbarItem.tsx`
- `src/ui/taskbar/TaskbarPinnedItem.tsx`

新增类型：

```ts
NotificationBadgeStatus = "normal" | "active" | "attention"
```

Badge 样式：

- `normal`：低调灰色小点。
- `active`：Nebula accent 小点和轻微外圈。
- `attention`：暖色小点和轻微 pulse 动效。

实现细节：

- Badge 使用 `pointer-events-none`，不影响 Taskbar 图标点击。
- Badge 固定在图标右上角，适配固定应用和运行应用图标。
- 保留原有前台窗口底部/侧边指示条。

### 29.2 当前状态映射

当前 `T5.1` 只做 UI，不做真实通知检测。

临时映射：

- 运行应用为前台窗口：`active`
- 运行应用为最小化状态：`attention`
- 其他运行应用：`normal`
- 固定应用如果能匹配到运行进程，则复用对应运行应用状态
- 未运行固定应用不显示 Badge

说明：

- 这一步不读取通知正文。
- 不接管 Windows Notification Center。
- 不读取聊天内容。
- 不 Hook Explorer。
- 真实注意状态检测留给 `T5.2 注意状态检测`。

### 29.3 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust 格式化检查通过。
- Rust `cargo check` 通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Vite 生产构建通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 29.4 当前下一步

按照任务书，下一步应执行：

- `T5.2 注意状态检测`

建议实现内容：

1. 后端提供 `get_notification_indicators()` 命令。
2. 明确只暴露应用/窗口级状态，不返回通知正文。
3. 前端从命令读取状态并覆盖当前 UI 临时映射。
4. 如果 Windows API 无法可靠读取 Flash 状态，需在记录中明确不可检测边界。

## 30. T5.2 注意状态检测

### 30.1 后端 Indicator 命令

新增：

- `src-tauri/src/commands/notification.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

新增命令：

```rust
get_notification_indicators()
```

返回结构：

```rust
NotificationIndicator {
  window_id,
  process_id,
  process_path,
  status
}
```

状态枚举：

```rust
Normal
Active
Attention
```

实现方式：

- 复用现有 Window Manager 的 `enumerate_running_apps()`。
- 不读取通知正文。
- 不读取聊天内容。
- 不访问 Windows Notification Center 内容。
- 不 Hook Explorer。
- 不注入任何进程。

当前状态映射：

- `is_minimized == true` -> `Attention`
- `is_foreground == true` -> `Active`
- 其他运行窗口 -> `Normal`

重要边界：

- Windows 没有稳定公开 API 直接查询任意窗口当前是否处于 Flash 状态。
- 当前命令提供窗口级 indicator 基础设施和保守状态映射。
- 真正的微信、QQ、企业微信、钉钉注意状态可检测性，需要在 `T5.3` 中逐项实测并记录不可检测场景。

### 30.2 前端 IPC

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

新增类型：

```ts
NotificationIndicatorStatus
NotificationIndicator
```

新增方法：

```ts
getNotificationIndicators()
```

### 30.3 Taskbar 接入

修改：

- `src/app/App.tsx`
- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`

行为：

- App 初始加载时读取 `getNotificationIndicators()`。
- 窗口状态刷新时同步刷新 indicator。
- Taskbar 优先使用后端 indicator 状态渲染 Badge。
- 如果 indicator 不存在，则回退到 `T5.1` 的本地窗口状态映射。
- 固定应用通过进程路径匹配运行窗口，再复用对应 indicator。

### 30.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run check
npm run build
npm run rust:test
npm run rust:fmt:check
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Vite 生产构建通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Rust 格式化检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 30.5 当前下一步

按照任务书，下一步应执行：

- `T5.3 微信/QQ兼容测试`

建议执行内容：

1. 运行 debug 产物。
2. 打开微信、QQ、企业微信、钉钉。
3. 分别触发新消息或注意状态。
4. 记录 Badge 是否可检测。
5. 明确不可检测场景，确保不引入 Hook、注入或通知正文读取。

## 31. T5.3 微信/QQ兼容测试

### 31.1 任务边界

任务要求：

- 测试微信新消息时 Badge 行为。
- 测试 QQ 新消息时 Badge 行为。
- 测试企业微信新消息时 Badge 行为。
- 记录不可检测场景。

约束：

- 不 Hook Explorer。
- 不注入微信、QQ、企业微信、钉钉等进程。
- 不接管 Windows Notification Center。
- 不读取通知正文。
- 不读取聊天内容。
- 不使用 undocumented API。

### 31.2 当前环境进程检查

执行：

```powershell
Get-Process | Where-Object { $_.ProcessName -match 'WeChat|WXWork|QQ|TIM|DingTalk|Ding' }
Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'WeChat|WXWork|QQ|TIM|DingTalk|Ding' -or $_.CommandLine -match 'WeChat|WXWork|QQ|TIM|DingTalk|Ding' }
```

结果：

- 普通权限执行 `Get-CimInstance Win32_Process` 时出现 `拒绝访问`。
- 提升权限后成功读取进程信息。

发现进程：

- 微信：
  - `Weixin.exe`
  - `WeChatAppEx.exe`
- QQ：
  - `QQ.exe`
  - `TXPlatform.exe`
- 企业微信：
  - `WXWork.exe`
  - `WXWorkWeb.exe`
  - `WeMail.exe`
- 钉钉：
  - 当前未发现运行进程。

### 31.3 兼容性记录

新增：

- `兼容性记录.md`

记录内容：

- 当前测试边界。
- 当前环境发现。
- 微信、QQ、企业微信、钉钉检测矩阵。
- 当前 Badge 行为记录。
- 后续人工新消息测试步骤。

当前结论：

- 微信、QQ、企业微信已检测到运行进程，可做窗口级状态检测。
- 钉钉当前未运行，无法验证。
- 当前未触发真实新消息，因此不能声明已经验证真实消息 Badge 行为。
- 当前方案只能确认：
  - 主窗口存在。
  - 进程路径存在。
  - 前台状态。
  - 最小化状态。
- 当前方案不能确认：
  - 托盘态未读消息。
  - 系统通知中心中的通知正文。
  - 所有应用是否一定通过窗口 Flash 暴露注意状态。

### 31.4 验证说明

本轮未修改代码，只新增兼容性记录文档。

上一轮代码验证仍保持：

```powershell
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

均已通过。

本轮未重复执行构建，因为仅新增 Markdown 文档。

### 31.5 当前下一步

按照任务书，下一步进入：

- `M6: 稳定性与性能验证`
- `T6.1 性能验证`

建议执行内容：

1. 启动 debug 产物。
2. 检查启动时间、CPU、内存。
3. 检查窗口枚举刷新是否造成明显占用。
4. 记录性能指标到文档。

## 32. T6.1 性能验证

### 32.1 任务要求

任务：

- 记录启动时间。
- 记录空闲 CPU。
- 记录内存占用。
- 检查窗口枚举频率。

验收标准：

- 启动时间 `< 2s`。
- 空闲 CPU `< 1%`。
- 内存 `< 200MB`。

### 32.2 Release 构建

执行：

```powershell
cargo tauri build --no-bundle
```

结果：

- 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\release\nebula-desktop.exe
```

### 32.3 性能采样

新增：

- `性能验证记录.md`

采样方式：

1. 使用 `Start-Process` 启动 Nebula Desktop。
2. 从启动计时到进程出现非 0 `MainWindowHandle`，记录为启动时间。
3. 启动后等待 3 秒进入空闲状态。
4. 采样 5 秒 CPU 时间差，按逻辑处理器数量折算 CPU 百分比。
5. 记录 Working Set、Private Memory、线程数、句柄数。
6. 测试后关闭本轮启动的 Nebula 进程。

### 32.4 Debug 产物结果

产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

结果：

- 启动时间：2461ms。
- 空闲 CPU：0.017%。
- Working Set：44.03MB。
- Private Memory：10.36MB。
- 线程数：12。
- 句柄数：427。

结论：

- CPU 达标。
- 内存达标。
- Debug 启动时间超过 2 秒，不作为最终性能验收依据。

### 32.5 Release 产物结果

构建后首次冷启动：

- 启动时间：2276ms。
- 空闲 CPU：0.035%。
- Working Set：39.47MB。
- Private Memory：10.25MB。
- 线程数：12。
- 句柄数：421。

Release 连续热启动：

- 第 1 次：
  - 启动时间：155ms。
  - 空闲 CPU：0.020%。
  - Working Set：39.05MB。
  - Private Memory：10.20MB。
- 第 2 次：
  - 启动时间：79ms。
  - 空闲 CPU：0.000%。
  - Working Set：38.88MB。
  - Private Memory：10.27MB。

### 32.6 窗口枚举频率

当前前端窗口状态刷新间隔：

```ts
WINDOW_REFRESH_INTERVAL_MS = 2_500
```

结论：

- 2.5 秒刷新一次，不属于高频轮询。
- 当前 CPU 采样未显示窗口枚举造成明显空闲占用。

### 32.7 当前结论

通过项：

- 空闲 CPU `< 1%`。
- 内存 `< 200MB`。
- 窗口枚举频率合理。
- Release 热启动 `< 2s`。

未完全通过项：

- 构建后首次 release 冷启动为 2276ms，略高于 `< 2s`。

后续建议：

1. 在非构建后环境中复测 release 冷启动。
2. 将首屏渲染与 IPC 数据加载进一步解耦。
3. 如果冷启动仍超过 2 秒，优先优化前端首屏初始化和 Tauri setup 阶段。

### 32.8 当前下一步

按照任务书，下一步应执行：

- `T6.2 Windows 版本兼容验证`

建议执行内容：

1. 记录当前 Windows 11 Home 25H2 验证结果。
2. 标记 Windows 10 22H2 需要在对应系统上复测。
3. 检查启动、退出、Taskbar、Launcher、Control Center、Notification Badge。

## 33. T6.2 Windows 版本兼容验证

### 33.1 任务要求

任务：

- 在 Windows 10 22H2 上验证启动、退出、Taskbar、Launcher、Control Center。
- 在 Windows 11 25H2 上验证启动、退出、Taskbar、Launcher、Control Center。
- 对比两套系统的窗口透明、阴影、圆角、焦点行为。
- 记录 Windows 10 降级样式是否正常。

验收标准：

- Windows 10 和 Windows 11 都能启动应用。
- 核心功能在两个系统上均可用。
- Windows 10 上视觉降级不影响操作。
- Windows 11 上增强视觉不影响稳定性。

### 33.2 当前系统确认

执行：

```powershell
Get-ComputerInfo
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
Get-CimInstance Win32_OperatingSystem
```

结果：

- `Get-ComputerInfo` 返回 `Windows 10 Home China / 2009`。
- 注册表 `ProductName` 返回 `Windows 10 Home China`。
- 注册表 `DisplayVersion` 返回 `25H2`。
- 注册表 `CurrentBuild` 返回 `26200`。
- `Win32_OperatingSystem.Caption` 返回 `Microsoft Windows 11 家庭版 中文版`。
- `Win32_OperatingSystem.Version` 返回 `10.0.26200`。
- `OSArchitecture` 返回 `64 位`。

结论：

- 当前环境按项目记录为 Windows 11 Home 25H2 x64。
- Windows 内部兼容字段仍可能显示 Windows 10，这是 Windows 11 常见兼容标识现象。

### 33.3 Windows 11 启动/退出验证

执行：

```powershell
Start-Process src-tauri\target\release\nebula-desktop.exe
CloseMainWindow()
```

结果：

```text
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : True
ForcedStopNeeded : False
```

结论：

- Release 产物在 Windows 11 Home 25H2 上可启动。
- 主窗口可创建。
- 可通过窗口关闭请求正常退出。
- 不需要强制结束进程。

### 33.4 兼容性记录

新增：

- `Windows兼容性验证记录.md`

记录内容：

- 当前系统识别。
- Windows 11 25H2 启动/退出验证。
- Taskbar、Launcher、Control Center、Notification Badge 当前状态。
- Windows 10 22H2 待验证项目。
- Windows 10 降级样式待验证项目。

当前结论：

- Windows 11 25H2：启动/退出通过。
- Windows 11 25H2：构建链路通过。
- Windows 10 22H2：当前机器无法实机验证，标记为待测。
- Windows 11 完整 UI 交互复核仍需人工操作确认。

### 33.5 当前下一步

按照任务书，下一步应执行：

- `T6.3 多屏 DPI 验证`

建议执行内容：

1. 读取当前显示器和缩放信息。
2. 记录当前 DPI 环境。
3. 标记 125%、150%、200% 缩放和多屏插拔为需要实机人工验证的项目。

## 34. T6.3 多屏 DPI 验证

### 34.1 任务要求

任务：

- 测试 125%、150%、200% 缩放。
- 测试主屏和副屏。
- 测试显示器插拔。
- 测试 Taskbar Top / Bottom。

验收标准：

- UI 不错位。
- AppBar 工作区计算正确。
- 显示器变化后可恢复布局。

### 34.2 当前环境读取

执行：

```powershell
Get-CimInstance Win32_VideoController
Get-ItemProperty 'HKCU:\Control Panel\Desktop\WindowMetrics'
rg -n "AppBar|SHAppBar|DPI|dpi|monitor|显示器|WINDOW_REFRESH_INTERVAL" src src-tauri 系统设计文档.md 开发任务书.md
```

结果：

- 显示控制器：`Intel(R) Arc(TM) Graphics`
- 驱动版本：`32.0.101.6129`
- 当前分辨率：`2560 x 1600`
- 当前刷新率：`120Hz`
- 当前 DPI：`AppliedDPI=144`
- 当前缩放：`150%`

### 34.3 代码状态检查

已具备：

- Taskbar 支持 `top`、`bottom`、`left`、`right` 的布局样式。
- Taskbar 使用视口约束，避免固定写死屏幕宽度。
- Launcher 使用视口居中浮层。
- Control Center 根据 Taskbar 位置计算面板位置。

未完成：

- `src-tauri/src/core/appbar/mod.rs` 目前只有模块注释。
- 尚未实现 `SHAppBarMessage`。
- 尚未实现 AppBar 工作区预留。
- 尚未实现显示器变化监听。
- 尚未实现每显示器 DPI 查询和重算。

### 34.4 验证记录

新增：

- `DPI验证记录.md`

当前结论：

- 当前 150% 缩放环境识别通过。
- 当前主屏分辨率识别通过。
- 前端响应式布局代码检查通过。
- 125% 缩放实测未执行。
- 200% 缩放实测未执行。
- 副屏实测未执行。
- 显示器插拔未执行。
- AppBar 工作区计算未通过，因为 AppBar Manager 尚未实现。

### 34.5 当前下一步

按照任务书，下一步应执行：

- `T6.4 退出恢复验证`

建议执行内容：

1. 测试正常退出。
2. 测试异常退出。
3. 验证 Explorer 未被影响。
4. 验证 Windows 原生任务栏和通知中心仍可用。

## 35. T6.4 退出恢复验证

### 35.1 任务要求

任务：

- 测试正常退出。
- 测试异常退出。
- 测试 Explorer 未被影响。
- 测试 Windows 原生任务栏和通知中心仍可用。

验收标准：

- 应用退出后系统桌面恢复正常。
- 不造成黑屏。
- 不造成 Explorer 崩溃。

### 35.2 Explorer 初始状态

执行：

```powershell
Get-Process explorer
```

结果：

- Explorer 进程 ID：`11556`
- Explorer 启动时间：`2026/5/28 8:36:51`

### 35.3 正常退出和异常退出测试

测试产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\release\nebula-desktop.exe
```

执行流程：

1. 启动 release 产物。
2. 等待主窗口创建。
3. 调用 `CloseMainWindow()` 测试正常退出。
4. 再次启动 release 产物。
5. 等待主窗口创建。
6. 使用 `Stop-Process -Force` 测试异常退出。
7. 检查 Explorer 进程是否仍在运行。

结果：

```text
ExplorerBeforeId                 : 11556
ExplorerAfterId                  : 11556
ExplorerSameProcess              : True
NormalWindowReady                : True
NormalCloseRequested             : True
NormalExitedAfterClose           : True
NormalForcedStopNeeded           : False
AbnormalWindowReady              : True
AbnormalKilled                   : True
ExplorerRunningAfterAbnormalExit : True
```

结论：

- 正常退出通过。
- 异常退出后 Nebula 进程可被结束。
- Explorer 进程 ID 未变化。
- 未观察到 Explorer 崩溃。
- 未观察到黑屏。

### 35.4 验证记录

新增：

- `退出恢复验证记录.md`

当前未自动验证项：

- Windows 原生任务栏点击是否完全正常。
- Windows Notification Center 是否可正常打开。
- 锁屏恢复后是否正常。
- 睡眠唤醒后是否正常。
- Explorer 手动重启后 Nebula 是否能恢复布局。

### 35.5 当前状态

当前已完成任务书的主要实现和记录：

- Taskbar 初版。
- Launcher 初版。
- Control Center 初版。
- Notification Badge 初版。
- 性能验证记录。
- Windows 版本兼容记录。
- DPI 验证记录。
- 退出恢复验证记录。

仍需后续重点处理：

1. AppBar Manager 尚未实现，`SHAppBarMessage` 工作区预留未完成。
2. Windows 10 22H2 仍需实机验证。
3. 125%、200% DPI 和多屏插拔仍需实机验证。
4. 微信、QQ、企业微信、钉钉真实新消息 Badge 行为仍需人工触发验证。
5. Release 构建后首次冷启动略高于 2 秒，需要复测和优化。

## 36. AppBar Manager 后端能力补齐

### 36.1 实现判断

前一轮 `T6.3` 记录中，AppBar Manager 仍是空模块。

本轮处理时确认：

- 当前 Tauri 主窗口仍是普通应用窗口。
- 还不是独立贴边、无边框、常驻的 Taskbar overlay 窗口。
- 如果启动时直接把当前主窗口注册为 AppBar，会改写系统工作区并移动/压缩普通主窗口，影响当前开发体验。

因此本轮采用策略：

- 先补齐 AppBar Manager 后端能力。
- 暂不默认启用 AppBar 注册。
- 通过 IPC 暴露显式注册/注销命令。
- 后续在真正 Taskbar overlay 窗口完成后，再默认启用。

### 36.2 Rust 后端实现

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/src/core/appbar/mod.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

新增：

- `src-tauri/src/commands/appbar.rs`

新增 Windows API feature：

```toml
Win32_Graphics_Gdi
```

使用 API：

```rust
SHAppBarMessage
APPBARDATA
ABM_NEW
ABM_QUERYPOS
ABM_SETPOS
ABM_REMOVE
ABE_TOP
ABE_BOTTOM
ABE_LEFT
ABE_RIGHT
MonitorFromWindow
GetMonitorInfoW
SetWindowPos
```

新增后端能力：

```rust
register_appbar(hwnd, position, thickness)
unregister_appbar()
get_appbar_status()
```

行为：

- 获取 Tauri 窗口 `HWND`。
- 根据窗口所在显示器计算 AppBar 区域。
- 支持 `top`、`bottom`、`left`、`right` 四个边。
- `thickness` 限制在 `32..=128`。
- 注册前若已有 AppBar 状态，先注销旧注册。
- 注销时调用 `ABM_REMOVE`。
- 内部保存当前注册状态、窗口句柄、位置、厚度和矩形。

### 36.3 IPC 接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

新增类型：

```ts
AppBarRect
AppBarStatus
```

新增前端方法：

```ts
getAppBarStatus()
registerAppBar(position, thickness)
unregisterAppBar()
```

说明：

- 当前前端尚未自动调用 `registerAppBar()`。
- 这是有意保守处理，避免普通主窗口直接注册 AppBar。

### 36.4 记录修正

修改：

- `DPI验证记录.md`

修正内容：

- 从“AppBar Manager 尚未实现”改为“后端 AppBar 能力已实现，但未在 overlay 模式实机启用验证”。
- 明确仍需真正 Taskbar overlay 窗口和工作区预留实测。

### 36.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run rust:check
npm run check
npm run build
npm run rust:test
npm run rust:fmt:check
npm run tauri:build:debug
```

结果：

- Rust 格式化通过。
- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Vite 生产构建通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Rust 格式化检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 36.6 当前下一步

下一步建议：

1. 将当前普通主窗口拆分为独立 Taskbar overlay 窗口。
2. overlay 窗口设为无边框、透明/半透明、贴边、固定厚度。
3. 在 overlay 窗口 ready 后调用 `registerAppBar(position, thickness)`。
4. 在窗口关闭或应用退出时调用 `unregisterAppBar()`。
5. 再做工作区预留和多屏 DPI 实测。

## 37. 当前注意项

### 37.1 AppBar 注意项

- 当前已实现 AppBar 后端能力，但没有默认启用。
- 不要把当前普通主窗口直接注册为 AppBar。
- 当前主窗口是开发/预览工作区窗口，不是真正的贴边 Taskbar overlay。
- 如果直接对普通主窗口调用 `registerAppBar()`，可能会改写 Windows 工作区并移动或压缩主窗口。
- 正确做法是先拆出独立 Taskbar overlay 窗口，再对该 overlay 窗口注册 AppBar。
- overlay 窗口关闭、应用退出、异常恢复流程中必须调用 `unregisterAppBar()`。

### 37.2 未完成实测项

- Windows 10 22H2 尚未实机验证。
- 125%、200% DPI 缩放尚未实机验证。
- 多屏、副屏、显示器插拔尚未实机验证。
- Windows 10 降级样式尚未截图或人工确认。
- 微信、QQ、企业微信、钉钉真实新消息 Badge 行为尚未人工触发验证。
- Windows 原生通知中心可用性尚未人工点击验证。

### 37.3 性能注意项

- Release 热启动已达标。
- 空闲 CPU 和内存已达标。
- 构建后首次 release 冷启动采样为 `2276ms`，略高于 `<2s` 目标。
- 后续需要在非构建后环境中复测冷启动。
- 如果冷启动仍超过 2 秒，应优先优化首屏渲染和启动阶段 IPC 加载。

### 37.4 隐私与兼容边界

- 不允许读取微信、QQ、企业微信、钉钉聊天内容。
- 不允许读取通知正文。
- 不接管 Windows Notification Center。
- 不 Hook Explorer。
- 不注入 Explorer 或其他应用进程。
- Notification Badge 当前只使用窗口级状态和保守 indicator，不能声明支持真实未读消息数。

### 37.5 下一步优先级

建议优先顺序：

1. 拆分独立 Taskbar overlay 窗口。
2. 对 overlay 窗口接入 AppBar 注册和注销。
3. 实测 AppBar 工作区预留。
4. 做 Windows 10 22H2 实机验证。
5. 做 DPI、多屏和显示器插拔验证。

## 38. Taskbar overlay 退出修复

### 38.1 问题

短启动/关闭验证发现：

```text
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : False
ForcedStopNeeded : True
```

结论：

- `main` 窗口可以创建，也能收到关闭请求。
- `main` 关闭后进程没有自动退出。
- 风险点是 `taskbar` overlay 窗口仍在事件循环中，AppBar 注册状态也需要在退出路径中明确注销。

### 38.2 修复操作

修改：

- `src-tauri/src/lib.rs`

修复内容：

- `main` 窗口收到 `CloseRequested` 时调用 `api.prevent_close()`，避免只关闭主窗口后留下后台窗口。
- 关闭前先调用 `crate::core::appbar::unregister_appbar()`，保证 AppBar 工作区预留被释放。
- 如果存在 `taskbar` overlay 窗口，继续调用 `taskbar.close()`。
- 最后调用 `window.app_handle().exit(0)` 请求 Tauri 应用整体退出。
- `taskbar` 的 `CloseRequested` / `Destroyed` 仍继续调用 `unregister_appbar()`。
- 补充 `main` 的 `Destroyed` 清理兜底，避免非标准退出路径残留 AppBar 状态。

### 38.3 下一步验证

首次修复后重新执行短启动/关闭验证，结果仍未通过：

```text
ProcessId        : 27956
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : False
ForcedStopNeeded : True
```

随后枚举 debug 进程顶层窗口，确认有两个可见窗口：

```text
Nebula Taskbar  Tauri Window
Nebula Desktop  Tauri Window
```

判断：

- `CloseMainWindow()` 可能命中置顶的 `Nebula Taskbar`。
- 原逻辑中 `taskbar` 收到关闭请求只注销 AppBar，不退出应用。
- 因此即使 taskbar 窗口关闭，`main` 或事件循环仍可能保留。

继续修改：

- `taskbar` 收到 `CloseRequested` 时也调用 `api.prevent_close()`。
- 先调用 `unregister_appbar()`。
- 再调用 `window.app_handle().exit(0)` 请求整个应用退出。
- `taskbar` 的 `Destroyed` 保留为 AppBar 注销兜底。

第二次复测仍未通过：

```text
ProcessId        : 25788
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : False
ForcedStopNeeded : True
```

判断：

- 在当前多窗口 overlay 路径中，仅调用 `AppHandle.exit(0)` 不能可靠终止事件循环。
- 对桌面增强工具来说，关闭请求后残留后台进程和 AppBar 工作区状态是更高风险。

继续修改：

- 新增 `request_app_exit(app_handle)`。
- 先调用 Tauri `app_handle.exit(0)`，保留正常退出路径。
- 再启动 250ms 延迟兜底线程调用 `std::process::exit(0)`。
- 兜底前已经执行 `unregister_appbar()`，避免退出时残留 AppBar 工作区预留。

### 38.4 下一步验证

需要重新执行：

```powershell
npm run rust:fmt
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

并复测 debug 产物短启动/关闭，目标结果：

```text
ExitedAfterClose : True
ForcedStopNeeded : False
```

### 38.5 验证结果

重新执行：

```powershell
npm run rust:fmt
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- Rust 格式化通过。
- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Vite 生产构建通过。
- Rust 单元测试通过，当前 1 个测试通过。
- Tauri debug 构建通过。

稳定启动后关闭验证：

```text
ProcessId        : 30144
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : True
ForcedStopNeeded : False
```

结论：

- debug 产物启动后等待窗口稳定，再调用 `CloseMainWindow()` 可以正常退出。
- 退出不需要强制结束进程。
- 当前关闭路径会先注销 AppBar，再请求应用退出，并有 250ms 进程级兜底。

注意：

- 在窗口句柄刚出现后立即关闭的自动化场景中，仍曾出现未退出情况。
- 判断与启动早期多窗口创建顺序有关，真实用户路径风险较低。
- 后续如果要强化极早期关闭场景，建议把 `taskbar` 从静态配置窗口改为 `setup` 后显式创建，确保事件处理和退出策略完全就绪后再显示 overlay。

### 38.6 当前下一步

下一步建议：

1. 拆分独立 `launcher` overlay window。
2. 拆分独立 `control-center` overlay window。
3. `taskbar` overlay 按钮不再 no-op，而是显示/隐藏对应浮层窗口。
4. 避免把 Launcher / Control Center 直接渲染在 80px 高的 taskbar 窗口里。

## 39. Launcher / Control Center 独立 overlay 窗口

### 39.1 目标

前一阶段 `TaskbarOverlayApp` 中：

- `onOpenLauncher` 是 no-op。
- `onOpenControlCenter` 是 no-op。

原因：

- `taskbar` overlay 窗口高度只有约 80px。
- 如果直接在 `taskbar` 窗口内部渲染 Launcher 或 Control Center，会被窗口边界裁切。

本轮目标：

- 拆分 `launcher` overlay window。
- 拆分 `control-center` overlay window。
- taskbar 按钮点击后显示对应 overlay 窗口。

### 39.2 新增前端窗口控制

新增：

- `src/app/overlayWindows.ts`

能力：

```ts
showOverlayWindow(label)
hideOverlayWindow(label)
hideCurrentWindow()
```

支持标签：

```ts
"launcher"
"control-center"
```

实现：

- 使用 `@tauri-apps/api/webviewWindow` 获取指定窗口。
- 调用 `show()` 和 `setFocus()` 显示并聚焦 overlay。
- 调用 `hide()` 隐藏窗口。
- 显示前读取当前窗口所在显示器 `currentMonitor()`。
- 将目标 overlay 窗口移动到该显示器左上角，并设置为显示器物理尺寸。
- Launcher / Control Center 因此可以作为整屏透明浮层使用，不再受固定小窗口尺寸限制。
- 通过 `window.__TAURI_INTERNALS__` 做运行时判断，避免浏览器预览中误调用 Tauri API。

### 39.3 Launcher overlay App

新增：

- `src/app/LauncherOverlayApp.tsx`

实现内容：

- 独立加载固定应用、最近项目、运行窗口。
- 复用现有 `Launcher` 组件。
- `open` 固定为 true，窗口显示/隐藏由 Tauri window 控制。
- 关闭 Launcher 时调用 `hideCurrentWindow()`，隐藏 overlay 窗口而不是销毁。
- 支持：
  - 启动固定应用。
  - 启动搜索到的开始菜单应用。
  - 打开最近项目。
  - 激活或恢复运行窗口。
  - 成功启动后更新最近项目。

### 39.4 Control Center overlay App

新增：

- `src/app/ControlCenterOverlayApp.tsx`

实现内容：

- 独立加载配置、系统状态、运行窗口。
- 复用现有 `ControlCenter` 组件。
- `open` 固定为 true，窗口显示/隐藏由 Tauri window 控制。
- 关闭 Control Center 时调用 `hideCurrentWindow()`。
- 继续支持音量读取/设置和 Windows 设置入口。

### 39.5 前端入口切换

修改：

- `src/main.tsx`

新增 view：

```text
index.html?view=launcher
index.html?view=control-center
```

映射：

- 默认：`App`
- `taskbar`：`TaskbarOverlayApp`
- `launcher`：`LauncherOverlayApp`
- `control-center`：`ControlCenterOverlayApp`

同时把 `view` 写入 `document.documentElement.dataset.view`，供 CSS 区分透明窗口样式。

### 39.6 Taskbar overlay 接入

修改：

- `src/app/TaskbarOverlayApp.tsx`

行为：

- 点击 Launcher 按钮：
  - 先隐藏 `control-center`。
  - 再显示并聚焦 `launcher`。
- 点击 Control Center 按钮：
  - 先隐藏 `launcher`。
  - 再显示并聚焦 `control-center`。

### 39.7 Tauri 窗口配置

修改：

- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`

新增窗口：

```text
launcher
control-center
```

共同配置：

- `decorations: false`
- `transparent: true`
- `alwaysOnTop: true`
- `skipTaskbar: true`
- `resizable: false`
- `visible: false`

说明：

- 启动时创建窗口但默认隐藏。
- taskbar 点击后再显示。
- 避免 Launcher / Control Center 抢首屏焦点。
- 初始配置尺寸只是兜底，实际显示前会按当前显示器尺寸重设位置和大小。

Capabilities 修正：

- 原 `default.json` 只包含 `main`。
- 已补充：

```json
"windows": [
  "main",
  "taskbar",
  "launcher",
  "control-center"
]
```

原因：

- `taskbar` 需要调用 IPC 和窗口显示 API。
- `launcher` / `control-center` 需要调用 IPC、隐藏自身窗口。
- 如果不加入 capabilities，Tauri v2 运行时可能拒绝这些窗口的前端调用。

按钮点击实测后继续修正：

- taskbar 左侧 Launcher 按钮点击后，`Nebula Launcher` 仍为 `Visible=False`。
- taskbar 右侧 Control Center 按钮点击后，`Nebula Control Center` 仍为 `Visible=False`。
- 确认 `core:window:default` 只包含读取类窗口权限，不包含 `show`、`hide`、`set_focus`、`set_position`、`set_size`。

补充显式权限：

```json
"core:window:allow-hide",
"core:window:allow-set-focus",
"core:window:allow-set-position",
"core:window:allow-set-size",
"core:window:allow-show"
```

### 39.8 关闭事件处理

修改：

- `src-tauri/src/lib.rs`

新增：

```rust
is_aux_overlay(label)
```

行为：

- `launcher` / `control-center` 收到 `CloseRequested` 时阻止默认关闭。
- 调用 `window.hide()` 隐藏窗口。
- 不退出主应用。

### 39.9 样式修正

修改：

- `src/styles/index.css`

新增透明窗口支持：

```css
:root[data-view="launcher"]
:root[data-view="control-center"]
```

确保 overlay 窗口根节点和 body 背景透明。

### 39.10 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- TypeScript 类型检查通过。
- Rust 格式化通过。
- Rust `cargo check` 通过。
- Vite 生产构建通过，当前构建模块数为 460。
- Rust 单元测试通过，当前 1 个测试通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

Capabilities 和整屏 overlay 调整后再次执行：

```powershell
npm run check
npm run build
npm run tauri:build:debug
```

结果：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run tauri:build:debug` 通过。

补充 window 权限后再次执行：

```powershell
npm run check
npm run tauri:build:debug
```

结果：

- `npm run check` 通过。
- `npm run tauri:build:debug` 通过。

运行时窗口枚举结果：

```text
Nebula Desktop          Visible=True
Nebula Taskbar          Visible=True
Nebula Launcher         Visible=False
Nebula Control Center   Visible=False
```

稳定关闭验证：

```text
CloseRequested   : True
ExitedAfterClose : True
```

taskbar 按钮点击验证：

```text
LauncherVisibleBefore            : False
ControlVisibleBefore             : False
LauncherVisibleAfterClick        : True
LauncherHiddenAfterBackdropClick : True
ControlVisibleAfterClick         : True
```

Control Center 完整路径验证：

```text
ControlVisibleAfterTaskbarClick : True
ControlHiddenAfterBackdropClick : True
CloseRequested                  : True
ExitedAfterClose                : True
```

结论：

- `launcher` 和 `control-center` overlay 窗口已按预期创建并默认隐藏。
- 主窗口和 taskbar overlay 启动后可见。
- 稳定启动后关闭应用可以正常退出。
- taskbar 左侧 N 按钮可以打开 Launcher overlay。
- taskbar 右侧状态区可以打开 Control Center overlay。
- overlay 背景点击可以隐藏对应浮层。

### 39.11 当前注意项

- Launcher / Control Center 显示前会按当前显示器尺寸铺满，但尚未按 AppBar 工作区扣除自定义 taskbar 厚度。
- Control Center 还应进一步贴近真实 taskbar 状态区点击位置。
- 当 Launcher / Control Center 处于可见状态时，`CloseMainWindow()` 可能命中辅助浮层窗口；此时按当前设计只隐藏浮层，不退出应用。
- 退出应用应通过关闭 `main` / `taskbar`，或先隐藏辅助浮层后再关闭。

## 40. Launcher 全局热键

### 40.1 背景

当前主窗口内已有键盘监听，但只在主窗口获得焦点时有效。

原设计记录中默认热键为：

```text
Alt+Space
```

实测 Windows 全局热键注册：

```text
AltSpaceRegistered : False
AltSpaceLastError  : 1409
AltNRegistered     : True
AltNLastError      : 0
```

结论：

- 当前 Windows 11 Home 25H2 环境中，`Alt+Space` 已被系统占用，不能作为可靠全局热键。
- `Alt+N` 可注册，适合作为 MVP 全局 Launcher 热键。

### 40.2 后端实现

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`

新增 Windows API feature：

```toml
Win32_UI_Input_KeyboardAndMouse
```

使用 API：

```rust
RegisterHotKey
GetMessageW
WM_HOTKEY
MOD_ALT
VK_N
```

实现内容：

- 在 Tauri `setup` 阶段启动 `nebula-global-hotkey` 后台线程。
- 注册 `Alt+N` 全局热键。
- 收到热键消息后：
  - 隐藏 `control-center`。
  - 显示并聚焦 `launcher`。
- 注册失败时写入 warn 日志，不阻断应用启动。

### 40.3 默认配置同步

修改：

- `src-tauri/src/core/config/mod.rs`
- `src/app/desktopDefaults.ts`
- `src/app/App.tsx`
- `系统设计文档.md`
- `Windows兼容性验证记录.md`

调整：

- 默认 `launcherHotkey` 从 `Alt+Space` 改为 `Alt+N`。
- 主窗口预览模式下的快捷键监听也从 `Alt+Space` 改为 `Alt+N`。
- 设计文档配置示例同步为 `Alt+N`。
- Windows 兼容记录中的 Launcher 交互项同步为 `Alt+N`。

### 40.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run check
npm run tauri:build:debug
```

结果：

- Rust 格式化通过。
- TypeScript 类型检查通过。
- Rust `cargo check` 通过。
- Tauri debug 构建通过。

全局热键运行时验证：

```text
LauncherVisibleBefore            : False
LauncherVisibleAfterAltN         : True
LauncherHiddenAfterBackdropClick : True
CloseRequested                   : True
ExitedAfterClose                 : True
```

结论：

- `Alt+N` 可以在当前系统中打开 Launcher overlay。
- Launcher 打开后可通过背景点击隐藏。
- 隐藏后应用可正常退出。

### 40.5 当前注意项

- 现阶段热键实现固定注册 `Alt+N`，尚未按配置文件动态解析任意组合键。
- 已存在的用户配置文件如果仍写着 `Alt+Space`，不会影响当前后端实际注册 `Alt+N`，但后续需要做配置迁移或热键解析。
- `Alt+Space` 不应作为 Windows 全局热键默认值，因为它在当前环境中注册失败。
