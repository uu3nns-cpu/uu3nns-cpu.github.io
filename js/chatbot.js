/* ============================================
   챗봇 입력창 활성화/비활성화 관리
   ============================================ */

/**
 * 보고서 결과가 있는지 확인
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
 * 챗봇 입력창 활성화/비활성화
 */
function updateChatbotInputState() {
    const chatInput = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('btnSendChat');
    const toggleGroq = document.getElementById('toggleGroq');
    const toggleGPT = document.getElementById('toggleGPT');
    
    if (!chatInput) return;
    
    const hasResults = hasReportResults();
    
    if (hasResults) {
        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = '수정 요청을 입력하세요. (예: "상담 과정을 더 상세하게")';
        
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

/**
 * 챗봇 입력창 상태 감시 시작
 */
function startChatbotStateMonitoring() {
    updateChatbotInputState();
    
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
    
    setInterval(updateChatbotInputState, 2000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startChatbotStateMonitoring, 500);
    });
} else {
    setTimeout(startChatbotStateMonitoring, 500);
}

/* ============================================
   챗봇 열기/닫기
   ============================================ */

function toggleChatbot() {
    const chatbotModal = document.getElementById('chatbotModal');
    const overlay = document.getElementById('chatbotOverlay');

    if (!chatbotModal) {
        console.error('챗봇 모달을 찾을 수 없습니다');
        return;
    }

    const isActive = chatbotModal.classList.contains('active');

    if (isActive) {
        chatbotModal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    } else {
        chatbotModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
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
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function initChatbotEvents() {
    const closeBtn = document.getElementById('chatbotCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatbot);
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotEvents);
} else {
    initChatbotEvents();
}

/* ============================================
   메시지 전송 이벤트
   ============================================ */

function handleChatSend() {
    console.log('챗봇 전송 버튼 클릭됨!'); // 디버깅
    
    const groqEnabled = document.getElementById('toggleGroq')?.checked;
    const gptEnabled = document.getElementById('toggleGPT')?.checked;
    const messageInput = document.getElementById('chatbotInput');
    const message = messageInput?.value.trim();
    
    console.log('Groq 활성:', groqEnabled, 'GPT 활성:', gptEnabled);
    console.log('메시지:', message);
    
    if (!groqEnabled && !gptEnabled) {
        showToast('⚠️ 최소 하나의 AI 모델을 선택해주세요', 2000);
        return;
    }
    
    if (!message) {
        showToast('⚠️ 수정 요청을 입력해주세요', 2000);
        if (messageInput) messageInput.focus();
        return;
    }
    
    if (!hasReportResults()) {
        showToast('⚠️ 보고서를 먼저 생성해주세요', 2500);
        return;
    }
    
    console.log('모든 검증 통과! 메시지 전송 시작');
    
    addChatMessage('user', message);
    clearChatInput();
    setLoadingState(true);
    
    if (groqEnabled && gptEnabled) {
        sendToBoth(message);
    } else if (groqEnabled) {
        sendToGroq(message);
    } else if (gptEnabled) {
        sendToGPT(message);
    }
}

function initSendButtonEvent() {
    const sendBtn = document.getElementById('btnSendChat');
    if (sendBtn) {
        console.log('전송 버튼 찾음, 이벤트 리스너 등록');
        
        // 기존 리스너 제거 (중복 방지)
        sendBtn.replaceWith(sendBtn.cloneNode(true));
        const newSendBtn = document.getElementById('btnSendChat');
        
        newSendBtn.addEventListener('click', function(e) {
            console.log('버튼 클릭 이벤트 발생!', e);
            e.preventDefault();
            e.stopPropagation();
            handleChatSend();
        });
        
        console.log('이벤트 리스너 등록 완료');
    } else {
        console.error('전송 버튼을 찾을 수 없습니다!');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSendButtonEvent);
} else {
    initSendButtonEvent();
}

/* ============================================
   메시지 추가 함수
   ============================================ */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addChatMessage(role, content, model = '') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) {
        console.error('메시지 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message--${role}`;
    
    if (role === 'ai') {
        const badge = document.createElement('div');
        badge.className = 'message-badge';
        badge.textContent = model || 'AI';
        messageDiv.appendChild(badge);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
        
    } else if (role === 'user') {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        messageDiv.appendChild(contentDiv);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDiv.textContent = `${hours}:${minutes}`;
        messageDiv.appendChild(timeDiv);
        
    } else if (role === 'system') {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* ============================================
   Enter 키 처리
   ============================================ */

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnterKeyHandler);
} else {
    initEnterKeyHandler();
}

/* ============================================
   입력창 초기화
   ============================================ */

function clearChatInput() {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
}

/* ============================================
   로딩 상태 관리
   ============================================ */

let isAnimating = false;

function setLoadingState(isLoading) {
    const sendBtn = document.getElementById('btnSendChat');
    const chatInput = document.getElementById('chatbotInput');
    const groqToggle = document.getElementById('toggleGroq');
    const gptToggle = document.getElementById('toggleGPT');
    
    if (isLoading) {
        isAnimating = true;
        
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('loading');
            const spinner = document.createElement('span');
            spinner.className = 'spinner';
            sendBtn.insertBefore(spinner, sendBtn.firstChild);
        }
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.style.opacity = '0.6';
            chatInput.placeholder = '수정 중입니다...';
        }
        
        if (groqToggle) groqToggle.disabled = true;
        if (gptToggle) gptToggle.disabled = true;
        
    } else {
        isAnimating = false;
        
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
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
   AI API 호출 함수들
   ============================================ */

function buildChatPrompt(userMessage, currentReport) {
    return `당신은 상담보고서를 수정하는 AI 어시스턴트입니다.

[현재 보고서]
${currentReport}

[수정 지침]
1. 사용자의 요청을 정확히 반영하세요
2. 수정하지 않는 부분은 원본 그대로 유지하세요
3. 자연스럽고 전문적인 어조를 유지하세요
4. 수정된 전체 보고서를 반환하세요
5. 서문이나 주석 없이 보고서 내용만 반환하세요
6. 보고서 형식(섹션 구조)을 유지하세요
7. **마크다운 형식으로 작성하세요**:
   - 섹션 제목: ## 제목
   - 하위 제목: ### 하위제목
   - 강조: **중요한 내용**
   - 목록: - 항목 또는 1. 항목

[사용자 요청]
${userMessage}

[수정된 보고서]`;
}

function highlightModifiedText(originalText, modifiedText) {
    const originalWords = originalText.split(/\s+/);
    const modifiedWords = modifiedText.split(/\s+/);
    let result = '';
    const modifiedIndices = new Set();
    
    for (let i = 0; i < modifiedWords.length; i++) {
        if (originalWords[i] !== modifiedWords[i]) {
            modifiedIndices.add(i);
        }
    }
    
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
    addChatMessage('system', '🔄 Groq가 보고서를 수정하고 있습니다...', 'Groq');
    
    try {
        const apiKey = getGroqApiKey();
        if (!apiKey) {
            throw new Error('Groq API 키가 설정되지 않았습니다');
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
                messages: [{ role: 'user', content: prompt }],
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
        
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        await updateReportWithTyping('groq', highlightedHtml, updatedReport);
        
        addChatMessage('ai', '✅ Groq가 보고서를 수정했습니다.', 'Groq');
        
    } catch (error) {
        console.error('Groq Error:', error);
        addChatMessage('system', `❌ Groq 오류: ${error.message}`, 'Groq');
    } finally {
        setLoadingState(false);
    }
}

async function sendToGPT(message) {
    addChatMessage('system', '🔄 GPT가 보고서를 수정하고 있습니다...', 'GPT');
    
    try {
        const apiKey = getGPTApiKey();
        if (!apiKey) {
            throw new Error('GPT API 키가 설정되지 않았습니다');
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
                'HTTP-Referer': 'https://uu3nns-cpu.github.io',
                'X-Title': 'RE Report Tool'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
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
        
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        await updateReportWithTyping('gpt', highlightedHtml, updatedReport);
        
        addChatMessage('ai', '✅ GPT가 보고서를 수정했습니다.', 'GPT');
        
    } catch (error) {
        console.error('GPT Error:', error);
        addChatMessage('system', `❌ GPT 오류: ${error.message}`, 'GPT');
    } finally {
        setLoadingState(false);
    }
}

async function sendToBoth(message) {
    addChatMessage('system', '🔄 Groq와 GPT가 동시에 수정 중...', 'Both');
    
    await Promise.all([
        sendToGroq(message),
        sendToGPT(message)
    ]);
    
    addChatMessage('system', '✅ 두 모델 모두 수정 완료!', 'Both');
}

console.log('챗봇 스크립트 로드 완료');
