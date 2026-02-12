(function() {
    // 增加一个简单的标志，防止脚本重复初始化
    if (window.hasRunXAssistant) return;
    window.hasRunXAssistant = true;

    console.log("🚀 X 关注状态检测助手已启动...");
    
    const highlightMutuals = () => {
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        
        userCells.forEach(cell => {
            // 1. 检查我是否关注了该用户 (包含中文和英文环境)
            const spans = Array.from(cell.querySelectorAll('span'));
            const isFollowing = spans.some(
                el => el.textContent.trim() === '正在关注' || 
                      el.textContent.trim() === 'Following'
            );

            // 如果我没有关注对方，则不进行任何标注
            if (!isFollowing) {
                if (cell.style.backgroundColor) {
                    cell.style.backgroundColor = '';
                }
                return;
            }

            // 2. 在我已关注的用户中，检查对方是否关注了我
            const followsYouLabel = spans.find(
                el => el.textContent.includes('关注了你') || 
                      el.textContent.includes('Follows you')
            );

            if (followsYouLabel) {
                // 双向关注：浅绿色背景
                if (cell.style.backgroundColor !== 'rgba(144, 238, 144, 0.2)') {
                    cell.style.backgroundColor = 'rgba(144, 238, 144, 0.2)';
                    console.log("✅ 发现双向关注: " + cell.innerText.split('\n')[0]);
                }
            } else {
                // 我关注了对方但对方未回关：浅红色背景
                if (cell.style.backgroundColor !== 'rgba(255, 99, 71, 0.2)') {
                    cell.style.backgroundColor = 'rgba(255, 99, 71, 0.2)';
                    console.log("❌ 发现未回关: " + cell.innerText.split('\n')[0]);
                }
            }
        });
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