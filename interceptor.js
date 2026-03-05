// =============================================================
// X 关注状态检测助手 - Fetch/XHR 拦截器
// 运行环境：document_start + world: MAIN（才能覆盖真实 window.fetch）
//
// X Follow Status Checker - Fetch/XHR Interceptor
// Runs at: document_start + world: MAIN (required to override window.fetch)
//
// 核心原理 / Core Principle:
//   X 自有的 HomeTimeline / UserTweets GraphQL 响应，
//   每个用户 legacy 对象包含 following / followed_by 布尔字段。
//   拦截这些响应，提取关注关系，通过 postMessage 传给 x.js。
//
//   X's own GraphQL responses (HomeTimeline / UserTweets etc.) contain
//   following / followed_by boolean fields in each user's legacy object.
//   Intercept and extract these, then postMessage to x.js (ISOLATED world).
// =============================================================

(function () {
    'use strict';

    // 已发送的记录，防止重复 postMessage / Dedup sent records
    const sent = new Map(); // key: handle_lower, value: {following, followedBy}

    // 只拦截包含用户关注关系信息的 GraphQL 端点
    // Only intercept GraphQL endpoints that carry follow relationship data
    const RELEVANT_ENDPOINTS = [
        'HomeTimeline',
        'HomeLatestTimeline',
        'UserTweets',
        'UserTweetsAndReplies',
        'SearchTimeline',
        'TweetDetail',
        'Following',
        'Followers',
        'FollowersYouKnow',
        'Likes',
        'Bookmarks',
        'UserByScreenName',
        'UserByRestId',
        'TweetResultByRestId',
        'UserHighlightsTweets',
        'UserMedia'
    ];

    function isRelevantUrl(url) {
        if (typeof url !== 'string') return false;
        if (!url.includes('/i/api/graphql/')) return false;
        return RELEVANT_ENDPOINTS.some(ep => url.includes(ep));
    }

    // 递归遍历 JSON 对象，提取 legacy.screen_name + following/followed_by
    // Recursively traverse JSON object, extract screen_name + follow flags
    function extractRelationships(obj, depth) {
        if (depth > 50 || !obj || typeof obj !== 'object') return; // 增加深度限制，X timeline DOM 很深 (Increase depth limit)

        // 命中：找到有 legacy.screen_name 的用户对象
        // Hit: user object with legacy.screen_name found
        if (obj.legacy && typeof obj.legacy.screen_name === 'string') {
            // 关键修复：X 的 GraphQL 响应中会混杂完整的 User 对象和轻量级的引用对象。
            // 轻量级对象可能没下发 following/followed_by
            let screenName = null;
            let following = null;
            let followedBy = null;

            if (obj.legacy) {
                screenName = obj.legacy.screen_name;
                // 【致命修复 / Critical Bugfix】
                // 如果仅存在 following 但省略了 followed_by，之前会导致 true === false (undefined)，
                // 进而把互关错误地写死为了“单向关注”，并在 x.js 永久覆盖。
                // 必须严格要求双字段同时存在（&&），否则交由 x.js 主动查询 friendships 接口兜底。
                const hasFullFollowData = 'following' in obj.legacy && 'followed_by' in obj.legacy;
                if (hasFullFollowData) {
                    following = obj.legacy.following === true;
                    followedBy = obj.legacy.followed_by === true;
                }
            }

            // 只有当同时存在 following 和 followed_by 字段时，才认为数据完整可靠
            if (screenName !== null && following !== null && followedBy !== null) {
                const handle = screenName; // Use the extracted screenName
                // const following = obj.legacy.following === true;    // 我关注了他 / I follow them
                // const followedBy = obj.legacy.followed_by === true; // 他关注了我 / They follow me

                const key = handle.toLowerCase();
                const prev = sent.get(key);

                // 只在状态变化，或者首次发现时发送 / Only send on first time or status change
                if (!prev || prev.following !== following || prev.followedBy !== followedBy) {
                    sent.set(key, { following, followedBy });

                    // 通过 postMessage 传给 ISOLATED world 的 x.js
                    // Pass to x.js running in ISOLATED world via postMessage
                    window.postMessage({
                        type: 'X_FOLLOW_STATUS',
                        handle: handle,
                        following: following,
                        followedBy: followedBy,
                    }, '*');

                    // 方便调试 / For debugging
                    if (following || followedBy) {
                        console.log(
                            `[X-Interceptor] ✅ @${handle}`,
                            following ? '我关注' : '未关注',
                            followedBy ? '| 对方关注我 (互关!)' : ''
                        );
                    }
                }
            }
        }

        // 递归子对象 / Recurse into children
        // 用 for...in 比 Object.keys 快，避免大对象卡顿
        // 注意：这个循环必须在 if (obj.legacy...) 之外，否则遇到非用户节点（如 TimelineAddEntries）就会停止遍历！
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                extractRelationships(obj[key], depth + 1);
            }
        }
    }

    // 处理响应数据 / Process response data
    function processData(data) {
        try {
            extractRelationships(data, 0);
        } catch (e) {
            // 忽略解析错误 / Ignore parse errors
        }
    }

    // ─── 拦截 fetch ──────────────────────────────────────────
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        const url = typeof args[0] === 'string' ? args[0] :
            (args[0] instanceof Request ? args[0].url : '');

        if (isRelevantUrl(url)) {
            try {
                const clone = response.clone();
                clone.json().then(processData).catch(() => { });
            } catch (e) { }
        }

        return response;
    };

    // ─── 拦截 XMLHttpRequest ──────────────────────────────────
    // Intercept XMLHttpRequest (fallback, X primarily uses fetch)
    const OrigOpen = XMLHttpRequest.prototype.open;
    const OrigSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._xInterceptUrl = url;
        return OrigOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', function () {
            if (this._xInterceptUrl && isRelevantUrl(this._xInterceptUrl)) {
                try {
                    const data = JSON.parse(this.responseText);
                    processData(data);
                } catch (e) { }
            }
        });
        return OrigSend.apply(this, args);
    };

    console.log('[X-Interceptor] ✅ fetch/XHR 拦截已就绪 (Follow status interceptor ready)');
})();
