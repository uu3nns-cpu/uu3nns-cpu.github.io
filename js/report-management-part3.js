/**
 * 보고서 관리 페이지 - Part 3: 모달 및 유틸리티
 * 
 * @author 김도현
 * @since 2025-01-10
 */

// ===== 텍스트 내보내기 (단일) =====
function exportSingleReportText(report) {
    try {
        const title = report.title || UIUtils.generateTitle(report.input, 50);
        const dateStr = UIUtils.formatDate(report.timestamp, true);
        
        // 상담 날짜 처리
        let counselingInfo = '';
        if (report.counselingDateTime && report.counselingDateTime.trim()) {
            counselingInfo = `상담 일시: ${report.counselingDateTime}
`;
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
                counselingInfo = `상담 일시: ${report.counselingDateTime}
`;
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

// ===== ESC 키로 모달 닫기 =====
document.addEventListener('keydown', function(e) {
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
});

// ===== 전역 변수 (현재 편집 중인 보고서 ID) =====
let currentEditingReportId = null;

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
