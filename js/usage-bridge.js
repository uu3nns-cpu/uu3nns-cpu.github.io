/**
 * Usage Bridge - UI와 이벤트 연결
 * UsageCounter(SSOT)와 실제 DOM/이벤트를 연결하는 브리지
 */

(function(window) {
    'use strict';
    
    console.log('[UsageBridge] 로딩 시작...');
    
    // UsageCounter가 로드되었는지 확인
    if (typeof window.UsageCounter === 'undefined') {
        console.error('[UsageBridge] UsageCounter를 찾을 수 없습니다! usage-core.js를 먼저 로드하세요.');
        return;
    }
    
    /**
     * UI 업데이트 - 모든 UI 요소를 한 번에 업데이트
     */
    function paint(count, remaining) {
        console.log('[UsageBridge] UI 업데이트 시작:', count, '/', (count + remaining));
        
        // DOM이 준비되지 않았으면 대기
        if (document.readyState === 'loading') {
            console.log('[UsageBridge] DOM 로딩 대기 중...');
            document.addEventListener('DOMContentLoaded', function() {
                paint(count, remaining);
            });
            return;
        }
        
        // 1. 인라인 카운터 (#usageCountInline)
        const inlineElem = document.getElementById('usageCountInline');
        if (inlineElem) {
            console.log('[UsageBridge] usageCountInline 업데이트:', count);
            inlineElem.textContent = String(count);
            
            // 색상 변경
            const percentage = (count / (count + remaining)) * 100;
            if (percentage >= 90) {
                inlineElem.style.color = '#ff4444';
            } else if (percentage >= 70) {
                inlineElem.style.color = '#ffaa00';
            } else {
                inlineElem.style.color = '#4a90e2';
            }
        } else {
            console.warn('[UsageBridge] usageCountInline 요소를 찾을 수 없습니다!');
        }
        
        // 2. 다른 카운터 요소들 (.usage-count)
        const allCountElems = document.querySelectorAll('.usage-count');
        console.log('[UsageBridge] .usage-count 요소 개수:', allCountElems.length);
        allCountElems.forEach(elem => {
            if (elem.id !== 'usageCountInline') { // 중복 업데이트 방지
                elem.textContent = String(count);
            }
        });
        
        // 3. 진행바가 있다면 업데이트
        const progressBar = document.getElementById('usageProgressBar');
        if (progressBar) {
            const percentage = (count / (count + remaining)) * 100;
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', count);
        }
        
        // 4. 보고서 생성 버튼 비활성화 (한도 초과 시)
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn && remaining <= 0) {
            generateBtn.disabled = true;
            generateBtn.title = '오늘의 보고서 생성 한도(30회)를 모두 사용했습니다.';
        }
        
        console.log('[UsageBridge] UI 업데이트 완료');
    }
    
    /**
     * 초기화
     */
    function init() {
        console.log('[UsageBridge] 초기화 시작...');
        
        // UsageCounter가 아직 초기화되지 않았다면 초기화
        const currentCount = window.UsageCounter.getCount();
        console.log('[UsageBridge] 현재 UsageCounter 상태:', currentCount);
        
        // 변경 감지 리스너 등록
        console.log('[UsageBridge] 리스너 등록 중...');
        window.UsageCounter.onChange(paint);
        
        // 현재 상태를 즉시 UI에 반영
        const remaining = window.UsageCounter.getRemaining();
        console.log('[UsageBridge] UI 업데이트:', currentCount, '/', (currentCount + remaining));
        paint(currentCount, remaining);
        
        // 이벤트 후킹
        hookGenerateButton();
        hookKeyboardShortcut();
        
        console.log('[UsageBridge] 초기화 완료');
    }
    
    /**
     * 보고서 작성 버튼에 카운터 증가 로직 추가
     * 중요: 입력 검증이 모두 통과된 후에만 카운트를 증가시킴
     */
    function hookGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) {
            console.warn('[UsageBridge] generateBtn을 찾을 수 없습니다.');
            return;
        }
        
        // 기존 onclick 저장
        const originalOnclick = generateBtn.onclick;
        
        // 새로운 onclick 설정
        generateBtn.onclick = function(event) {
            console.log('[UsageBridge] 보고서 작성 버튼 클릭');
            
            // 1단계: 입력 확인
            const inputText = document.getElementById('inputText');
            if (!inputText || !inputText.value.trim()) {
                if (typeof showError === 'function') {
                    showError('상담 메모를 먼저 입력해주세요.');
                }
                return;
            }
            
            const input = inputText.value.trim();
            const length = input.length;
            
            // 2단계: 최소 길이 검증 (50자)
            const MIN_LENGTH = 50;
            if (length < MIN_LENGTH) {
                if (typeof showError === 'function') {
                    showError(`최소 ${MIN_LENGTH}자 이상 입력해주세요. (현재: ${length}자)`);
                }
                return;
            }
            
            // 3단계: 짧은 메모 경고 (50~150자)
            const SHORT_WARNING_LENGTH = 150;
            if (length >= MIN_LENGTH && length < SHORT_WARNING_LENGTH) {
                const userConfirmed = confirm(
                    `⚠️ 메모가 짧습니다 (${length}자)\n\n` +
                    `메모가 지나치게 짧은 경우 보고서 결과가 미흡할 수 있습니다.\n\n` +
                    `그래도 작성하시겠습니까?`
                );
                if (!userConfirmed) {
                    console.log('[UsageBridge] 사용자가 짧은 메모 경고에서 취소함 - 카운트 증가하지 않음');
                    return;
                }
            }
            
            // 4단계: 긴 메모 경고 (4000자 이상)
            const LONG_WARNING_LENGTH = 4000;
            if (length >= LONG_WARNING_LENGTH) {
                const userConfirmed = confirm(
                    `⚠️ 메모가 매우 깁니다 (${length}자)\n\n` +
                    `메모가 지나치게 긴 경우 보고서 결과가 내용을 잘 반영하지 못할 수도 있습니다.\n\n` +
                    `그래도 작성하시겠습니까?`
                );
                if (!userConfirmed) {
                    console.log('[UsageBridge] 사용자가 긴 메모 경고에서 취소함 - 카운트 증가하지 않음');
                    return;
                }
            }
            
            // 5단계: 사용 가능 여부 확인 (한도 체크)
            if (!window.UsageCounter.canGenerate()) {
                const remaining = window.UsageCounter.getRemaining();
                if (typeof showError === 'function') {
                    showError(`⚠️ 오늘의 보고서 생성 한도(30회)를 모두 사용했습니다.\n내일 자정에 초기화됩니다.\n(오늘 남은 횟수: ${remaining}회)`);
                } else {
                    alert(`오늘의 보고서 생성 한도를 모두 사용했습니다.\n남은 횟수: ${remaining}회`);
                }
                return;
            }
            
            // ✅ 모든 검증 통과! 이제 카운터 증가
            const newCount = window.UsageCounter.increment('button_click');
            console.log('[UsageBridge] 모든 검증 통과 - 사용량 증가:', newCount);
            
            // 원래 핸들러 실행
            if (originalOnclick) {
                originalOnclick.call(this, event);
            } else if (typeof generateJournals === 'function') {
                generateJournals(event);
            }
        };
        
        console.log('[UsageBridge] generateBtn 후킹 완료');
    }
    
    /**
     * Ctrl+Enter 단축키 후킹
     */
    function hookKeyboardShortcut() {
        const inputText = document.getElementById('inputText');
        if (!inputText) {
            console.warn('[UsageBridge] inputText를 찾을 수 없습니다.');
            return;
        }
        
        inputText.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.key === 'Enter') {
                console.log('[UsageBridge] Ctrl+Enter 감지');
                event.preventDefault();
                
                // generateBtn 클릭 이벤트 트리거 (자동으로 카운터 증가됨)
                const generateBtn = document.getElementById('generateBtn');
                if (generateBtn && !generateBtn.disabled) {
                    generateBtn.click();
                }
            }
        });
        
        console.log('[UsageBridge] Ctrl+Enter 후킹 완료');
    }
    
    // DOM 준비 완료 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[UsageBridge] DOMContentLoaded 이벤트 발생');
            // 약간 대기 후 초기화 (DOM이 완전히 렌더링될 때까지)
            setTimeout(init, 200);
        });
    } else {
        console.log('[UsageBridge] DOM 이미 로드됨');
        // 이미 로드된 경우도 약간 대기
        setTimeout(init, 200);
    }
    
    console.log('[UsageBridge] 로딩 완료');
    
})(window);
