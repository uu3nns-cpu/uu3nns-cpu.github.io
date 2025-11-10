/**
 * 비교 탭 마크다운 렌더링 문제 수정
 * - GPT 완성 후 비교 탭이 자동으로 새로고침되지 않는 문제 해결
 * 
 * @author 김도현
 * @since 2025-01-12
 */

// 원래 generateWithGPT 함수를 래핑
(function() {
    // 페이지 로드 완료 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // GPT 생성 완료를 감지하기 위한 옵저버
        const gptOutput = document.getElementById('gptOutput');
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        
        if (!gptOutput || !gptOutputCompare) {
            console.warn('[Compare-Tab-Fix] 필요한 DOM 요소를 찾을 수 없습니다');
            return;
        }
        
        // GPT 출력이 변경되면 비교 탭도 강제 업데이트
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // GPT 출력이 표시되면
                    if (gptOutput.style.display === 'block') {
                        // 약간의 딜레이 후 비교 탭 새로고침
                        setTimeout(() => {
                            if (typeof refreshCompareTab === 'function') {
                                refreshCompareTab();
                                console.log('[Compare-Tab-Fix] 비교 탭 새로고침 완료');
                            }
                        }, 100);
                    }
                }
                
                // innerHTML이 변경되면 (내용이 업데이트되면)
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    setTimeout(() => {
                        if (typeof refreshCompareTab === 'function') {
                            refreshCompareTab();
                            console.log('[Compare-Tab-Fix] 비교 탭 내용 업데이트 후 새로고침');
                        }
                    }, 100);
                }
            });
        });
        
        // GPT 출력 관찰 시작
        observer.observe(gptOutput, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('[Compare-Tab-Fix] GPT 출력 옵저버 시작');
    }
})();
