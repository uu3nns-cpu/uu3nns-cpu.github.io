/**
 * 보고서 관리 기능 통합 모듈
 * 
 * 이 파일은 보고서 관리 페이지의 모든 기능을 통합한 모듈입니다.
 * - 보고서 목록 로드 및 필터링
 * - UI 렌더링 및 카드 생성
 * - 상세보기 모달
 * - 내보내기 기능
 * - 상담 일시 관리
 * 
 * @author 김도현
 * @since 2025-01-10
 * @updated 2025-11-11 (통합)
 */

// ==================== Part 1: 전역 변수 및 초기화 ====================

let allReports = [];
let filteredReports = [];
let displayedReports = [];
let currentPage = 0;
const REPORTS_PER_PAGE = 20;
let currentDetailReport = null;
let isLoading = false;
let currentEditingReportId = null;

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
    initReportManagement();
});

function initReportManagement() {
    loadReports();
    applyFilters();
    setupInfiniteScroll();
    
    // 초기 로드 시 우아한 순서로 카드 나타나기
    const container = document.getElementById('reportsContainer');
    if (container) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // 모든 카드 관찰
        setTimeout(() => {
            container.querySelectorAll('.report-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                observer.observe(card);
            });
        }, 100);
    }
}

// ==================== Part 1: 보고서 로드 및 필터링 ====================

// ===== 보고서 로드 =====
function loadReports() {
    try {
        allReports = ReportDataManager.loadReports();
        console.log('📋 보고서 로드됨:', allReports.length + '개');
        
        if (allReports.length > 0) {
            console.log('첫 번째 보고서:', {
                id: allReports[0].id,
                title: allReports[0].title,
                hasOutput: !!allReports[0].output,
                outputLength: (allReports[0].output || '').length
            });
        }
    } catch (error) {
        console.error('보고서 로드 실패:', error);
        UIUtils.showToast('보고서를 불러오는데 실패했습니다.', 'error');
        allReports = [];
    }
}

// ===== 필터 적용 =====
function applyFilters() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    const sortType = document.getElementById('sortType').value;
    
    // 활성 보고서만 표시 (삭제되지 않은 것)
    let filtered = allReports.filter(report => !report.isDeleted);
    
    // 1. 검색
    if (keyword) {
        filtered = filtered.filter(report => {
            const title = (report.title || '').toLowerCase();
            const input = (report.input || '').toLowerCase();
            const output = (report.output || '').toLowerCase();
            return title.includes(keyword) || input.includes(keyword) || output.includes(keyword);
        });
    }
    
    // 2. 날짜 필터
    filtered = filterByDate(filtered, dateFilter);
    
    // 3. 정렬
    filtered = sortReports(filtered, sortType);
    
    filteredReports = filtered;
    currentPage = 0;
    displayedReports = [];
    
    // 상태 업데이트
    updateFilterStatus();
    
    // 렌더링
    renderReports(true);
}

// ===== 날짜 필터 =====
function filterByDate(reports, filterType) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reports.filter(report => {
        const reportDate = new Date(report.timestamp);
        
        switch(filterType) {
            case 'today':
                return reportDate >= today;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return reportDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return reportDate >= monthAgo;
            case 'all':
            default:
                return true;
        }
    });
}

// ===== 정렬 =====
function sortReports(reports, sortType) {
    const sorted = [...reports];
    
    switch(sortType) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'title-asc':
            sorted.sort((a, b) => {
                const titleA = (a.title || a.input.split('\n')[0]).toLowerCase();
                const titleB = (b.title || b.input.split('\n')[0]).toLowerCase();
                return titleA.localeCompare(titleB);
            });
            break;
        case 'title-desc':
            sorted.sort((a, b) => {
                const titleA = (a.title || a.input.split('\n')[0]).toLowerCase();
                const titleB = (b.title || b.input.split('\n')[0]).toLowerCase();
                return titleB.localeCompare(titleA);
            });
            break;
    }
    
    return sorted;
}

// ===== 필터 상태 업데이트 =====
function updateFilterStatus() {
    const statusEl = document.getElementById('filterStatus');
    const activeCount = allReports.filter(r => !r.isDeleted).length;
    const filtered = filteredReports.length;
    
    statusEl.textContent = `현재 ${activeCount}개 / 전체 50개`;
}

// ===== 무한 스크롤 설정 =====
function setupInfiniteScroll() {
    let observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                if (displayedReports.length < filteredReports.length) {
                    isLoading = true;
                    setTimeout(() => {
                        renderReports(false);
                        isLoading = false;
                    }, 300);
                }
            }
        });
    }, {
        rootMargin: '100px'
    });
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        observer.observe(loadingIndicator);
    }
}

// ===== 검색 디바운스 =====
let searchDebounceTimer;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.oninput = function() {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function() {
            applyFilters();
        }, 300);
    };
}

// ==================== Part 2: UI 렌더링 ====================

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

// ==================== Part 3: 모달 및 유틸리티 ====================

// ===== 텍스트 내보내기 (단일) =====
function exportSingleReportText(report) {
    try {
        const title = report.title || UIUtils.generateTitle(report.input, 50);
        const dateStr = UIUtils.formatDate(report.timestamp, true);
        
        // 상담 날짜 처리
        let counselingInfo = '';
        if (report.counselingDateTime && report.counselingDateTime.trim()) {
            counselingInfo = `상담 일시: ${report.counselingDateTime}\n`;
        }
        
        let content = `
========================================
제목: ${title}
${counselingInfo}저장 일시: ${dateStr}
========================================

[입력 내용]
${report.input}

========================================
`;
        
        // Groq 결과
        if (report.groqOutput && report.groqOutput.trim()) {
            content += `
[생성된 보고서 - Groq]
${report.groqOutput}

========================================
`;
        }
        
        // GPT 결과
        if (report.gptOutput && report.gptOutput.trim()) {
            content += `
[생성된 보고서 - GPT]
${report.gptOutput}

========================================
`;
        }
        
        // 기본 output
        if (!report.groqOutput && !report.gptOutput && report.output) {
            content += `
[생성된 보고서]
${report.output}

========================================
`;
        }
        
        const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = UIUtils.sanitizeFilename(title) + '_' + Date.now() + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UIUtils.showToast('텍스트 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
        console.error('텍스트 내보내기 실패:', error);
        UIUtils.showToast('텍스트 내보내기에 실패했습니다.', 'error');
    }
}

// ===== 텍스트 내보내기 (다중) =====
function exportMultipleReportsText(reports) {
    try {
        let content = '';
        
        reports.forEach((report, index) => {
            const title = report.title || UIUtils.generateTitle(report.input, 50);
            const dateStr = UIUtils.formatDate(report.timestamp, true);
            
            // 상담 날짜 처리
            let counselingInfo = '';
            if (report.counselingDateTime && report.counselingDateTime.trim()) {
                counselingInfo = `상담 일시: ${report.counselingDateTime}\n`;
            }
            
            content += `
========================================
보고서 #${index + 1}
제목: ${title}
${counselingInfo}저장 일시: ${dateStr}
========================================

[입력 내용]
${report.input}

========================================
`;
            
            // Groq 결과
            if (report.groqOutput && report.groqOutput.trim()) {
                content += `
[생성된 보고서 - Groq]
${report.groqOutput}

========================================
`;
            }
            
            // GPT 결과
            if (report.gptOutput && report.gptOutput.trim()) {
                content += `
[생성된 보고서 - GPT]
${report.gptOutput}

========================================
`;
            }
            
            // 기본 output
            if (!report.groqOutput && !report.gptOutput && report.output) {
                content += `
[생성된 보고서]
${report.output}

========================================
`;
            }
            
            content += '\n\n';
        });
        
        const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `보고서_모음_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UIUtils.showToast(`${reports.length}개의 보고서가 텍스트 파일로 다운로드되었습니다.`, 'success');
    } catch (error) {
        console.error('텍스트 내보내기 실패:', error);
        UIUtils.showToast('텍스트 내보내기에 실패했습니다.', 'error');
    }
}

// ===== 상세보기 모달 =====
function openDetailModal(reportId) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    currentDetailReport = report;
    
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('detailTitle');
    const body = document.getElementById('detailBody');
    
    const reportTitle = report.title || UIUtils.generateTitle(report.input, 50);
    
    // 상담일시 표시
    let counselingInfo = '';
    if (report.counselingDateTime && report.counselingDateTime.trim()) {
        counselingInfo = `<span style="color: var(--text-secondary); font-size: 0.9em; margin-left: 12px;">📅 ${report.counselingDateTime}</span>`;
    }
    
    title.innerHTML = reportTitle + counselingInfo;
    
    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">✍️ 입력 내용</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.input)}</div>
        </div>
        
        ${report.groqOutput && report.groqOutput.trim() ? `
        <div class="detail-section">
            <div class="detail-section-title">📋 생성된 보고서 (Groq)</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.groqOutput)}</div>
        </div>
        ` : ''}
        
        ${report.gptOutput && report.gptOutput.trim() ? `
        <div class="detail-section">
            <div class="detail-section-title">📋 생성된 보고서 (GPT)</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.gptOutput)}</div>
        </div>
        ` : ''}
        
        ${!report.groqOutput && !report.gptOutput && report.output ? `
        <div class="detail-section">
            <div class="detail-section-title">📋 생성된 보고서</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.output)}</div>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal(event) {
    const modal = document.getElementById('detailModal');
    
    if (!event || event.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentDetailReport = null;
    }
}

function loadReportFromDetail() {
    if (currentDetailReport) {
        loadReportInEditor(currentDetailReport.id);
    }
}

function exportCurrentReport(format) {
    if (currentDetailReport) {
        exportReport(currentDetailReport.id, 'text');
    }
}

// ===== 상담 일시 입력 모달 =====
function openDatetimeModal(reportId) {
    currentEditingReportId = reportId;
    const modal = document.getElementById('datetimeModal');
    
    // 기존 데이터 확인
    const report = ReportDataManager.findReport(reportId);
    
    if (report && report.counselingDateTime) {
        // 기존 데이터가 있으면 파싱해서 넣기
        // 형식: "2025. 01. 16. 오후 2:00"
        const match = report.counselingDateTime.match(/(\d{4})\. (\d{1,2})\. (\d{1,2})\. (오전|오후) (\d{1,2}):(\d{2})/);
        if (match) {
            const [_, year, month, day, ampm, hour, minute] = match;
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            document.getElementById('counselingDate').value = dateStr;
            
            // 시간 변환 (오전/오후 -> 24시간)
            let hours24 = parseInt(hour);
            if (ampm === '오후' && hours24 !== 12) {
                hours24 += 12;
            } else if (ampm === '오전' && hours24 === 12) {
                hours24 = 0;
            }
            
            const startTime = `${hours24.toString().padStart(2, '0')}:${minute}`;
            document.getElementById('startTime').value = startTime;
            
            // 종료 시간은 1시간 후로
            const endHours = (hours24 + 1).toString().padStart(2, '0');
            document.getElementById('endTime').value = `${endHours}:${minute}`;
        }
    } else {
        // 새로 입력하는 경우: 오늘 날짜, 현재 시간 기준
        const now = new Date();
        
        // 날짜: 오늘 (로컬 시간대로)
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        document.getElementById('counselingDate').value = dateStr;
        
        // 종료 시간: 현재 시각의 정각 (2시 20분 -> 2시)
        const currentHour = now.getHours();
        const endTime = `${currentHour.toString().padStart(2, '0')}:00`;
        document.getElementById('endTime').value = endTime;
        
        // 시작 시간: 종료 시간의 1시간 전
        const startHour = currentHour - 1;
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        document.getElementById('startTime').value = startTime;
    }
    
    // 시작 시간 변경 시 종료 시간 자동 조정 (이벤트 리스너 중복 방지)
    const startTimeInput = document.getElementById('startTime');
    const newStartTimeInput = startTimeInput.cloneNode(true);
    startTimeInput.parentNode.replaceChild(newStartTimeInput, startTimeInput);
    
    newStartTimeInput.addEventListener('change', function() {
        const startTime = this.value;
        if (startTime) {
            const [hours, minutes] = startTime.split(':');
            const endHours = (parseInt(hours) + 1).toString().padStart(2, '0');
            document.getElementById('endTime').value = `${endHours}:${minutes}`;
        }
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== 상담 일시 수정 =====
function editCounselingDate(reportId) {
    openDatetimeModal(reportId);
}

function closeDatetimeModal(event) {
    const modal = document.getElementById('datetimeModal');
    
    if (!event || event.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function applyDatetime() {
    const date = document.getElementById('counselingDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!date || !startTime || !endTime) {
        UIUtils.showToast('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 시간 계산
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;
    const durationMinutes = endMinutesTotal - startMinutesTotal;
    
    if (durationMinutes <= 0) {
        UIUtils.showToast('종료 시간은 시작 시간보다 늦어야 합니다.', 'error');
        return;
    }
    
    // 날짜 포맷팅
    const dateObj = new Date(date + 'T' + startTime);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = (hours % 12 || 12).toString();
    
    const displayDate = `${year}. ${month}. ${day}. ${ampm} ${displayHours}:${minutes}`;
    
    // 보고서 업데이트
    if (currentEditingReportId) {
        if (ReportDataManager.updateReport(currentEditingReportId, {
            counselingDateTime: displayDate
        })) {
            UIUtils.showToast(`상담 일시가 설정되었습니다.`, 'success');
            loadReports();
            applyFilters();
        }
    }
    
    closeDatetimeModal();
    currentEditingReportId = null;
}

// ==================== 유틸리티 함수 ====================

// ===== 스크롤 투 탑 버튼 =====
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 스크롤 위치에 따른 버튼 표시/숨김
window.addEventListener('scroll', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn && window.pageYOffset > 500) {
        scrollToTopBtn.classList.add('visible');
    } else if (scrollToTopBtn) {
        scrollToTopBtn.classList.remove('visible');
    }
});

// ===== 키보드 단축키 =====
document.addEventListener('keydown', function(e) {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal && modal.classList.contains('active')) {
            closeDetailModal();
        }
        
        const datetimeModal = document.getElementById('datetimeModal');
        if (datetimeModal && datetimeModal.classList.contains('active')) {
            closeDatetimeModal();
            currentEditingReportId = null;
        }
    }
    
    // Ctrl/Cmd + K: 검색에 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl/Cmd + A: 전체 선택 (입력 필드 외부에서)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable) {
            e.preventDefault();
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) selectAllCheckbox.click();
        }
    }
    
    // Delete: 선택된 항목 삭제
    if (e.key === 'Delete' && typeof selectedReports !== 'undefined' && selectedReports.size > 0) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable) {
            if (typeof deleteSelected === 'function') {
                deleteSelected();
            }
        }
    }
});
