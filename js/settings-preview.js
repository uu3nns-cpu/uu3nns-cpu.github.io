/* ==================== 설정 미리보기 시스템 ==================== */

// 분량/상세도 설정 맵
const detailLevelConfig = {
    '-45': { label: '최소 (50%)', multiplier: 0.5 },
    '-30': { label: '간결 (80%)', multiplier: 0.8 },
    '-15': { label: '약간 간결 (110%)', multiplier: 1.1 },
    '0': { label: '표준 (140%)', multiplier: 1.4 },
    '15': { label: '약간 상세 (170%)', multiplier: 1.7 },
    '30': { label: '상세 (210%)', multiplier: 2.1 },
    '45': { label: '최대 (250%)', multiplier: 2.5 }
};

// 포맷 옵션 레이블
const formatLabels = {
    'format_datetime': '상담 일시 / 회기',
    'format_issue': '주 호소 문제',
    'format_goal': '상담 목표',
    'format_process': '상담 과정 / 내용',
    'format_technique': '사용한 기법',
    'format_plan': '다음 회기 계획'
};

// 스타일 옵션 레이블
const styleLabels = {
    'style_terminology': '전문성 / 가독성',
    'style_expression': '내담자 표현',
    'style_focus': '관점 / 초점',
    'style_technique': '기법 서술',
    'style_emotion': '정서 표현',
    'style_counselor': '상담자 반응',
    'style_structure': '구성 방식',
    'style_plan': '회기 계획',
    'style_audience': '보고서 독자',
    'style_approach': '이론적 관점'
};

// 페이지 로드 시 설정 미리보기 업데이트
document.addEventListener('DOMContentLoaded', function() {
    // DOM이 완전히 로드된 후 약간의 지연을 두고 실행
    setTimeout(loadSettingsPreview, 100);
});

// 설정 미리보기 로드
function loadSettingsPreview() {
    try {
        updateDetailLevelPreview();
        updateFormatPreview();
        updateStylePreview();
        updateCustomPromptPreview();
        updateApiStatusPreview();
    } catch (error) {
        console.error('Error loading settings preview:', error);
    }
}

// 1. 분량/상세도 미리보기
function updateDetailLevelPreview() {
    const detailLevel = localStorage.getItem('detailLevel') || '0';
    const config = detailLevelConfig[detailLevel];
    
    if (config) {
        const previewElement = document.getElementById('previewDetailLevel');
        const exampleElement = document.getElementById('previewDetailExample');
        
        if (previewElement) {
            previewElement.textContent = config.label;
        }
        
        if (exampleElement) {
            const sampleInput = 1000;
            const expectedOutput = Math.round(sampleInput * config.multiplier);
            exampleElement.textContent = `예: ${sampleInput}자 → 약 ${expectedOutput}자`;
        }
    }
}

// 2. 포맷 섹션 미리보기
function updateFormatPreview() {
    let formatOptions = localStorage.getItem('formatOptions');
    const previewList = document.getElementById('previewFormatList');
    
    if (!previewList) {
        console.log('previewFormatList element not found');
        return;
    }
    
    // 배열 또는 객체 형식 모두 처리
    let activeFormats = [];
    
    try {
        const parsed = JSON.parse(formatOptions || '[]');
        
        if (Array.isArray(parsed)) {
            // 배열 형식: ['datetime', 'issue', 'goal']
            activeFormats = parsed;
        } else if (typeof parsed === 'object') {
            // 객체 형식: { format_datetime: true, format_issue: true }
            activeFormats = Object.entries(parsed)
                .filter(([key, value]) => value === true)
                .map(([key]) => key.replace('format_', ''));
        }
    } catch (e) {
        console.error('포맷 옵션 파싱 오류:', e);
        activeFormats = [];
    }
    
    if (activeFormats.length === 0) {
        previewList.innerHTML = '<div class="format-preview-item" style="color: var(--text-tertiary); font-style: italic;">선택된 섹션 없음</div>';
        return;
    }
    
    // 활성화된 포맷 표시
    previewList.innerHTML = activeFormats.map(key => {
        const cleanKey = key.replace('format_', ''); // format_ 접두사 제거
        const label = formatLabels['format_' + cleanKey] || formatLabels[cleanKey] || cleanKey;
        return `<div class="format-preview-item">${label}</div>`;
    }).join('');
}

// 3. 작성 스타일 미리보기
function updateStylePreview() {
    const styleSettings = JSON.parse(localStorage.getItem('styleSettings') || '{}');
    const previewList = document.getElementById('previewStyleList');
    
    if (!previewList) {
        console.log('previewStyleList element not found');
        return;
    }
    
    // 설정된 스타일만 필터링 (기본값이 아닌 것)
    const activeStyles = Object.keys(styleSettings).filter(key => 
        styleSettings[key] && styleSettings[key] !== '' && styleSettings[key] !== '기본'
    );
    
    if (activeStyles.length === 0) {
        previewList.innerHTML = '<div style="color: var(--text-tertiary); font-style: italic; font-size: 0.85em;">기본 스타일 사용 중</div>';
        return;
    }
    
    // 모든 스타일 표시 (2열 병렬)
    previewList.innerHTML = activeStyles.map(key => {
        const value = styleSettings[key];
        return `<div class="style-preview-value">${value}</div>`;
    }).join('');
}

// 4. 사용자 지시사항 미리보기
function updateCustomPromptPreview() {
    const customPrompt = localStorage.getItem('customPrompt') || '';
    const previewElement = document.getElementById('previewCustomPrompt');
    
    if (!previewElement) {
        console.log('previewCustomPrompt element not found');
        return;
    }
    
    if (!customPrompt || customPrompt.trim() === '') {
        previewElement.textContent = '설정되지 않음';
        previewElement.style.fontStyle = 'italic';
        previewElement.style.color = 'var(--text-tertiary)';
        return;
    }
    
    // 30자 이상이면 줄임
    const displayText = customPrompt.length > 100 
        ? customPrompt.substring(0, 100) + '...' 
        : customPrompt;
    
    previewElement.textContent = displayText;
    previewElement.style.fontStyle = 'normal';
    previewElement.style.color = 'var(--text-secondary)';
}

// 5. API 연결 상태 미리보기
function updateApiStatusPreview() {
    const groqKey = localStorage.getItem('groqApiKey');
    const gptKey = localStorage.getItem('gptApiKey');
    
    const statusGroq = document.getElementById('statusGroq');
    const statusGPT = document.getElementById('statusGPT');
    
    if (!statusGroq || !statusGPT) {
        console.log('Status elements not found:', {statusGroq, statusGPT});
        return;
    }
    
    if (statusGroq) {
        if (groqKey && groqKey.trim() !== '') {
            statusGroq.textContent = '✅';
            statusGroq.style.color = 'var(--success)';
        } else {
            statusGroq.textContent = '❌';
            statusGroq.style.color = 'var(--error)';
        }
    }
    
    if (statusGPT) {
        if (gptKey && gptKey.trim() !== '') {
            statusGPT.textContent = '✅';
            statusGPT.style.color = 'var(--success)';
        } else {
            statusGPT.textContent = '❌';
            statusGPT.style.color = 'var(--error)';
        }
    }
}

// 사이드바 토글 기능
function toggleSidebar() {
    const sidebar = document.getElementById('settingsSidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        
        // 상태 저장
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

// 사이드바 토글 버튼 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // 저장된 상태 복원
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        const sidebar = document.getElementById('settingsSidebar');
        if (sidebar) {
            sidebar.classList.add('collapsed');
        }
    }
});

// 탭 전환 기능
function switchOutputTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 모든 탭 패널 숨김
    document.querySelectorAll('.output-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedTab = document.querySelector(`.output-tab[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // 선택된 패널 표시
    const panelMap = {
        'groq': 'tabGroq',
        'gpt': 'tabGpt',
        'compare': 'tabCompare'
    };
    
    const selectedPanel = document.getElementById(panelMap[tabName]);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    // 비교 탭일 경우 내용 복사
    if (tabName === 'compare') {
        syncCompareContent();
    }
}

// 비교 탭 내용 동기화
function syncCompareContent() {
    const groqOutput = document.getElementById('groqOutput');
    const gptOutput = document.getElementById('gptOutput');
    const groqOutputCompare = document.getElementById('groqOutputCompare');
    const gptOutputCompare = document.getElementById('gptOutputCompare');
    const groqCountCompare = document.getElementById('groqCountCompare');
    const gptCountCompare = document.getElementById('gptCountCompare');
    
    if (groqOutput && groqOutputCompare) {
        groqOutputCompare.textContent = groqOutput.textContent;
    }
    
    if (gptOutput && gptOutputCompare) {
        gptOutputCompare.textContent = gptOutput.textContent;
    }
    
    if (groqCountCompare) {
        const groqCount = document.getElementById('groqCount');
        if (groqCount) {
            groqCountCompare.textContent = groqCount.textContent;
        }
    }
    
    if (gptCountCompare) {
        const gptCount = document.getElementById('gptCount');
        if (gptCount) {
            gptCountCompare.textContent = gptCount.textContent;
        }
    }
}

// 초기화 함수 추가
function clearInput() {
    const inputText = document.getElementById('inputText');
    if (inputText) {
        if (confirm('입력한 메모를 모두 삭제하시겠습니까?')) {
            inputText.value = '';
            updateCharCount();
            showToast('✓ 메모가 초기화되었습니다.', 1500);
        }
    }
}

// 전역 스코프에 함수 노출
window.loadSettingsPreview = loadSettingsPreview;
window.toggleSidebar = toggleSidebar;
window.switchOutputTab = switchOutputTab;
window.syncCompareContent = syncCompareContent;
window.clearInput = clearInput;
