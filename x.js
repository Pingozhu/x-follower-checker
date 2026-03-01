(function () {
    if (window.hasRunXAssistant) return;
    window.hasRunXAssistant = true;

    console.log("🚀 X 关注状态检测助手 v1.10 已启动... (X Follower Checker started...)");

    let relationshipCache = {};
    let globalReplyMode = 'simple'; // 全局回复模式 (Global reply mode: simple | content)
    let isFilling = false; // 填充忙碌锁 (Filling concurrency lock)
    let isFilterActive = false; // 筛选状态 (Filter active state)

    // 预设回复模板 (Preset reply templates) - 简单版 (Simple)
    const templatesSimple = [
        "蓝V小伙伴们，来波互关！评论“互关”我秒回，一起涨粉养号。pingoo.trade #蓝V互关 互相支持成长！",
        "加密市场低迷？不如来蓝V互关！留言就能获50+关注，有关必回，永不取关。pingoo.trade #蓝V互关",
        "大V秘诀：前期互关抱团！蓝V朋友评论区集合，我100%回关，一起破局。pingoo.trade #蓝V互关",
        "持续蓝V互关中，优先活跃账号。看到关注就回，没看到评论提醒。互相成就！pingoo.trade #蓝V互关",
        "蓝V互关走起！评论“滴滴”收获蓝V粉丝，诚信秒回，一起玩转X。pingoo.trade #蓝V互关",
        "人脉就是财富，蓝V互关来一波。有关必回，打造优质圈子，一起前行。pingoo.trade #蓝V互关",
        "蓝V集结！互关支持，评论留言获互推机会。真实互动，拒绝套路。pingoo.trade #蓝V互关",
        "周末蓝V互关时间！留言你将有30蓝V好友，秒关秒回，一起互动。pingoo.trade #蓝V互关",
        "Web3玩家蓝V互关，分享项目经验。评论互关，互相学习成长。pingoo.trade #蓝V互关",
        "蓝V互关，100%诚信回关。优先有输出账号，一起提升权重。pingoo.trade #蓝V互关",
        "来蓝V互关，评论“支持”获即时回关。互相点赞转发，玩转算法。pingoo.trade #蓝V互关",
        "蓝V朋友们，互关一波！永不取关，有关必回，一起追逐机会。pingoo.trade #蓝V互关",
        "加密搭子蓝V互关，避坑分享。留言互关，构建网络。pingoo.trade #蓝V互关",
        "蓝V互关集结号！评论区滴滴，我秒回，一起涨粉丝。pingoo.trade #蓝V互关",
        "优先互关蓝V活跃号，看到回关。互相支持，成就彼此。pingoo.trade #蓝V互关",
        "蓝V互关，评论获蓝V关注。诚信第一，一起抱团。",
        "新一周蓝V互关！留言“互关”收获惊喜，秒回不鸽。pingoo.trade #蓝V互关",
        "蓝V互关，分享生活感悟。有关必回，一起正能量。pingoo.trade #蓝V互关",
        "蓝V小圈子互关，优先Web3账号。评论提醒，回关支持。pingoo.trade #蓝V互关",
        "蓝V互关走一波！100%回关，互相成长不孤单。pingoo.trade #蓝V互关",
        "蓝V互关，评论“来啦”获互推。真实互动，拒绝单关。pingoo.trade #蓝V互关",
        "持续蓝V互关中，有关必回。一起玩成真社交！pingoo.trade #蓝V互关",
        "蓝V朋友互关，永不取关。留言集合，一起前行。pingoo.trade #蓝V互关",
        "蓝V互关，优先有内容账号。秒回支持，互相成就。pingoo.trade #蓝V互关",
        "来波蓝V互关！评论获40+关注，诚信互惠。pingoo.trade #蓝V互关",
        "蓝V互关集结，分享创业经验。留言互关，一起破圈。pingoo.trade #蓝V互关",
        "蓝V互关，100%秒回。互相点赞，转发助力。pingoo.trade #蓝V互关",
        "周四蓝V互关时间！评论“互关”收获粉丝。pingoo.trade #蓝V互关",
        "蓝V互关，构建Web3网络。有关必回，一起探索。pingoo.trade #蓝V互关",
        "蓝V互关走起！优先活跃蓝V，互相支持。pingoo.trade #蓝V互关",
        "蓝V互关，评论提醒回关。诚信第一，长期合作。pingoo.trade #蓝V互关",
        "蓝V朋友们互关一波！永不取关，一起涨粉。pingoo.trade #蓝V互关",
        "蓝V互关，分享币圈机会。留言互关，避雷同行。pingoo.trade #蓝V互关",
        "持续蓝V互关，看到就回。互相成就，玩转X。pingoo.trade #蓝V互关",
        "蓝V互关集结！评论“滴滴”秒获回关。pingoo.trade #蓝V互关",
        "蓝V互关，优先真实账号。一起点赞转发。pingoo.trade #蓝V互关",
        "新蓝V互关！留言获互惠，诚信秒回。pingoo.trade #蓝V互关",
        "蓝V互关，生活正能量分享。有关必回。pingoo.trade #蓝V互关",
        "蓝V小伙伴互关，Web3项目讨论。评论集合。pingoo.trade #蓝V互关",
        "蓝V互关，100%回关率。一起抱团成长。pingoo.trade #蓝V互关",
        "蓝V互关，评论“支持”获蓝V好友。互相互动。pingoo.trade #蓝V互关",
        "蓝V互关走一波！永不取关，互相前行。pingoo.trade #蓝V互关",
        "加密蓝V互关，机会分享。留言互关。pingoo.trade #蓝V互关",
        "蓝V互关，优先有输出蓝V。秒回支持。pingoo.trade #蓝V互关",
        "来蓝V互关！评论获惊喜粉丝，诚信互惠。pingoo.trade #蓝V互关",
        "蓝V互关集结号，创业者集合。互相成就。pingoo.trade #蓝V互关",
        "蓝V互关，100%秒关。点赞转发助力。pingoo.trade #蓝V互关",
        "周末蓝V互关！评论“互关”收获多。pingoo.trade #蓝V互关",
        "蓝V互关，探索Web3。有关必回，一起学习。pingoo.trade #蓝V互关",
        "蓝V互关结束一周！优先活跃，互相支持成长。"
    ];

    // 预设回复模板 (Preset reply templates) - 内容版 (Content/Detailed)
    const templatesDetailed = [
        "上周花了三天研究一个DeFi项目，把数据整理成图表发出来。没想到几位关注很久的蓝V都来评论了，我们在评论区聊了很多坑和机会。如果你也在研究Web3项目，欢迎来聊聊你的看法。#Web3Trends pingoo.trade #蓝V互关",
        "这轮行情让不少人又开始焦虑了。我昨天整理了一些数据和自己的判断发出来，收到很多共鸣。市场不好的时候，交流避坑经验比预测涨跌更有用。做交易的朋友可以聊聊。#CryptoMarket pingoo.trade #蓝V互关",
        "最近在测试AI工具在业务流程中的应用，效果超出预期。把完整的案例拆解发出来后，不少创业的朋友来交流他们的实践。创业路上确实需要多交流，少走弯路。#StartupTips pingoo.trade #蓝V互关",
        "前几天采访了一位行业前辈，聊了很多关于商业增长的话题。整理成对话形式发出来，评论区的讨论比我预想的还热烈。做业务的朋友应该会有共鸣。#BusinessGrowth pingoo.trade #蓝V互关",
        "试了一个月的新工作方法，效率提升了不少。配了些数据和照片分享出来，发现很多人也在探索类似的生活方式。关于时间管理和效率提升，我们可以多聊聊。#DigitalLife pingoo.trade #蓝V互关",
        "整理了2026年上半年的几个科技趋势，配了一些前瞻性的分析。发出来后不少技术背景的朋友来讨论，角度都很独特。关注科技创新的可以交流下看法。#TechInnovation pingoo.trade #蓝V互关",
        "去年那波下跌时的操作复盘了一遍，发现几个明显的决策失误。把这些经验教训写出来，没想到很多人都遇到过类似的坑。加密交易确实需要不断总结。#CryptoRecovery pingoo.trade #蓝V互关",
        "最近在整理收藏，顺便写了些产区和品鉴的笔记。发现不少蓝V朋友也喜欢这个，大家在评论区分享了很多有意思的故事。玩雪茄的朋友可以交流一下。#LuxuryLifestyle pingoo.trade #蓝V互关",
        "在交易上试了一个新的方法，市场反馈还不错。把具体的操作步骤和心得分享出来，收到不少老师朋友的反馈和补充。做交易的应该能理解这种成就感。#Trading pingoo.trade #蓝V互关",
        "参与了几个Web3项目后，对这个领域有了更深的理解。把踩过的坑和收获整理成帖子，不少在做项目的朋友来交流。Web3还在早期，多交流总没错。#Web3Projects pingoo.trade #蓝V互关",
        "创业三年，从亏损到盈利的过程挺不容易的。分享了一些关键转折点的决策，评论区很多创业者都有类似经历。这条路确实需要互相鼓励。#MotivationMonday pingoo.trade #蓝V互关",
        "最近读完一本商业类书籍，写了篇深度书评。没想到引发了不少讨论，大家推荐的书单也很有价值。爱读书的朋友可以交换一下书单。#BookLovers pingoo.trade #蓝V互关",
        "差点踩了一个大坑，幸好及时发现了项目的几个风险点。把完整的分析过程发出来，希望能帮其他人避雷。做投资的都懂风控有多重要。#BlockchainSecurity pingoo.trade #蓝V互关",
        "对2026年下半年的加密市场做了个趋势分析，配了几张图表。发出来后不少人来讨论，也认识了一些做相关领域的朋友。如果你也在关注市场动向，欢迎聊聊。pingoo.trade #蓝V互关",
        "最近对工作和生活的平衡有了新的理解，写了些感悟发出来。没想到引起了很多共鸣，大家分享的经验也很有启发。保持活力确实需要找到自己的节奏。#PositiveVibes pingoo.trade #蓝V互关",
        "在X上互关了大半年，遇到过取关的，但更多是长期互动的朋友。分享了一些维护关系的心得，其实就是真诚对待。做长期主义的朋友应该懂这个道理。pingoo.trade #蓝V互关",
        "每周一都会制定这周的目标和计划，这个习惯坚持了一年多。把方法论分享出来后，不少人表示也想试试。一起做计划管理的可以互相监督。#WeeklyGoals pingoo.trade #蓝V互关",
        "生活中的一些小确幸记录下来发出去，发现其实很多人需要这种正能量。我们互相鼓励，日子会过得更有劲。喜欢分享生活的朋友可以多交流。#InspirationDaily pingoo.trade #蓝V互关",
        "观察了几个Web3社区的运营方式，写了些思考和建议。做社区的朋友来讨论了很多实操问题，收获挺大。Web3的社区文化确实独特。#NFTTrends pingoo.trade #蓝V互关",
        "这半年认识了不少志同道合的朋友，大家互相支持成长。把这段经历写出来，想告诉大家抱团确实比单打独斗好。一起成长的感觉很棒。pingoo.trade #蓝V互关",
        "尝试了几次和其他博主的互推合作，效果还不错。分享了一些合作的注意事项，希望对想尝试的人有帮助。互推的核心还是价值互换。pingoo.trade #蓝V互关",
        "在X上待久了发现，真正有意思的连接都来自真诚互动，不是套路式互关。分享你感兴趣的内容，和志同道合的人聊天，关系自然就建立了。做内容的朋友应该懂这个感觉。pingoo.trade #蓝V互关",
        "互关容易，长期维护关系才难。分享了一些我保持长期互动的方法，其实就是把对方当真正的朋友。那些一直没取关的，基本都成了真朋友。#FriendshipGoals pingoo.trade #蓝V互关",
        "坚持高质量输出半年多了，粉丝质量明显提升。分享了一些内容创作的思路和方法，做内容的朋友应该能理解持续输出的不易。我们可以互相学习。pingoo.trade #蓝V互关",
        "有几次因为内容被大V转发，涨粉速度超出预期。把这些经验总结出来分享，其实核心就是内容要真的有价值。做内容的都期待这种惊喜时刻。pingoo.trade #蓝V互关",
        "做了个创业话题的系列分享，吸引了不少创业者来交流。我们建了个小群互相支持，氛围挺好的。如果你也在创业路上，欢迎加入讨论。#Entrepreneurship pingoo.trade #蓝V互关",
        "试了一段时间快速回复评论，发现互动效果确实好很多。分享了一些提高响应速度的方法，愿意投入时间做互动的朋友可以试试。pingoo.trade #蓝V互关",
        "每周都会回顾这周的进展，调整下周计划。把这个习惯分享出来后，不少人表示也想试试。我们可以互相分享周复盘的心得。#WeekendVibes pingoo.trade #蓝V互关",
        "最近在深入研究DeFi协议，把学习笔记整理成系列发出来。收到很多同样在学习的朋友的反馈，大家一起探索这个领域。学习DeFi的可以交流。#DeFi pingoo.trade #蓝V互关",
        "保持账号活跃度需要一些方法，分享了我的实践心得。其实就是真诚参与讨论，而不是为了互动而互动。愿意投入时间运营账号的可以聊聊。pingoo.trade #蓝V互关",
        "遇到过互关后就取关的，也遇到过一直保持互动的真朋友。分享了一些判断对方是否靠谱的小技巧，诚信互关才能长久。pingoo.trade #蓝V互关",
        "账号从几百粉到几千粉的过程，总结了一些实用的涨粉方法。最重要的还是内容质量和持续输出。想认真做账号的可以交流下心得。pingoo.trade #蓝V互关",
        "最近在研究几个山寨币项目，把分析过程记录下来。不少做币圈投资的朋友来交流观点，大家一起研究总能发现更多机会。#Altcoins pingoo.trade #蓝V互关",
        "在X上持续输出内容一年多了，分享一些坚持下来的心得。其实就是找到自己的节奏，不要为了发帖而发帖。做长期运营的应该有共鸣。pingoo.trade #蓝V互关",
        "观察了一些热门话题的传播规律，总结了参与讨论的一些技巧。及时参与优质话题确实能提高曝光。会玩X的朋友可以交流下玩法。pingoo.trade #蓝V互关",
        "发现真实账号比僵尸粉账号的互动质量高太多。分享了一些识别真实账号的方法，互关还是要找真正做内容的人。pingoo.trade #蓝V互关",
        "作为过来人，给新蓝V一些互关的建议。其实就是先做好内容，再考虑互关。内容是基础，关系是结果。新入局的可以少走弯路。pingoo.trade #蓝V互关",
        "坚持分享正能量内容，收获了一群志同道合的朋友。发现正能量确实会吸引正能量的人。喜欢传播积极内容的可以互相关注。#Wellness pingoo.trade #蓝V互关",
        "组织了几次Web3项目的深度讨论，参与的都是真正在做事的人。这种高质量的交流很难得，欢迎对Web3认真的朋友加入。#Metaverse pingoo.trade #蓝V互关",
        "测试了不同的互关方式，发现真诚的互动回关率最高。分享了一些提高回关率的实践，其实核心就是展现你的价值。pingoo.trade #蓝V互关",
        "在X上建立了自己的支持网络，大家互相点赞评论。这种互助的感觉很好，让做内容不再孤单。愿意互相支持的朋友可以加入。pingoo.trade #蓝V互关",
        "互关容易，长期维护才是考验。分享了一些我保持长期关系的方法，就是把每个互关都当作真正的朋友对待。pingoo.trade #蓝V互关",
        "最近在研究Bitcoin的链上数据，发现了一些有意思的规律。把分析过程分享出来，欢迎做Bitcoin研究的朋友来讨论。#Bitcoin pingoo.trade #蓝V互关",
        "坚持优质内容输出，发现粉丝质量越来越高。分享了一些内容创作的思路，做内容的朋友应该能理解持续输出的价值。pingoo.trade #蓝V互关",
        "通过互关认识了很多优秀的人，收获超出预期。分享了一些互关带来的意外收获，真诚互关确实能带来惊喜。pingoo.trade #蓝V互关",
        "建了个创业者的小社群，大家定期分享进展和困难。这种互助的氛围很棒，欢迎认真创业的朋友加入。#Innovation pingoo.trade #蓝V互关",
        "和几个朋友建立了互助点赞的机制，大家的内容曝光都提升了。这种互相支持的方式很有效，愿意参与的可以加入。pingoo.trade #蓝V互关",
        "每周末都会复盘这周的运营情况，分享了一些复盘的方法 and 心得。做账号运营的应该都需要定期复盘。#WeekendVibes pingoo.trade #蓝V互关",
        "最近在研究Metaverse相关的项目，把学习笔记整理出来。对Web3和元宇宙感兴趣的朋友可以一起探索这个领域。#Metaverse pingoo.trade #蓝V互关",
        "总结了这段时间的互关经验，最大的收获是认识了很多真诚的朋友。互关的意义不只是数字增长，更是关系的建立。pingoo.trade #蓝V互关"
    ];


    // 填充随机回复 / Fill random reply
    const fillRandomReply = (editor) => {
        if (isFilling) return;
        isFilling = true;

        // 500ms 锁定，防止快速双击或重复触发 (500ms lock to prevent double-click or multiple triggers)
        setTimeout(() => { isFilling = false; }, 500);

        const pool = globalReplyMode === 'content' ? templatesDetailed : templatesSimple;
        let text = pool[Math.floor(Math.random() * pool.length)];

        // 终极内容与标签分离处理逻辑 / Ultimate Content & Tag Separation Logic
        // 匹配所有 # 开头的标签，包括各种语言字符
        const hashtagRegex = /#[\w\u4e00-\u9fa5]+/gi;
        const forcedTags = ["#蓝V互关", "#PingooTrade"];

        // 1. 提取文中的所有标签 (Extract all tags from text)
        const extractedTags = text.match(hashtagRegex) || [];

        // 2. 获取纯净正文 (Get clean content)
        // 将所有标签替换为空格，然后压缩空格
        let cleanContent = text.replace(hashtagRegex, '').replace(/\s+/g, ' ').trim();

        // 3. 标签去重与合并 (Deduplicate and merge tags)
        const uniqueTags = new Set();

        // 先加入强制标签 (Add forced tags first)
        forcedTags.forEach(tag => uniqueTags.add(tag.toUpperCase()));

        // 再加入提取的标签 (Add extracted tags)
        extractedTags.forEach(tag => {
            uniqueTags.add(tag.toUpperCase());
        });

        // 4. 组装最终文本 (Assemble final text)
        // 转换回原始大小写 (Convert back to original case - finding original from set is tricky, so we reconstruct)
        // 简单处理：使用 Set 中的大写作为键，保留原始格式是不太容易的，但标签一般不区分大小写。
        // 为了体验更好，我们使用一个 Map 来保留第一次出现的大小写格式。

        const tagMap = new Map(); // Key: UPPERCASE, Value: Original

        // 初始化强制标签
        forcedTags.forEach(tag => tagMap.set(tag.toUpperCase(), tag));

        // 处理提取标签，如果 Map 中没有（即不是强制标签），则加入
        extractedTags.forEach(tag => {
            if (!tagMap.has(tag.toUpperCase())) {
                tagMap.set(tag.toUpperCase(), tag);
            }
        });

        // 生成最终标签字符串
        const finalTagsString = Array.from(tagMap.values()).join(" ");

        const fullText = `${cleanContent} ${finalTagsString}`;

        console.log(`📝 [Lock Active] Filling random reply:`, fullText);
        editor.focus();

        // ✅ 最简可靠方案：selectAll + insertText (Simplest reliable approach)
        // 这是唯一能正确与 contenteditable + Draft.js/React 协作的方式
        // This is the ONLY way to correctly cooperate with contenteditable + Draft.js/React
        //
        // 关键原理 (Key principle):
        // - document.execCommand('insertText') 走浏览器原生输入流，Draft.js 会自动感知
        // - 直接操作 DOM (innerText/textContent) 会破坏 React 虚拟 DOM 同步
        // - 手动派发 textInput 事件会导致 Draft.js 重复插入
        // - 因此：只用 selectAll + insertText，不做任何额外操作

        // 1. 全选现有内容 (Select all existing content)
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            // 选择失败时忽略，insertText 仍会在光标位置插入
            // If selection fails, insertText will still insert at cursor
        }

        // 2. insertText 自动替换选中内容 (insertText auto-replaces selected content)
        document.execCommand('insertText', false, fullText);
    };



    // 自动关注 / Auto-follow
    const tryAutoFollow = (toolbar) => {
        try {
            console.log("🔍 Auto-follow: Identifying target...");

            let targetHandle = null;

            // 1. 策略 A: 标准弹窗 (Standard Modal)
            // 在 dialog 中查找 article[data-testid="tweet"]，这是被回复的原推文
            // Look for article[data-testid="tweet"] in dialog, which is the original tweet
            const modal = toolbar.closest('[role="dialog"]');
            if (modal) {
                // 优先尝试找 Modal 里的 tweet article
                const tweetArticle = modal.querySelector('article[data-testid="tweet"]');
                if (tweetArticle) {
                    const userNameNode = tweetArticle.querySelector('[data-testid="User-Name"]');
                    if (userNameNode) {
                        const spans = Array.from(userNameNode.querySelectorAll('span'));
                        const handleSpan = spans.find(s => s.textContent.includes('@'));
                        if (handleSpan) targetHandle = handleSpan.textContent.trim();
                    }
                }

                // 如果没找到 article，尝试找 User-Name (可能是旧版布局)
                if (!targetHandle) {
                    const userNameNode = modal.querySelector('[data-testid="User-Name"]');
                    if (userNameNode) {
                        const spans = Array.from(userNameNode.querySelectorAll('span'));
                        const handleSpan = spans.find(s => s.textContent.includes('@'));
                        if (handleSpan) targetHandle = handleSpan.textContent.trim();
                    }
                }
            }

            // 2. 策略 B: 文本扫描 (Text Scan) - 适配 TweetDeck / Pro 和非标准布局
            // 向上遍历查找 "Replying to @handle" 或 "回复 @handle"
            // Traverse up to find "Replying to @handle" or "回复 @handle"
            if (!targetHandle) {
                // 定义正则表达式匹配 @handle
                const handleRegex = /@([a-zA-Z0-9_]+)/;

                // 从 toolbar 开始向上查找 8 层
                let current = toolbar;
                for (let i = 0; i < 8 && current; i++) {
                    // 检查当前元素及其子元素的文本
                    if (current.innerText && (current.innerText.includes('Replying to') || current.innerText.includes('回复'))) {
                        // 尝试提取 handle
                        const match = current.innerText.match(handleRegex);
                        if (match) {
                            targetHandle = match[0]; // 包含 @
                            console.log(`🔍 Found handle via text scan: ${targetHandle}`);
                            break;
                        }
                    }
                    current = current.parentElement;
                }
            }

            // 3. 策略 C: 推文详情页 (Tweet Detail) - 原有逻辑
            if (!targetHandle) {
                const mainColumn = document.querySelector('[data-testid="primaryColumn"]');
                if (mainColumn) {
                    const userNameNode = mainColumn.querySelector('[data-testid="User-Name"]');
                    if (userNameNode) {
                        const spans = Array.from(userNameNode.querySelectorAll('span'));
                        const handleSpan = spans.find(s => s.textContent.includes('@'));
                        if (handleSpan) targetHandle = handleSpan.textContent.trim();
                    }
                }
            }

            if (targetHandle) {
                console.log(`🎯 Target identified: ${targetHandle}`);

                // 3. 全局搜索匹配的关注按钮 (包括侧边栏、悬浮卡片等)
                // Global search for matching follow button (sidebar, hover cards, etc.)
                // 选择器逻辑：data-testid 必须以 -follow 结尾，且 aria-label 包含 handle
                const selector = `button[data-testid$="-follow"][aria-label*="${targetHandle}"]`;
                const followBtn = document.querySelector(selector);

                if (followBtn) {
                    console.log("✅ Found exact follow button, clicking...");
                    followBtn.click();
                } else {
                    console.log(`ℹ️ Follow button not visible via selector: ${selector}`);

                    // 尝试触发悬浮卡片 (Hover Card Strategy) - 增强版 (Enhanced)
                    // Try hover card strategy
                    console.log("🖱️ Attempting to trigger hover card (Enhanced)...");
                    const handleLinks = Array.from(document.querySelectorAll(`a[href*="${targetHandle.replace('@', '')}"]`));
                    // 找一个可见的链接 (Find a visible link)
                    const visibleLink = handleLinks.find(link => {
                        const rect = link.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0 && link.closest('[data-testid="User-Name"]');
                    });

                    if (visibleLink) {
                        // 关键修复：必须在内部的 span 元素上触发事件，直接在 a 标签上触发往往无效
                        // Critical Fix: Must trigger events on the inner span element; triggering on <a> often fails.
                        const targetSpan = visibleLink.querySelector('span') || visibleLink;

                        const rect = targetSpan.getBoundingClientRect();
                        const clientX = rect.left + rect.width / 2;
                        const clientY = rect.top + rect.height / 2;

                        const eventOptions = {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: clientX,
                            clientY: clientY
                        };

                        // 模拟真实鼠标序列 (Simulate real mouse sequence)
                        targetSpan.dispatchEvent(new MouseEvent('mousemove', eventOptions));
                        targetSpan.dispatchEvent(new MouseEvent('mouseover', eventOptions));
                        targetSpan.dispatchEvent(new MouseEvent('mouseenter', eventOptions));

                        // 延迟点击，等待卡片弹出 (Wait for card to render)
                        // X 的卡片有防抖延迟，需要给足时间
                        console.log("⏳ Waiting for hover card to render...");
                        setTimeout(() => {
                            // 卡片通常挂载在 body 的 layout 层级
                            const hoverCard = document.querySelector('[data-testid="hoverCard"]');
                            if (hoverCard) {
                                const hoverBtn = hoverCard.querySelector('button[data-testid$="-follow"]');
                                if (hoverBtn) {
                                    console.log("✅ Clicked follow button inside hover card");
                                    hoverBtn.click();

                                    // 成功后关闭卡片 (Close card on success)
                                    setTimeout(() => {
                                        targetSpan.dispatchEvent(new MouseEvent('mouseleave', eventOptions));
                                    }, 500);
                                } else {
                                    console.log("ℹ️ Hover card opened but no follow button found (already followed?)");
                                    // 仍要关闭卡片
                                    targetSpan.dispatchEvent(new MouseEvent('mouseleave', eventOptions));
                                }
                            } else {
                                console.log("❌ Hover card did not appear after timeout");
                            }
                        }, 2500); // 2.5s delay for robustness
                    } else {
                        console.log("⚠️ No visible handle link found to hover");
                    }
                }
            } else {
                console.log("⚠️ Could not extract target handle from context");
            }
        } catch (e) {
            console.error("❌ Auto-follow failed:", e);
        }
    };

    // 更新所有模式按钮的 UI / Update all mode buttons UI
    const updateModeButtonsUI = () => {
        const isContent = globalReplyMode === 'content';
        document.querySelectorAll('.x-reply-mode-btn').forEach(btn => {
            btn.textContent = isContent ? '内容' : '简单';
            if (isContent) {
                btn.style.background = 'rgb(29, 155, 240)';
                btn.style.color = 'white';
            } else {
                btn.style.background = 'rgba(29, 155, 240, 0.1)';
                btn.style.color = 'rgb(29, 155, 240)';
            }
        });
    };

    // 注入快捷回复按钮 / Inject quick reply button
    const injectQuickReplyButton = () => {
        const toolbars = document.querySelectorAll('[data-testid="toolBar"]');

        toolbars.forEach(toolbar => {
            if (toolbar.querySelector('.x-quick-reply-btn')) return;

            // 模式选择器按钮 (Mode Selector Button)
            const modeBtn = document.createElement('div');
            modeBtn.className = 'x-reply-mode-btn';
            modeBtn.setAttribute('role', 'button');
            modeBtn.style.marginRight = '4px';
            modeBtn.style.padding = '0 8px';
            modeBtn.style.height = '32px';
            modeBtn.style.lineHeight = '32px';
            modeBtn.style.border = '1px solid rgb(29, 155, 240)';
            modeBtn.style.borderRadius = '16px';
            modeBtn.style.fontSize = '12px';
            modeBtn.style.fontWeight = 'bold';
            modeBtn.style.cursor = 'pointer';
            modeBtn.style.userSelect = 'none';
            modeBtn.style.display = 'inline-flex';
            modeBtn.style.alignItems = 'center';
            modeBtn.style.justifyContent = 'center';

            // 立即根据全局状态同步样式 (Sync style immediately based on global state)
            const isContent = globalReplyMode === 'content';
            modeBtn.textContent = isContent ? '内容' : '简单';
            if (isContent) {
                modeBtn.style.background = 'rgb(29, 155, 240)';
                modeBtn.style.color = 'white';
            } else {
                modeBtn.style.background = 'rgba(29, 155, 240, 0.1)';
                modeBtn.style.color = 'rgb(29, 155, 240)';
            }

            modeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                globalReplyMode = globalReplyMode === 'simple' ? 'content' : 'simple';

                // 同步更新页面上所有模式按钮 (Sync all mode buttons on page)
                updateModeButtonsUI();

                console.log(`🔄 Global reply mode switched to: ${globalReplyMode}`);
            };

            const btn = document.createElement('div');
            btn.className = 'x-quick-reply-btn';
            btn.setAttribute('role', 'button');
            btn.style.marginLeft = '12px';
            btn.style.padding = '0 12px';
            btn.style.height = '32px';
            btn.style.lineHeight = '32px';
            btn.style.background = 'rgb(29, 155, 240)';
            btn.style.color = 'white';
            btn.style.borderRadius = '16px';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';
            btn.style.userSelect = 'none';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.textContent = '一键回复';

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🖱️ Quick reply clicked [Global Mode: ${globalReplyMode}]`);

                let editor = null;

                // 更鲁棒的查找：向上找包含容器，再往下找文本框
                const container = toolbar.closest('[data-testid="inlineReply"]') ||
                    toolbar.closest('div[role="dialog"]') ||
                    toolbar.parentElement.parentElement.parentElement;

                if (container) {
                    editor = container.querySelector('[role="textbox"]') ||
                        container.querySelector('.public-DraftEditor-content');
                }

                // 兜底：如果没找到，尝试在整个页面找第一个可见的文本框
                if (!editor) {
                    console.log("🔍 Falling back to global search for editor");
                    editor = document.querySelector('[data-testid^="tweetTextarea_"][role="textbox"]');
                }

                if (editor) {
                    console.log("🎯 Editor found, filling...");
                    fillRandomReply(editor);

                    // 执行自动关注逻辑
                    tryAutoFollow(toolbar);
                } else {
                    console.error("❌ Could not find editor for quick reply. Toolbar:", toolbar);
                }
            };

            // 悬停效果 / Hover effect
            btn.onmouseover = () => btn.style.background = 'rgb(26, 140, 216)';
            btn.onmouseout = () => btn.style.background = 'rgb(29, 155, 240)';

            // 插入到发送按钮之前或工具栏末尾 / Insert before send button or at the end
            const sendBtn = toolbar.querySelector('[data-testid="tweetButton"]') ||
                toolbar.querySelector('[data-testid="tweetButtonInline"]');

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.alignItems = 'center';
            btnContainer.style.marginLeft = '12px';
            btnContainer.appendChild(modeBtn);
            btnContainer.appendChild(btn);

            if (sendBtn) {
                sendBtn.parentElement.insertBefore(btnContainer, sendBtn);
            } else {
                toolbar.appendChild(btnContainer);
            }
        });
    };


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

    // 注入筛选按钮 / Inject filter button
    const injectFilterButton = () => {
        // 只在关注页面注入 (Only inject on the following page)
        if (!window.location.pathname.endsWith('/following')) return;

        const tabList = document.querySelector('[role="tablist"]');
        if (!tabList || tabList.querySelector('.x-filter-follows-btn')) return;

        const btn = document.createElement('div');
        btn.className = 'x-filter-follows-btn';
        btn.setAttribute('role', 'tab');
        btn.style.flexGrow = '1';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.cursor = 'pointer';
        btn.style.userSelect = 'none';
        btn.style.transition = 'background-color 0.2s';
        btn.style.padding = '0 16px';
        btn.style.minWidth = '56px';

        const inner = document.createElement('div');
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'center';
        inner.style.height = '100%';
        inner.style.position = 'relative';

        const text = document.createElement('span');
        text.className = 'x-filter-follows-text';
        text.textContent = '未回粉';
        text.style.fontSize = '15px';
        text.style.fontWeight = 'bold';
        // 使用 CSS 变量自适应主题 (Use CSS variables for theme adaptation)
        text.style.color = isFilterActive ? 'var(--color-text-primary, rgb(15, 20, 25))' : 'var(--color-text-secondary, rgb(83, 100, 113))';

        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.bottom = '0';
        line.style.height = '4px';
        line.style.minWidth = '56px';
        line.style.width = '100%';
        line.style.borderRadius = '9999px';
        line.style.backgroundColor = isFilterActive ? 'var(--color-primary, rgb(29, 155, 240))' : 'transparent';

        inner.appendChild(text);
        inner.appendChild(line);
        btn.appendChild(inner);

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            isFilterActive = !isFilterActive;
            console.log(`🔍 Filter "Not Following Back" toggled: ${isFilterActive}`);

            // 更新 UI (Update UI)
            text.style.color = isFilterActive ? 'var(--color-text-primary, rgb(15, 20, 25))' : 'var(--color-text-secondary, rgb(83, 100, 113))';
            line.style.backgroundColor = isFilterActive ? 'var(--color-primary, rgb(29, 155, 240))' : 'transparent';

            // 立即应用筛选 (Apply filter immediately)
            applyFollowerFilter();
        };

        btn.onmouseover = () => {
            btn.style.backgroundColor = 'rgba(var(--rgb-text-primary, 15, 20, 25), 0.1)';
        };
        btn.onmouseout = () => {
            btn.style.backgroundColor = 'transparent';
        };

        tabList.appendChild(btn);
    };

    // 注入提醒按钮 / Inject Nudge button
    const injectNudgeButton = (cell, handle) => {
        if (cell.querySelector('.x-nudge-btn')) return;

        // 找到操作区域（通常是关注按钮所在的 div）
        // Find action area (usually the div containing follow button)
        const actionArea = cell.querySelector('[data-testid$="-follow"]')?.parentElement ||
            cell.querySelector('div[dir="ltr"]:last-child');

        if (!actionArea) return;

        const nudgeBtn = document.createElement('div');
        nudgeBtn.className = 'x-nudge-btn';
        nudgeBtn.textContent = '提醒';
        nudgeBtn.style.marginLeft = '8px';
        nudgeBtn.style.padding = '0 12px';
        nudgeBtn.style.height = '32px';
        nudgeBtn.style.lineHeight = '32px';
        nudgeBtn.style.background = 'transparent';
        nudgeBtn.style.border = '1px solid var(--color-primary, rgb(29, 155, 240))';
        nudgeBtn.style.color = 'var(--color-primary, rgb(29, 155, 240))';
        nudgeBtn.style.borderRadius = '16px';
        nudgeBtn.style.fontSize = '13px';
        nudgeBtn.style.fontWeight = 'bold';
        nudgeBtn.style.cursor = 'pointer';
        nudgeBtn.style.userSelect = 'none';

        nudgeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const message = `@${handle} 发现你还没关注我哦，期待回关支持！ #蓝V互关 #PingooTrade pingoo.trade`;

            // 复制到剪贴板 (Copy to clipboard)
            navigator.clipboard.writeText(message).then(() => {
                console.log(`📋 Copied nudge message for @${handle}`);

                // 视觉反馈 (Visual feedback)
                const originalText = nudgeBtn.textContent;
                nudgeBtn.textContent = '已复制';
                nudgeBtn.style.background = 'var(--color-primary, rgb(29, 155, 240))';
                nudgeBtn.style.color = 'white';

                setTimeout(() => {
                    nudgeBtn.textContent = originalText;
                    nudgeBtn.style.background = 'transparent';
                    nudgeBtn.style.color = 'var(--color-primary, rgb(29, 155, 240))';
                }, 2000);

                // 打开用户主页 (Open profile)
                window.open(`https://x.com/${handle}`, '_blank');
            }).catch(err => {
                console.error('❌ Failed to copy nudge message:', err);
            });
        };

        // 插入到关注按钮之前 (Insert before follow button)
        actionArea.style.display = 'flex';
        actionArea.style.alignItems = 'center';
        actionArea.prepend(nudgeBtn);
    };

    // 应用关注者筛选 / Apply follower filter
    const applyFollowerFilter = () => {
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        let nonFollowerCount = 0;

        userCells.forEach(cell => {
            const handle = getHandle(cell);
            const spans = Array.from(cell.querySelectorAll('span'));

            // 检查是否有"正在关注"按钮 (Check if I am following this user)
            const isFollowing = spans.some(
                el => el.textContent.trim() === '正在关注' ||
                    el.textContent.trim() === 'Following'
            );

            // 检查是否有"关注了你"标签 (Check for "Follows you" label)
            const followsYou = spans.some(
                el => el.textContent.includes('关注了你') ||
                    el.textContent.includes('Follows you')
            );

            if (!followsYou) {
                nonFollowerCount++;
                // 只有在我关注了对方，且对方未回粉的情况下才显示提醒按钮 (Only show nudge if I follow them and they don't follow back)
                if (handle && isFollowing) {
                    injectNudgeButton(cell, handle);
                } else {
                    const existingNudge = cell.querySelector('.x-nudge-btn');
                    if (existingNudge) existingNudge.remove();
                }
            } else {
                // 如果已回粉，移除提醒按钮（如果存在）
                const existingNudge = cell.querySelector('.x-nudge-btn');
                if (existingNudge) existingNudge.remove();
            }

            if (!isFilterActive) {
                cell.style.display = '';
                return;
            }

            // 如果已经回粉（互关），则隐藏 (Hide if they follow back)
            if (followsYou) {
                cell.style.display = 'none';
            } else {
                cell.style.display = '';
            }
        });

        // 更新按钮上的统计数字 (Update count on button)
        const filterText = document.querySelector('.x-filter-follows-text');
        if (filterText) {
            filterText.textContent = `未回粉 (${nonFollowerCount})`;
        }
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
        debounceTimer = setTimeout(() => {
            updateAllLabels();
            injectQuickReplyButton();
            injectFilterButton();
            applyFollowerFilter();
        }, 300);
    };

    // 监听 DOM 变化 / Observe DOM changes
    const observer = new MutationObserver(debounceHighlight);
    observer.observe(document.body, { childList: true, subtree: true });

    // 初始执行 / Initial execution
    debounceHighlight();

    console.log("✅ X Follower Checker initialized (DOM-only mode)");
})();