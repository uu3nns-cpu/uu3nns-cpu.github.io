/**
 * UI 버튼 추가 헬퍼 함수
 */

// 저장 버튼 추가 (입력 섹션에)
function addSaveButton() {
    // 이미 존재하면 추가하지 않음
    if (document.querySelector('.btn-save-report')) return;
    
    const inputActions = document.querySelector('.input-actions');
    if (!inputActions) return;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save-report';
    saveBtn.id = 'saveReportBtn';
    saveBtn.innerHTML = '💾 저장';
    saveBtn.title = '현재 보고서 저장';
    saveBtn.onclick = (e) => {
        e.stopPropagation();
        saveReport();
    };
    
    // 생성 버튼 앞에 추가
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        inputActions.insertBefore(saveBtn, generateBtn);
    } else {
        inputActions.appendChild(saveBtn);
    }
}

// API 키 보기/숨기기 토글 버튼 추가
function addApiKeyToggle() {
    const apiInputs = document.querySelectorAll('.api-input');
    
    apiInputs.forEach(input => {
        const wrapper = input.closest('.api-input-wrapper');
        if (!wrapper) return;
        
        // 이미 토글 버튼이 있는지 확인
        if (wrapper.querySelector('.btn-toggle-api')) return;
        
        // 토글 버튼 생성
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-toggle-api';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.title = 'API 키 보기/숨기기';
        toggleBtn.type = 'button';
        
        toggleBtn.onclick = () => {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerHTML = '🙈';
                toggleBtn.title = 'API 키 숨기기';
            } else {
                input.type = 'password';
                toggleBtn.innerHTML = '👁️';
                toggleBtn.title = 'API 키 보기';
            }
        };
        
        // 삭제 버튼 앞에 추가
        const deleteBtn = wrapper.querySelector('.btn-clear-api');
        if (deleteBtn) {
            wrapper.insertBefore(toggleBtn, deleteBtn);
        } else {
            wrapper.appendChild(toggleBtn);
        }
    });
}

// 초기화 시 모든 UI 요소 추가
function initializeUIEnhancements() {
    addSaveButton();
    addApiKeyToggle();
    initAutoResizeTextarea();
}

// textarea 자동 높이 조절 기능
function autoResizeTextarea(textarea) {
    // 높이를 auto로 설정하여 scrollHeight를 정확히 계산
    textarea.style.height = 'auto';
    // scrollHeight + 여유 공간(2px)으로 높이 설정
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

// textarea 자동 높이 조절 초기화
function initAutoResizeTextarea() {
    const textarea = document.getElementById('inputText');
    if (!textarea) return;
    
    // 초기 높이 설정
    autoResizeTextarea(textarea);
    
    // input 이벤트에 자동 높이 조절 추가
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // 페이지 로드 시 내용이 있으면 높이 조절
    if (textarea.value) {
        autoResizeTextarea(textarea);
    }
}

// 전역 스코프로 내보내기
if (typeof window !== 'undefined') {
    window.addSaveButton = addSaveButton;
    window.addApiKeyToggle = addApiKeyToggle;
    window.initializeUIEnhancements = initializeUIEnhancements;
    window.autoResizeTextarea = autoResizeTextarea;
    window.initAutoResizeTextarea = initAutoResizeTextarea;
}
