/* ============================================
   챗봇 입력란 활성화/비활성화 관리
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
 * 챗봇 입력란 활성화/비활성화
 */
function updateChatbotInputState() {
    const chatInput = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('btnSendChat');
    const toggleGroq = document.getElementById('toggleGroq');
    const toggleGPT = document.getElementById('toggleGPT');
    
    if (!chatInput) return;
    
    const hasResults = hasReportResults();
    
    if (hasResults) {
        // 결과 있음: 활성화
        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = '수정 요청을 입력하세요... (예: "상담 과정을 더 상세하게")';
        
        if (sendBtn) sendBtn.disabled = false;
        if (toggleGroq) toggleGroq.disabled = false;
        if (toggleGPT) toggleGPT.disabled = false;
    } else {
        // 결과 없음: 비활성화
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
 * 챗봇 입력란 상태 감시 시작
 */
function startChatbotStateMonitoring() {
    // 초기 상태 설정
    updateChatbotInputState();
    
    // 출력 영역 변화 감지 (MutationObserver)
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
    
    // 주기적으로도 체크 (fallback)
    setInterval(updateChatbotInputState, 2000);
}

// 페이지 로드 시 감시 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startChatbotStateMonitoring, 500);
    });
} else {
    setTimeout(startChatbotStateMonitoring, 500);
}

/* ============================================
   챗봇 기능 - Floating 버튼 드래그
   ============================================ */

// Floating 버튼 초기화
function initChatbotFloatingButton() {
    const btn = document.getElementById('chatbotFloatingBtn');
    if (!btn) return;
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // 저장된 위치 복원
    const savedPos = localStorage.getItem('chatbotBtnPos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            btn.style.right = pos.right;
            btn.style.bottom = pos.bottom;
        } catch (e) {
            console.error('챗봇 버튼 위치 복원 오류:', e);
        }
    }
    
    // 마우스 다운
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
        
        // 5px 이상 움직이면 드래그로 간주
        if (moveX > 5 || moveY > 5) {
            isDragging = true;
            btn.classList.add('dragging');
        }
        
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = initialX + deltaX;
            const newTop = initialY + deltaY;
            
            // 화면 밖으로 나가지 않도록 제한
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
            // 위치 저장
            const rect = btn.getBoundingClientRect();
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
            // 클릭 (드래그 아님) - 챗봇 열기
            toggleChatbot();
        }
    }
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotFloatingButton);
} else {
    initChatbotFloatingButton();
}

/* ============================================
   챗봇 사이드바 열기/닫기 - 설정 사이드바와 배타적
   ============================================ */

// 챗봇 사이드바 토글 - 본문을 밀어내는 형태
function toggleChatbot() {
    const chatbotModal = document.getElementById('chatbotModal');
    const settingsSidebar = document.getElementById('settingsSidebar');
    const mainArea = document.querySelector('.main-area');
    
    if (!chatbotModal) return;
    
    const isActive = chatbotModal.classList.contains('active');
    
    if (isActive) {
        // 챗봇 닫기
        chatbotModal.classList.remove('active');
        if (mainArea) mainArea.classList.remove('chatbot-open');
    } else {
        // 챗봇 열기
        chatbotModal.classList.add('active');
        if (mainArea) mainArea.classList.add('chatbot-open');
        
        // 설정 사이드바 닫기
        if (settingsSidebar && settingsSidebar.classList.contains('open')) {
            settingsSidebar.classList.remove('open');
            if (mainArea) mainArea.classList.remove('sidebar-open');
        }
        
        // 입력란 상태 업데이트
        updateChatbotInputState();
        
        // 입력창 포커스 (활성화되어 있을 때만)
        const input = document.getElementById('chatbotInput');
        if (input && !input.disabled) {
            setTimeout(() => input.focus(), 33);
        }
    }
}

// 챗봇 닫기
function closeChatbot() {
    const modal = document.getElementById('chatbotModal');
    const mainArea = document.querySelector('.main-area');
    if (modal) modal.classList.remove('active');
    if (mainArea) mainArea.classList.remove('chatbot-open');
}

// 이벤트 리스너 등록
function initChatbotEvents() {
    // X 버튼 클릭
    const closeBtn = document.getElementById('chatbotCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatbot);
    }
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('chatbotModal');
            if (modal && modal.classList.contains('active')) {
                closeChatbot();
            }
        }
    });
}

// 페이지 로드 시 이벤트 리스너 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotEvents);
} else {
    initChatbotEvents();
}

/* ============================================
   메시지 전송 이벤트
   ============================================ */

// 메시지 전송 처리
function handleChatSend() {
    const groqEnabled = document.getElementById('toggleGroq').checked;
    const gptEnabled = document.getElementById('toggleGPT').checked;
    const messageInput = document.getElementById('chatbotInput');
    const message = messageInput.value.trim();
    
    // 검증 1: 둘 다 OFF인 경우
    if (!groqEnabled && !gptEnabled) {
        showToast('⚠️ 명령 받을 대상을 선택해주세요', 2000);
        return;
    }
    
    // 검증 2: 메시지 비어있는지 확인
    if (!message) {
        showToast('⚠️ 메시지를 입력해주세요', 2000);
        messageInput.focus();
        return;
    }
    
    // 검증 3: 보고서 결과 확인 (입력란이 활성화되어 있다는 것은 결과가 있다는 의미)
    if (!hasReportResults()) {
        showToast('⚠️ 보고서를 먼저 생성해주세요', 2500);
        return;
    }
    
    // 사용자 메시지 표시
    addChatMessage('user', message);
    
    // 입력창 초기화
    clearChatInput();
    
    // 로딩 상태 설정
    setLoadingState(true);
    
    // 전송 로직
    if (groqEnabled && gptEnabled) {
        // 둘 다 전송
        sendToBoth(message);
    } else if (groqEnabled) {
        // Groq만 전송
        sendToGroq(message);
    } else if (gptEnabled) {
        // GPT만 전송
        sendToGPT(message);
    }
}

// 전송 버튼 이벤트 등록
function initSendButtonEvent() {
    const sendBtn = document.getElementById('btnSendChat');
    if (sendBtn) {
        sendBtn.addEventListener('click', handleChatSend);
    }
}

// 페이지 로드 시 전송 버튼 이벤트 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSendButtonEvent);
} else {
    initSendButtonEvent();
}

/* ============================================
   Phase 2.3 - 메시지 추가 함수
   ============================================ */

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 채팅 메시지 추가
function addChatMessage(role, content, model = '') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message--${role}`;
    
    if (role === 'ai') {
        // AI 메시지: badge + content
        const badge = document.createElement('div');
        badge.className = 'message-badge';
        badge.textContent = model || 'AI';
        messageDiv.appendChild(badge);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content; // AI 응답은 HTML 포함 가능
        messageDiv.appendChild(contentDiv);
        
    } else if (role === 'user') {
        // 사용자 메시지: content + time
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content; // 사용자 입력은 텍스트만
        messageDiv.appendChild(contentDiv);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDiv.textContent = `${hours}:${minutes}`;
        messageDiv.appendChild(timeDiv);
        
    } else if (role === 'system') {
        // 시스템 메시지: content만
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
    }
    
    // 메시지 추가
    messagesContainer.appendChild(messageDiv);
    
    // 자동 스크롤
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* ============================================
   Phase 2.4 - Enter 키 처리
   ============================================ */

// Enter 키 처리 초기화
function initEnterKeyHandler() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Enter만 누르면 전송
            e.preventDefault();
            handleChatSend();
        }
        // Shift+Enter는 기본 동작 (줄바꿈) 유지
    });
}

// 페이지 로드 시 Enter 키 핸들러 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnterKeyHandler);
} else {
    initEnterKeyHandler();
}

/* ============================================
   Phase 4.4 - 입력창 초기화
   ============================================ */

function clearChatInput() {
    const input = document.getElementById('chatbotInput');
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
}

/* ============================================
   Phase 4.1 - 로딩 상태 관리 - 애니메이션 중 입력 차단
   ============================================ */

let isAnimating = false; // 전역 변수로 애니메이션 상태 관리

function setLoadingState(isLoading) {
    const sendBtn = document.getElementById('btnSendChat');
    const chatInput = document.getElementById('chatbotInput');
    const groqToggle = document.getElementById('toggleGroq');
    const gptToggle = document.getElementById('toggleGPT');
    
    if (isLoading) {
        // 로딩 시작
        isAnimating = true;
        
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('loading');
            // 스피너 추가
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
        // 로딩 종료
        isAnimating = false;
        
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
            // 스피너 제거
            const spinner = sendBtn.querySelector('.spinner');
            if (spinner) spinner.remove();
        }
        
        if (chatInput) {
            // 로딩 종료 후 상태는 updateChatbotInputState에서 관리
            updateChatbotInputState();
        }
        
        if (groqToggle) groqToggle.disabled = false;
        if (gptToggle) gptToggle.disabled = false;
    }
}

/* ============================================
   Phase 3 - AI 연동 함수
   ============================================ */

// Phase 3.1 - 프롬프트 생성
function buildChatPrompt(userMessage, currentReport) {
    return `당신은 상담보고서를 수정하는 AI 어시스턴트입니다.

[현재 보고서]
${currentReport}

[수정 지침]
1. 사용자의 요청을 정확히 반영하세요
2. 수정하지 않는 부분은 원본 그대로 유지하세요
3. 전문적이고 객관적인 어조를 유지하세요
4. 수정된 전체 보고서를 반환하세요
5. 설명이나 주석 없이 보고서 내용만 반환하세요
6. 보고서 형식(섹션 구조)을 유지하세요
7. **마크다운 형식으로 작성하세요**:
   - 섹션 제목: ## 제목
   - 하위 제목: ### 하위제목
   - 강조: **중요한 내용**
   - 목록: - 항목 또는 1. 순서

[사용자 요청]
${userMessage}

[수정된 보고서]`;
}

// Phase 3.2 - 변경 하이라이트 (간이 알고리즘)
function highlightModifiedText(originalText, modifiedText) {
    const originalWords = originalText.split(/\s+/);
    const modifiedWords = modifiedText.split(/\s+/);
    let result = '';
    const modifiedIndices = new Set();
    
    // 변경된 단어 인덱스 찾기
    for (let i = 0; i < modifiedWords.length; i++) {
        if (originalWords[i] !== modifiedWords[i]) {
            modifiedIndices.add(i);
        }
    }
    
    // HTML 생성
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

// Phase 3.3 - 타이핑 애니메이션 (typing-animation.js에서 공용 함수 사용)
async function typeModifiedText(element, htmlContent) {
    if (typeof typeHtmlWithAnimation === 'function') {
        await typeHtmlWithAnimation(element, htmlContent);
    } else {
        // fallback: 즉시 표시
        element.innerHTML = htmlContent;
    }
}

// Phase 3.7 - 결과 반영 (타이핑) - 비교 탭에도 애니메이션 적용, 마크다운 렌더링 포함
async function updateReportWithTyping(model, highlightedHtml, plainText) {
    const outputId = (model === 'groq') ? 'groqOutput' : 'gptOutput';
    const out = document.getElementById(outputId);
    
    if (!out) return;
    
    // 원본 텍스트 저장 (복사 기능을 위해)
    out.setAttribute('data-raw-text', plainText);
    
    // 글자수 먼저 업데이트
    const count = plainText.length;
    const countElem = document.getElementById(`${model}Count`);
    if (countElem) countElem.textContent = `${count}자`;
    
    const cmpCountElem = document.getElementById(`${model}CountCompare`);
    if (cmpCountElem) cmpCountElem.textContent = `${count}자`;
    
    // 복사 버튼 활성화
    const copyBtn = document.getElementById(`${model}CopyBtn`);
    if (copyBtn) copyBtn.disabled = false;
    
    const copyBtn2 = document.getElementById(`${model}CopyBtnCompare`);
    if (copyBtn2) copyBtn2.disabled = false;
    
    // 마크다운 렌더링 적용
    let finalHtml = highlightedHtml;
    if (typeof renderMarkdown === 'function') {
        finalHtml = renderMarkdown(plainText);
        out.classList.add('markdown-rendered');
    }
    
    // 현재 탭 확인
    const activeTab = document.querySelector('.output-tab.active');
    const activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'compare';
    
    if (activeTabName === 'compare') {
        // 비교 모드: 비교 탭에 애니메이션 적용
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
        // 개별 탭에는 즉시 반영 (애니메이션 없음)
        out.style.display = 'block';
        out.innerHTML = finalHtml;
    } else {
        // 개별 탭 모드: 해당 탭에 애니메이션 적용
        out.style.display = 'block';
        await typeModifiedText(out, finalHtml);
        // 비교 탭에는 즉시 반영 (애니메이션 없음)
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

// API 키 가져오기 (app.js의 함수 활용)
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

// Phase 3.4 - Groq 전송
async function sendToGroq(message) {
    addChatMessage('system', '💭 Groq가 보고서를 수정하고 있습니다...', 'Groq');
    
    try {
        const apiKey = getGroqApiKey();
        if (!apiKey) {
            throw new Error('Groq API 키가 설정되지 않았습니다');
        }
        
        // 현재 보고서 가져오기
        const groqOutput = document.getElementById('groqOutput');
        if (!groqOutput || !groqOutput.textContent.trim()) {
            throw new Error('Groq 보고서가 없습니다. 먼저 보고서를 생성해주세요.');
        }
        const currentReport = groqOutput.textContent;
        
        // 프롬프트 생성
        const prompt = buildChatPrompt(message, currentReport);
        
        // API 호출
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
            throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        // 변경 하이라이트 적용
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        
        // 타이핑 애니메이션으로 결과 반영
        await updateReportWithTyping('groq', highlightedHtml, updatedReport);
        
        // 성공 메시지
        addChatMessage('ai', '✅ Groq가 보고서를 수정했습니다.', 'Groq');
        
    } catch (error) {
        console.error('Groq Error:', error);
        addChatMessage('system', `❌ Groq 오류: ${error.message}`, 'Groq');
    } finally {
        setLoadingState(false);
    }
}

// Phase 3.5 - GPT 전송
async function sendToGPT(message) {
    addChatMessage('system', '💭 GPT가 보고서를 수정하고 있습니다...', 'GPT');
    
    try {
        const apiKey = getGPTApiKey();
        if (!apiKey) {
            throw new Error('GPT API 키가 설정되지 않았습니다');
        }
        
        // 현재 보고서 가져오기
        const gptOutput = document.getElementById('gptOutput');
        if (!gptOutput || !gptOutput.textContent.trim()) {
            throw new Error('GPT 보고서가 없습니다. 먼저 보고서를 생성해주세요.');
        }
        const currentReport = gptOutput.textContent;
        
        // 프롬프트 생성
        const prompt = buildChatPrompt(message, currentReport);
        
        // API 호출
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
            throw new Error(`API 오류 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const updatedReport = data.choices[0].message.content;
        
        // 변경 하이라이트 적용
        const highlightedHtml = highlightModifiedText(currentReport, updatedReport);
        
        // 타이핑 애니메이션으로 결과 반영
        await updateReportWithTyping('gpt', highlightedHtml, updatedReport);
        
        // 성공 메시지
        addChatMessage('ai', '✅ GPT가 보고서를 수정했습니다.', 'GPT');
        
    } catch (error) {
        console.error('GPT Error:', error);
        addChatMessage('system', `❌ GPT 오류: ${error.message}`, 'GPT');
    } finally {
        setLoadingState(false);
    }
}

// Phase 3.6 - 동시 전송
async function sendToBoth(message) {
    addChatMessage('system', '💭 Groq와 GPT가 동시에 수정 중...', 'Both');
    
    await Promise.all([
        sendToGroq(message),
        sendToGPT(message)
    ]);
    
    addChatMessage('system', '✅ 두 모델 모두 수정 완료!', 'Both');
}
