/**
 * UI 유틸리티 (UI Utilities)
 * 공통 UI 관련 함수 모음
 * 
 * 목적:
 * - Toast 알림 통합
 * - HTML 이스케이프
 * - 날짜 포맷팅
 * - 중복 코드 제거
 * 
 * @author 김도현
 * @since 2025-01-10
 */

const UIUtils = (function() {
    'use strict';
    
    // ===== Private Variables =====
    let toastElement = null;
    let toastTimer = null;
    
    // ===== Private Methods =====
    
    /**
     * Toast 엘리먼트 초기화
     */
    function initToast() {
        if (!toastElement) {
            toastElement = document.getElementById('toast');
            
            // toast 엘리먼트가 없으면 생성
            if (!toastElement) {
                toastElement = document.createElement('div');
                toastElement.id = 'toast';
                toastElement.className = 'toast';
                document.body.appendChild(toastElement);
            }
        }
    }
    
    // ===== Public API =====
    
    return {
        /**
         * Toast 알림 표시
         * @param {string} message - 메시지
         * @param {string} type - 타입 (success, error, info, warning)
         * @param {number} duration - 표시 시간 (ms, 기본: 3000)
         */
        showToast(message, type = 'success', duration = 3000) {
            initToast();
            
            if (!toastElement) {
                console.warn('Toast element not found');
                return;
            }
            
            // 기존 타이머 클리어
            if (toastTimer) {
                clearTimeout(toastTimer);
                toastTimer = null;
            }
            
            // 메시지 설정
            toastElement.textContent = message;
            toastElement.className = `toast show ${type}`;
            
            // 자동 숨김
            toastTimer = setTimeout(() => {
                toastElement.classList.remove('show');
                toastTimer = null;
            }, duration);
        },
        
        /**
         * HTML 이스케이프
         * @param {string} text - 원본 텍스트
         * @returns {string} - 이스케이프된 텍스트
         */
        escapeHtml(text) {
            if (typeof text !== 'string') return '';
            
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * 날짜 포맷팅 (한국어)
         * @param {Date|string} date - Date 객체 또는 ISO 문자열
         * @param {boolean} includeTime - 시간 포함 여부 (기본: true)
         * @returns {string} - 포맷된 날짜 문자열
         */
        formatDate(date, includeTime = true) {
            const d = typeof date === 'string' ? new Date(date) : date;
            
            if (!(d instanceof Date) || isNaN(d)) {
                return '';
            }
            
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            
            if (!includeTime) {
                return `${year}.${month}.${day}`;
            }
            
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            
            return `${year}.${month}.${day} ${hours}:${minutes}`;
        },
        
        /**
         * 제목 생성 (입력 텍스트에서)
         * @param {string} content - 입력 내용
         * @param {number} maxLength - 최대 길이 (기본: 30)
         * @returns {string} - 생성된 제목
         */
        generateTitle(content, maxLength = 30) {
            const cleaned = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            let title = cleaned.substring(0, maxLength);
            
            if (cleaned.length > maxLength) {
                title += '...';
            }
            
            if (!title) {
                const now = new Date();
                title = `보고서 ${now.getMonth() + 1}/${now.getDate()}`;
            }
            
            return title;
        },
        
        /**
         * 문자열 자르기 (말줄임표 추가)
         * @param {string} text - 원본 텍스트
         * @param {number} maxLength - 최대 길이
         * @returns {string} - 자른 텍스트
         */
        truncate(text, maxLength) {
            if (!text || text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength) + '...';
        },
        
        /**
         * 파일명 안전하게 만들기
         * @param {string} filename - 원본 파일명
         * @returns {string} - 안전한 파일명
         */
        sanitizeFilename(filename) {
            return filename.replace(/[^a-zA-Z0-9가-힣\s\-_]/g, '_');
        },
        
        /**
         * 상대 시간 표시 (예: "방금 전", "3분 전")
         * @param {Date|string} date - 날짜
         * @returns {string} - 상대 시간 문자열
         */
        getRelativeTime(date) {
            const d = typeof date === 'string' ? new Date(date) : date;
            
            if (!(d instanceof Date) || isNaN(d)) {
                return '';
            }
            
            const now = new Date();
            const diffMs = now - d;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);
            
            if (diffSec < 60) return '방금 전';
            if (diffMin < 60) return `${diffMin}분 전`;
            if (diffHour < 24) return `${diffHour}시간 전`;
            if (diffDay < 7) return `${diffDay}일 전`;
            
            return this.formatDate(d, false);
        },
        
        /**
         * 확인 대화상자 (커스텀)
         * @param {string} message - 메시지
         * @param {string} confirmText - 확인 버튼 텍스트 (기본: "확인")
         * @param {string} cancelText - 취소 버튼 텍스트 (기본: "취소")
         * @returns {Promise<boolean>} - 확인 여부
         */
        async confirm(message, confirmText = '확인', cancelText = '취소') {
            // 간단한 구현: 네이티브 confirm 사용
            // 추후 커스텀 모달로 교체 가능
            return window.confirm(message);
        },
        
        /**
         * 입력 대화상자 (커스텀)
         * @param {string} message - 메시지
         * @param {string} defaultValue - 기본값
         * @returns {Promise<string|null>} - 입력값 또는 null (취소)
         */
        async prompt(message, defaultValue = '') {
            // 간단한 구현: 네이티브 prompt 사용
            // 추후 커스텀 모달로 교체 가능
            return window.prompt(message, defaultValue);
        },
        
        /**
         * 로딩 인디케이터 표시/숨김
         * @param {boolean} show - 표시 여부
         * @param {string} elementId - 엘리먼트 ID (선택)
         */
        toggleLoading(show, elementId = 'loadingIndicator') {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = show ? 'block' : 'none';
            }
        },
        
        /**
         * 스크롤을 최상단으로
         * @param {boolean} smooth - 부드러운 스크롤 여부 (기본: true)
         */
        scrollToTop(smooth = true) {
            window.scrollTo({
                top: 0,
                behavior: smooth ? 'smooth' : 'auto'
            });
        },
        
        /**
         * 클립보드에 복사
         * @param {string} text - 복사할 텍스트
         * @returns {Promise<boolean>} - 성공 여부
         */
        async copyToClipboard(text) {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // 폴백: textarea 사용
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    const success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return success;
                }
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                return false;
            }
        }
    };
})();

// 전역 호환성을 위한 showToast 함수 (레거시 지원)
function showToast(message, type = 'success', duration = 3000) {
    // type이 숫자인 경우 (레거시: showToast(message, duration))
    if (typeof type === 'number') {
        duration = type;
        type = 'success';
    }
    
    UIUtils.showToast(message, type, duration);
}

// CommonJS/Node.js 호환
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
}
