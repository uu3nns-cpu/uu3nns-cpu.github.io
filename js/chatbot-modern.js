/* ============================================
   🎨 MODERN CHATBOT JAVASCRIPT v2.3 FINAL
   Clean, simple, no icons
   ============================================ */

/* ============================================
   전역 상태 관리
   ============================================ */

let typingIndicatorElement = null;
let activeRequests = 0;

function startRequest() {
    activeRequests++;
    updateLoadingState();
}

function finishRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    updateLoadingState();
}

function updateLoadingState() {
    const isLoading = activeRequests > 0;
    setLoadingState(isLoading);
}

/* ============================================
   타이핑 인디케이터
   ============================================ */

function showTypingIndicator(model = 'AI') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    removeTypingIndicator();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message chat-message--ai typing-indicator-message';
    typingDiv.id = 'typingIndicator';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    typingDiv.appendChild(indicator);
    
    messagesContainer.appendChild(typingDiv);
    typingIndicatorElement = typingDiv;
    
    smoothScrollToBottom(messagesContainer);
}

function removeTypingIndicator() {
    if (typingIndicatorElement) {
        typingIndicatorElement.style.animation = 'messageSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (typingIndicatorElement && typingIndicatorElement.parentNode) {
                typingIndicatorElement.remove();
            }
            typingIndicatorElement = null;
        }, 300);
    }
}

function smoothScrollToBottom(container) {
    if (!container) return;
    
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

/* ============================================
   메시지 추가 함수
   ============================================ */

function addChatMessage(role, content, model = '') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const welcomeMsg = messagesContainer.querySelector('.chat-welcome-message');
    if (welcomeMsg && messagesContainer.children.length === 1) {
        welcomeMsg.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => welcomeMsg.remove(), 300);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message--${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = role === 'system' ? 'message-content message-content--system' : 'message-content';
    
    if (role === 'user') {
        contentDiv.textContent = content;
    } else {
        contentDiv.innerHTML = content;
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    smoothScrollToBottom(messagesContainer);
}

/* ============================================
   챗봇 입력창 관리
   ============================================ */

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

function updateChatbotInputState() {
    const chatInput = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('btnSendChat');
    const toggleGroq = document.getElementById('toggleGroq');
    const toggleGPT = document.getElementById('toggleGPT');
    
    if (!chatInput) return;
    
    const hasResults = hasReportResults();
    
    if (activeRequests > 0) {
        chatInput.disabled = true;
        chatInput.style.opacity = '0.6';
        chatInput.placeholder = '응답을 기다리는 중입니다...';
        
        if (sendBtn) sendBtn.disabled = true;
        if (toggleGroq) toggleGroq.disabled = true;
        if (toggleGPT) toggleGPT.disabled = true;
        return;
    }
    
    if (hasResults) {
        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = '요청 내용을 입력하세요. (예: "상담 과정을 더 자세하게")';
        
        if (sendBtn) sendBtn.disabled = false;
        if (toggleGroq) toggleGroq.disabled = false;
        if (toggleGPT) toggleGPT.disabled = false;
    } else {
        chatInput.disabled = true;
        chatInput.style.opacity = '0.5';
        chatInput.placeholder = '보고서를 먼저 생성해주세요';
        chatInput.value = '';
        
        if (sendBtn) sendBtn.disabled = true;
        if (toggleGroq) toggleGroq.disabled = true;
        if (toggleGPT) toggleGPT.disabled = true;
    }
}

function startChatbotStateMonitoring() {
    updateChatbotInputState();
    
    const outputIds = ['groqOutput', 'gptOutput', 'groqOutputCompare', 'gptOutputCompare'];
    const observer = new MutationObserver(updateChatbotInputState);
    
    outputIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            observer.observe(elem, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    });
    
    setInterval(updateChatbotInputState, 2000);
}

/* ============================================
   챗봇 토글
   ============================================ */

function toggleChatbot() {
    const chatbotModal = document.getElementById('chatbotModal');
    const overlay = document.getElementById('chatbotOverlay');
    const toggleBtn = document.getElementById('chatbotToggleBtn');

    if (!chatbotModal) return;

    const isActive = chatbotModal.classList.contains('active');

    if (isActive) {
        chatbotModal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggleBtn) toggleBtn.classList.remove('active');
    } else {
        chatbotModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        if (toggleBtn) toggleBtn.classList.add('active');

        updateChatbotInputState();

        const input = document.getElementById('chatbotInput');
        if (input && !input.disabled) {
            setTimeout(() => input.focus(), 100);
        }
    }
}

function closeChatbot() {
    const modal = document.getElementById('chatbotModal');
    const overlay = document.getElementById('chatbotOverlay');
    const toggleBtn = document.getElementById('chatbotToggleBtn');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('active');
}

/* ============================================
   메시지 전송
   ============================================ */

function handleChatSend() {
    const groqEnabled = document.getElementById('toggleGroq')?.checked;
    const gptEnabled = document.getElementById('toggleGPT')?.checked;
    const messageInput = document.getElementById('chatbotInput');
    const message = messageInput?.value.trim();
    
    if (activeRequests > 0) {
        showToast('이전 요청이 완료될 때까지 기다려주세요', 2000);
        return;
    }
    
    if (!groqEnabled && !gptEnabled) {
        showToast('응답 받을 모델을 선택해주세요', 2000);
        return;
    }
    
    if (!message) {
        showToast('메시지를 입력해주세요', 2000);
        if (messageInput) messageInput.focus();
        return;
    }
    
    if (!hasReportResults()) {
        showToast('먼저 보고서를 생성해주세요', 2500);
        return;
    }
    
    addChatMessage('user', message);
    clearChatInput();
    
    if (groqEnabled && gptEnabled) {
        sendToBoth(message);
    } else if (groqEnabled) {
        sendToGroq(message);
    } else if (gptEnabled) {
        sendToGPT(message);
    }
}

function clearChatInput() {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
}

/* ============================================
   로딩 상태
   ============================================ */

function setLoadingState(isLoading) {
    const sendBtn = document.getElementById('btnSendChat');
    const chatInput = document.getElementById('chatbotInput');
    const groqToggle = document.getElementById('toggleGroq');
    const gptToggle = document.getElementById('toggleGPT');
    
    if (isLoading) {
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('loading');
            
            const sendText = sendBtn.querySelector('.send-text');
            if (sendText) {
                sendText.setAttribute('data-original-text', sendText.textContent);
                sendText.textContent = '작성중';
            }
            
            const existingSpinner = sendBtn.querySelector('.spinner');
            if (!existingSpinner) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner';
                sendBtn.insertBefore(spinner, sendBtn.firstChild);
            }
        }
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.style.opacity = '0.6';
            chatInput.placeholder = '응답을 기다리는 중입니다...';
        }
        
        if (groqToggle) groqToggle.disabled = true;
        if (gptToggle) gptToggle.disabled = true;
        
    } else {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
            
            const sendText = sendBtn.querySelector('.send-text');
            if (sendText) {
                const originalText = sendText.getAttribute('data-original-text') || '요청';
                sendText.textContent = originalText;
                sendText.removeAttribute('data-original-text');
            }
            
            const spinner = sendBtn.querySelector('.spinner');
            if (spinner) spinner.remove();
        }
        
        if (chatInput) {
            updateChatbotInputState();
        }
        
        if (groqToggle) groqToggle.disabled = false;
        if (gptToggle) gptToggle.disabled = false;
    }
}

/* ============================================
   AI 호출 함수
   ============================================ */

function buildChatPrompt(userMessage, currentReport) {
    return `당신은 상담보고서를 수정하는 AI 어시스턴트입니다.

[현재 보고서]
${currentReport}

[수정 지침]
1. 사용자의 요구사항을 정확히 반영하세요.
2. 수정하지 않는 부분은 원본 그대로 유지하세요.
3. 전문적이고 객관적인 어조를 유지하세요.
4. 수정된 전체 보고서를 반환하세요.
5. 어떤 설명이나 주석 없이 보고서 내용만 반환하세요.
6. 보고서 형식(섹션 구조)을 유지하세요.
7. **마크다운 형식으로 작성하세요**:
   - 섹션 제목: ## 제목
   - 하위 제목: ### 하위제목
   - 강조: **중요한 내용**
   - 목록: - 항목 또는 1. 순서

[사용자 요청]
${userMessage}

[수정된 보고서]`;
}

function highlightModifiedText(originalText, modifiedText) {
    return modifiedText;
}

async function typeModifiedText(element, htmlContent) {
    if (typeof typeHtmlWithAnimation === 'function') {
        await typeHtmlWithAnimation(element, htmlContent);
    } else {
        element.innerHTML = htmlContent;
    }
}

async function updateReportWithTyping(model, highlightedHtml, plainText) {
    const outputId = (model === 'groq') ? 'groqOutput' : 'gptOutput';
    const out = document.getElementById(outputId);
    
    if (!out) return;
    
    out.setAttribute('data-raw-text', plainText);
    
    const count = plainText.length;
    const countElem = document.getElementById(`${model}Count`);
    if (countElem) countElem.textContent = `${count}자`;
    
    const cmpCountElem = document.getElementById(`${model}CountCompare`);
    if (cmpCountElem) cmpCountElem.textContent = `${count}자`;
    
    const copyBtn = document.getElementById(`${model}CopyBtn`);
    if (copyBtn) copyBtn.disabled = false;
    
    const copyBtn2 = document.getElementById(`${model}CopyBtnCompare`);
    if (copyBtn2) copyBtn2.disabled = false;
    
    let finalHtml = highlightedHtml;
    if (typeof renderMarkdown === 'function') {
        finalHtml = renderMarkdown(plainText);
        out.classList.add('markdown-rendered');
    }
    
    const activeTab = document.querySelector('.output-tab.active');
    const activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'compare';
    
    if (activeTabName === 'compare') {
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
        out.style.display = 'block';
        out.innerHTML = finalHtml;
    } else {
        out.style.display = 'block';
        await typeModifiedText(out, finalHtml);
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

async function sendToGroq(message) {
    startRequest();
    showTypingIndicator('Groq');
    
    try {
        const apiKey = getGroqApiKey();
        if (!apiKey) {
            throw new Error('Groq API 키가 설정되지 않았습니다.');
        }
        
        const groqOutput = document.getElementById('groqOutput');
        if (!groqOutput || !groqOutput.textContent.trim()) {
            throw new Error('Groq 보고서가 없습니다. 먼저 보고서를 생성해주세요.');
        }
        const currentReport = groqOutput.textContent;
        
        const prompt = buildChatPrompt(message, currentReport);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        removeTypingIndicator();
        
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        await updateReportWithTyping('groq', highlightedHtml, updatedReport);
        
        addChatMessage('ai', '보고서를 수정했습니다.');
        
    } catch (error) {
        removeTypingIndicator();
        console.error('Groq Error:', error);
        addChatMessage('system', `오류: ${error.message}`);
    } finally {
        finishRequest();
    }
}

async function sendToGPT(message) {
    startRequest();
    showTypingIndicator('GPT');
    
    try {
        const apiKey = getGPTApiKey();
        if (!apiKey) {
            throw new Error('GPT API 키가 설정되지 않았습니다.');
        }
        
        const gptOutput = document.getElementById('gptOutput');
        if (!gptOutput || !gptOutput.textContent.trim()) {
            throw new Error('GPT 보고서가 없습니다. 먼저 보고서를 생성해주세요.');
        }
        const currentReport = gptOutput.textContent;
        
        const prompt = buildChatPrompt(message, currentReport);
        
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
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        removeTypingIndicator();
        
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        await updateReportWithTyping('gpt', highlightedHtml, updatedReport);
        
        addChatMessage('ai', '보고서를 수정했습니다.');
        
    } catch (error) {
        removeTypingIndicator();
        console.error('GPT Error:', error);
        addChatMessage('system', `오류: ${error.message}`);
    } finally {
        finishRequest();
    }
}

async function sendToBoth(message) {
    await Promise.all([
        sendToGroq(message),
        sendToGPT(message)
    ]);
}

/* ============================================
   이벤트 리스너
   ============================================ */

function initChatbotEvents() {
    const closeBtn = document.getElementById('chatbotCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatbot);
    }
    
    const overlay = document.getElementById('chatbotOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeChatbot);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('chatbotModal');
            if (modal && modal.classList.contains('active')) {
                closeChatbot();
            }
        }
    });
}

function initSendButtonEvent() {
    const sendBtn = document.getElementById('btnSendChat');
    if (sendBtn) {
        sendBtn.removeEventListener('click', handleChatSend);
        sendBtn.addEventListener('click', handleChatSend);
    }
}

function initEnterKeyHandler() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSend();
        }
    });
}

/* ============================================
   초기화
   ============================================ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            startChatbotStateMonitoring();
            initChatbotEvents();
            initSendButtonEvent();
            initEnterKeyHandler();
        }, 500);
    });
} else {
    setTimeout(() => {
        startChatbotStateMonitoring();
        initChatbotEvents();
        initSendButtonEvent();
        initEnterKeyHandler();
    }, 500);
}

/* ============================================
   애니메이션 CSS
   ============================================ */

if (!document.getElementById('chatbot-animations')) {
    const style = document.createElement('style');
    style.id = 'chatbot-animations';
    style.textContent = `
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: scale(0.9);
            }
        }
        
        @keyframes messageSlideOut {
            to {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
            }
        }
    `;
    document.head.appendChild(style);
}
