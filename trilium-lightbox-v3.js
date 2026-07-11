/**
 * Trilium 图片查看器 Lightbox (V3.6)
 * 更新点（累计）：
 *  1. 双击图片打开查看器。
 *  2. 左右切换按钮：鼠标移到画面左/右端各 30% 感应带，两个按钮同时淡入。
 *  3. 首/末张提示：边界弹「当前笔记的第一张/最后一张图片」，1 秒淡化。
 *  4. 底部图标工具栏：放大/缩小/复位/复制/导出。
 *  5. 导出图片：canvas 同步绘制，稳定触发「另存为」。
 *  6. 右键图片弹出菜单：复制 / 另存为 / 图片信息 / 设置。
 *  7. 图片信息弹窗：名称、类型、大小、尺寸、修改时间、位置（大小/修改时间依赖服务器响应头，可能显示「未知」）。
 *  8. 设置弹窗：语言切换（中文/English/日本語），默认存脚本头部 CONFIG，运行期存 localStorage。
 */
(function() {
    if (window.triliumLightboxLoaded) return;

    const ICONS = {
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`,
        prev:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
        next:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
        zoomIn:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
        zoomOut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
        reset:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>`,
        download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        copy:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
        info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.6" r="0.8" fill="currentColor" stroke="none"/></svg>`,
        settings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    };

    // ============ 多语言配置（默认语言在脚本头部 CONFIG 中；运行期修改存 localStorage） ============
    const CONFIG = { language: 'zh' }; // 'zh' | 'en' | 'ja'
    const I18N = {
        zh: {
            menuCopy:'复制图片', menuSaveAs:'另存为', menuInfo:'图片信息', menuSettings:'设置',
            infoTitle:'图片信息', lblName:'图片名称', lblType:'图片类型', lblSize:'图片大小',
            lblDim:'图片尺寸', lblModified:'修改时间', lblLocation:'图片位置', lblUnknown:'未知',
            lblLoading:'加载中…', lblEmbedded:'内嵌图片',
            copied:'已复制图片到剪贴板', copyFailed:'复制失败：浏览器不支持或图片跨域受限', copyNeedHttps:'复制失败：当前为普通 HTTP 非安全环境，浏览器禁用了剪贴板。请用桌面版 / localhost / HTTPS 访问',
            firstImg:'当前笔记的第一张图片', lastImg:'当前笔记的最后一张图片',
            settingsTitle:'设置', lblLanguage:'语言', langZh:'中文', langEn:'英语', langJa:'日本語',
            infoNote:'说明：图片大小、修改时间依赖服务器返回的响应头，若服务器未提供则显示为「未知」。',
            titleClose:'关闭 (Esc)', titlePrev:'上一张 (←)', titleNext:'下一张 (→)',
            titleZoomIn:'放大 (+)', titleZoomOut:'缩小 (-)', titleZoomReset:'复位 / 1:1',
            titleCopy:'复制图片到剪贴板', titleDownload:'导出图片 (另存为)'
        },
        en: {
            menuCopy:'Copy image', menuSaveAs:'Save as', menuInfo:'Image info', menuSettings:'Settings',
            infoTitle:'Image Info', lblName:'Name', lblType:'Type', lblSize:'Size',
            lblDim:'Dimensions', lblModified:'Modified', lblLocation:'Location', lblUnknown:'Unknown',
            lblLoading:'Loading…', lblEmbedded:'Embedded image',
            copied:'Image copied to clipboard', copyFailed:'Copy failed: unsupported or cross-origin', copyNeedHttps:'Copy failed: page is plain HTTP (non-secure), clipboard disabled by browser. Use desktop app / localhost / HTTPS',
            firstImg:'First image in this note', lastImg:'Last image in this note',
            settingsTitle:'Settings', lblLanguage:'Language', langZh:'Chinese', langEn:'English', langJa:'Japanese',
            infoNote:'Note: Size and Modified depend on server response headers; shown as "Unknown" if not provided.',
            titleClose:'Close (Esc)', titlePrev:'Previous (←)', titleNext:'Next (→)',
            titleZoomIn:'Zoom in (+)', titleZoomOut:'Zoom out (-)', titleZoomReset:'Reset / 1:1',
            titleCopy:'Copy image', titleDownload:'Export image (Save as)'
        },
        ja: {
            menuCopy:'画像をコピー', menuSaveAs:'名前を付けて保存', menuInfo:'画像情報', menuSettings:'設定',
            infoTitle:'画像情報', lblName:'画像名', lblType:'種類', lblSize:'サイズ',
            lblDim:'サイズ（ピクセル）', lblModified:'更新日時', lblLocation:'場所', lblUnknown:'不明',
            lblLoading:'読み込み中…', lblEmbedded:'埋め込み画像',
            copied:'画像をクリップボードにコピーしました', copyFailed:'コピー失敗：未対応またはクロスオリジン制限', copyNeedHttps:'コピー失敗：現在のページは非セキュアな HTTP のためクリップボードが無効です。デスクトップ版・localhost・HTTPS でご利用ください',
            firstImg:'このノートの最初の画像', lastImg:'このノートの最後の画像',
            settingsTitle:'設定', lblLanguage:'言語', langZh:'中国語', langEn:'英語', langJa:'日本語',
            infoNote:'注意：サイズ・更新日時はサーバー応答ヘッダに依存し、ない場合は「不明」と表示されます。',
            titleClose:'閉じる (Esc)', titlePrev:'前へ (←)', titleNext:'次へ (→)',
            titleZoomIn:'拡大 (+)', titleZoomOut:'縮小 (-)', titleZoomReset:'リセット / 1:1',
            titleCopy:'画像をコピー', titleDownload:'画像を書き出し (名前を付けて保存)'
        }
    };
    function t(key) { return (I18N[CONFIG.language] || I18N.zh)[key] || key; }
    const SAVE_KEY_LANG = 'tl_lightbox_lang';
    function loadLang() {
        try { const v = localStorage.getItem(SAVE_KEY_LANG); if (v && I18N[v]) return v; } catch (e) {}
        return CONFIG.language;
    }
    function saveLang(l) { CONFIG.language = l; try { localStorage.setItem(SAVE_KEY_LANG, l); } catch (e) {} }
    CONFIG.language = loadLang();

    const style = document.createElement('style');
    style.textContent = `
        .tl-lightbox-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); z-index: 999999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
            user-select: none; isolation: isolate;
        }
        .tl-lightbox-overlay.active { opacity: 1; pointer-events: auto; }

        .tl-lightbox-wrap {
            position: relative; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-sizing: border-box; padding-top: 60px;
        }
        .tl-lightbox-img { max-width: 90%; max-height: 82%; object-fit: contain; transition: transform 0.15s ease-out; transform-origin: center; cursor: grab; }
        .tl-lightbox-img:active { cursor: grabbing; }

        .tl-lightbox-btn {
            position: absolute; background: #ffffff; color: #000000;
            mix-blend-mode: difference; border: none; cursor: pointer; padding: 0;
            display: flex; align-items: center; justify-content: center; z-index: 100001;
            transition: transform 0.2s ease, opacity 0.25s ease;
        }
        .tl-lightbox-btn svg { width: 55%; height: 55%; display: block; }
        .tl-lightbox-btn:hover { transform: scale(1.1); }

        .tl-lightbox-close { top: 60px; right: 20px; left: auto; width: 45px; height: 45px; border-radius: 50%; }

        .tl-lightbox-prev, .tl-lightbox-next {
            top: 50%; width: 48px; height: 48px; border-radius: 50%;
            opacity: 0; pointer-events: none;
        }
        .tl-lightbox-prev { left: 25px; transform: translateY(-50%); }
        .tl-lightbox-next { right: 25px; transform: translateY(-50%); }
        .tl-lightbox-prev.tl-edge-show, .tl-lightbox-next.tl-edge-show { opacity: 1; pointer-events: auto; }
        .tl-lightbox-prev:hover { transform: translateY(-50%) scale(1.12); }
        .tl-lightbox-next:hover { transform: translateY(-50%) scale(1.12); }

        .tl-lightbox-toolbar {
            position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 16px; z-index: 100001;
        }
        .tl-toolbar-btn {
            position: static; background: #ffffff; color: #000000; mix-blend-mode: difference;
            border: none; cursor: pointer; padding: 0; width: 44px; height: 44px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;
        }
        .tl-toolbar-btn svg { width: 22px; height: 22px; display: block; }
        .tl-toolbar-btn:hover { transform: scale(1.12); }

        /* 边界提示 toast */
        .tl-lightbox-toast {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.78); color: #fff; padding: 12px 22px; border-radius: 8px;
            font-size: 15px; font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
            z-index: 100002; pointer-events: none; opacity: 0; transition: opacity 0.4s ease;
            white-space: nowrap;
        }
        .tl-lightbox-toast.tl-toast-show { opacity: 1; }

        /* 右键菜单 */
        .tl-ctx-menu {
            position: fixed; z-index: 1000010; min-width: 168px;
            background: rgba(30,30,32,0.97); color: #fff; border-radius: 10px; padding: 6px;
            font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif; font-size: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.45); display: none;
        }
        .tl-ctx-menu.tl-show { display: block; }
        .tl-ctx-item { display: flex; align-items: center; gap: 11px; padding: 9px 13px; border-radius: 7px; cursor: pointer; }
        .tl-ctx-item:hover { background: rgba(255,255,255,0.14); }
        .tl-ctx-item svg { width: 18px; height: 18px; flex-shrink: 0; }
        .tl-ctx-item span { line-height: 1; }

        /* 信息 / 设置 弹窗 */
        .tl-modal-mask {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000011;
            display: none; align-items: center; justify-content: center;
        }
        .tl-modal-mask.tl-show { display: flex; }
        .tl-modal {
            background: #fff; color: #222; border-radius: 12px; min-width: 330px; max-width: 92vw;
            max-height: 88vh; overflow: auto; padding: 20px 22px;
            font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
            box-shadow: 0 16px 48px rgba(0,0,0,0.45);
        }
        .tl-modal h3 { margin: 0 0 14px; font-size: 17px; display: flex; justify-content: space-between; align-items: center; }
        .tl-modal-close { background: none; border: none; font-size: 22px; line-height: 1; cursor: pointer; color: #999; padding: 0 2px; }
        .tl-modal-close:hover { color: #333; }
        .tl-info-row { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .tl-info-row:last-child { border-bottom: none; }
        .tl-info-row .tl-k { width: 84px; color: #999; flex-shrink: 0; }
        .tl-info-row .tl-v { word-break: break-all; flex: 1; }
        .tl-modal-note { font-size: 12px; color: #aaa; margin-top: 10px; line-height: 1.55; }
        .tl-lang-opt { display: flex; align-items: center; gap: 10px; padding: 11px 13px; border: 1px solid #e5e5e5; border-radius: 9px; margin-bottom: 10px; cursor: pointer; font-size: 14px; }
        .tl-lang-opt:last-child { margin-bottom: 0; }
        .tl-lang-opt.tl-active { border-color: #3b82f6; background: #f0f6ff; }
        .tl-lang-opt input { accent-color: #3b82f6; width: 16px; height: 16px; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'tl-lightbox-overlay';
    overlay.innerHTML = `
        <button class="tl-lightbox-btn tl-lightbox-close" title="关闭 (Esc)">${ICONS.close}</button>
        <button class="tl-lightbox-btn tl-lightbox-prev" title="上一张 (←)">${ICONS.prev}</button>
        <div class="tl-lightbox-wrap">
            <img class="tl-lightbox-img" src="" alt="" draggable="false">
        </div>
        <button class="tl-lightbox-btn tl-lightbox-next" title="下一张 (→)">${ICONS.next}</button>

        <div class="tl-lightbox-toolbar">
            <button class="tl-toolbar-btn tl-zoom-in"  title="放大 (+)">${ICONS.zoomIn}</button>
            <button class="tl-toolbar-btn tl-zoom-out" title="缩小 (-)">${ICONS.zoomOut}</button>
            <button class="tl-toolbar-btn tl-zoom-reset" title="复位 / 1:1">${ICONS.reset}</button>
            <button class="tl-toolbar-btn tl-copy" title="复制图片到剪贴板">${ICONS.copy}</button>
            <button class="tl-toolbar-btn tl-download" title="导出图片 (另存为)">${ICONS.download}</button>
        </div>

        <div class="tl-lightbox-toast"></div>
    `;
    document.body.appendChild(overlay);

    // ============ 右键菜单 / 图片信息 / 设置 弹窗 DOM ============
    const ctxMenu = document.createElement('div');
    ctxMenu.className = 'tl-ctx-menu';
    document.body.appendChild(ctxMenu);

    const infoModal = document.createElement('div');
    infoModal.className = 'tl-modal-mask tl-info-mask';
    infoModal.innerHTML = '<div class="tl-modal"><h3><span class="tl-info-title"></span><button class="tl-modal-close" title="关闭">×</button></h3><div class="tl-info-body"></div><div class="tl-modal-note"></div></div>';
    document.body.appendChild(infoModal);

    const settingsModal = document.createElement('div');
    settingsModal.className = 'tl-modal-mask tl-settings-mask';
    settingsModal.innerHTML = '<div class="tl-modal"><h3><span class="tl-settings-title"></span><button class="tl-modal-close" title="关闭">×</button></h3><div class="tl-lang-body"></div></div>';
    document.body.appendChild(settingsModal);

    const lightboxImg = overlay.querySelector('.tl-lightbox-img');
    const closeBtn = overlay.querySelector('.tl-lightbox-close');
    const prevBtn = overlay.querySelector('.tl-lightbox-prev');
    const nextBtn = overlay.querySelector('.tl-lightbox-next');
    const zoomInBtn = overlay.querySelector('.tl-zoom-in');
    const zoomOutBtn = overlay.querySelector('.tl-zoom-out');
    const zoomResetBtn = overlay.querySelector('.tl-zoom-reset');
    const downloadBtn = overlay.querySelector('.tl-download');
    const copyBtn = overlay.querySelector('.tl-copy');
    const toast = overlay.querySelector('.tl-lightbox-toast');

    // 弹窗内部元素引用
    const infoTitleEl = infoModal.querySelector('.tl-info-title');
    const infoBodyEl = infoModal.querySelector('.tl-info-body');
    const infoNoteEl = infoModal.querySelector('.tl-modal-note');
    const settingsTitleEl = settingsModal.querySelector('.tl-settings-title');
    const langBodyEl = settingsModal.querySelector('.tl-lang-body');
    const infoCloseBtn = infoModal.querySelector('.tl-modal-close');
    const settingsCloseBtn = settingsModal.querySelector('.tl-modal-close');

    let currentImages = [];
    let currentIndex = 0;
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    let lastMouseX = -1;
    let toastTimer = null;
    let imageReady = false;

    function hasMultiple() { return currentImages.length > 1; }

    function setImageReady(ready) {
        imageReady = ready;
        copyBtn.disabled = !ready;
        downloadBtn.disabled = !ready;
    }

    function showImage(index) {
        if (index < 0 || index >= currentImages.length) return;
        currentIndex = index;
        const src = currentImages[currentIndex].src;
        setImageReady(false);
        lightboxImg.onload = () => { if (lightboxImg.src === src) setImageReady(true); };
        lightboxImg.onerror = () => { if (lightboxImg.src === src) setImageReady(false); };
        lightboxImg.src = src;
        if (lightboxImg.src === src && lightboxImg.complete && lightboxImg.naturalWidth > 0) setImageReady(true);
        resetZoom();
        updateEdgeButtons(lastMouseX);
    }

    function resetZoom() {
        scale = 1; translateX = 0; translateY = 0;
        updateTransform();
    }

    function updateTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function zoomFromCenter(isZoomIn) {
        const oldScale = scale;
        scale += isZoomIn ? 0.25 : -0.25;
        scale = Math.max(0.15, Math.min(scale, 15));
        translateX = translateX * (scale / oldScale);
        translateY = translateY * (scale / oldScale);
        updateTransform();
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('tl-toast-show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('tl-toast-show'), 1000);
    }

    // ============ 导出图片（canvas 绘制，稳定触发另存为） ============
    function deriveFileName(src, mime) {
        let name = '';
        try {
            const u = new URL(src, location.href);
            name = decodeURIComponent(u.pathname.split('/').pop() || '');
        } catch (e) {}
        if (!name || !/\.[a-z0-9]{2,5}$/i.test(name)) {
            const extMap = { 'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','image/svg+xml':'svg','image/bmp':'bmp' };
            const ext = extMap[mime] || 'png';
            name = 'image_' + Date.now() + '.' + ext;
        }
        return name;
    }

    function triggerDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // 关键：同步完成，全程留在用户点击手势内，否则浏览器会拦截下载。
    function exportImage() {
        const src = currentImages[currentIndex] && currentImages[currentIndex].src;
        if (!src) return;
        try {
            // 直接用灯箱内已加载完成的 <img>，避免异步重新加载导致用户手势失效
            const img = lightboxImg;
            if (!imageReady || !img.complete || !img.naturalWidth) return;
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png'); // 同步拿到 dataURL
            triggerDownload(dataUrl, deriveFileName(src, 'image/png'));
        } catch (err) {
            // 兜底：跨域无 CORS 头导致 canvas 被污染，则新标签打开由用户手动另存为
            const a = document.createElement('a');
            a.href = src; a.target = '_blank'; a.rel = 'noopener';
            document.body.appendChild(a); a.click(); a.remove();
        }
    }

    // ============ 复制图片到剪贴板 ============
    async function copyImage() {
        try {
            // navigator.clipboard 仅在「安全上下文」可用：HTTPS、localhost/127.0.0.1、以及桌面版(Electron)。
            // 普通 http://局域网IP / 公网域名 不算安全上下文，clipboard 会被浏览器禁用——Nriver 插件也受此限制。
            if (!window.isSecureContext) throw new Error('insecure');
            if (!navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported');
            const img = lightboxImg;
            if (!imageReady || !img.complete || !img.naturalWidth) return;
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            // 剪贴板图片写入需要 PNG；toBlob 是异步的，但 Clipboard API 允许在点击后短时内完成
            const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
            if (!blob) throw new Error('toBlob null');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast(t('copied'));
        } catch (err) {
            if (err && err.message === 'insecure') showToast(t('copyNeedHttps'));
            else showToast(t('copyFailed'));
        }
    }

    // ============ 右键菜单 / 图片信息 / 设置 ============
    function closeAllPopups() {
        ctxMenu.classList.remove('tl-show');
        infoModal.classList.remove('tl-show');
        settingsModal.classList.remove('tl-show');
    }

    function openCtxMenu(x, y) {
        const items = [
            { key: 'menuCopy',     icon: ICONS.copy,     fn: copyImage },
            { key: 'menuSaveAs',   icon: ICONS.download, fn: exportImage },
            { key: 'menuInfo',     icon: ICONS.info,     fn: openInfo },
            { key: 'menuSettings', icon: ICONS.settings, fn: openSettings }
        ];
        ctxMenu.innerHTML = items.map((it, i) =>
            `<div class="tl-ctx-item" data-i="${i}">${it.icon}<span>${t(it.key)}</span></div>`
        ).join('');
        ctxMenu.querySelectorAll('.tl-ctx-item').forEach(el => {
            el.addEventListener('click', () => {
                const it = items[+el.dataset.i];
                closeAllPopups();
                it.fn();
            });
        });
        ctxMenu.classList.add('tl-show');
        const mw = ctxMenu.offsetWidth, mh = ctxMenu.offsetHeight;
        ctxMenu.style.left = Math.max(8, Math.min(x, window.innerWidth - mw - 8)) + 'px';
        ctxMenu.style.top  = Math.max(8, Math.min(y, window.innerHeight - mh - 8)) + 'px';
    }

    lightboxImg.addEventListener('contextmenu', function(e) {
        e.preventDefault(); e.stopPropagation();
        openCtxMenu(e.clientX, e.clientY);
    });
    overlay.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    document.addEventListener('click', function(e) {
        if (!ctxMenu.contains(e.target)) ctxMenu.classList.remove('tl-show');
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAllPopups(); });
    window.addEventListener('wheel', function(e) {
        if (!e.target.closest || !e.target.closest('.tl-modal')) closeAllPopups();
    }, true);

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }
    function getImageName(src) {
        if (src.indexOf('data:') === 0) return t('lblEmbedded');
        try {
            const u = new URL(src, location.href);
            const n = decodeURIComponent(u.pathname.split('/').pop() || '');
            if (n) return n;
        } catch (e) {}
        return 'image';
    }
    function getImageType(src) {
        if (src.indexOf('data:') === 0) {
            const m = src.match(/^data:(image\/[a-z0-9.+-]+)/i);
            return m ? m[1].split('/')[1].toUpperCase() : t('lblUnknown');
        }
        const ext = (src.split('?')[0].split('#')[0].split('.').pop() || '').toUpperCase();
        return /^[A-Z0-9]{2,5}$/.test(ext) ? ext : t('lblUnknown');
    }
    function formatBytes(n) {
        if (n == null) return t('lblUnknown');
        if (n < 1024) return n + ' B';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1048576).toFixed(2) + ' MB';
    }
    async function fetchMeta(src) {
        if (src.indexOf('data:') === 0) {
            const m = src.match(/^data:.*;base64,(.*)$/);
            const bytes = m ? Math.ceil((m[1].length * 3) / 4) : null;
            return { size: bytes, modified: null };
        }
        try {
            let r;
            try {
                r = await fetch(src, { method: 'HEAD', credentials: 'same-origin' });
            } catch (e) {}
            if (!r || !r.ok) r = await fetch(src, { credentials: 'same-origin' });
            const cl = r.headers.get('content-length');
            const lm = r.headers.get('last-modified');
            return {
                size: cl ? parseInt(cl, 10) : null,
                modified: lm ? new Date(lm).toLocaleString() : null
            };
        } catch (e) {
            return { size: null, modified: null };
        }
    }

    async function openInfo() {
        const src = currentImages[currentIndex] && currentImages[currentIndex].src;
        if (!src) return;
        infoTitleEl.textContent = t('infoTitle');
        infoNoteEl.textContent = t('infoNote');
        const dispLoc = src.length > 120 ? src.slice(0, 120) + '…' : src;
        const rows = [
            [t('lblName'), getImageName(src)],
            [t('lblType'), getImageType(src)],
            [t('lblSize'), t('lblLoading')],
            [t('lblDim'), (lightboxImg.naturalWidth || 0) + ' × ' + (lightboxImg.naturalHeight || 0)],
            [t('lblModified'), t('lblLoading')],
            [t('lblLocation'), dispLoc]
        ];
        infoBodyEl.innerHTML = rows.map(r =>
            `<div class="tl-info-row"><div class="tl-k">${r[0]}</div><div class="tl-v">${escapeHtml(r[1])}</div></div>`
        ).join('');
        infoBodyEl.children[5].querySelector('.tl-v').title = src;
        infoModal.classList.add('tl-show');

        const meta = await fetchMeta(src);
        if (!infoModal.classList.contains('tl-show')) return;
        const sizeEl = infoBodyEl.children[2].querySelector('.tl-v');
        const modEl  = infoBodyEl.children[4].querySelector('.tl-v');
        if (sizeEl) sizeEl.textContent = meta.size != null ? formatBytes(meta.size) : t('lblUnknown');
        if (modEl)  modEl.textContent  = meta.modified != null ? meta.modified : t('lblUnknown');
    }

    function openSettings() {
        settingsTitleEl.textContent = t('settingsTitle');
        const langs = [['zh', t('langZh')], ['en', t('langEn')], ['ja', t('langJa')]];
        langBodyEl.innerHTML = langs.map(([code, label]) =>
            `<label class="tl-lang-opt ${CONFIG.language === code ? 'tl-active' : ''}">
                <input type="radio" name="tl-lang" value="${code}" ${CONFIG.language === code ? 'checked' : ''}/>
                <span>${label}</span>
            </label>`
        ).join('');
        langBodyEl.querySelectorAll('input[name="tl-lang"]').forEach(inp => {
            inp.addEventListener('change', () => { saveLang(inp.value); localizeStatic(); openSettings(); });
        });
        settingsModal.classList.add('tl-show');
    }

    infoCloseBtn.addEventListener('click', () => infoModal.classList.remove('tl-show'));
    settingsCloseBtn.addEventListener('click', () => settingsModal.classList.remove('tl-show'));
    infoModal.addEventListener('click', e => { if (e.target === infoModal) infoModal.classList.remove('tl-show'); });
    settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.remove('tl-show'); });

    // 工具栏按钮悬浮提示（title）随语言切换而更新
    function localizeStatic() {
        closeBtn.title = t('titleClose');
        prevBtn.title = t('titlePrev');
        nextBtn.title = t('titleNext');
        zoomInBtn.title = t('titleZoomIn');
        zoomOutBtn.title = t('titleZoomOut');
        zoomResetBtn.title = t('titleZoomReset');
        copyBtn.title = t('titleCopy');
        downloadBtn.title = t('titleDownload');
    }
    localizeStatic();

    // ============ 左右按钮：鼠标到左端或右端，两个按钮同时显示 ============
    function updateEdgeButtons(mouseX) {
        if (!hasMultiple()) {
            prevBtn.classList.remove('tl-edge-show');
            nextBtn.classList.remove('tl-edge-show');
            return;
        }
        const width = overlay.clientWidth;
        const edge = Math.max(80, width * 0.30);
        const nearLeft = mouseX >= 0 && mouseX < edge;
        const nearRight = mouseX >= 0 && mouseX > width - edge;

        // 靠近任意一端 → 两个切换按钮同时显示（即使首/末张也显示）
        if (nearLeft || nearRight) {
            prevBtn.classList.add('tl-edge-show');
            nextBtn.classList.add('tl-edge-show');
        } else {
            prevBtn.classList.remove('tl-edge-show');
            nextBtn.classList.remove('tl-edge-show');
        }
    }

    overlay.addEventListener('mousemove', function(e) {
        lastMouseX = e.clientX - overlay.getBoundingClientRect().left;
        updateEdgeButtons(lastMouseX);
    });
    overlay.addEventListener('mouseleave', function() {
        lastMouseX = -1;
        prevBtn.classList.remove('tl-edge-show');
        nextBtn.classList.remove('tl-edge-show');
    });

    // 双击图片才打开查看器（避免误触；与 WPS 等习惯一致）
    document.body.addEventListener('dblclick', function(e) {
        if (e.target.tagName === 'IMG') {
            if (e.target.closest('.tl-lightbox-overlay') || e.target.closest('.sidebar') || e.target.closest('.tree') || e.target.closest('.menus')) return;
            const container = e.target.closest('.note-detail') || e.target.closest('.ck-content') || e.target.closest('.component') || document.body;
            if (container) {
                currentImages = Array.from(container.querySelectorAll('img')).filter(img => {
                    if (img.closest('.tl-lightbox-overlay') || img.closest('.sidebar') || img.closest('.tree') || img.closest('.menus')) return false;
                    return img.src && img.getBoundingClientRect().width > 15;
                });
                currentIndex = currentImages.indexOf(e.target);
                if (currentIndex === -1) { currentImages = [e.target]; currentIndex = 0; }
                showImage(currentIndex);
                overlay.classList.add('active');
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, true);

    function closeLightbox() { overlay.classList.remove('active'); }
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay || e.target.className === 'tl-lightbox-wrap') closeLightbox();
    });

    // 翻页按钮：到达边界时弹提示而不是切换
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        if (currentIndex > 0) showImage(currentIndex - 1);
        else showToast(t('firstImg'));
    }, true);
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        if (currentIndex < currentImages.length - 1) showImage(currentIndex + 1);
        else showToast(t('lastImg'));
    }, true);

    zoomInBtn.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); zoomFromCenter(true); }, true);
    zoomOutBtn.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); zoomFromCenter(false); }, true);
    zoomResetBtn.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); resetZoom(); }, true);
    copyBtn.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); copyImage(); }, true);
    downloadBtn.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); exportImage(); }, true);

    overlay.addEventListener('wheel', function(e) {
        e.preventDefault();
        const oldScale = scale;
        if (e.deltaY < 0) scale += 0.15; else scale -= 0.15;
        scale = Math.max(0.15, Math.min(scale, 15));
        const rect = overlay.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        translateX = mouseX - (mouseX - translateX) * (scale / oldScale);
        translateY = mouseY - (mouseY - translateY) * (scale / oldScale);
        updateTransform();
    }, { passive: false });

    lightboxImg.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // 仅左键拖拽，避免右键误触
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.transition = 'none';
    });
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });
    window.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; lightboxImg.style.transition = 'transform 0.15s ease-out'; }
    });

    window.addEventListener('keydown', function(e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { if (currentIndex > 0) showImage(currentIndex - 1); else showToast(t('firstImg')); }
        if (e.key === 'ArrowRight') { if (currentIndex < currentImages.length - 1) showImage(currentIndex + 1); else showToast(t('lastImg')); }
    });

    window.triliumLightboxLoaded = true;
})();




