/**
 * 보고서 관리 페이지 (리팩토링 버전)
 * ReportDataManager와 UIUtils 사용
 * 
 * 주요 개선사항:
 * - ReportDataManager를 통한 데이터 관리 통합
 * - UIUtils를 통한 UI 유틸리티 통합
 * - 중복 코드 제거 및 유지보수성 향상
 * 
 * @author 김도현
 * @since 2025-01-10
 */

// ===== 전역 변수 =====
let allReports = [];
let filteredReports = [];
let displayedReports = [];
let selectedReports = new Set();
let currentPage = 0;
const REPORTS_PER_PAGE = 20;
let currentDetailReport = null;
let isLoading = false;
let currentTab = 'active'; // 'active' or 'trash'

// 태그 관련
let currentTagReport = null;
const PRESET_TAGS = ['🔴 긴급', '📚 학교', '🏥 병원', '👨‍👩‍👧 가족', '💼 직장', '🎯 목표설정', '😊 긍정적', '😟 부정적'];

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
    initReportManagement();
});

function initReportManagement() {
    loadReports();
    applyFilters();
    setupInfiniteScroll();
    
    // 초기 로드 시 우얰한 순서로 카드 나타나기
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

// ===== 보고서 로드 (ReportDataManager 사용) =====
function loadReports() {
    try {
        // ReportDataManager를 사용하여 로드
        allReports = ReportDataManager.loadReports();
        console.log('📋 보고서 로드됨:', allReports.length + '개');
        
        // 디버깅
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
    const favoriteFilter = document.getElementById('favoriteFilter')?.value || 'all';
    
    // 0. 현재 탭에 따라 필터링
    let filtered = allReports.filter(report => {
        if (currentTab === 'trash') {
            return report.isDeleted === true;
        } else {
            return !report.isDeleted;
        }
    });
    
    // 1. 검색
    if (keyword) {
        filtered = filtered.filter(report => {
            const title = (report.title || '').toLowerCase();
            const input = (report.input || '').toLowerCase();
            const output = (report.output || '').toLowerCase();
            return title.includes(keyword) || input.includes(keyword) || output.includes(keyword);
        });
    }
    
    // 2. 즐겨찾기 필터
    if (currentTab === 'active' && favoriteFilter === 'favorite') {
        filtered = filtered.filter(report => report.isFavorite === true);
    }
    
    // 3. 날짜 필터
    filtered = filterByDate(filtered, dateFilter);
    
    // 4. 정렬
    filtered = sortReports(filtered, sortType);
    
    filteredReports = filtered;
    currentPage = 0;
    displayedReports = [];
    selectedReports.clear();
    
    // 상태 업데이트
    updateFilterStatus();
    updateSelectAllCheckbox();
    updateActionButtons();
    
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
    const trashCount = allReports.filter(r => r.isDeleted).length;
    const filtered = filteredReports.length;
    
    if (currentTab === 'trash') {
        statusEl.textContent = `휴지통: ${filtered}개`;
    } else {
        if (filtered === activeCount) {
            statusEl.textContent = `전체 ${activeCount}개`;
        } else {
            statusEl.textContent = `${filtered}개 / 전체 ${activeCount}개`;
        }
    }
    
    // 탭 버튼 뱃지 업데이트
    const activeTabBadge = document.querySelector('.tab-btn[data-tab="active"] .tab-badge');
    const trashTabBadge = document.querySelector('.tab-btn[data-tab="trash"] .tab-badge');
    
    if (activeTabBadge) activeTabBadge.textContent = activeCount;
    if (trashTabBadge) trashTabBadge.textContent = trashCount;
}

// ===== 탭 전환 =====
function switchTab(tab) {
    currentTab = tab;
    
    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // 선택 해제
    selectedReports.clear();
    
    // UI 업데이트
    updateActionButtonsForTab();
    
    // 필터 재적용
    applyFilters();
}

// ===== 탭별 액션 버튼 업데이트 =====
function updateActionButtonsForTab() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    const emptyTrashBtn = document.getElementById('emptyTrashBtn');
    
    if (currentTab === 'trash') {
        deleteBtn.textContent = '영구 삭제';
        if (emptyTrashBtn) emptyTrashBtn.style.display = 'inline-flex';
    } else {
        deleteBtn.textContent = '삭제';
        if (emptyTrashBtn) emptyTrashBtn.style.display = 'none';
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
        const weekStr = timeStr ? ` ${timeStr}` : '';
        return `${Math.floor(days / 7)}주 전${weekStr}`;
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

// ===== 보고서 카드 생성 (UIUtils 사용) =====
function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.dataset.reportId = report.id;
    
    if (selectedReports.has(report.id)) {
        card.classList.add('selected');
    }
    
    // 제목 처리 (UIUtils.generateTitle 사용)
    let title = report.title;
    if (!title || title.trim() === '') {
        title = UIUtils.generateTitle(report.input, 50);
    }
    
    // 날짜만 있는 제목인 경우 내용 기반 제목으로 갱신
    const dateOnlyPattern = /^\d{4}\. \d{1,2}\. \d{1,2}\. (\uc624전|\uc624후) \d{1,2}:\d{2}(:\d{2})?$/;
    if (dateOnlyPattern.test(title)) {
        title = UIUtils.generateTitle(report.input, 50);
    }
    
    const displayTitle = title;
    
    // 저장 날짜 (상대적 시간 - 간결하게)
    const savedDateStr = getRelativeTime(report.timestamp);
    
    // 상담 날짜 (있을 경우)
    let counselingDateStr = '';
    if (report.displayDate) {
        counselingDateStr = report.displayDate.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
    }
    
    // 미리보기 텍스트 (UIUtils.truncate 사용)
    const preview = UIUtils.truncate(report.input, 150);
    

    
    // 결과물 개수 확인 (Groq, GPT)
    const hasGroq = report.groqOutput && report.groqOutput.trim().length > 0;
    const hasGPT = report.gptOutput && report.gptOutput.trim().length > 0;
    const resultCount = (hasGroq ? 1 : 0) + (hasGPT ? 1 : 0);
    const resultBadge = resultCount > 1 ? `<span class="report-result-badge">${resultCount}개 결과</span>` : '';
    
    // 태그 HTML
    const tagsHTML = report.tags && report.tags.length > 0 ? 
        `<div class="report-tags">
            ${report.tags.map(tag => `<span class="tag-badge">${UIUtils.escapeHtml(tag)}</span>`).join('')}
        </div>` : '';
    
    card.innerHTML = `
        <div class="report-card-header">
            <div class="report-checkbox-wrapper" onclick="event.stopPropagation(); toggleSelect(${report.id})">
                <input 
                    type="checkbox" 
                    class="report-checkbox" 
                    data-report-id="${report.id}"
                    ${selectedReports.has(report.id) ? 'checked' : ''}
                >
            </div>
            <button 
                class="favorite-btn ${report.isFavorite ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${report.id})"
                title="즐겨찾기"
            >
                ${report.isFavorite ? '⭐' : '☆'}
            </button>
            <div class="report-title-wrapper">
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
                <div class="report-meta">
                    ${counselingDateStr ? `<span class="report-counseling-date">📅 ${counselingDateStr}</span>` : ''}
                    <span class="report-saved-date">💾 ${savedDateStr}</span>
                    ${resultBadge}
                </div>
            </div>
        </div>
        <div class="report-preview">${UIUtils.escapeHtml(preview)}</div>
        ${tagsHTML}
        <div class="report-actions">
            <div class="report-actions-left">
                <button class="report-action-btn icon-action" onclick="event.stopPropagation(); openTagEditor(${report.id})" title="태그 편집">
                    🏷️ 태그
                </button>
                <button class="report-action-btn icon-action" onclick="event.stopPropagation(); exportReport(${report.id}, 'text')" title="텍스트 파일로 저장">
                    💾 저장
                </button>
            </div>
            <div class="report-actions-right">
                ${currentTab === 'active' ? `
                <button class="report-action-btn icon-only" onclick="event.stopPropagation(); loadReportInEditor(${report.id})" title="편집">
                    ✏️
                </button>
                <button class="report-action-btn icon-only danger-action" onclick="event.stopPropagation(); moveToTrash(${report.id})" title="삭제">
                    🗑️
                </button>
                ` : `
                <button class="report-action-btn icon-only restore-action" onclick="event.stopPropagation(); restoreReport(${report.id})" title="복원">
                    ♻️
                </button>
                <button class="report-action-btn icon-only danger-action" onclick="event.stopPropagation(); deleteReportPermanently(${report.id})" title="영구 삭제">
                    ⛔
                </button>
                `}
            </div>
        </div>
    `;
    
    // 그리드 뷰만 사용하므로 리스트 뷰 로직 제거
    
    // 카드 클릭 시 상세보기
    card.addEventListener('click', function(e) {
        if (e.target.closest('.report-checkbox') || 
            e.target.closest('.report-action-btn') || 
            e.target.closest('.report-title.editable') ||
            e.target.closest('.favorite-btn')) {
            return;
        }
        openDetailModal(report.id);
    });
    
    return card;
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

// ===== 보기 모드 전환 (그리드만 사용) =====
function switchView(view) {
    // 그리드 뷰만 사용하므로 함수 유지 (호환성)
    const container = document.getElementById('reportsContainer');
    container.className = 'reports-grid';
}

// ===== 전체 선택 토글 =====
function toggleSelectAll() {
    const checkbox = document.getElementById('selectAllCheckbox');
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        filteredReports.forEach(report => selectedReports.add(report.id));
    } else {
        selectedReports.clear();
    }
    
    updateUI();
}

// ===== 개별 선택 토글 =====
function toggleSelect(reportId) {
    if (selectedReports.has(reportId)) {
        selectedReports.delete(reportId);
    } else {
        selectedReports.add(reportId);
    }
    
    updateUI();
}

// ===== UI 업데이트 =====
function updateUI() {
    updateSelectAllCheckbox();
    updateActionButtons();
    updateCardSelection();
}

function updateSelectAllCheckbox() {
    const checkbox = document.getElementById('selectAllCheckbox');
    const allSelected = filteredReports.length > 0 && 
                       filteredReports.every(r => selectedReports.has(r.id));
    checkbox.checked = allSelected;
}

function updateActionButtons() {
    const count = selectedReports.size;
    const countEl = document.getElementById('selectedCount');
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    const exportBtn = document.getElementById('exportSelectedBtn');
    
    countEl.textContent = `(${count}개 선택됨)`;
    deleteBtn.disabled = count === 0;
    exportBtn.disabled = count === 0;
}

function updateCardSelection() {
    document.querySelectorAll('.report-card').forEach(card => {
        const reportId = parseInt(card.dataset.reportId);
        const checkbox = card.querySelector('.report-checkbox');
        const isSelected = selectedReports.has(reportId);
        
        card.classList.toggle('selected', isSelected);
        if (checkbox) checkbox.checked = isSelected;
    });
}

// ===== 복사본 만들기 (ReportDataManager 사용) =====
function duplicateReport(reportId) {
    const newId = ReportDataManager.duplicateReport(reportId);
    
    if (newId) {
        UIUtils.showToast('보고서가 복사되었습니다.', 'success');
        loadReports();
        applyFilters();
    } else {
        UIUtils.showToast('보고서 복사에 실패했습니다.', 'error');
    }
}



// ===== 태그 편집기 열기 (ReportDataManager 사용) =====
function openTagEditor(reportId) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    currentTagReport = report;
    
    // 현재 태그가 없으면 초기화
    if (!report.tags) {
        report.tags = [];
    }
    
    const tagInput = prompt(
        '태그를 입력하세요 (쉼표로 구분)\n\n추천 태그:\n' + PRESET_TAGS.join(', ') + '\n\n현재 태그: ' + (report.tags.length > 0 ? report.tags.join(', ') : '없음'),
        report.tags.join(', ')
    );
    
    if (tagInput === null) return; // 취소
    
    // 태그 파싱
    const newTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    
    // 중복 제거
    const uniqueTags = [...new Set(newTags)];
    
    // 저장 (ReportDataManager 사용)
    if (ReportDataManager.updateReport(reportId, { tags: uniqueTags })) {
        UIUtils.showToast('태그가 저장되었습니다.', 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 즐겨찾기 토글 (ReportDataManager 사용) =====
function toggleFavorite(reportId) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 즐겨찾기 상태 토글
    const newFavoriteState = !report.isFavorite;
    
    if (ReportDataManager.updateReport(reportId, { isFavorite: newFavoriteState })) {
        // UI 업데이트
        const card = document.querySelector(`.report-card[data-report-id="${reportId}"]`);
        if (card) {
            const btn = card.querySelector('.favorite-btn');
            if (btn) {
                btn.classList.toggle('active', newFavoriteState);
                btn.textContent = newFavoriteState ? '⭐' : '☆';
            }
        }
        
        UIUtils.showToast(
            newFavoriteState ? '즐겨찾기에 추가되었습니다.' : '즐겨찾기에서 제거되었습니다.', 
            'success'
        );
        
        // 필터가 즐겨찾기 모드일 경우 재렌더링
        const favoriteFilter = document.getElementById('favoriteFilter')?.value;
        if (favoriteFilter === 'favorite' && !newFavoriteState) {
            loadReports();
            applyFilters();
        }
    }
}

// ===== 제목 저장 (ReportDataManager 사용) =====
function saveTitle(reportId, element) {
    const newTitle = element.textContent.trim();
    
    if (!newTitle) {
        UIUtils.showToast('제목을 입력해주세요.', 'error');
        // 원래 제목으로 복원
        const report = ReportDataManager.findReport(reportId);
        if (report) {
            element.textContent = report.title || UIUtils.generateTitle(report.input, 50);
        }
        return;
    }
    
    // 보고서 제목 업데이트 (ReportDataManager 사용)
    if (ReportDataManager.updateReport(reportId, { title: newTitle })) {
        UIUtils.showToast('제목이 변경되었습니다.', 'success');
        loadReports();
    }
}

// ===== 휴지통으로 이동 (ReportDataManager 사용) =====
function moveToTrash(reportId) {
    if (ReportDataManager.deleteReport(reportId, false)) { // 소프트 삭제
        selectedReports.delete(reportId);
        UIUtils.showToast('보고서가 휴지통으로 이동되었습니다.', 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 선택 삭제/이동 (ReportDataManager 사용) =====
function deleteSelected() {
    if (selectedReports.size === 0) return;
    
    const idsArray = Array.from(selectedReports);
    
    if (currentTab === 'active') {
        // 활성 탭: 휴지통으로 이동
        if (ReportDataManager.deleteMultiple(idsArray, false)) { // 소프트 삭제
            UIUtils.showToast(`${selectedReports.size}개의 보고서가 휴지통으로 이동되었습니다.`, 'success');
            selectedReports.clear();
            loadReports();
            applyFilters();
        }
    } else {
        // 휴지통 탭: 영구 삭제
        if (!confirm(`선택한 ${selectedReports.size}개의 보고서를 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }
        
        if (ReportDataManager.deleteMultiple(idsArray, true)) { // 하드 삭제
            UIUtils.showToast(`${selectedReports.size}개의 보고서가 영구적으로 삭제되었습니다.`, 'success');
            selectedReports.clear();
            loadReports();
            applyFilters();
        }
    }
}

// ===== 복원 (ReportDataManager 사용) =====
function restoreReport(reportId) {
    if (ReportDataManager.restoreReport(reportId)) {
        selectedReports.delete(reportId);
        UIUtils.showToast('보고서가 복원되었습니다.', 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 영구 삭제 (ReportDataManager 사용) =====
function deleteReportPermanently(reportId) {
    if (!confirm('이 보고서를 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    if (ReportDataManager.deleteReport(reportId, true)) { // 하드 삭제
        selectedReports.delete(reportId);
        UIUtils.showToast('보고서가 영구적으로 삭제되었습니다.', 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 휴지통 비우기 (ReportDataManager 사용) =====
function emptyTrash() {
    const stats = ReportDataManager.getStats();
    const trashCount = stats.deleted;
    
    if (trashCount === 0) {
        UIUtils.showToast('휴지통이 비어있습니다.', 'info');
        return;
    }
    
    if (!confirm(`휴지통의 ${trashCount}개 보고서를 모두 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    if (ReportDataManager.emptyTrash()) {
        selectedReports.clear();
        UIUtils.showToast(`${trashCount}개의 보고서가 영구적으로 삭제되었습니다.`, 'success');
        loadReports();
        applyFilters();
    }
}

// ===== 선택 내보내기 =====
function exportSelected() {
    if (selectedReports.size === 0) return;
    
    const reportsToExport = allReports.filter(r => selectedReports.has(r.id));
    exportMultipleReportsText(reportsToExport);
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



// ===== 텍스트 내보내기 (단일) =====
function exportSingleReportText(report) {
    try {
        const title = report.title || UIUtils.generateTitle(report.input, 50);
        const dateStr = UIUtils.formatDate(report.timestamp, true);
        
        // 상담 날짜에서 초 제거
        let counselingDateStr = '';
        if (report.displayDate) {
            counselingDateStr = report.displayDate.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
        }
        
        let content = `
========================================
제목: ${title}
${counselingDateStr ? `상담 일시: ${counselingDateStr}
` : ''}저장 일시: ${dateStr}
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
            
            // 상담 날짜에서 초 제거
            let counselingDateStr = '';
            if (report.displayDate) {
                counselingDateStr = report.displayDate.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
            }
            
            content += `
========================================
보고서 #${index + 1}
제목: ${title}
${counselingDateStr ? `상담 일시: ${counselingDateStr}
` : ''}저장 일시: ${dateStr}
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
    const dateStr = UIUtils.formatDate(report.timestamp, true);
    
    // 상담 날짜에서 초 제거
    let counselingDateStr = '';
    if (report.displayDate) {
        counselingDateStr = report.displayDate.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
    }
    
    title.textContent = reportTitle;
    
    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">📅 날짜 정보</div>
            <div class="detail-section-content">
                ${counselingDateStr ? `<strong>상담 일시:</strong> ${counselingDateStr}<br>` : ''}
                <strong>저장 일시:</strong> ${dateStr}
            </div>
        </div>
        
        ${report.tags && report.tags.length > 0 ? `
        <div class="detail-section">
            <div class="detail-section-title">🏷️ 태그</div>
            <div class="detail-section-content">
                <div class="detail-tags">
                    ${report.tags.map(tag => `<span class="tag-badge">${UIUtils.escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </div>
        ` : ''}
        
        
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

// ===== 에디터로 불러오기 =====
function loadReportInEditor(reportId) {
    sessionStorage.setItem('loadReportId', reportId);
    window.location.href = 'report.html';
}

// ===== ESC 키로 모달 닫기 =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal && modal.classList.contains('active')) {
            closeDetailModal();
        }
    }
});

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
    if (window.pageYOffset > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// ===== 필터 초기화 =====
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('sortType').value = 'newest';
    const favoriteFilter = document.getElementById('favoriteFilter');
    if (favoriteFilter) favoriteFilter.value = 'all';
    
    applyFilters();
    UIUtils.showToast('필터가 초기화되었습니다.', 'info');
}

// ===== 키보드 단축키 =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: 검색에 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Ctrl/Cmd + A: 전체 선택 (입력 필드 외부에서)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable) {
            e.preventDefault();
            document.getElementById('selectAllCheckbox').click();
        }
    }
    
    // Delete: 선택된 항목 삭제
    if (e.key === 'Delete' && selectedReports.size > 0) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable) {
            deleteSelected();
        }
    }
});

// ===== 검색 디바운스 =====
let searchDebounceTimer;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    const originalOnInput = searchInput.oninput;
    searchInput.oninput = function() {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function() {
            applyFilters();
        }, 300);
    };
}
