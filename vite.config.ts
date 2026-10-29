import { defineConfig } from "vite";

// React 和组件包（window.React、window.Memo）由 index.html 里的脚本加载，
// 来自设计系统；这里的 JSX 编译成 React.createElement，用的就是那份全局 React。
export default defineConfig({
  esbuild: { jsx: "transform", jsxFactory: "React.createElement", jsxFragment: "React.Fragment" },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
