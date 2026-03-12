/**
 * 자동 저장 및 보고서 히스토리 관리 (리팩토링 버전)
 * 
 * 역할:
 * - 자동 저장 기능 (report.html 전용)
 * - 보고서 불러오기 기능
 * - ReportDataManager를 사용한 데이터 관리
 * 
 * @author 김도현
 * @since 2025-01-10 (리팩토링)
 */

// ===== 상수 =====
const AUTOSAVE_KEY = 'temp_counseling_input';
const AUTOSAVE_INTERVAL = 5000;

let autoSaveTimer = null;

// ===== Helper Functions =====

/**
 * 버튼 상태 안전하게 변경
 */
function safelySetButtonState(buttonId, disabled) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = disabled;
    }
}

/**
 * 텍스트 내용 안전하게 설정
 */
function safelySetTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// ===== 자동 저장 =====

/**
 * 자동 저장 시작
 */
function startAutoSave() {
    const inputField = document.getElementById('inputText');
    if (!inputField) return;
    
    inputField.addEventListener('input', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            const content = inputField.value.trim();
            if (content) {
                localStorage.setItem(AUTOSAVE_KEY, content);
                console.log('자동 저장됨:', new Date().toLocaleTimeString());
            }
        }, AUTOSAVE_INTERVAL);
    });
}

/**
 * 자동 저장된 내용 복구
 */
function restoreAutoSavedInput() {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return false;
    
    const inputField = document.getElementById('inputText');
    if (!inputField) return false;
    
    if (!inputField.value.trim()) {
        if (confirm('💾 작성 중이던 메모가 있습니다. 복구할까요?')) {
            inputField.value = saved;
            if (typeof updateCharCount === 'function') {
                updateCharCount();
            }
            UIUtils.showToast('✓ 이전 메모가 복구되었습니다', 'success', 2000);
            return true;
        } else {
            localStorage.removeItem(AUTOSAVE_KEY);
        }
    }
    return false;
}

/**
 * 자동 저장 내용 삭제
 */
function clearAutoSave() {
    localStorage.removeItem(AUTOSAVE_KEY);
}

// ===== 보고서 저장 =====

/**
 * 보고서 저장
 * @param {string} customTitle - 커스텀 제목 (선택)
 * @returns {number|null} - 저장된 보고서 ID
 */
function saveReport(customTitle = null) {
    const inputElement = document.getElementById('inputText');
    const groqOutputElement = document.getElementById('groqOutput');
    const gptOutputElement = document.getElementById('gptOutput');
    
    if (!inputElement) {
        if (typeof showError === 'function') {
            showError('입력란을 찾을 수 없습니다.');
        }
        return null;
    }
    
    const input = inputElement.value.trim();
    const groqOutput = groqOutputElement ? groqOutputElement.textContent : '';
    const gptOutput = gptOutputElement ? gptOutputElement.textContent : '';
    
    if (!input) {
        if (typeof showError === 'function') {
            showError('저장할 메모가 없습니다.');
        }
        return null;
    }
    
    const groqHasContent = groqOutput && !groqOutput.includes('상단에 메모를 작성하고');
    const gptHasContent = gptOutput && !gptOutput.includes('상단에 메모를 작성하고');
    
    if (!groqHasContent && !gptHasContent) {
        if (typeof showError === 'function') {
            showError('저장할 보고서가 없습니다. 먼저 보고서를 작성해주세요.');
        }
        return null;
    }
    
    // 제목 입력 받기 (customTitle이 없을 때만)
    if (!customTitle) {
        const defaultTitle = UIUtils.generateTitle(input, 30);
        
        customTitle = prompt('💾 보고서 제목을 입력하세요:', defaultTitle);
        
        // 취소 시 저장 중단
        if (customTitle === null) {
            return null;
        }
        
        // 빈 제목이면 기본 제목 사용
        customTitle = customTitle.trim() || defaultTitle;
    }
    
    // 출력 내용 선택 (groq 우선)
    const outputContent = groqHasContent ? groqOutput : (gptHasContent ? gptOutput : '');
    
    // ReportDataManager를 사용하여 저장
    const reportData = {
        title: customTitle,
        input: input,
        output: outputContent,
        groqOutput: groqHasContent ? groqOutput : '',
        gptOutput: gptHasContent ? gptOutput : '',
        settings: {
            customPrompt: typeof getCustomPrompt === 'function' ? getCustomPrompt() : '',
            styleSettings: typeof getStyleSettings === 'function' ? getStyleSettings() : {},
            formatOptions: typeof getFormatOptions === 'function' ? getFormatOptions() : []
        }
    };
    
    const reportId = ReportDataManager.saveReport(reportData);
    
    if (reportId) {
        UIUtils.showToast('✓ 보고서가 저장되었습니다', 'success', 2000);
        clearAutoSave();
        return reportId;
    } else {
        if (typeof showError === 'function') {
            showError('보고서 저장에 실패했습니다.');
        }
        return null;
    }
}

// ===== 보고서 관리 =====

/**
 * 보고서 제목 수정
 * @param {number} reportId - 보고서 ID
 * @param {string} newTitle - 새 제목
 * @returns {boolean} - 성공 여부
 */
function updateReportTitle(reportId, newTitle) {
    const trimmedTitle = newTitle.trim();
    
    if (!trimmedTitle) {
        if (typeof showError === 'function') {
            showError('제목을 입력해주세요.');
        }
        return false;
    }
    
    const success = ReportDataManager.updateReport(reportId, { title: trimmedTitle });
    
    if (!success) {
        if (typeof showError === 'function') {
            showError('보고서를 찾을 수 없습니다.');
        }
    }
    
    return success;
}

/**
 * 저장된 보고서 목록 가져오기
 * @returns {Array} - 보고서 배열
 */
function getSavedReports() {
    return ReportDataManager.loadReports();
}

/**
 * 특정 보고서 불러오기
 * @param {number} reportId - 보고서 ID
 * @returns {boolean} - 성공 여부
 */
function loadReport(reportId) {
    const report = ReportDataManager.findReport(reportId);
    
    if (!report) {
        if (typeof showError === 'function') {
            showError('보고서를 찾을 수 없습니다.');
        }
        return false;
    }
    
    // 입력 필드에 로드
    const inputElement = document.getElementById('inputText');
    if (inputElement) {
        inputElement.value = report.input;
        if (typeof updateCharCount === 'function') {
            updateCharCount();
        }
    }
    
    // Groq 출력 로드
    if (report.groqOutput) {
        const groqDiv = document.getElementById('groqOutput');
        if (groqDiv) {
            groqDiv.setAttribute('data-raw-text', report.groqOutput);
            
            if (typeof renderMarkdown === 'function') {
                groqDiv.innerHTML = renderMarkdown(report.groqOutput);
                groqDiv.classList.add('markdown-rendered');
            } else {
                groqDiv.textContent = report.groqOutput;
            }
            
            groqDiv.classList.remove('empty');
            groqDiv.classList.remove('is-hidden');
            groqDiv.style.display = '';
        }
        
        // 로딩 인디케이터 숨기기
        const groqLoading = document.getElementById('groqLoading');
        if (groqLoading) {
            groqLoading.classList.remove('active');
        }
        
        safelySetButtonState('groqCopyBtn', false);
        safelySetButtonState('groqExportBtn', false);
        safelySetButtonState('groqSaveBtn', false);
        safelySetTextContent('groqCount', report.groqOutput.length + '자');
        
        const groqCompare = document.getElementById('groqOutputCompare');
        if (groqCompare) {
            groqCompare.setAttribute('data-raw-text', report.groqOutput);
            if (typeof renderMarkdown === 'function') {
                groqCompare.innerHTML = renderMarkdown(report.groqOutput);
                groqCompare.classList.add('markdown-rendered');
            } else {
                groqCompare.textContent = report.groqOutput;
            }
            groqCompare.classList.remove('is-hidden');
            groqCompare.style.display = '';
        }
        
        // 로딩 인디케이터 숨기기
        const groqLoadingCompare = document.getElementById('groqLoadingCompare');
        if (groqLoadingCompare) {
            groqLoadingCompare.classList.add('is-hidden');
        }
        
        safelySetTextContent('groqCountCompare', report.groqOutput.length + '자');
        safelySetButtonState('groqCopyBtnCompare', false);
        safelySetButtonState('groqExportBtnCompare', false);
    }
    
    // GPT 출력 로드
    if (report.gptOutput) {
        const gptDiv = document.getElementById('gptOutput');
        if (gptDiv) {
            gptDiv.setAttribute('data-raw-text', report.gptOutput);
            
            if (typeof renderMarkdown === 'function') {
                gptDiv.innerHTML = renderMarkdown(report.gptOutput);
                gptDiv.classList.add('markdown-rendered');
            } else {
                gptDiv.textContent = report.gptOutput;
            }
            
            gptDiv.classList.remove('empty');
            gptDiv.classList.remove('is-hidden');
            gptDiv.style.display = '';
        }
        
        // 로딩 인디케이터 숨기기
        const gptLoading = document.getElementById('gptLoading');
        if (gptLoading) {
            gptLoading.classList.remove('active');
        }
        
        safelySetButtonState('gptCopyBtn', false);
        safelySetButtonState('gptExportBtn', false);
        safelySetButtonState('gptSaveBtn', false);
        safelySetTextContent('gptCount', report.gptOutput.length + '자');
        
        const gptCompare = document.getElementById('gptOutputCompare');
        if (gptCompare) {
            gptCompare.setAttribute('data-raw-text', report.gptOutput);
            if (typeof renderMarkdown === 'function') {
                gptCompare.innerHTML = renderMarkdown(report.gptOutput);
                gptCompare.classList.add('markdown-rendered');
            } else {
                gptCompare.textContent = report.gptOutput;
            }
            gptCompare.classList.remove('is-hidden');
            gptCompare.style.display = '';
        }
        
        // 로딩 인디케이터 숨기기
        const gptLoadingCompare = document.getElementById('gptLoadingCompare');
        if (gptLoadingCompare) {
            gptLoadingCompare.classList.add('is-hidden');
        }
        
        safelySetTextContent('gptCountCompare', report.gptOutput.length + '자');
        safelySetButtonState('gptCopyBtnCompare', false);
        safelySetButtonState('gptExportBtnCompare', false);
    }
    
    // UI 업데이트
    const emptyState = document.getElementById('emptyState');
    const outputTabs = document.getElementById('outputTabs');
    if (emptyState) {
        emptyState.classList.add('is-hidden');
        emptyState.style.display = 'none';
    }
    if (outputTabs) {
        outputTabs.classList.remove('is-hidden');
        outputTabs.style.display = '';
    }
    
    if (typeof switchOutputTab === 'function') {
        switchOutputTab('compare');
    }
    
    UIUtils.showToast('✓ 보고서를 불러왔습니다', 'success', 2000);
    
    const mainContainer = document.querySelector('.main-container');
    const outputSection = document.querySelector('.output-section');
    if (mainContainer) mainContainer.classList.add('auto-slide');
    if (outputSection) outputSection.classList.add('expanded');
    
    return true;
}

/**
 * 보고서 삭제 (소프트 삭제)
 * @param {number} reportId - 보고서 ID
 * @returns {boolean} - 성공 여부
 */
function deleteReport(reportId) {
    if (!confirm('이 보고서를 삭제하시겠습니까?')) {
        return false;
    }
    
    const success = ReportDataManager.deleteReport(reportId, false); // 소프트 삭제
    
    if (success) {
        UIUtils.showToast('✓ 보고서가 삭제되었습니다', 'success', 2000);
    } else {
        if (typeof showError === 'function') {
            showError('보고서 삭제에 실패했습니다.');
        }
    }
    
    return success;
}

/**
 * 모든 보고서 삭제 (휴지통 비우기)
 * @returns {boolean} - 성공 여부
 */
function clearAllReports() {
    if (!confirm('모든 저장된 보고서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        return false;
    }
    
    // 모든 보고서 영구 삭제
    const reports = ReportDataManager.loadReports();
    const allIds = reports.map(r => r.id);
    const success = ReportDataManager.deleteMultiple(allIds, true); // 하드 삭제
    
    if (success) {
        UIUtils.showToast('✓ 모든 보고서가 삭제되었습니다', 'success', 2000);
    } else {
        if (typeof showError === 'function') {
            showError('보고서 삭제에 실패했습니다.');
        }
    }
    
    return success;
}

/**
 * 히스토리 검색 (레거시 지원)
 * @param {string} keyword - 검색어
 * @returns {Array} - 검색 결과
 */
function searchReports(keyword) {
    return ReportDataManager.search(keyword);
}

/**
 * 날짜 필터 함수 (레거시 지원)
 * @param {Array} reports - 보고서 배열
 * @param {string} filterType - 필터 타입
 * @returns {Array} - 필터링된 보고서
 */
function filterReportsByDate(reports, filterType) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reports.filter(report => {
        const itemDate = new Date(report.timestamp);
        
        switch(filterType) {
            case 'today':
                return itemDate >= today;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return itemDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return itemDate >= monthAgo;
            case 'all':
            default:
                return true;
        }
    });
}

/**
 * 정렬 함수 (레거시 지원)
 * @param {Array} reports - 보고서 배열
 * @param {string} sortType - 정렬 타입
 * @returns {Array} - 정렬된 보고서
 */
function sortReports(reports, sortType) {
    const sorted = [...reports];
    
    switch(sortType) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        default:
            break;
    }
    
    return sorted;
}

/**
 * 보고서 히스토리 UI 표시 - report-management.html로 이동
 */
function showReportHistory() {
    window.location.href = 'report-management.html';
}

/**
 * 제목 인라인 편집 (레거시 지원)
 * @param {number} reportId - 보고서 ID
 * @param {HTMLElement} element - DOM 엘리먼트
 */
function editReportTitle(reportId, element) {
    const currentTitle = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.style.cssText = 'width: 100%; padding: 6px 10px; border: 2px solid var(--accent-primary); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); font-size: 1em; font-weight: 600;';
    
    const saveTitle = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            if (updateReportTitle(reportId, newTitle)) {
                element.textContent = newTitle;
                UIUtils.showToast('✓ 제목이 수정되었습니다', 'success', 1500);
            }
        } else {
            element.textContent = currentTitle;
        }
        element.style.display = 'block';
        input.remove();
    };
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTitle();
        } else if (e.key === 'Escape') {
            element.textContent = currentTitle;
            element.style.display = 'block';
            input.remove();
        }
    });
    
    input.addEventListener('blur', saveTitle);
    
    element.style.display = 'none';
    element.parentNode.insertBefore(input, element);
    input.focus();
    input.select();
}

/**
 * 모달 닫기 (레거시 지원)
 */
function closeReportHistory() {
    // 사용하지 않음 (간소화 버전)
}
