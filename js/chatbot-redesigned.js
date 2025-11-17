/**
 * 챗봇 모던 리디자인 (완전히 새로 작성)
 * 기존 코드와 독립적으로 작동하며 현재 디자인과 조화로운 챗봇 시스템
 */

(function() {
    'use strict';

    // ============================================
    // 상태 관리
    // ============================================
    const ChatbotState = {
        isOpen: false,
        messages: [],
        isProcessing: false,
        groqEnabled: true,
        gptEnabled: true
    };

    // ============================================
    // DOM 초기화
    // ============================================
    function initChatbot() {
        // 기존 챗봇 요소 제거
        const oldModal = document.getElementById('chatbotModal');
        const oldOverlay = document.getElementById('chatbotOverlay');
        const oldButton = document.getElementById('chatbotToggleBtn');
        
        if (oldModal) oldModal.remove();
        if (oldOverlay) oldOverlay.remove();
        if (oldButton) oldButton.remove();

        // 새 챗봇 UI 생성
        createChatbotUI();
        attachEventListeners();
        
        console.log('✅ 챗봇 리디자인 초기화 완료');
    }

    // ============================================
    // UI 생성
    // ============================================
    function createChatbotUI() {
        const chatbotHTML = `
            <!-- 챗봇 오버레이 -->
            <div class="chatbot-overlay" id="chatbotOverlay"></div>

            <!-- 챗봇 모달 -->
            <div class="chatbot-modal" id="chatbotModal">
                <div class="chatbot-header">
                    <h3>AI 챗봇</h3>
                    <button class="chatbot-close-btn" id="chatbotCloseBtn" title="닫기">×</button>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chat-welcome-message">
                        <p>안녕하세요, 상담 보고서 작성을 돕는 AI 챗봇입니다.</p>
                        <p>필요한 템플릿, 말투, 구조 등을 자연어로 요청해 주세요.</p>
                        <p class="chat-welcome-example">예시: "개입 기법 섹션을 좀 더 구체적으로 설명해줘"</p>
                    </div>
                </div>

                <div class="chatbot-input-area">
                    <textarea
                        id="chatbotInput"
                        placeholder="요청 내용을 입력하세요..."
                        rows="3"
                        maxlength="500"></textarea>
                    <div class="chatbot-controls">
                        <div class="chatbot-toggles">
                            <label class="chatbot-toggle-switch" title="Groq 모델 사용">
                                <input type="checkbox" id="toggleGroq" checked>
                                <span class="chatbot-toggle-slider"></span>
                                <span class="chatbot-toggle-label">Groq</span>
                            </label>
                            <label class="chatbot-toggle-switch" title="GPT 모델 사용">
                                <input type="checkbox" id="toggleGPT" checked>
                                <span class="chatbot-toggle-slider"></span>
                                <span class="chatbot-toggle-label">GPT</span>
                            </label>
                        </div>
                        <button class="chatbot-send-btn" id="chatbotSendBtn">
                            <span class="send-text">전송</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    // ============================================
    // 이벤트 리스너
    // ============================================
    function attachEventListeners() {
        const closeBtn = document.getElementById('chatbotCloseBtn');
        const overlay = document.getElementById('chatbotOverlay');
        const sendBtn = document.getElementById('chatbotSendBtn');
        const input = document.getElementById('chatbotInput');
        const toggleGroq = document.getElementById('toggleGroq');
        const toggleGPT = document.getElementById('toggleGPT');

        // 열기/닫기
        closeBtn?.addEventListener('click', closeChatbot);
        overlay?.addEventListener('click', closeChatbot);

        // 메시지 전송
        sendBtn?.addEventListener('click', sendMessage);
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // 토글 변경
        toggleGroq?.addEventListener('change', (e) => {
            ChatbotState.groqEnabled = e.target.checked;
        });

        toggleGPT?.addEventListener('change', (e) => {
            ChatbotState.gptEnabled = e.target.checked;
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ChatbotState.isOpen) {
                closeChatbot();
            }
        });
    }

    // ============================================
    // 챗봇 열기/닫기
    // ============================================
    function toggleChatbot() {
        if (ChatbotState.isOpen) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }

    function openChatbot() {
        const modal = document.getElementById('chatbotModal');
        const overlay = document.getElementById('chatbotOverlay');

        if (!modal || !overlay) return;

        ChatbotState.isOpen = true;
        
        modal.classList.add('active');
        overlay.classList.add('active');

        // 입력창에 포커스
        setTimeout(() => {
            document.getElementById('chatbotInput')?.focus();
        }, 400);
    }

    function closeChatbot() {
        const modal = document.getElementById('chatbotModal');
        const overlay = document.getElementById('chatbotOverlay');

        if (!modal || !overlay) return;

        ChatbotState.isOpen = false;
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }

    // ============================================
    // 메시지 관련
    // ============================================
    function sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input?.value.trim();

        if (!message || ChatbotState.isProcessing) return;

        // 최소 한 개의 모델이 선택되어야 함
        if (!ChatbotState.groqEnabled && !ChatbotState.gptEnabled) {
            showToast('최소 한 개의 AI 모델을 선택해주세요.', 'warning');
            return;
        }

        // 사용자 메시지 추가
        addMessage('user', message);
        input.value = '';

        // AI 응답 처리
        processAIResponse(message);
    }

    function addMessage(role, content) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        // 환영 메시지 제거
        const welcomeMsg = messagesContainer.querySelector('.chat-welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        
        const avatarEmoji = role === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="chat-avatar">${avatarEmoji}</div>
            <div class="chat-bubble">${escapeHtml(content)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        // 상태 저장
        ChatbotState.messages.push({ role, content, timestamp: Date.now() });
    }

    function addTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="chat-avatar">🤖</div>
            <div class="chat-bubble">
                <div class="chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    // ============================================
    // AI 응답 처리
    // ============================================
    async function processAIResponse(userMessage) {
        ChatbotState.isProcessing = true;
        updateSendButtonState();
        addTypingIndicator();

        try {
            // 보고서 내용 가져오기
            const reportContent = getReportContent();
            
            // 프롬프트 구성
            const systemPrompt = buildSystemPrompt();
            const userPrompt = buildUserPrompt(userMessage, reportContent);

            let response = '';

            // Groq 호출
            if (ChatbotState.groqEnabled) {
                try {
                    const groqResponse = await callGroqAPI(systemPrompt, userPrompt);
                    response += groqResponse;
                } catch (error) {
                    console.error('Groq API 오류:', error);
                    response += '[Groq 모델 응답 실패] ';
                }
            }

            // GPT 호출
            if (ChatbotState.gptEnabled) {
                try {
                    const gptResponse = await callGPTAPI(systemPrompt, userPrompt);
                    if (ChatbotState.groqEnabled) {
                        response += '\n\n---\n\n';
                    }
                    response += gptResponse;
                } catch (error) {
                    console.error('GPT API 오류:', error);
                    response += '[GPT 모델 응답 실패]';
                }
            }

            removeTypingIndicator();

            if (response.trim()) {
                addMessage('assistant', response.trim());
            } else {
                addMessage('assistant', '죄송합니다. 응답을 생성하는 데 실패했습니다. 다시 시도해주세요.');
            }

        } catch (error) {
            console.error('AI 응답 처리 오류:', error);
            removeTypingIndicator();
            addMessage('assistant', '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            ChatbotState.isProcessing = false;
            updateSendButtonState();
        }
    }

    // ============================================
    // API 호출
    // ============================================
    async function callGroqAPI(systemPrompt, userPrompt) {
        const apiKey = localStorage.getItem('groqApiKey');
        if (!apiKey) {
            throw new Error('Groq API 키가 설정되지 않았습니다.');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    async function callGPTAPI(systemPrompt, userPrompt) {
        const apiKey = localStorage.getItem('gptApiKey');
        if (!apiKey) {
            throw new Error('GPT API 키가 설정되지 않았습니다.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`GPT API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    // ============================================
    // 프롬프트 구성
    // ============================================
    function buildSystemPrompt() {
        return `당신은 상담 보고서 작성을 돕는 AI 어시스턴트입니다.
사용자의 요청에 따라 보고서의 특정 부분을 수정하거나 개선하는 역할을 합니다.

응답 시 다음을 지켜주세요:
1. 간결하고 명확하게 답변하세요
2. 전문적이면서도 친근한 톤을 유지하세요
3. 필요시 예시를 들어 설명하세요
4. 마크다운 형식으로 답변하세요`;
    }

    function buildUserPrompt(userMessage, reportContent) {
        let prompt = `사용자 요청: ${userMessage}\n\n`;
        
        if (reportContent) {
            prompt += `현재 보고서 내용:\n${reportContent}\n\n`;
        }
        
        prompt += '위 요청에 대해 구체적이고 실용적인 답변을 제공해주세요.';
        
        return prompt;
    }

    function getReportContent() {
        // Groq 출력
        const groqOutput = document.getElementById('groqOutput')?.textContent || '';
        // GPT 출력
        const gptOutput = document.getElementById('gptOutput')?.textContent || '';
        // 입력 텍스트
        const inputText = document.getElementById('inputText')?.value || '';

        let content = '';
        if (inputText) content += `입력 메모:\n${inputText}\n\n`;
        if (groqOutput) content += `Groq 결과:\n${groqOutput}\n\n`;
        if (gptOutput) content += `GPT 결과:\n${gptOutput}`;

        return content.trim();
    }

    // ============================================
    // UI 업데이트
    // ============================================
    function updateSendButtonState() {
        const sendBtn = document.getElementById('chatbotSendBtn');
        if (!sendBtn) return;

        if (ChatbotState.isProcessing) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span class="send-text">처리중...</span>';
        } else {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<span class="send-text">전송</span>';
        }
    }

    // ============================================
    // 유틸리티
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, type = 'info') {
        // 기존 토스트 시스템 활용
        if (window.showToast) {
            window.showToast(message);
        } else {
            alert(message);
        }
    }

    // ============================================
    // 전역 함수 노출 (기존 코드 호환성)
    // ============================================
    window.toggleChatbot = toggleChatbot;
    window.openChatbot = openChatbot;
    window.closeChatbot = closeChatbot;

    // ============================================
    // 초기화
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

})();
