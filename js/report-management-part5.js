// ===== Part 5: 내보내기 및 모달 =====

// ===== 선택 내보내기 =====
function exportSelected() {
    if (selectedReports.size === 0) return;
    
    const format = confirm('PDF로 내보내시겠습니까?\n취소를 누르면 텍스트 파일로 내보냅니다.') ? 'pdf' : 'text';
    
    const reportsToExport = allReports.filter(r => selectedReports.has(r.id));
    
    if (format === 'pdf') {
        exportMultipleReportsPDF(reportsToExport);
    } else {
        exportMultipleReportsText(reportsToExport);
    }
}

// ===== 개별 내보내기 =====
function exportReport(reportId, format) {
    const report = ReportDataManager.findReport(reportId);
    if (!report) {
        UIUtils.showToast('보고서를 찾을 수 없습니다.', 'error');
        return;
    }
    
    if (format === 'pdf') {
        exportSingleReportPDF(report);
    } else {
        exportSingleReportText(report);
    }
}

// ===== PDF 내보내기 (단일) =====
function exportSingleReportPDF(report) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const title = report.title || UIUtils.generateTitle(report.input, 50);
        const dateStr = UIUtils.formatDate(report.timestamp, true);
        
        // 제목
        doc.setFontSize(16);
        doc.text(title, 20, 20);
        
        // 날짜
        doc.setFontSize(10);
        doc.text(dateStr, 20, 30);
        
        // 구분선
        doc.line(20, 35, 190, 35);
        
        // 입력 내용
        doc.setFontSize(12);
        doc.text('[입력 내용]', 20, 45);
        
        const inputLines = doc.splitTextToSize(report.input, 170);
        doc.setFontSize(10);
        doc.text(inputLines, 20, 55);
        
        // 새 페이지 (출력 내용)
        doc.addPage();
        doc.setFontSize(12);
        doc.text('[생성된 보고서]', 20, 20);
        
        const outputLines = doc.splitTextToSize(report.output, 170);
        doc.setFontSize(10);
        doc.text(outputLines, 20, 30);
        
        // 저장
        const filename = UIUtils.sanitizeFilename(title) + '_' + Date.now() + '.pdf';
        doc.save(filename);
        
        UIUtils.showToast('PDF 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        UIUtils.showToast('PDF 내보내기에 실패했습니다.', 'error');
    }
}

// ===== 텍스트 내보내기 (단일) =====
function exportSingleReportText(report) {
    try {
        const title = report.title || UIUtils.generateTitle(report.input, 50);
        const dateStr = UIUtils.formatDate(report.timestamp, true);
        
        const content = `
========================================
제목: ${title}
날짜: ${dateStr}
========================================

[입력 내용]
${report.input}

========================================

[생성된 보고서]
${report.output}

========================================
        `.trim();
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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

// ===== PDF 내보내기 (다중) =====
function exportMultipleReportsPDF(reports) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        reports.forEach((report, index) => {
            if (index > 0) doc.addPage();
            
            const title = report.title || UIUtils.generateTitle(report.input, 50);
            const dateStr = UIUtils.formatDate(report.timestamp, true);
            
            doc.setFontSize(16);
            doc.text(title, 20, 20);
            
            doc.setFontSize(10);
            doc.text(dateStr, 20, 30);
            
            doc.line(20, 35, 190, 35);
            
            doc.setFontSize(12);
            doc.text('[입력 내용]', 20, 45);
            
            const inputLines = doc.splitTextToSize(report.input, 170);
            doc.setFontSize(10);
            doc.text(inputLines, 20, 55);
            
            doc.addPage();
            doc.setFontSize(12);
            doc.text('[생성된 보고서]', 20, 20);
            
            const outputLines = doc.splitTextToSize(report.output, 170);
            doc.setFontSize(10);
            doc.text(outputLines, 20, 30);
        });
        
        const filename = `보고서_모음_${Date.now()}.pdf`;
        doc.save(filename);
        
        UIUtils.showToast(`${reports.length}개의 보고서가 PDF로 다운로드되었습니다.`, 'success');
    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        UIUtils.showToast('PDF 내보내기에 실패했습니다.', 'error');
    }
}

// ===== 텍스트 내보내기 (다중) =====
function exportMultipleReportsText(reports) {
    try {
        let content = '';
        
        reports.forEach((report, index) => {
            const title = report.title || UIUtils.generateTitle(report.input, 50);
            const dateStr = UIUtils.formatDate(report.timestamp, true);
            
            content += `
========================================
보고서 #${index + 1}
제목: ${title}
날짜: ${dateStr}
========================================

[입력 내용]
${report.input}

========================================

[생성된 보고서]
${report.output}

========================================
\n\n`;
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
    
    title.textContent = reportTitle;
    
    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">📅 작성일시</div>
            <div class="detail-section-content">${dateStr}</div>
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
        
        ${report.notes ? `
        <div class="detail-section">
            <div class="detail-section-title">📝 메모</div>
            <div class="detail-section-content detail-note">${UIUtils.escapeHtml(report.notes)}</div>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <div class="detail-section-title">✍️ 입력 내용</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.input)}</div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">📋 생성된 보고서</div>
            <div class="detail-section-content">${UIUtils.escapeHtml(report.output)}</div>
        </div>
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
        exportReport(currentDetailReport.id, format);
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
