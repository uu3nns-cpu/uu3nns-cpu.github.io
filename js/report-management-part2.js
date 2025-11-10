/**
 * 보고서 관리 페이지 - Part 2: 렌더링 및 개별 기능
 * 
 * @author 김도현
 * @since 2025-01-10
 */

// ===== 상대적 시간 표시 함수 =====
function getRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // 시간 포맷팅 (초 제거)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const timeStr = `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    
    if (days === 0) {
        return `오늘 ${timeStr}`;
    } else if (days === 1) {
        return `어제 ${timeStr}`;
    } else if (days < 7) {
        return `${days}일 전`;
    } else if (days < 30) {
        return `${Math.floor(days / 7)}주 전`;
    } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const currentYear = now.getFullYear();
        
        // 올해면 년도 생략
        if (year === currentYear) {
            return `${month}/${day} ${timeStr}`;
        } else {
            return `${year}.${month}.${day} ${timeStr}`;
        }
    }
}

// ===== 보고서 렌더링 =====
function renderReports(reset = false) {
    const container = document.getElementById('reportsContainer');
    
    if (reset) {
        container.innerHTML = '';
        displayedReports = [];
        currentPage = 0;
    }
    
    // 빈 상태
    if (filteredReports.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-title">보고서가 없습니다</div>
                <div class="empty-state-text">
                    ${allReports.length === 0 ? 
                        '아직 저장된 보고서가 없습니다.<br>보고서를 작성하고 저장해보세요!' : 
                        '검색 조건에 맞는 보고서가 없습니다.<br>다른 검색어나 필터를 시도해보세요.'}
                </div>
            </div>
        `;
        return;
    }
    
    // 페이지네이션
    const start = currentPage * REPORTS_PER_PAGE;
    const end = start + REPORTS_PER_PAGE;
    const reportsToRender = filteredReports.slice(start, end);
    
    if (reportsToRender.length === 0) return;
    
    reportsToRender.forEach(report => {
        const card = createReportCard(report);
        container.appendChild(card);
        displayedReports.push(report);
    });
    
    currentPage++;
}

// ===== 보고서 카드 생성 =====
function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.dataset.reportId = report.id;
    
    // 제목 처리
    let title = report.title;
    if (!title || title.trim() === '') {
        title = UIUtils.generateTitle(report.input, 50);
    }
    
    // 날짜만 있는 제목인 경우 내용 기반 제목으로 갱신
    const dateOnlyPattern = /^\d{4}\. \d{1,2}\. \d{1,2}\. (오전|오후) \d{1,2}:\d{2}(:\d{2})?$/;
    if (dateOnlyPattern.test(title)) {
        title = UIUtils.generateTitle(report.input, 50);
    }
    
    const displayTitle = title;
    
    // 저장 날짜
    const savedDateStr = getRelativeTime(report.timestamp);
    
    // actions-left용 상담 날짜 또는 placeholder
    let actionsLeftHTML = '';
    if (report.counselingDateTime && report.counselingDateTime.trim()) {
        // 상담일시가 있는 경우
        actionsLeftHTML = `
            <span class="report-counseling-date">
                📅 ${report.counselingDateTime}
                <button class="btn-inline-edit" onclick="event.stopPropagation(); editCounselingDate(${report.id})" title="수정">✏️</button>
            </span>
        `;
    } else {
        // 상담일시가 없는 경우
        actionsLeftHTML = `
            <span class="counseling-placeholder" onclick="event.stopPropagation(); openDatetimeModal(${report.id})">
                📅 <span class="text-muted">상담일시 미지정</span>
            </span>
        `;
    }
    
    // 미리보기 텍스트
    const preview = UIUtils.truncate(report.input, 150);
    
    // 결과물 개수 확인
    const hasGroq = report.groqOutput && report.groqOutput.trim().length > 0;
    const hasGPT = report.gptOutput && report.gptOutput.trim().length > 0;
    const resultCount = (hasGroq ? 1 : 0) + (hasGPT ? 1 : 0);
    const resultBadge = resultCount > 0 ? `<span class="report-result-badge">${resultCount}개 결과</span>` : '';
    
    card.innerHTML = `
        <div class="report-card-header">
            <div class="report-title-row">
                <div 
                    class="report-title editable" 
                    contenteditable="true"
                    data-report-id="${report.id}"
                    data-original-title="${UIUtils.escapeHtml(title)}"
                    onclick="event.stopPropagation()"
                    onblur="saveTitle(${report.id}, this)"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
                    title="${UIUtils.escapeHtml(title)}"
                >${UIUtils.escapeHtml(displayTitle)}</div>
                <div class="report-title-meta">
                    ${resultBadge}
                    <span class="report-saved-date">💾 ${savedDateStr}</span>
                </div>
            </div>
        </div>
        <div class="report-preview">${UIUtils.escapeHtml(preview)}</div>
        <div class="report-actions">
            <div class="report-actions-left">
                ${actionsLeftHTML}
            </div>
            <div class="report-actions-right">
                <button class="report-action-btn icon-only" onclick="event.stopPropagation(); exportReport(${report.id}, 'text')" title="TXT로 내려받기">
                    📄
                </button>
                <button class="report-action-btn icon-only" onclick="event.stopPropagation(); loadReportInEditor(${report.id})" title="편집">
                    ✏️
                </button>
                <button class="report-action-btn icon-only danger-action" onclick="event.stopPropagation(); deleteReport(${report.id})" title="삭제">
                    🗑️
                </button>
            </div>
        </div>
    `;
    
    // 카드 클릭 시 상세보기
    card.addEventListener('click', function(e) {
        if (e.target.closest('.report-action-btn') || 
            e.target.closest('.report-title.editable')) {
            return;
        }
        openDetailModal(report.id);
    });
    
    return card;
}

// ===== 제목 저장 =====
function saveTitle(reportId, element) {
    const newTitle = element.textContent.trim();
    
    if (!newTitle) {
        UIUtils.showToast('제목을 입력해주세요.', 'error');
        const report = ReportDataManager.findReport(reportId);
        if (report) {
            element.textContent = report.title || UIUtils.generateTitle(report.input, 50);
        }
        return;
    }
    
    if (ReportDataManager.updateReport(reportId, { title: newTitle })) {
        UIUtils.showToast('제목이 변경되었습니다.', 'success');
        loadReports();
    }
}

// ===== 보고서 삭제 =====
function deleteReport(reportId) {
    if (!confirm('이 보고서를 삭제하시겠습니까?')) {
        return;
    }
    
    if (ReportDataManager.deleteReport(reportId, true)) {
        UIUtils.showToast('보고서가 삭제되었습니다.', 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 개별 내보내기 =====
function exportReport(reportId, format) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    exportSingleReportText(report);
}

// ===== 에디터로 불러오기 =====
function loadReportInEditor(reportId) {
    sessionStorage.setItem('loadReportId', reportId);
    window.location.href = 'report.html';
}
