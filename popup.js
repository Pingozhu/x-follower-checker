document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('replies-input');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status-msg');

    // 加载已有配置 (Load existing custom replies)
    chrome.storage.local.get(['customReplies'], (result) => {
        if (result && result.customReplies) {
            input.value = result.customReplies.join('\n');
        }
    });

    // 点击保存事件 (Save on click)
    saveBtn.addEventListener('click', () => {
        const text = input.value;
        const replies = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        chrome.storage.local.set({ customReplies: replies }, () => {
            statusMsg.style.opacity = 1;
            setTimeout(() => {
                statusMsg.style.opacity = 0;
            }, 2000);
        });
    });
});
