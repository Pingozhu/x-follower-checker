(function () {
    if (window.hasRunXAssistant) return;
    window.hasRunXAssistant = true;

    console.log("🚀 X 关注状态检测助手 v1.10 已启动... (X Follower Checker started...)");

    let relationshipCache = {};

    // 从存储中加载缓存 / Load cache from storage
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['relationshipCache'], (result) => {
                try {
                    if (result && result.relationshipCache) {
                        relationshipCache = result.relationshipCache;
                        console.log("📦 Loaded cache:", Object.keys(relationshipCache).length, "users");
                        updateAllLabels();
                    }
                } catch (e) {
                    console.log("⚠️ Failed to process loaded cache");
                }
            });
        }
    } catch (e) {
        console.log("⚠️ chrome.storage not available");
    }

    // 保存缓存到存储 / Save cache to storage
    const saveCache = () => {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.storage?.local) {
                chrome.storage.local.set({ relationshipCache });
            }
        } catch (e) {
            // 忽略扩展上下文失效等错误 / Ignore extension context invalidated errors
        }
    };

    // 获取用户 handle / Get user handle
    const getHandle = (container) => {
        // 1. 从 User-Names 的第二个 span 获取 / Get from second span in User-Names
        const handleSpan = container.querySelector('[data-testid="User-Names"] span:nth-child(2)');
        if (handleSpan && handleSpan.textContent.startsWith('@')) {
            return handleSpan.textContent.slice(1);
        }

        // 2. 从链接 href 获取 / Get from link href
        const profileLinks = Array.from(container.querySelectorAll('a[role="link"][href^="/"]'));
        for (const link of profileLinks) {
            const path = link.getAttribute('href').slice(1);
            if (!['home', 'explore', 'notifications', 'messages', 'i', 'search', 'settings'].includes(path.split('/')[0])) {
                return path;
            }
        }

        // 3. 正则匹配 / Regex match
        const handleMatch = container.innerText.match(/@(\w+)/);
        return handleMatch ? handleMatch[1] : null;
    };

    // 创建或更新标签 / Create or update label
    const createOrUpdateLabel = (container, status, isUserCell) => {
        if (isUserCell) {
            // UserCell: 使用背景色 / Use background color
            const existingLabel = container.querySelector('.x-follower-status-label');
            if (existingLabel) existingLabel.remove();

            let bgColor = '';
            if (status === 'mutual') {
                bgColor = 'rgba(144, 238, 144, 0.2)';
            } else if (status === 'not_following_back') {
                bgColor = 'rgba(255, 99, 71, 0.2)';
            }

            container.style.backgroundColor = bgColor;
            return;
        }

        // Tweet: 使用标签 / Use label
        container.style.backgroundColor = '';

        const namesContainer = container.querySelector('[data-testid="User-Names"]') ||
            container.querySelector('div[dir="ltr"] span')?.parentElement ||
            container.querySelector('div[dir="ltr"]');

        if (!namesContainer) return;

        let label = namesContainer.querySelector('.x-follower-status-label');
        if (!label) {
            label = document.createElement('span');
            label.className = 'x-follower-status-label';
            label.style.marginLeft = '8px';
            label.style.padding = '1px 6px';
            label.style.borderRadius = '4px';
            label.style.fontSize = '11px';
            label.style.fontWeight = 'bold';
            label.style.color = '#FFFFFF';
            label.style.display = 'inline-block';
            label.style.verticalAlign = 'middle';
            namesContainer.appendChild(label);
        }

        let text = '';
        let bgColor = '';

        switch (status) {
            case 'mutual':
                text = '互关 (Mutual)';
                bgColor = 'rgba(144, 238, 144, 0.8)';
                break;
            case 'not_following_back':
                text = '未回关 (Not Following)';
                bgColor = 'rgba(255, 99, 71, 0.8)';
                break;
            case 'following':
                text = '已关注 (Following)';
                bgColor = 'rgba(255, 165, 0, 0.8)';
                break;
            default:
                label.remove();
                return;
        }

        label.textContent = text;
        label.style.backgroundColor = bgColor;
    };

    // 更新所有标签 / Update all labels
    const updateAllLabels = () => {
        let changed = false;

        // 1. 处理 UserCell（关注列表等）/ Process UserCell (Following lists, etc.)
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        userCells.forEach(cell => {
            const handle = getHandle(cell);
            if (!handle) return;

            const spans = Array.from(cell.querySelectorAll('span'));

            // 检查是否有"正在关注"按钮 / Check for "Following" button
            const isFollowing = spans.some(
                el => el.textContent.trim() === '正在关注' ||
                    el.textContent.trim() === 'Following'
            );

            if (!isFollowing) {
                // 不是我关注的人 / Not following
                if (relationshipCache[handle] !== 'none') {
                    relationshipCache[handle] = 'none';
                    changed = true;
                }
                createOrUpdateLabel(cell, 'none', true);
                return;
            }

            // 检查是否有"关注了你"标签 / Check for "Follows you" label
            const followsYou = spans.some(
                el => el.textContent.includes('关注了你') ||
                    el.textContent.includes('Follows you')
            );

            const status = followsYou ? 'mutual' : 'not_following_back';

            if (relationshipCache[handle] !== status) {
                relationshipCache[handle] = status;
                changed = true;
            }

            createOrUpdateLabel(cell, status, true);
        });

        // 2. 处理 Tweets（时间线推文）/ Process Tweets (Timeline tweets)
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        tweets.forEach(tweet => {
            const handle = getHandle(tweet);
            if (!handle) return;

            // 从缓存读取状态 / Read status from cache
            let status = relationshipCache[handle];

            // 如果缓存中没有，检查是否有"关注了你"标签
            // If not in cache, check for "Follows you" label
            if (!status) {
                const spans = Array.from(tweet.querySelectorAll('span'));
                const followsYou = spans.some(
                    el => el.textContent.includes('关注了你') ||
                        el.textContent.includes('Follows you')
                );

                // 如果有"关注了你"，说明至少是互关
                // If "Follows you" exists, it's at least mutual
                if (followsYou) {
                    status = 'mutual';
                    relationshipCache[handle] = 'mutual';
                    changed = true;
                }
            }

            // 只显示有明确状态的用户 / Only show users with confirmed status
            if (status && status !== 'none') {
                createOrUpdateLabel(tweet, status, false);
            }
        });

        if (changed) {
            saveCache();
        }
    };

    // 防抖处理 / Debounce
    let debounceTimer;
    const debounceHighlight = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateAllLabels, 300);
    };

    // 监听 DOM 变化 / Observe DOM changes
    const observer = new MutationObserver(debounceHighlight);
    observer.observe(document.body, { childList: true, subtree: true });

    // 初始执行 / Initial execution
    debounceHighlight();

    console.log("✅ X Follower Checker initialized (DOM-only mode)");
})();