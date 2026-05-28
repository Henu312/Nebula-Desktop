# Nebula Desktop 多屏 DPI 验证记录

## 1. 测试范围

任务：`T6.3 多屏 DPI 验证`

测试时间：2026-05-28

任务要求：

- 测试 125%、150%、200% 缩放。
- 测试主屏和副屏。
- 测试显示器插拔。
- 测试 Taskbar Top / Bottom。

验收标准：

- UI 不错位。
- AppBar 工作区计算正确。
- 显示器变化后可恢复布局。

## 2. 当前环境

当前显示控制器：

```text
Intel(R) Arc(TM) Graphics
DriverVersion: 32.0.101.6129
```

当前分辨率：

```text
2560 x 1600
RefreshRate: 120Hz
```

当前 DPI：

```text
AppliedDPI: 144
Scale: 150%
```

换算：

```text
96 DPI  = 100%
120 DPI = 125%
144 DPI = 150%
192 DPI = 200%
```

## 3. 当前代码状态

已具备：

- Taskbar 支持 `top`、`bottom`、`left`、`right` 的布局样式。
- UI 使用响应式宽度和高度约束：
  - `w-[min(1180px,calc(100vw-48px))]`
  - `h-[min(820px,calc(100vh-48px))]`
- Control Center 根据 Taskbar 位置计算面板位置。
- Launcher 使用视口居中浮层，不依赖固定像素屏幕坐标。

已补充：

- `src-tauri/src/core/appbar/mod.rs` 已实现 AppBar 注册、注销和状态查询。
- 已使用 `SHAppBarMessage` 支持 `ABM_NEW`、`ABM_QUERYPOS`、`ABM_SETPOS`、`ABM_REMOVE`。
- 已使用 `MonitorFromWindow` 和 `GetMonitorInfoW` 获取当前窗口所在显示器区域。

仍未完成：

- AppBar 尚未默认启用。
- 当前主窗口仍是普通应用窗口，不是独立贴边 Taskbar overlay。
- 尚未实现显示器变化监听。
- 尚未实现每显示器 DPI 查询和重算。

## 4. 当前验证结果

| 项目 | 当前结果 | 说明 |
|---|---|---|
| 当前 150% 缩放环境识别 | 通过 | `AppliedDPI=144` |
| 当前主屏分辨率识别 | 通过 | 2560x1600 |
| Taskbar 响应式布局代码检查 | 通过 | 使用视口约束 |
| Launcher 响应式布局代码检查 | 通过 | 使用固定最大宽度和视口定位 |
| Control Center 定位代码检查 | 通过 | 按 Taskbar 位置切换 |
| 125% 缩放实测 | 未执行 | 需要人工切换系统缩放 |
| 200% 缩放实测 | 未执行 | 需要人工切换系统缩放 |
| 副屏实测 | 未执行 | 当前未完成多屏实机验证 |
| 显示器插拔 | 未执行 | 需要物理或虚拟显示器环境 |
| AppBar 工作区计算 | 部分通过 | 后端 AppBar 能力已实现，但未在 overlay 模式实机启用验证 |

## 5. 结论

当前可以确认：

- 当前 Windows 11 25H2 环境为 150% 缩放。
- 现有前端布局具备基础响应式能力。
- 现有代码没有依赖 Windows 11 独占 DPI API。

当前不能确认：

- 125%、200% 缩放下 UI 是否完全无错位。
- 副屏和不同 DPI 显示器上的行为。
- 显示器插拔后布局恢复。
- AppBar 工作区计算。

阻塞项：

- 需要把当前普通主窗口拆分为真正的 Taskbar overlay 窗口后，再默认启用 AppBar。
- `SHAppBarMessage` 注册能力已具备，但尚未做实机工作区预留验证。

后续建议：

1. 先实现 AppBar Manager。
2. 增加显示器枚举和 DPI 查询命令。
3. 在 125%、150%、200% 缩放下分别人工截图复核。
4. 在双屏环境测试主屏/副屏切换。
5. 测试显示器插拔后 Taskbar 与 Control Center 是否重新定位。
