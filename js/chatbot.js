/* ============================================
   梨쀫큸 ?낅젰? ?쒖꽦??鍮꾪솢?깊솕 愿由?   ============================================ */

/**
 * 蹂닿퀬??寃곌낵媛 ?덈뒗吏 ?뺤씤
 */
function hasReportResults() {
    const groqOutput = document.getElementById('groqOutput');
    const gptOutput = document.getElementById('gptOutput');
    const groqOutputCompare = document.getElementById('groqOutputCompare');
    const gptOutputCompare = document.getElementById('gptOutputCompare');
    
    const hasGroq = (groqOutput && groqOutput.textContent.trim()) || 
                    (groqOutputCompare && groqOutputCompare.textContent.trim());
    const hasGpt = (gptOutput && gptOutput.textContent.trim()) || 
                   (gptOutputCompare && gptOutputCompare.textContent.trim());
    
    return hasGroq || hasGpt;
}

/**
 * 梨쀫큸 ?낅젰? ?쒖꽦??鍮꾪솢?깊솕
 */
function updateChatbotInputState() {
    const chatInput = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('btnSendChat');
    const toggleGroq = document.getElementById('toggleGroq');
    const toggleGPT = document.getElementById('toggleGPT');
    
    if (!chatInput) return;
    
    const hasResults = hasReportResults();
    
    if (hasResults) {
        // 寃곌낵 ?덉쓬: ?쒖꽦??        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = '?섏젙 ?붿껌???낅젰?섏꽭??.. (?? "?곷떞 怨쇱젙?????곸꽭?섍쾶")';
        
        if (sendBtn) sendBtn.disabled = false;
        if (toggleGroq) toggleGroq.disabled = false;
        if (toggleGPT) toggleGPT.disabled = false;
    } else {
        // 寃곌낵 ?놁쓬: 鍮꾪솢?깊솕
        chatInput.disabled = true;
        chatInput.style.opacity = '0.5';
        chatInput.placeholder = '蹂닿퀬?쒕? 癒쇱? ?앹꽦?댁＜?몄슂';
        chatInput.value = '';
        
        if (sendBtn) sendBtn.disabled = true;
        if (toggleGroq) toggleGroq.disabled = true;
        if (toggleGPT) toggleGPT.disabled = true;
    }
}

/**
 * 梨쀫큸 ?낅젰? ?곹깭 媛먯떆 ?쒖옉
 */
function startChatbotStateMonitoring() {
    // 珥덇린 ?곹깭 ?ㅼ젙
    updateChatbotInputState();
    
    // 異쒕젰 ?곸뿭 蹂??媛먯? (MutationObserver)
    const outputIds = ['groqOutput', 'gptOutput', 'groqOutputCompare', 'gptOutputCompare'];
    const observer = new MutationObserver(function() {
        updateChatbotInputState();
    });
    
    outputIds.forEach(function(id) {
        const elem = document.getElementById(id);
        if (elem) {
            observer.observe(elem, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    });
    
    // 二쇨린?곸쑝濡쒕룄 泥댄겕 (fallback)
    setInterval(updateChatbotInputState, 2000);
}

// ?섏씠吏 濡쒕뱶 ??媛먯떆 ?쒖옉
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startChatbotStateMonitoring, 500);
    });
} else {
    setTimeout(startChatbotStateMonitoring, 500);
}

/* ============================================
   梨쀫큸 湲곕뒫 - Floating 踰꾪듉 ?쒕옒洹?   ============================================ */

// Floating 버튼 초기화
function initChatbotFloatingButton() {
    const btn = document.getElementById('chatbotFloatingBtn');
    if (!btn) return;
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // ??λ맂 ?꾩튂 蹂듭썝
    const savedPos = localStorage.getItem('chatbotBtnPos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            btn.style.right = pos.right;
            btn.style.bottom = pos.bottom;
        } catch (e) {
            console.error('梨쀫큸 踰꾪듉 ?꾩튂 蹂듭썝 ?ㅻ쪟:', e);
        }
    }
    
    // 留덉슦???ㅼ슫
    btn.addEventListener('mousedown', function(e) {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = btn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        e.preventDefault();
    });
    
    function onMouseMove(e) {
        const moveX = Math.abs(e.clientX - startX);
        const moveY = Math.abs(e.clientY - startY);
        
        // 5px ?댁긽 ?吏곸씠硫??쒕옒洹몃줈 媛꾩＜
        if (moveX > 5 || moveY > 5) {
            isDragging = true;
            btn.classList.add('dragging');
        }
        
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = initialX + deltaX;
            const newTop = initialY + deltaY;
            
            // ?붾㈃ 諛뽰쑝濡??섍?吏 ?딅룄濡??쒗븳
            const maxX = window.innerWidth - btn.offsetWidth;
            const maxY = window.innerHeight - btn.offsetHeight;
            
            const finalLeft = Math.max(0, Math.min(newLeft, maxX));
            const finalTop = Math.max(0, Math.min(newTop, maxY));
            
            btn.style.left = finalLeft + 'px';
            btn.style.top = finalTop + 'px';
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';
        }
    }
    
    function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        if (isDragging) {
            // ?꾩튂 ???            const rect = btn.getBoundingClientRect();
            const right = window.innerWidth - rect.right;
            const bottom = window.innerHeight - rect.bottom;
            
            localStorage.setItem('chatbotBtnPos', JSON.stringify({
                right: right + 'px',
                bottom: bottom + 'px'
            }));
            
            setTimeout(() => {
                btn.classList.remove('dragging');
                isDragging = false;
            }, 100);
        } else {
            // ?대┃ (?쒕옒洹??꾨떂) - 梨쀫큸 ?닿린
            toggleChatbot();
        }
    }
}

// ?섏씠吏 濡쒕뱶 ??珥덇린??if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotFloatingButton);
} else {
    initChatbotFloatingButton();
}

/* ============================================
   梨쀫큸 ?ъ씠?쒕컮 ?닿린/?リ린 - ?ㅼ젙 ?ъ씠?쒕컮? 諛고???   ============================================ */

// 梨쀫큸 ?ъ씠?쒕컮 ?좉? - 蹂몃Ц??諛?대궡???뺥깭
function toggleChatbot() {
    const chatbotModal = document.getElementById('chatbotModal');
    const settingsSidebar = document.getElementById('settingsSidebar');
    const mainArea = document.querySelector('.main-area');
    const overlay = document.getElementById('chatbotOverlay');

    if (!chatbotModal) return;

    const isActive = chatbotModal.classList.contains('active');

    if (isActive) {
        chatbotModal.classList.remove('active');
        if (mainArea) mainArea.classList.remove('chatbot-open');
        if (overlay) overlay.classList.remove('active');
    } else {
        chatbotModal.classList.add('active');
        if (mainArea) mainArea.classList.add('chatbot-open');
        if (overlay) overlay.classList.add('active');

        if (settingsSidebar && settingsSidebar.classList.contains('open')) {
            settingsSidebar.classList.remove('open');
            if (mainArea) mainArea.classList.remove('sidebar-open');
        }

        updateChatbotInputState();

        const input = document.getElementById('chatbotInput');
        if (input && !input.disabled) {
            setTimeout(() => input.focus(), 33);
        }
    }
}

function closeChatbot() {
    const modal = document.getElementById('chatbotModal');
    const mainArea = document.querySelector('.main-area');
    const overlay = document.getElementById('chatbotOverlay');
    if (modal) modal.classList.remove('active');
    if (mainArea) mainArea.classList.remove('chatbot-open');
    if (overlay) overlay.classList.remove('active');
}

// ?대깽??由ъ뒪???깅줉
function initChatbotEvents() {
    // X 踰꾪듉 ?대┃
    const closeBtn = document.getElementById('chatbotCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatbot);
    }
    
    // ESC ?ㅻ줈 ?リ린
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('chatbotModal');
            if (modal && modal.classList.contains('active')) {
                closeChatbot();
            }
        }
    });
}

// ?섏씠吏 濡쒕뱶 ???대깽??由ъ뒪???깅줉
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotEvents);
} else {
    initChatbotEvents();
}

/* ============================================
   硫붿떆吏 ?꾩넚 ?대깽??   ============================================ */

// 硫붿떆吏 ?꾩넚 泥섎━
function handleChatSend() {
    const groqEnabled = document.getElementById('toggleGroq').checked;
    const gptEnabled = document.getElementById('toggleGPT').checked;
    const messageInput = document.getElementById('chatbotInput');
    const message = messageInput.value.trim();
    
    // 寃利?1: ????OFF??寃쎌슦
    if (!groqEnabled && !gptEnabled) {
        showToast('?좑툘 紐낅졊 諛쏆쓣 ??곸쓣 ?좏깮?댁＜?몄슂', 2000);
        return;
    }
    
    // 寃利?2: 硫붿떆吏 鍮꾩뼱?덈뒗吏 ?뺤씤
    if (!message) {
        showToast('?좑툘 硫붿떆吏瑜??낅젰?댁＜?몄슂', 2000);
        messageInput.focus();
        return;
    }
    
    // 寃利?3: 蹂닿퀬??寃곌낵 ?뺤씤 (?낅젰????쒖꽦?붾릺???덈떎??寃껋? 寃곌낵媛 ?덈떎???섎?)
    if (!hasReportResults()) {
        showToast('?좑툘 蹂닿퀬?쒕? 癒쇱? ?앹꽦?댁＜?몄슂', 2500);
        return;
    }
    
    // ?ъ슜??硫붿떆吏 ?쒖떆
    addChatMessage('user', message);
    
    // ?낅젰李?珥덇린??    clearChatInput();
    
    // 濡쒕뵫 ?곹깭 ?ㅼ젙
    setLoadingState(true);
    
    // ?꾩넚 濡쒖쭅
    if (groqEnabled && gptEnabled) {
        // ?????꾩넚
        sendToBoth(message);
    } else if (groqEnabled) {
        // Groq留??꾩넚
        sendToGroq(message);
    } else if (gptEnabled) {
        // GPT留??꾩넚
        sendToGPT(message);
    }
}

// ?꾩넚 踰꾪듉 ?대깽???깅줉
function initSendButtonEvent() {
    const sendBtn = document.getElementById('btnSendChat');
    if (sendBtn) {
        sendBtn.addEventListener('click', handleChatSend);
    }
}

// ?섏씠吏 濡쒕뱶 ???꾩넚 踰꾪듉 ?대깽???깅줉
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSendButtonEvent);
} else {
    initSendButtonEvent();
}

/* ============================================
   Phase 2.3 - 硫붿떆吏 異붽? ?⑥닔
   ============================================ */

// HTML ?댁뒪耳?댄봽 (XSS 諛⑹?)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 梨꾪똿 硫붿떆吏 異붽?
function addChatMessage(role, content, model = '') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message--${role}`;
    
    if (role === 'ai') {
        // AI 硫붿떆吏: badge + content
        const badge = document.createElement('div');
        badge.className = 'message-badge';
        badge.textContent = model || 'AI';
        messageDiv.appendChild(badge);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content; // AI ?묐떟? HTML ?ы븿 媛??        messageDiv.appendChild(contentDiv);
        
    } else if (role === 'user') {
        // ?ъ슜??硫붿떆吏: content + time
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content; // ?ъ슜???낅젰? ?띿뒪?몃쭔
        messageDiv.appendChild(contentDiv);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDiv.textContent = `${hours}:${minutes}`;
        messageDiv.appendChild(timeDiv);
        
    } else if (role === 'system') {
        // ?쒖뒪??硫붿떆吏: content留?        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
    }
    
    // 硫붿떆吏 異붽?
    messagesContainer.appendChild(messageDiv);
    
    // ?먮룞 ?ㅽ겕濡?    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* ============================================
   Phase 2.4 - Enter ??泥섎━
   ============================================ */

// Enter 키 처리 초기화
function initEnterKeyHandler() {
    
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Enter留??꾨Ⅴ硫??꾩넚
            e.preventDefault();
            handleChatSend();
        }
        // Shift+Enter??湲곕낯 ?숈옉 (以꾨컮轅? ?좎?
    });
}

// ?섏씠吏 濡쒕뱶 ??Enter ???몃뱾???깅줉
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnterKeyHandler);
} else {
    initEnterKeyHandler();
}

/* ============================================
   Phase 4.4 - ?낅젰李?珥덇린??   ============================================ */

function clearChatInput() {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
}

/* ============================================
   Phase 4.1 - 濡쒕뵫 ?곹깭 愿由?- ?좊땲硫붿씠??以??낅젰 李⑤떒
   ============================================ */

let isAnimating = false; // ?꾩뿭 蹂?섎줈 ?좊땲硫붿씠???곹깭 愿由?
function setLoadingState(isLoading) {
    const sendBtn = document.getElementById('btnSendChat');
    const chatInput = document.getElementById('chatbotInput');
    const groqToggle = document.getElementById('toggleGroq');
    const gptToggle = document.getElementById('toggleGPT');
    
    if (isLoading) {
        // 濡쒕뵫 ?쒖옉
        isAnimating = true;
        
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('loading');
            // ?ㅽ뵾??異붽?
            const spinner = document.createElement('span');
            spinner.className = 'spinner';
            sendBtn.insertBefore(spinner, sendBtn.firstChild);
        }
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.style.opacity = '0.6';
            chatInput.placeholder = '?섏젙 以묒엯?덈떎...';
        }
        
        if (groqToggle) groqToggle.disabled = true;
        if (gptToggle) gptToggle.disabled = true;
        
    } else {
        // 濡쒕뵫 醫낅즺
        isAnimating = false;
        
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
            // ?ㅽ뵾???쒓굅
            const spinner = sendBtn.querySelector('.spinner');
            if (spinner) spinner.remove();
        }
        
        if (chatInput) {
            // 濡쒕뵫 醫낅즺 ???곹깭??updateChatbotInputState?먯꽌 愿由?            updateChatbotInputState();
        }
        
        if (groqToggle) groqToggle.disabled = false;
        if (gptToggle) gptToggle.disabled = false;
    }
}

/* ============================================
   Phase 3 - AI ?곕룞 ?⑥닔
   ============================================ */

// Phase 3.1 - ?꾨＼?꾪듃 ?앹꽦
function buildChatPrompt(userMessage, currentReport) {
    return `?뱀떊? ?곷떞蹂닿퀬?쒕? ?섏젙?섎뒗 AI ?댁떆?ㅽ꽩?몄엯?덈떎.

[?꾩옱 蹂닿퀬??
${currentReport}

[?섏젙 吏移?
1. ?ъ슜?먯쓽 ?붿껌???뺥솗??諛섏쁺?섏꽭??2. ?섏젙?섏? ?딅뒗 遺遺꾩? ?먮낯 洹몃?濡??좎??섏꽭??3. ?꾨Ц?곸씠怨?媛앷??곸씤 ?댁“瑜??좎??섏꽭??4. ?섏젙???꾩껜 蹂닿퀬?쒕? 諛섑솚?섏꽭??5. ?ㅻ챸?대굹 二쇱꽍 ?놁씠 蹂닿퀬???댁슜留?諛섑솚?섏꽭??6. 蹂닿퀬???뺤떇(?뱀뀡 援ъ“)???좎??섏꽭??7. **留덊겕?ㅼ슫 ?뺤떇?쇰줈 ?묒꽦?섏꽭??*:
   - ?뱀뀡 ?쒕ぉ: ## ?쒕ぉ
   - ?섏쐞 ?쒕ぉ: ### ?섏쐞?쒕ぉ
   - 媛뺤“: **以묒슂???댁슜**
   - 紐⑸줉: - ??ぉ ?먮뒗 1. ?쒖꽌

[?ъ슜???붿껌]
${userMessage}

[?섏젙??蹂닿퀬??`;
}

// Phase 3.2 - 蹂寃??섏씠?쇱씠??(媛꾩씠 ?뚭퀬由ъ쬁)
function highlightModifiedText(originalText, modifiedText) {
    const originalWords = originalText.split(/\s+/);
    const modifiedWords = modifiedText.split(/\s+/);
    let result = '';
    const modifiedIndices = new Set();
    
    // 蹂寃쎈맂 ?⑥뼱 ?몃뜳??李얘린
    for (let i = 0; i < modifiedWords.length; i++) {
        if (originalWords[i] !== modifiedWords[i]) {
            modifiedIndices.add(i);
        }
    }
    
    // HTML ?앹꽦
    for (let i = 0; i < modifiedWords.length; i++) {
        const word = modifiedWords[i] || '';
        if (modifiedIndices.has(i)) {
            result += `<span class="modified-text">${escapeHtml(word)}</span> `;
        } else {
            result += `${escapeHtml(word)} `;
        }
    }
    
    return result.trim();
}

// Phase 3.3 - ??댄븨 ?좊땲硫붿씠??(typing-animation.js?먯꽌 怨듭슜 ?⑥닔 ?ъ슜)
async function typeModifiedText(element, htmlContent) {
    if (typeof typeHtmlWithAnimation === 'function') {
        await typeHtmlWithAnimation(element, htmlContent);
    } else {
        // fallback: 利됱떆 ?쒖떆
        element.innerHTML = htmlContent;
    }
}

// Phase 3.7 - 寃곌낵 諛섏쁺 (??댄븨) - 鍮꾧탳 ??뿉???좊땲硫붿씠???곸슜, 留덊겕?ㅼ슫 ?뚮뜑留??ы븿
async function updateReportWithTyping(model, highlightedHtml, plainText) {
    const outputId = (model === 'groq') ? 'groqOutput' : 'gptOutput';
    const out = document.getElementById(outputId);
    
    if (!out) return;
    
    // ?먮낯 ?띿뒪?????(蹂듭궗 湲곕뒫???꾪빐)
    out.setAttribute('data-raw-text', plainText);
    
    // 湲?먯닔 癒쇱? ?낅뜲?댄듃
    const count = plainText.length;
    const countElem = document.getElementById(`${model}Count`);
    if (countElem) countElem.textContent = `${count}??;
    
    const cmpCountElem = document.getElementById(`${model}CountCompare`);
    if (cmpCountElem) cmpCountElem.textContent = `${count}??;
    
    // 蹂듭궗 踰꾪듉 ?쒖꽦??    const copyBtn = document.getElementById(`${model}CopyBtn`);
    if (copyBtn) copyBtn.disabled = false;
    
    const copyBtn2 = document.getElementById(`${model}CopyBtnCompare`);
    if (copyBtn2) copyBtn2.disabled = false;
    
    // 留덊겕?ㅼ슫 ?뚮뜑留??곸슜
    let finalHtml = highlightedHtml;
    if (typeof renderMarkdown === 'function') {
        finalHtml = renderMarkdown(plainText);
        out.classList.add('markdown-rendered');
    }
    
    // ?꾩옱 ???뺤씤
    const activeTab = document.querySelector('.output-tab.active');
    const activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'compare';
    
    if (activeTabName === 'compare') {
        // 鍮꾧탳 紐⑤뱶: 鍮꾧탳 ??뿉 ?좊땲硫붿씠???곸슜
        const cmpId = (model === 'groq') ? 'groqOutputCompare' : 'gptOutputCompare';
        const cmp = document.getElementById(cmpId);
        if (cmp) {
            cmp.setAttribute('data-raw-text', plainText);
            cmp.style.display = 'block';
            if (typeof renderMarkdown === 'function') {
                cmp.classList.add('markdown-rendered');
            }
            await typeModifiedText(cmp, finalHtml);
        }
        // 媛쒕퀎 ??뿉??利됱떆 諛섏쁺 (?좊땲硫붿씠???놁쓬)
        out.style.display = 'block';
        out.innerHTML = finalHtml;
    } else {
        // 媛쒕퀎 ??紐⑤뱶: ?대떦 ??뿉 ?좊땲硫붿씠???곸슜
        out.style.display = 'block';
        await typeModifiedText(out, finalHtml);
        // 鍮꾧탳 ??뿉??利됱떆 諛섏쁺 (?좊땲硫붿씠???놁쓬)
        const cmpId = (model === 'groq') ? 'groqOutputCompare' : 'gptOutputCompare';
        const cmp = document.getElementById(cmpId);
        if (cmp) {
            cmp.setAttribute('data-raw-text', plainText);
            if (typeof renderMarkdown === 'function') {
                cmp.classList.add('markdown-rendered');
            }
            cmp.innerHTML = finalHtml;
        }
    }
}

// API ??媛?몄삤湲?(app.js???⑥닔 ?쒖슜)
function getGroqApiKey() {
    if (typeof loadApiKeySafely === 'function') {
        return loadApiKeySafely('groqApiKey');
    }
    return '';
}

function getGPTApiKey() {
    if (typeof loadApiKeySafely === 'function') {
        return loadApiKeySafely('gptApiKey');
    }
    return '';
}

// Phase 3.4 - Groq ?꾩넚
async function sendToGroq(message) {
    addChatMessage('system', '?뮡 Groq媛 蹂닿퀬?쒕? ?섏젙?섍퀬 ?덉뒿?덈떎...', 'Groq');
    
    try {
        const apiKey = getGroqApiKey();
        if (!apiKey) {
            throw new Error('Groq API ?ㅺ? ?ㅼ젙?섏? ?딆븯?듬땲??);
        }
        
        // ?꾩옱 蹂닿퀬??媛?몄삤湲?        const groqOutput = document.getElementById('groqOutput');
        if (!groqOutput || !groqOutput.textContent.trim()) {
            throw new Error('Groq 蹂닿퀬?쒓? ?놁뒿?덈떎. 癒쇱? 蹂닿퀬?쒕? ?앹꽦?댁＜?몄슂.');
        }
        const currentReport = groqOutput.textContent;
        
        // ?꾨＼?꾪듃 ?앹꽦
        const prompt = buildChatPrompt(message, currentReport);
        
        // API ?몄텧
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API ?ㅻ쪟 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        // 蹂寃??섏씠?쇱씠???곸슜
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        
        // ??댄븨 ?좊땲硫붿씠?섏쑝濡?寃곌낵 諛섏쁺
        await updateReportWithTyping('groq', highlightedHtml, updatedReport);
        
        // ?깃났 硫붿떆吏
        addChatMessage('ai', '??Groq媛 蹂닿퀬?쒕? ?섏젙?덉뒿?덈떎.', 'Groq');
        
    } catch (error) {
        console.error('Groq Error:', error);
        addChatMessage('system', `??Groq ?ㅻ쪟: ${error.message}`, 'Groq');
    } finally {
        setLoadingState(false);
    }
}

// Phase 3.5 - GPT ?꾩넚
async function sendToGPT(message) {
    addChatMessage('system', '?뮡 GPT媛 蹂닿퀬?쒕? ?섏젙?섍퀬 ?덉뒿?덈떎...', 'GPT');
    
    try {
        const apiKey = getGPTApiKey();
        if (!apiKey) {
            throw new Error('GPT API ?ㅺ? ?ㅼ젙?섏? ?딆븯?듬땲??);
        }
        
        // ?꾩옱 蹂닿퀬??媛?몄삤湲?        const gptOutput = document.getElementById('gptOutput');
        if (!gptOutput || !gptOutput.textContent.trim()) {
            throw new Error('GPT 蹂닿퀬?쒓? ?놁뒿?덈떎. 癒쇱? 蹂닿퀬?쒕? ?앹꽦?댁＜?몄슂.');
        }
        const currentReport = gptOutput.textContent;
        
        // ?꾨＼?꾪듃 ?앹꽦
        const prompt = buildChatPrompt(message, currentReport);
        
        // API ?몄텧
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://counseling-journal.app',
                'X-Title': 'Counseling Journal Tool'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API ?ㅻ쪟 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        // 蹂寃??섏씠?쇱씠???곸슜
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        
        // ??댄븨 ?좊땲硫붿씠?섏쑝濡?寃곌낵 諛섏쁺
        await updateReportWithTyping('gpt', highlightedHtml, updatedReport);
        
        // ?깃났 硫붿떆吏
        addChatMessage('ai', '??GPT媛 蹂닿퀬?쒕? ?섏젙?덉뒿?덈떎.', 'GPT');
        
    } catch (error) {
        console.error('GPT Error:', error);
        addChatMessage('system', `??GPT ?ㅻ쪟: ${error.message}`, 'GPT');
    } finally {
        setLoadingState(false);
    }
}

// Phase 3.6 - ?숈떆 ?꾩넚
async function sendToBoth(message) {
    addChatMessage('system', '?뮡 Groq? GPT媛 ?숈떆???섏젙 以?..', 'Both');
    
    await Promise.all([
        sendToGroq(message),
        sendToGPT(message)
    ]);
    
    addChatMessage('system', '????紐⑤뜽 紐⑤몢 ?섏젙 ?꾨즺!', 'Both');
}

