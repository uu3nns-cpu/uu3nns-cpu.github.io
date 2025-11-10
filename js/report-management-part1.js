/**
 * 보고서 관리 페이지 - Part 1: 초기화 및 필터링
 * 
 * @author 김도현
 * @since 2025-01-10
 */

// ===== 전역 변수 =====
let allReports = [];
let filteredReports = [];
let displayedReports = [];
let currentPage = 0;
const REPORTS_PER_PAGE = 20;
let currentDetailReport = null;
let isLoading = false;

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
