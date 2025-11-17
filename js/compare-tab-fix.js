/**
 * 비교 탭 - 마크다운 렌더링 보호 로직 (개선 버전)
 * - 탭 전환 시 마크다운 렌더링 강제 유지
 * - 로딩 상태 실시간 동기화
 * 
 * @author 김해현
 * @since 2025-11-18 (마크다운 보호 강화)
 */

(function() {
    'use strict';
    
    console.log('[Compare-Tab] 초기화 시작 - 마크다운 강제 유지 버전');
    
    /**
     * 비교 탭의 마크다운 렌더링 강제 적용
     */
    function forceMarkdownRenderingInCompareTab() {
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        
        // Groq 출력 확인 및 렌더링
        if (groqOutputCompare) {
            const rawText = groqOutputCompare.getAttribute('data-raw-text');
            if (rawText && rawText.trim()) {
                console.log('[Compare-Tab] Groq 마크다운 렌더링 강제 적용');
                
                // 마크다운 렌더링 적용
                if (typeof renderMarkdown === 'function') {
                    const renderedHtml = renderMarkdown(rawText);
                    if (typeof setSafeHtml === 'function') {
                        setSafeHtml(groqOutputCompare, renderedHtml);
                    } else {
                        groqOutputCompare.innerHTML = renderedHtml;
                    }
                    groqOutputCompare.classList.add('markdown-rendered');
                }
                
                // 표시 상태 보장
                groqOutputCompare.classList.remove('is-hidden');
                groqOutputCompare.style.display = '';
            }
        }
        
        // GPT 출력 확인 및 렌더링
        if (gptOutputCompare) {
            const rawText = gptOutputCompare.getAttribute('data-raw-text');
            if (rawText && rawText.trim()) {
                console.log('[Compare-Tab] GPT 마크다운 렌더링 강제 적용');
                
                // 마크다운 렌더링 적용
                if (typeof renderMarkdown === 'function') {
                    const renderedHtml = renderMarkdown(rawText);
                    if (typeof setSafeHtml === 'function') {
                        setSafeHtml(gptOutputCompare, renderedHtml);
                    } else {
                        gptOutputCompare.innerHTML = renderedHtml;
                    }
                    gptOutputCompare.classList.add('markdown-rendered');
                }
                
                // 표시 상태 보장
                gptOutputCompare.classList.remove('is-hidden');
                gptOutputCompare.style.display = '';
            }
        }
    }
    
    /**
     * 탭 전환 이벤트 리스너 등록
     */
    function initTabSwitchListener() {
        // 모든 탭 버튼 찾기
        const tabButtons = document.querySelectorAll('.output-tab');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                if (tabName === 'compare') {
                    // 비교 탭으로 전환 시 마크다운 렌더링 강제 적용
                    console.log('[Compare-Tab] 비교 탭으로 전환 감지');
                    
                    // 약간의 지연 후 렌더링 적용 (DOM 업데이트 대기)
                    setTimeout(() => {
                        forceMarkdownRenderingInCompareTab();
                    }, 50);
                }
            });
        });
        
        console.log('[Compare-Tab] 탭 전환 리스너 등록 완료');
    }
    
    /**
     * 로딩 상태 실시간 동기화
     */
    function syncLoadingStates() {
        // Groq 로딩 상태 감지
        const groqLoading = document.getElementById('groqLoading');
        const groqLoadingCompare = document.getElementById('groqLoadingCompare');
        
        if (groqLoading && groqLoadingCompare) {
            const observer = new MutationObserver(() => {
                if (groqLoading.classList.contains('active')) {
                    groqLoadingCompare.classList.remove('is-hidden');
                    groqLoadingCompare.classList.add('active');
                } else {
                    groqLoadingCompare.classList.add('is-hidden');
                    groqLoadingCompare.classList.remove('active');
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
                    gptLoadingCompare.classList.add('active');
                } else {
                    gptLoadingCompare.classList.add('is-hidden');
                    gptLoadingCompare.classList.remove('active');
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
     * 비교 탭 출력 내용 변경 감지 및 자동 렌더링
     */
    function watchCompareTabContent() {
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        
        if (groqOutputCompare) {
            const observer = new MutationObserver((mutations) => {
                // data-raw-text가 설정되었는지 확인
                const rawText = groqOutputCompare.getAttribute('data-raw-text');
                if (rawText && !groqOutputCompare.classList.contains('markdown-rendered')) {
                    console.log('[Compare-Tab] Groq 내용 변경 감지 - 마크다운 렌더링 적용');
                    
                    if (typeof renderMarkdown === 'function') {
                        const renderedHtml = renderMarkdown(rawText);
                        if (typeof setSafeHtml === 'function') {
                            setSafeHtml(groqOutputCompare, renderedHtml);
                        } else {
                            groqOutputCompare.innerHTML = renderedHtml;
                        }
                        groqOutputCompare.classList.add('markdown-rendered');
                    }
                }
            });
            
            observer.observe(groqOutputCompare, {
                attributes: true,
                attributeFilter: ['data-raw-text'],
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        
        if (gptOutputCompare) {
            const observer = new MutationObserver((mutations) => {
                // data-raw-text가 설정되었는지 확인
                const rawText = gptOutputCompare.getAttribute('data-raw-text');
                if (rawText && !gptOutputCompare.classList.contains('markdown-rendered')) {
                    console.log('[Compare-Tab] GPT 내용 변경 감지 - 마크다운 렌더링 적용');
                    
                    if (typeof renderMarkdown === 'function') {
                        const renderedHtml = renderMarkdown(rawText);
                        if (typeof setSafeHtml === 'function') {
                            setSafeHtml(gptOutputCompare, renderedHtml);
                        } else {
                            gptOutputCompare.innerHTML = renderedHtml;
                        }
                        gptOutputCompare.classList.add('markdown-rendered');
                    }
                }
            });
            
            observer.observe(gptOutputCompare, {
                attributes: true,
                attributeFilter: ['data-raw-text'],
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        
        console.log('[Compare-Tab] 내용 변경 감지 시작');
    }
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTabSwitchListener();
            syncLoadingStates();
            watchCompareTabContent();
        });
    } else {
        initTabSwitchListener();
        syncLoadingStates();
        watchCompareTabContent();
    }
    
    console.log('[Compare-Tab] 초기화 완료 - 마크다운 강제 유지 + 자동 렌더링');
})();
