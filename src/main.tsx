import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { ControlCenterOverlayApp } from "./app/ControlCenterOverlayApp";
import { LauncherOverlayApp } from "./app/LauncherOverlayApp";
import { TaskbarOverlayApp } from "./app/TaskbarOverlayApp";
import "./styles/index.css";

const view = new URLSearchParams(window.location.search).get("view");
const RootApp = rootAppForView(view);

if (view) {
  document.documentElement.dataset.view = view;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);

function rootAppForView(view: string | null) {
  switch (view) {
    case "taskbar":
      return TaskbarOverlayApp;
    case "launcher":
      return LauncherOverlayApp;
    case "control-center":
      return ControlCenterOverlayApp;
    default:
      return App;
  }
}
