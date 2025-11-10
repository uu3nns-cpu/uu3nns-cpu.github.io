// ===== Part 4: 선택/삭제/복원 기능 (ReportDataManager 사용) =====

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
        loadReports(); // 재로드
        applyFilters(); // 재렌더링
    } else {
        UIUtils.showToast('보고서 복사에 실패했습니다.', 'error');
    }
}

// ===== 메모 편집기 열기 (ReportDataManager 사용) =====
function openNoteEditor(reportId) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const currentNote = report.notes || '';
    const newNote = prompt(
        '메모를 입력하세요:\n(메모를 삭제하려면 빈 칸으로 남겨두세요)',
        currentNote
    );
    
    if (newNote === null) return; // 취소
    
    // 저장 (ReportDataManager 사용)
    if (ReportDataManager.updateReport(reportId, { notes: newNote.trim() })) {
        if (newNote.trim()) {
            UIUtils.showToast('메모가 저장되었습니다.', 'success');
        } else {
            UIUtils.showToast('메모가 삭제되었습니다.', 'success');
        }
        
        loadReports();
        applyFilters();
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
