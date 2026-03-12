/**
 * 보고서 데이터 관리자 (Report Data Manager)
 * Single Source of Truth for localStorage operations
 * 
 * 목적:
 * - localStorage CRUD 전담
 * - 보고서 데이터 구조 검증 및 마이그레이션
 * - 중복 코드 제거 및 유지보수성 향상
 * 
 * @author 김도현
 * @since 2025-01-10
 */

const ReportDataManager = (function() {
    'use strict';
    
    // ===== 상수 =====
    const STORAGE_KEY = 'saved_counseling_reports';
    const MAX_REPORTS = 50;
    
    // ===== Private Methods =====
    
    /**
     * 보고서 데이터 검증 및 마이그레이션
     * @param {Array} reports - 원본 보고서 배열
     * @returns {Array} - 검증 및 마이그레이션된 보고서 배열
     */
    function validateAndMigrate(reports) {
        if (!Array.isArray(reports)) {
            console.warn('Invalid reports data, returning empty array');
            return [];
        }
        
        return reports.map(report => {
            // 기본 필드 확인
            if (!report.id || !report.timestamp) {
                console.warn('Invalid report structure:', report);
                return null;
            }
            
            // 호환성 처리: output 필드가 없으면 groqOutput/gptOutput에서 가져오기
            if (!report.output && (report.groqOutput || report.gptOutput)) {
                report.output = report.groqOutput || report.gptOutput || '';
            }
            
            // 기본값 설정
            return {
                id: report.id,
                timestamp: report.timestamp,
                displayDate: report.displayDate || '',  // 기본값 제거
                title: report.title || '',
                input: report.input || '',
                output: report.output || '',
                groqOutput: report.groqOutput || '',
                gptOutput: report.gptOutput || '',
                settings: report.settings || {},
                
                // 상담 일시 필드
                counselingDateTime: report.counselingDateTime || '',
                
                // Phase 2 필드
                isFavorite: report.isFavorite || false,
                tags: report.tags || [],
                notes: report.notes || '',
                isDeleted: report.isDeleted || false,
                deletedAt: report.deletedAt || null
            };
        }).filter(report => report !== null);
    }
    
    /**
     * 제목 자동 생성
     * @param {string} input - 입력 텍스트
     * @returns {string} - 생성된 제목
     */
    function generateTitle(input) {
        const cleaned = input.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        let title = cleaned.substring(0, 30);
        if (cleaned.length > 30) {
            title += '...';
        }
        if (!title) {
            const now = new Date();
            title = `보고서 ${now.getMonth() + 1}/${now.getDate()}`;
        }
        return title;
    }
    
    // ===== Public API =====
    
    return {
        /**
         * 전체 보고서 로드
         * @returns {Array} - 보고서 배열
         */
        loadReports() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                const reports = stored ? JSON.parse(stored) : [];
                return validateAndMigrate(reports);
            } catch (error) {
                console.error('Failed to load reports:', error);
                return [];
            }
        },
        
        /**
         * 전체 보고서 저장
         * @param {Array} reports - 보고서 배열
         * @returns {boolean} - 성공 여부
         */
        saveReports(reports) {
            try {
                // 최대 개수 제한
                const limited = reports.slice(0, MAX_REPORTS);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
                return true;
            } catch (error) {
                console.error('Failed to save reports:', error);
                return false;
            }
        },
        
        /**
         * 단일 보고서 저장 (신규)
         * @param {Object} reportData - 보고서 데이터
         * @returns {number|null} - 저장된 보고서 ID 또는 null
         */
        saveReport(reportData) {
            try {
                const reports = this.loadReports();
                
                // ID 생성
                const newId = Date.now();
                
                // 제목 자동 생성
                const title = reportData.title || generateTitle(reportData.input);
                
                const newReport = {
                    id: newId,
                    timestamp: new Date().toISOString(),
                    displayDate: reportData.displayDate || '',  // 기본값 없음, 사용자 입력 필요
                    title: title,
                    input: reportData.input || '',
                    output: reportData.output || '',
                    groqOutput: reportData.groqOutput || '',
                    gptOutput: reportData.gptOutput || '',
                    settings: reportData.settings || {},
                    counselingDateTime: reportData.counselingDateTime || '',
                    isFavorite: false,
                    tags: [],
                    notes: '',
                    isDeleted: false,
                    deletedAt: null
                };
                
                // 맨 앞에 추가 (최신 보고서)
                reports.unshift(newReport);
                
                // 저장
                if (this.saveReports(reports)) {
                    return newId;
                }
                return null;
            } catch (error) {
                console.error('Failed to save report:', error);
                return null;
            }
        },
        
        /**
         * 보고서 업데이트
         * @param {number} reportId - 보고서 ID
         * @param {Object} updates - 업데이트할 필드들
         * @returns {boolean} - 성공 여부
         */
        updateReport(reportId, updates) {
            try {
                const reports = this.loadReports();
                const index = reports.findIndex(r => r.id === reportId);
                
                if (index === -1) {
                    console.warn('Report not found:', reportId);
                    return false;
                }
                
                // 업데이트
                reports[index] = { ...reports[index], ...updates };
                
                return this.saveReports(reports);
            } catch (error) {
                console.error('Failed to update report:', error);
                return false;
            }
        },
        
        /**
         * 보고서 삭제 (소프트/하드)
         * @param {number} reportId - 보고서 ID
         * @param {boolean} permanent - 영구 삭제 여부 (기본: false)
         * @returns {boolean} - 성공 여부
         */
        deleteReport(reportId, permanent = false) {
            try {
                let reports = this.loadReports();
                
                if (permanent) {
                    // 하드 삭제
                    reports = reports.filter(r => r.id !== reportId);
                } else {
                    // 소프트 삭제
                    const index = reports.findIndex(r => r.id === reportId);
                    if (index === -1) {
                        console.warn('Report not found:', reportId);
                        return false;
                    }
                    
                    reports[index].isDeleted = true;
                    reports[index].deletedAt = new Date().toISOString();
                }
                
                return this.saveReports(reports);
            } catch (error) {
                console.error('Failed to delete report:', error);
                return false;
            }
        },
        
        /**
         * 다중 보고서 삭제
         * @param {Array} reportIds - 보고서 ID 배열
         * @param {boolean} permanent - 영구 삭제 여부
         * @returns {boolean} - 성공 여부
         */
        deleteMultiple(reportIds, permanent = false) {
            try {
                let reports = this.loadReports();
                
                if (permanent) {
                    // 하드 삭제
                    reports = reports.filter(r => !reportIds.includes(r.id));
                } else {
                    // 소프트 삭제
                    reportIds.forEach(id => {
                        const index = reports.findIndex(r => r.id === id);
                        if (index !== -1) {
                            reports[index].isDeleted = true;
                            reports[index].deletedAt = new Date().toISOString();
                        }
                    });
                }
                
                return this.saveReports(reports);
            } catch (error) {
                console.error('Failed to delete multiple reports:', error);
                return false;
            }
        },
        
        /**
         * 보고서 복원
         * @param {number} reportId - 보고서 ID
         * @returns {boolean} - 성공 여부
         */
        restoreReport(reportId) {
            return this.updateReport(reportId, {
                isDeleted: false,
                deletedAt: null
            });
        },
        
        /**
         * 휴지통 비우기 (모든 삭제된 보고서 영구 삭제)
         * @returns {boolean} - 성공 여부
         */
        emptyTrash() {
            try {
                const reports = this.loadReports();
                const activeReports = reports.filter(r => !r.isDeleted);
                return this.saveReports(activeReports);
            } catch (error) {
                console.error('Failed to empty trash:', error);
                return false;
            }
        },
        
        /**
         * 특정 보고서 찾기
         * @param {number} reportId - 보고서 ID
         * @returns {Object|null} - 보고서 또는 null
         */
        findReport(reportId) {
            const reports = this.loadReports();
            return reports.find(r => r.id === reportId) || null;
        },
        
        /**
         * 보고서 복사
         * @param {number} reportId - 복사할 보고서 ID
         * @returns {number|null} - 새 보고서 ID 또는 null
         */
        duplicateReport(reportId) {
            try {
                const reports = this.loadReports();
                const original = reports.find(r => r.id === reportId);
                
                if (!original) {
                    console.warn('Report not found:', reportId);
                    return null;
                }
                
                // 새 ID 생성
                const maxId = Math.max(...reports.map(r => r.id), 0);
                const newId = maxId + 1;
                
                // 복사본 생성
                const duplicate = {
                    ...original,
                    id: newId,
                    timestamp: new Date().toISOString(),
                    displayDate: new Date().toLocaleString('ko-KR'),
                    title: (original.title || generateTitle(original.input)) + ' (사본)',
                    isDeleted: false,
                    deletedAt: null
                };
                
                // 맨 앞에 추가
                reports.unshift(duplicate);
                
                if (this.saveReports(reports)) {
                    return newId;
                }
                return null;
            } catch (error) {
                console.error('Failed to duplicate report:', error);
                return null;
            }
        },
        
        /**
         * 검색
         * @param {string} keyword - 검색어
         * @returns {Array} - 검색 결과
         */
        search(keyword) {
            if (!keyword || !keyword.trim()) {
                return this.loadReports();
            }
            
            const reports = this.loadReports();
            const lowerKeyword = keyword.toLowerCase();
            
            return reports.filter(report => {
                return (report.title && report.title.toLowerCase().includes(lowerKeyword)) ||
                       (report.input && report.input.toLowerCase().includes(lowerKeyword)) ||
                       (report.output && report.output.toLowerCase().includes(lowerKeyword)) ||
                       (report.displayDate && report.displayDate.includes(keyword));
            });
        },
        
        /**
         * 통계 정보 반환
         * @returns {Object} - 통계 객체
         */
        getStats() {
            const reports = this.loadReports();
            
            return {
                total: reports.length,
                active: reports.filter(r => !r.isDeleted).length,
                deleted: reports.filter(r => r.isDeleted).length,
                favorites: reports.filter(r => r.isFavorite && !r.isDeleted).length
            };
        }
    };
})();

// CommonJS/Node.js 호환
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportDataManager;
}
