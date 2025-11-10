/**
 * 입력/결과 영역 크기 조절 기능
 */

function initResizeHandler() {
    const inputArea = document.querySelector('.input-area-compact');
    const outputArea = document.querySelector('.output-area-compact');
    const mainArea = document.querySelector('.main-area');
    
    if (!inputArea || !outputArea || !mainArea) return;
    
    // Resize 핸들 생성
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '<div class="resize-handle-bar">⋮⋮⋮</div>';
    resizeHandle.title = '드래그하여 크기 조절';
    
    // 핸들을 입력 영역과 출력 영역 사이에 삽입
    mainArea.insertBefore(resizeHandle, outputArea);
    
    // 초기 flex 값 설정 (30% / 70%)
    inputArea.style.flex = '0 0 30%';
    outputArea.style.flex = '1 1 70%';
    
    let isResizing = false;
    let startY = 0;
    let startInputFlex = 0;
    
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        
        // 현재 input-area의 실제 높이 비율 계산
        const mainHeight = mainArea.offsetHeight;
        const inputHeight = inputArea.offsetHeight;
        startInputFlex = (inputHeight / mainHeight) * 100;
        
        resizeHandle.classList.add('resizing');
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaY = e.clientY - startY;
        const mainHeight = mainArea.offsetHeight;
        
        // 델타를 퍼센트로 변환
        const deltaPercent = (deltaY / mainHeight) * 100;
        let newInputFlex = startInputFlex + deltaPercent;
        
        // 최소/최대 제한 (입력: 10% ~ 70%, 출력: 30% ~ 90%)
        if (newInputFlex < 10) newInputFlex = 10;
        if (newInputFlex > 70) newInputFlex = 70;
        
        const newOutputFlex = 100 - newInputFlex;
        
        // flex 값 적용
        inputArea.style.flex = `0 0 ${newInputFlex}%`;
        outputArea.style.flex = `1 1 ${newOutputFlex}%`;
        
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizeHandle.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
    
    // 더블클릭으로 기본 비율로 리셋
    resizeHandle.addEventListener('dblclick', () => {
        inputArea.style.flex = '0 0 30%';
        outputArea.style.flex = '1 1 70%';
    });
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResizeHandler);
} else {
    initResizeHandler();
}
