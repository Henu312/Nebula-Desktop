# Nebula Desktop Windows 兼容性验证记录

## 1. 测试范围

任务：`T6.2 Windows 版本兼容验证`

测试时间：2026-05-28

目标平台：

- Windows 10 22H2 x64
- Windows 11 23H2 / 24H2 / 25H2 x64

验证项目：

- 启动。
- 退出。
- Taskbar。
- Launcher。
- Control Center。
- Notification Badge。
- Windows 10 降级样式。
- Windows 11 增强视觉稳定性。

## 2. 当前系统识别

当前可测系统：

```text
Microsoft Windows 11 家庭版 中文版
Version: 10.0.26200
BuildNumber: 26200
DisplayVersion: 25H2
Architecture: 64 位
EditionID: CoreCountrySpecific
```

说明：

- `Get-ComputerInfo` 和注册表 `ProductName` 返回 `Windows 10 Home China`。
- `Win32_OperatingSystem.Caption` 返回 `Microsoft Windows 11 家庭版 中文版`。
- `DisplayVersion=25H2`、`CurrentBuild=26200`，按当前项目目标记录为 Windows 11 Home 25H2。

## 3. Windows 11 25H2 验证

产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\release\nebula-desktop.exe
```

启动/退出检查：

| 项目 | 结果 |
|---|---|
| 进程启动 | 通过 |
| 主窗口创建 | 通过 |
| `CloseMainWindow()` 请求 | 通过 |
| 关闭后进程退出 | 通过 |
| 是否需要强制结束 | 否 |

采样结果：

```text
WindowReady      : True
CloseRequested   : True
ExitedAfterClose : True
ForcedStopNeeded : False
```

功能状态：

| 功能 | 当前结论 | 说明 |
|---|---|---|
| Taskbar | 构建通过，窗口可启动 | 需要人工视觉复核位置和遮挡 |
| Launcher | 构建通过，`Alt+N` 全局热键验证通过 | Taskbar 按钮和热键均已自动化验证，仍建议人工视觉复核 |
| Control Center | 构建通过 | 状态区点击、音量、设置入口需人工复核 |
| Notification Badge | 构建通过 | Badge UI 和 indicator 已接入，真实消息行为需 T5.3 人工触发 |
| 退出行为 | 通过 | 本轮验证可正常关闭 |

## 4. Windows 10 22H2 状态

当前机器不是 Windows 10 22H2，无法完成实机验证。

待验证项目：

- Release 产物能否启动。
- Taskbar 是否正常显示。
- Launcher 是否能打开和搜索。
- Control Center 是否能打开。
- Core Audio 音量控制是否可用。
- `ms-settings:` 入口是否能打开 WiFi、蓝牙、显示、电源设置。
- 半透明、边框、阴影、圆角在无 Windows 11 Mica/Acrylic 依赖下是否正常降级。
- Notification Badge 是否不影响点击。

## 5. 兼容性结论

当前已验证：

- Windows 11 Home 25H2 上 release 产物能启动。
- Windows 11 Home 25H2 上 release 产物能正常关闭。
- Windows 11 Home 25H2 上构建链路、类型检查、Rust 检查、debug/release 构建均可通过。

当前未完成：

- Windows 10 22H2 实机验证。
- Windows 11 25H2 的完整人工 UI 交互复核。
- Windows 10 降级样式实机截图或人工记录。

后续建议：

1. 在 Windows 10 22H2 x64 机器上运行 release 产物。
2. 逐项复核 Taskbar、Launcher、Control Center、Notification Badge。
3. 记录 Windows 10 上透明、阴影、圆角、焦点行为是否影响操作。
4. 如果 Windows 10 上 `backdrop-blur` 表现弱化，只要可读性和点击操作正常即可视为降级通过。
