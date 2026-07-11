# Trilium Next Image Lightbox

A lightweight image lightbox script for Trilium Next. Double-click an image in a note to open a full-screen viewer with navigation, zoom, copy, export, image info, and multilingual UI.

## Features

- Double-click an image to open the lightbox
- Navigate previous / next images in the current note
- Zoom in, zoom out, reset, and drag the image
- Copy image to clipboard
- Export image as a file
- Right-click menu for copy, save as, image info, and settings
- Image info dialog with name, type, size, dimensions, modified time, and location
- Chinese, English, and Japanese interface

## Installation

1. Open Trilium Next.
2. Create or open a frontend JavaScript script note.
3. Copy the contents of `trilium-lightbox-v3.js` into that script note.
4. Make sure the script note is enabled for the frontend.
5. Refresh or restart Trilium Next.
6. Double-click an image in a note to open the viewer.

## Notes

Clipboard image copy requires a secure context. It should work in the desktop app, localhost, or HTTPS. Plain HTTP pages may be blocked by the browser.

Image size and modified time depend on response headers returned by the server. If the server does not provide them, the dialog will show them as unknown.

## License

MIT
