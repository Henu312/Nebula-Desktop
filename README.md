# Nebula Desktop

Nebula Desktop 是一个面向 Windows 10 / Windows 11 的桌面增强层。项目采用 Tauri 2.x、React、TypeScript、TailwindCSS 和 Rust。

## 开发环境

已验证环境：

- Windows 11 Home 25H2
- Node.js 24
- npm 11
- Rust stable MSVC toolchain
- Tauri CLI 2
- WebView2 Runtime
- Visual Studio Build Tools 2022

目标兼容环境：

- Windows 10 22H2 x64
- Windows 11 23H2 / 24H2 / 25H2 x64

## 常用命令

安装前端依赖：

```powershell
npm install --offline=false --prefer-online
```

启动前端开发服务：

```powershell
npm run dev
```

前端地址：

```text
http://127.0.0.1:1420/
```

启动 Tauri 开发模式：

```powershell
npm run tauri:dev
```

前端类型检查：

```powershell
npm run typecheck
```

前端构建：

```powershell
npm run build
```

Rust 检查：

```powershell
npm run rust:check
```

Rust 格式化：

```powershell
npm run rust:fmt
```

Rust 格式化检查：

```powershell
npm run rust:fmt:check
```

整体检查：

```powershell
npm run check
```

Tauri debug 构建，不生成安装包：

```powershell
npm run tauri:build:debug
```

正式 Tauri 构建：

```powershell
npm run tauri:build
```

## 当前注意事项

当前机器上的 npm 配置处于 offline 模式。首次安装或新增 npm 依赖时，应使用：

```powershell
npm install --offline=false --prefer-online
```

如果 Cargo 处于 offline 模式且需要下载新依赖，可临时执行：

```powershell
$env:CARGO_NET_OFFLINE='false'
npm run rust:check
```

当前沙箱中直接执行 Vite/esbuild 可能出现：

```text
Error: spawn EPERM
```

这属于沙箱对子进程启动的限制。实际构建已在提升权限下验证通过。

## 项目边界

Nebula Desktop 必须遵守：

- 不替换 `explorer.exe`
- 不做 Shell Replacement
- 不 Hook Explorer
- 不注入系统进程
- 不接管 Windows Notification Center
- 不读取聊天内容或通知正文

核心功能以 Windows 10 可用 API 为基线，Windows 11 视觉能力只作为增强。
