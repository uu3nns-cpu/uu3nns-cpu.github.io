/**
 * Input Validation & Button Enhancement
 * 입력 검증 및 버튼 강화 기능
 * 
 * 주의: 입력 길이 경고는 usage-bridge.js에서 처리하므로
 *       여기서는 버튼 활성화/비활성화 로직만 처리함
 */

(function() {
    'use strict';
    
    console.log('[InputValidation] 로딩 시작...');
    
    // 상수
    const MIN_LENGTH = 50;
    
    /**
     * 입력 길이 검증 및 버튼 상태 업데이트
     * 50자 미만이면 버튼 비활성화
     */
    function validateInputLength() {
        const textarea = document.getElementById('inputText');
        const generateBtn = document.getElementById('generateBtn');
        
        if (!textarea || !generateBtn) return;
        
        const length = textarea.value.trim().length;
        
        // 50자 미만: 버튼 비활성화
        if (length < MIN_LENGTH) {
            generateBtn.disabled = true;
            generateBtn.title = `최소 ${MIN_LENGTH}자 이상 입력해주세요 (현재: ${length}자)`;
            return false;
        }
        
        // 버튼 활성화
        generateBtn.disabled = false;
        generateBtn.title = '보고서 작성 (Ctrl+Enter)';
        return true;
    }
    
    /**
     * 버튼에 Glow 효과 추가
     */
    function addButtonGlow() {
        // 챗봇과 나의설정 버튼에 GLOW 추가
        const chatbotBtn = document.getElementById('chatbotFloatingBtn');
        const settingsBtn = document.getElementById('sidebarFloatingToggle');
        
        if (chatbotBtn) {
            chatbotBtn.classList.add('btn-glow');
            console.log('[InputValidation] 챗봇 버튼에 glow 추가');
        }
        
        if (settingsBtn) {
            settingsBtn.classList.add('btn-glow');
            console.log('[InputValidation] 설정 버튼에 glow 추가');
        }
    }
    
    /**
     * 초기화
     */
    function init() {
        console.log('[InputValidation] 초기화 시작...');
        
        // textarea 이벤트 리스너 등록
        const textarea = document.getElementById('inputText');
        if (textarea) {
            textarea.addEventListener('input', validateInputLength);
            // 초기 검증
            validateInputLength();
        }
        
        // 버튼 glow 추가
        addButtonGlow();
        
        console.log('[InputValidation] 초기화 완료');
    }
    
    // DOM 준비 완료 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 다른 스크립트들이 로드될 때까지 약간 대기
            setTimeout(init, 500);
        });
    } else {
        setTimeout(init, 500);
    }
    
    console.log('[InputValidation] 로딩 완료');
    
})();
