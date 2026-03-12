/* ============================================
   report.html 전용 UI 스크립트
   ============================================ */

// clearInput 함수
function clearInput() {
    if (confirm('입력한 메모를 모두 지우시겠습니까?')) {
        document.getElementById('inputText').value = '';
        updateCharCount();
        showToast('✅ 메모가 지워졌습니다.', 1500);
    }
}

// Floating 버튼 토글 기능 (드래그 제거)
(function initFloatingToggle() {
    const floatingBtn = document.getElementById('sidebarFloatingToggle');
    const reportLayout = document.querySelector('.report-layout');
    const sidebar = document.getElementById('settingsSidebar');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    
    // 요소가 없으면 함수 종료
    if (!floatingBtn || !sidebar) {
        return;
    }
    
    let isSidebarOpen = false;
    
    // 사이드바 열기/닫기 함수
    function toggleSidebar(open) {
        const mainArea = document.querySelector('.main-area');
        const chatbotModal = document.getElementById('chatbotModal');
        
        isSidebarOpen = open;
        
        if (isSidebarOpen) {
            sidebar.classList.add('open');
            if (mainArea) mainArea.classList.add('sidebar-open');
            // 챗봇 닫기
            if (chatbotModal && chatbotModal.classList.contains('active')) {
                chatbotModal.classList.remove('active');
                if (mainArea) mainArea.classList.remove('chatbot-open');
            }
        } else {
            sidebar.classList.remove('open');
            if (mainArea) mainArea.classList.remove('sidebar-open');
        }
    }
    
    // 플로팅 버튼 클릭 - 챗봇과 배타적
    floatingBtn.addEventListener('click', function(e) {
        toggleSidebar(!isSidebarOpen);
    });
    
    // 사이드바 닫기 버튼 클릭
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar(false);
        });
    }
})();

// switchOutputTab 함수 (오류 수정)
function switchOutputTab(tabName) {
    // 모든 탭과 패널의 active 클래스 제거
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.output-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 선택된 탭과 패널 활성화
    const selectedTab = document.querySelector(`.output-tab[data-tab="${tabName}"]`);
    const selectedPanel = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedPanel) selectedPanel.classList.add('active');
    
    // 비교 모드에서는 결과를 동기화 (마크다운 렌더링 포함)
    if (tabName === 'compare') {
        const groqOutput = document.getElementById('groqOutput');
        const gptOutput = document.getElementById('gptOutput');
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        const groqCountCompare = document.getElementById('groqCountCompare');
        const gptCountCompare = document.getElementById('gptCountCompare');
        const groqCopyBtnCompare = document.getElementById('groqCopyBtnCompare');
        const gptCopyBtnCompare = document.getElementById('gptCopyBtnCompare');
        
        if (groqOutput && groqOutputCompare) {
            // 원본 텍스트가 있으면 마크다운 렌더링 다시 적용
            const rawText = groqOutput.getAttribute('data-raw-text');
            if (rawText) {
                groqOutputCompare.setAttribute('data-raw-text', rawText);
                if (typeof renderMarkdown === 'function') {
                    groqOutputCompare.innerHTML = renderMarkdown(rawText);
                    groqOutputCompare.classList.add('markdown-rendered');
                } else {
                    groqOutputCompare.innerHTML = groqOutput.innerHTML;
                }
                // is-hidden 클래스 제거 및 표시
                groqOutputCompare.classList.remove('is-hidden');
                groqOutputCompare.style.display = '';
                if (groqCopyBtnCompare) groqCopyBtnCompare.disabled = false;
            } else {
                groqOutputCompare.innerHTML = groqOutput.innerHTML;
            }
            
            if (groqCountCompare) {
                groqCountCompare.textContent = document.getElementById('groqCount').textContent;
            }
        }
        if (gptOutput && gptOutputCompare) {
            // 원본 텍스트가 있으면 마크다운 렌더링 다시 적용
            const rawText = gptOutput.getAttribute('data-raw-text');
            if (rawText) {
                gptOutputCompare.setAttribute('data-raw-text', rawText);
                if (typeof renderMarkdown === 'function') {
                    gptOutputCompare.innerHTML = renderMarkdown(rawText);
                    gptOutputCompare.classList.add('markdown-rendered');
                } else {
                    gptOutputCompare.innerHTML = gptOutput.innerHTML;
                }
                // is-hidden 클래스 제거 및 표시
                gptOutputCompare.classList.remove('is-hidden');
                gptOutputCompare.style.display = '';
                if (gptCopyBtnCompare) gptCopyBtnCompare.disabled = false;
            } else {
                gptOutputCompare.innerHTML = gptOutput.innerHTML;
            }
            
            if (gptCountCompare) {
                gptCountCompare.textContent = document.getElementById('gptCount').textContent;
            }
        }
    }
}

// 출력 탭 보이기 초기화
function initOutputTabsObserver() {
    const emptyState = document.getElementById('emptyState');
    const outputTabs = document.getElementById('outputTabs');
    
    // 보고서 생성 후 탭 표시 리스너 추가
    const observer = new MutationObserver(() => {
        const groqHasContent = !document.getElementById('groqOutput').classList.contains('is-hidden');
        const gptHasContent = !document.getElementById('gptOutput').classList.contains('is-hidden');
        
        if (groqHasContent || gptHasContent) {
            emptyState.classList.add('is-hidden');
            outputTabs.classList.remove('is-hidden');
        }
    });
    
    observer.observe(document.getElementById('groqOutput'), {
        attributes: true,
        attributeFilter: ['class']
    });
    observer.observe(document.getElementById('gptOutput'), {
        attributes: true,
        attributeFilter: ['class']
    });
}

// 비교 탭 강제 새로고침 함수 (더 이상 필요 없음 - app.js에서 자동 동기화)
function refreshCompareTab() {
    // 비교 탭은 switchOutputTab('compare') 호출 시 자동 동기화
    console.log('[Compare-Tab] refreshCompareTab 호출됨 - 자동 동기화로 인해 별도 작업 불필요');
}

// 현재 프리셋 표시 업데이트
function updateCurrentPresetDisplay() {
    const presetNameElement = document.getElementById('currentPresetName');
    if (!presetNameElement) return;
    
    const activeId = getActivePresetId();
    
    if (activeId === 0) {
        presetNameElement.textContent = '수동 설정';
        return;
    }
    
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === activeId);
    
    if (preset) {
        presetNameElement.textContent = `${preset.icon} ${preset.name}`;
    } else {
        presetNameElement.textContent = '수동 설정';
    }
}

// 비교 탭 로딩 상태 동기화
function syncCompareLoadingState() {
    const groqLoading = document.getElementById('groqLoading');
    const gptLoading = document.getElementById('gptLoading');
    const groqLoadingCompare = document.getElementById('groqLoadingCompare');
    const gptLoadingCompare = document.getElementById('gptLoadingCompare');
    
    if (groqLoading && groqLoadingCompare) {
        if (groqLoading.classList.contains('active')) {
            groqLoadingCompare.classList.remove('is-hidden');
        } else {
            groqLoadingCompare.classList.add('is-hidden');
        }
    }
    
    if (gptLoading && gptLoadingCompare) {
        if (gptLoading.classList.contains('active')) {
            gptLoadingCompare.classList.remove('is-hidden');
        } else {
            gptLoadingCompare.classList.add('is-hidden');
        }
    }
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // 프리셋 표시 업데이트
    if (typeof updateCurrentPresetDisplay === 'function') {
        updateCurrentPresetDisplay();
    }
    
    // 출력 탭 옵저버 초기화
    initOutputTabsObserver();
    
    // sessionStorage에서 보고서 ID 확인 및 자동 불러오기
    const reportIdToLoad = sessionStorage.getItem('loadReportId');
    if (reportIdToLoad) {
        // sessionStorage 정리
        sessionStorage.removeItem('loadReportId');
        
        // 약간의 딜레이 후 보고서 불러오기 (페이지 초기화 완료 후)
        setTimeout(() => {
            if (typeof loadReport === 'function') {
                loadReport(parseInt(reportIdToLoad));
            }
        }, 300);
    }
});
