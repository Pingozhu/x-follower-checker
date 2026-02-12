(function () {
    // 增加一个简单的标志，防止脚本重复初始化
    if (window.hasRunXAssistant) return;
    window.hasRunXAssistant = true;

    console.log("🚀 X 关注状态检测助手已启动... (X Follower Checker started...)");

    let relationshipCache = new Map();

    // 从存储中加载缓存 / Load cache from storage
    chrome.storage.local.get(['relationshipCache'], (result) => {
        if (result.relationshipCache) {
            relationshipCache = new Map(Object.entries(result.relationshipCache));
            debounceHighlight();
        }
    });

    // 保存缓存到存储 / Save cache to storage
    const saveCache = () => {
        const obj = Object.fromEntries(relationshipCache);
        chrome.storage.local.set({ relationshipCache: obj });
    };

    const isFollowingFeed = () => {
        // 查找选中的标签页 / Find the selected tab
        const selectedTab = document.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
        if (!selectedTab) return false;
        const tabText = selectedTab.textContent.trim();
        return tabText === '正在关注' || tabText === 'Following';
    };

    const getHandle = (container) => {
        // 1. 优先尝试从具体的 Username 容器或 A 标签获取 / Prioritize Username container or A tag
        // data-testid="User-Names" 里的第二个 span 通常是 handle
        const handleSpan = container.querySelector('[data-testid="User-Names"] span:nth-child(2)');
        if (handleSpan && handleSpan.textContent.startsWith('@')) {
            return handleSpan.textContent.slice(1);
        }

        // 2. 尝试从 A 标签的 href 获取 / Try from A tag href
        const profileLinks = Array.from(container.querySelectorAll('a[role="link"][href^="/"]'));
        for (const link of profileLinks) {
            const path = link.getAttribute('href').slice(1);
            // 排除非用户名路径 / Exclude non-username paths
            if (!['home', 'explore', 'notifications', 'messages', 'i', 'search', 'settings'].includes(path.split('/')[0])) {
                return path;
            }
        }

        // 3. 备选：正则匹配文本中的第一个 @ / Fallback: regex match first @ in text
        const handleMatch = container.innerText.match(/@(\w+)/);
        return handleMatch ? handleMatch[1] : null;
    };

    const createOrUpdateLabel = (container, status, isUserCell) => {
        if (isUserCell) {
            const existingLabel = container.querySelector('.x-follower-status-label');
            if (existingLabel) existingLabel.remove();

            let bgColor = '';
            if (status === 'mutual') {
                bgColor = 'rgba(144, 238, 144, 0.2)';
            } else if (status === 'not_following_back') {
                bgColor = 'rgba(255, 99, 71, 0.2)';
            }

            if (container.style.backgroundColor !== bgColor) {
                container.style.backgroundColor = bgColor;
            }
            return;
        }

        if (container.style.backgroundColor) container.style.backgroundColor = '';

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
                if (label) label.remove();
                return;
        }

        if (label.textContent !== text) {
            label.textContent = text;
            label.style.backgroundColor = bgColor;
        }
    };

    const highlightMutuals = () => {
        let changed = false;
        const inFollowingFeed = isFollowingFeed();

        // 1. 处理用户单元格 (UserCell)
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        userCells.forEach(cell => {
            const spans = Array.from(cell.querySelectorAll('span'));
            const handle = getHandle(cell);
            if (!handle) return;

            const isFollowingText = spans.some(
                el => el.textContent.trim() === '正在关注' ||
                    el.textContent.trim() === 'Following'
            );

            if (!isFollowingText) {
                if (relationshipCache.get(handle) !== 'none') {
                    relationshipCache.set(handle, 'none');
                    changed = true;
                }
                createOrUpdateLabel(cell, 'none', true);
                return;
            }

            const followsYouLabel = spans.find(
                el => el.textContent.includes('关注了你') ||
                    el.textContent.includes('Follows you')
            );

            let status = followsYouLabel ? 'mutual' : 'not_following_back';

            if (relationshipCache.get(handle) !== status) {
                relationshipCache.set(handle, status);
                changed = true;
            }
            createOrUpdateLabel(cell, status, true);
        });

        // 2. 处理推文 (Tweets)
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        tweets.forEach(tweet => {
            const handle = getHandle(tweet);
            if (!handle) return;

            const spans = Array.from(tweet.querySelectorAll('span'));
            const hasFollowsYouLabel = spans.some(
                el => el.textContent.includes('关注了你') ||
                    el.textContent.includes('Follows you')
            );

            let status = relationshipCache.get(handle);

            // 如果在“正在关注”栏目，或者推文里带“关注了你”标签
            if (inFollowingFeed && (!status || status === 'none')) {
                status = 'following'; // 至少是已关注
                relationshipCache.set(handle, 'following');
                changed = true;
            }

            if (hasFollowsYouLabel && (status === 'following' || !status)) {
                status = 'mutual';
                relationshipCache.set(handle, 'mutual');
                changed = true;
            }

            if (status && status !== 'none') {
                createOrUpdateLabel(tweet, status, false);
            }
        });

        if (changed) saveCache();
    };

    // 使用防抖处理，避免频繁触发导致页面卡顿
    let timer = null;
    const debounceHighlight = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(highlightMutuals, 500);
    };

    // 初始运行
    debounceHighlight();

    // 监听页面变化（滚动或动态加载）
    const observer = new MutationObserver(() => {
        debounceHighlight();
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();