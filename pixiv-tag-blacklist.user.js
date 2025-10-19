// ==UserScript==
// @name         Pixiv 标签黑名单
// @namespace    http://tampermonkey.net/
// @version      2025-10-19
// @description  根据黑名单隐藏 Pixiv 上的作品
// @author       Zack
// @match        https://www.pixiv.net/novel/ranking*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

(function() {
    'use strict';

    // =================================================================
    // --- 配置 (CONFIG) ---
    // 在这里管理你的黑名单和网站的 CSS 选择器
    // =================================================================

    const CONFIG = {
        /**
         * 在此添加你想要屏蔽的标签.
         * 桌面端和移动端共享此列表.
         */
        BLACKLIST_TAGS: [
            "崩坏星穹铁道",
            "碧蓝航线",
            "明日方舟",
            "原神",
            "鸣潮",
        ],

        /**
         * CSS 选择器 - 桌面端 (Desktop)
         */
        DESKTOP: {
            // 桌面端单个作品的容器
            ITEM_CONTAINER: '._ranking-item',
            // 桌面端包含标签信息的元素 (通常是 <img>)
            TAGS_ELEMENT: 'img',
            // 包含标签信息的 data 属性
            TAGS_ATTRIBUTE: 'data-tags'
        },

        /**
         * CSS 选择器 - 移动端 (Mobile)
         */
        MOBILE: {
            // 移动端单个作品的容器
            ITEM_CONTAINER: '.list-item',
            // 移动端包含标签文本的 <a> 元素
            TAG_ELEMENT: 'a.tag'
        }
    };


    // =================================================================
    // --- 桌面端逻辑 ---
    //
    // 在 `@run-at document-start` 阶段立即注入 <style> 标签.
    // 在页面渲染前隐藏元素, 杜绝闪烁.
    // 此函数在移动端执行是无害的, 因为 CSS 选择器不匹配.
    // =================================================================

    function injectDesktopCSS() {
        const style = document.createElement('style');
        // 附加到 <html> 以确保它在 <body> 加载前生效
        document.documentElement.appendChild(style);

        const selectors = CONFIG.BLACKLIST_TAGS.map(tag => {
            // 生成CSS选择器, e.g.:
            // ._ranking-item:has(img[data-tags*="崩坏星穹铁道"])
            return `${CONFIG.DESKTOP.ITEM_CONTAINER}:has(${CONFIG.DESKTOP.TAGS_ELEMENT}[${CONFIG.DESKTOP.TAGS_ATTRIBUTE}*="${tag}"])`;
        });

        if (selectors.length > 0) {
            style.textContent = `
                ${selectors.join(',\n')} {
                    display: none !important;
                }
            `;
        }
    }


    // =================================================================
    // --- 移动端逻辑 ) ---
    //
    // 方法: JavaScript 扫描 + MutationObserver.
    // 1. checkAndHideMobileItem: 检查单个元素.
    // 2. initMobileMode: 扫描已有元素, 并设置一个 "监视器" (Observer)
    //    来自动过滤无限滚动时加载的新元素.
    // =================================================================

    /**
     * 检查并隐藏单个移动端作品
     * @param {Element} item - 一个 .list-item DOM 元素.
     */
    function checkAndHideMobileItem(item) {
        // 确保是有效的元素节点
        if (item.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        // 查找此作品的所有标签元素
        const tagElements = item.querySelectorAll(CONFIG.MOBILE.TAG_ELEMENT);
        // 将标签元素的文本内容提取为数组
        const tags = Array.from(tagElements).map(el => el.textContent.trim());

        // 检查此作品的任何一个标签是否在我们的黑名单中
        const isBlocked = CONFIG.BLACKLIST_TAGS.some(blockedTag => tags.includes(blockedTag));

        if (isBlocked) {
            item.style.display = 'none';
        }
    }

    /**
     * 启动移动端过滤, 扫描现有内容, 并设置监视器
     */
    function initMobileMode() {
        // 1. 首先扫描一次页面上所有已存在的内容
        document.querySelectorAll(CONFIG.MOBILE.ITEM_CONTAINER).forEach(checkAndHideMobileItem);

        // 2. 创建一个 MutationObserver 来监视 DOM 变化 (用于无限滚动)
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                // 我们只关心被添加到 DOM 中的节点
                if (mutation.type !== 'childList') continue;

                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    // 检查被添加的节点是否包含作品
                    const newItems = node.querySelectorAll(CONFIG.MOBILE.ITEM_CONTAINER);
                    newItems.forEach(checkAndHideMobileItem);
                }
            }
        });

        // 3. 配置并启动监视器, 监视整个 <body> 的子节点变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function main() {
        // 通过查询桌面端独有的元素来检测我们是否在桌面端
        const isDesktop = document.querySelector(CONFIG.DESKTOP.ITEM_CONTAINER);

        if (isDesktop) {
            injectDesktopCSS();
        } else {
            // 移动端
            // 启动重量级的 JS 监视器.
            initMobileMode();
        }
    }

    // =================================================================
    // --- 执行入口 (Execution Entry Point) ---
    // =================================================================
    // 等待 DOM 加载完毕再执行 "main" 函数, 等待 DOM 存在才能进行 "isDesktop" 检测, 以及启动 Observer.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        // DOM 已经加载完毕
        main();
    }

})();
