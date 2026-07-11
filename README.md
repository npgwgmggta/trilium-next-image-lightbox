# Trilium Next Image Lightbox

> Trilium Next 图片灯箱查看器：双击笔记中的图片，即可进入全屏查看、缩放、切换、复制、导出和查看图片信息。

[演示视频 / Demo Video](./PixPin_2026-07-10_15-17-02.mp4)

## 中文说明

### 功能

- 双击笔记中的图片打开灯箱查看器
- 在当前笔记内切换上一张 / 下一张图片
- 支持放大、缩小、复位和拖拽查看
- 支持复制图片到剪贴板
- 支持导出图片文件
- 右键菜单：复制、另存为、图片信息、设置
- 图片信息弹窗：名称、类型、大小、尺寸、修改时间、位置
- 界面语言支持中文、English、日本語

### 安装方法

1. 打开 Trilium Next。
2. 创建或打开一个前端 JavaScript 脚本笔记。
3. 将 `trilium-lightbox-v3.js` 的内容粘贴进去。
4. 确认该脚本笔记启用于前端。
5. 刷新或重启 Trilium Next。
6. 双击笔记里的图片即可打开查看器。

### 注意事项

复制图片到剪贴板需要安全上下文：桌面版、localhost 或 HTTPS 通常可用；普通 HTTP 页面可能会被浏览器限制。

图片大小和修改时间依赖服务器返回的响应头。如果服务器没有提供，对应字段会显示为未知。

---

## English

### Overview

A lightweight image lightbox script for Trilium Next. Double-click an image in a note to open a full-screen viewer with navigation, zoom, copy, export, image info, and multilingual UI.

### Features

- Double-click an image to open the lightbox
- Navigate previous / next images in the current note
- Zoom in, zoom out, reset, and drag the image
- Copy image to clipboard
- Export image as a file
- Right-click menu for copy, save as, image info, and settings
- Image info dialog with name, type, size, dimensions, modified time, and location
- Chinese, English, and Japanese interface

### Installation

1. Open Trilium Next.
2. Create or open a frontend JavaScript script note.
3. Paste the contents of `trilium-lightbox-v3.js` into that script note.
4. Make sure the script note is enabled for the frontend.
5. Refresh or restart Trilium Next.
6. Double-click an image in a note to open the viewer.

### Notes

Clipboard image copy requires a secure context. It should work in the desktop app, localhost, or HTTPS. Plain HTTP pages may be blocked by the browser.

Image size and modified time depend on response headers returned by the server. If the server does not provide them, the dialog will show them as unknown.

## License

MIT
