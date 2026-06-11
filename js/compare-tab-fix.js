/**
 * 비교 탭 - 단순화된 동기화 로직
 * - Groq/GPT 생성 함수가 이미 비교 탭에도 직접 렌더링하므로
 * - 탭 전환 시 자연스러운 표시만 보장
 * - 로딩 상태 실시간 동기화 추가
 * 
 * @author 김도현
 * @since 2025-01-17 (개선)
 */

(function() {
    'use strict';
    
    console.log('[Compare-Tab] 초기화 시작 - 단순화된 버전 v2');
    
    /**
     * 비교 탭으로 전환 시 올바른 표시 보장
     * - 이미 렌더링된 결과를 표시만 함
     * - 추가 API 호출이나 렌더링 없음
     */
    function ensureCompareTabVisibility() {
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        
        // 이미 내용이 있으면 표시 상태 보장
        if (groqOutputCompare && groqOutputCompare.getAttribute('data-raw-text')) {
            groqOutputCompare.classList.remove('is-hidden');
            groqOutputCompare.style.display = '';
        }
        
        if (gptOutputCompare && gptOutputCompare.getAttribute('data-raw-text')) {
            gptOutputCompare.classList.remove('is-hidden');
            gptOutputCompare.style.display = '';
        }
    }
    
    /**
     * 로딩 상태 실시간 동기화
     * - 단독 탭의 로딩 상태를 비교 탭에도 반영
     */
    function syncLoadingStates() {
        // Groq 로딩 상태 감지
        const groqLoading = document.getElementById('groqLoading');
        const groqLoadingCompare = document.getElementById('groqLoadingCompare');
        
        if (groqLoading && groqLoadingCompare) {
            const observer = new MutationObserver(() => {
                if (groqLoading.classList.contains('active')) {
                    groqLoadingCompare.classList.remove('is-hidden');
                } else {
                    groqLoadingCompare.classList.add('is-hidden');
                }
            });
            
            observer.observe(groqLoading, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        // GPT 로딩 상태 감지
        const gptLoading = document.getElementById('gptLoading');
        const gptLoadingCompare = document.getElementById('gptLoadingCompare');
        
        if (gptLoading && gptLoadingCompare) {
            const observer = new MutationObserver(() => {
                if (gptLoading.classList.contains('active')) {
                    gptLoadingCompare.classList.remove('is-hidden');
                } else {
                    gptLoadingCompare.classList.add('is-hidden');
                }
            });
            
            observer.observe(gptLoading, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        console.log('[Compare-Tab] 로딩 상태 동기화 설정 완료');
    }
    
    /**
     * 탭 전환 이벤트 리스너 등록
     */
    function initTabSwitchListener() {
        // 비교 탭 버튼 찾기
        const compareTabButton = document.querySelector('[data-tab="compare"]');
        
        if (compareTabButton) {
            compareTabButton.addEventListener('click', function() {
                // 탭 전환 직후 가시성 보장 (비동기로 실행)
                requestAnimationFrame(ensureCompareTabVisibility);
            });
            
            console.log('[Compare-Tab] 탭 전환 리스너 등록 완료');
        } else {
            console.warn('[Compare-Tab] 비교 탭 버튼을 찾을 수 없습니다');
        }
    }
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTabSwitchListener();
            syncLoadingStates();
        });
    } else {
        initTabSwitchListener();
        syncLoadingStates();
    }
    
    console.log('[Compare-Tab] 초기화 완료 - 단순 동기화 + 로딩 상태 추적');
})();
