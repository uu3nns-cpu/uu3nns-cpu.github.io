/**
 * 통합 에러 핸들러
 * 모든 에러를 일관된 방식으로 처리하고 표시
 */

/**
 * 에러 타입 정의
 */
const ErrorType = {
    VALIDATION: 'validation',
    API: 'api',
    STORAGE: 'storage',
    NETWORK: 'network',
    SYSTEM: 'system'
};

/**
 * 에러 심각도 정의
 */
const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * 통합 에러 핸들러 클래스
 */
class ErrorHandler {
    /**
     * 에러 처리 및 사용자에게 표시
     * @param {Error|string} error - 에러 객체 또는 메시지
     * @param {string} type - 에러 타입 (ErrorType 중 하나)
     * @param {string} severity - 에러 심각도 (ErrorSeverity 중 하나)
     * @param {Object} context - 추가 컨텍스트 정보
     * @returns {void}
     */
    static handle(error, type = ErrorType.SYSTEM, severity = ErrorSeverity.ERROR, context = {}) {
        // 콘솔에 상세 로그 출력
        this.logError(error, type, severity, context);
        
        // 사용자에게 적절한 메시지 표시
        const userMessage = this.getUserMessage(error, type);
        this.displayError(userMessage, severity);
        
        // 심각한 에러의 경우 추가 처리
        if (severity === ErrorSeverity.CRITICAL) {
            this.handleCriticalError(error, context);
        }
    }
    
    /**
     * 콘솔에 에러 로그 출력
     * @param {Error|string} error - 에러
     * @param {string} type - 에러 타입
     * @param {string} severity - 심각도
     * @param {Object} context - 컨텍스트
     * @private
     */
    static logError(error, type, severity, context) {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : '';
        
        console.group(`🔴 [${severity.toUpperCase()}] ${type} Error - ${timestamp}`);
        console.error('Message:', errorMessage);
        if (stack) console.error('Stack:', stack);
        if (Object.keys(context).length > 0) console.error('Context:', context);
        console.groupEnd();
    }
    
    /**
     * 사용자 친화적인 에러 메시지 생성
     * @param {Error|string} error - 에러
     * @param {string} type - 에러 타입
     * @returns {string} 사용자용 메시지
     * @private
     */
    static getUserMessage(error, type) {
        const errorMessage = error instanceof Error ? error.message : error;
        
        // API 에러 특별 처리
        if (type === ErrorType.API) {
            if (errorMessage.includes('401')) {
                return 'API 키가 유효하지 않습니다. 설정에서 API 키를 확인해주세요.';
            }
            if (errorMessage.includes('429')) {
                return 'API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
            }
            if (errorMessage.includes('402')) {
                return 'API 크레딧이 부족합니다. 크레딧을 충전해주세요.';
            }
            if (errorMessage.includes('500') || errorMessage.includes('503')) {
                return 'API 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
            }
            return `API 오류: ${errorMessage}`;
        }
        
        // 저장소 에러
        if (type === ErrorType.STORAGE) {
            if (errorMessage.includes('quota')) {
                return '저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.';
            }
            return '데이터 저장 중 오류가 발생했습니다.';
        }
        
        // 네트워크 에러
        if (type === ErrorType.NETWORK) {
            return '네트워크 연결을 확인해주세요.';
        }
        
        // 검증 에러
        if (type === ErrorType.VALIDATION) {
            return errorMessage; // 검증 메시지는 그대로 표시
        }
        
        // 기본 에러 메시지
        return errorMessage || '알 수 없는 오류가 발생했습니다.';
    }
    
    /**
     * 사용자에게 에러 표시
     * @param {string} message - 표시할 메시지
     * @param {string} severity - 심각도
     * @private
     */
    static displayError(message, severity) {
        // showError 함수가 있으면 사용
        if (typeof showError === 'function') {
            showError(message);
            return;
        }
        
        // showToast 함수가 있으면 사용
        if (typeof showToast === 'function') {
            const duration = severity === ErrorSeverity.CRITICAL ? 5000 : 3000;
            showToast(`⚠️ ${message}`, duration);
            return;
        }
        
        // DOM 직접 업데이트
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('active');
            
            const duration = severity === ErrorSeverity.CRITICAL ? 5000 : 3000;
            setTimeout(() => {
                errorDiv.classList.remove('active');
            }, duration);
            return;
        }
        
        // 마지막 수단: alert
        console.warn('에러 표시 UI를 찾을 수 없어 alert 사용:', message);
        alert(message);
    }
    
    /**
     * 심각한 에러 처리
     * @param {Error|string} error - 에러
     * @param {Object} context - 컨텍스트
     * @private
     */
    static handleCriticalError(error, context) {
        // 에러 정보를 localStorage에 저장 (디버깅용)
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : '',
                context: context
            };
            
            const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            existingLogs.unshift(errorLog);
            
            // 최대 10개까지만 보관
            if (existingLogs.length > 10) {
                existingLogs.length = 10;
            }
            
            localStorage.setItem('error_logs', JSON.stringify(existingLogs));
        } catch (e) {
            console.error('에러 로그 저장 실패:', e);
        }
    }
    
    /**
     * API 에러 처리 헬퍼
     * @param {Error} error - API 에러
     * @param {string} apiName - API 이름 (예: 'Groq', 'GPT')
     * @param {Object} context - 추가 컨텍스트
     */
    static handleApiError(error, apiName = 'API', context = {}) {
        const enhancedContext = {
            ...context,
            apiName: apiName,
            timestamp: new Date().toISOString()
        };
        
        this.handle(
            error,
            ErrorType.API,
            ErrorSeverity.ERROR,
            enhancedContext
        );
    }
    
    /**
     * 검증 에러 처리 헬퍼
     * @param {string} message - 검증 에러 메시지
     * @param {string} fieldId - 에러가 발생한 필드 ID (옵션)
     */
    static handleValidationError(message, fieldId = null) {
        this.handle(
            message,
            ErrorType.VALIDATION,
            ErrorSeverity.WARNING
        );
        
        // 필드에 에러 표시
        if (fieldId) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('error');
                setTimeout(() => {
                    field.classList.remove('error');
                }, 3000);
            }
        }
    }
    
    /**
     * 저장소 에러 처리 헬퍼
     * @param {Error} error - 저장소 에러
     * @param {string} operation - 작업 종류 (예: 'save', 'load', 'delete')
     */
    static handleStorageError(error, operation = 'unknown') {
        this.handle(
            error,
            ErrorType.STORAGE,
            ErrorSeverity.ERROR,
            { operation }
        );
    }
    
    /**
     * 네트워크 에러 처리 헬퍼
     * @param {Error} error - 네트워크 에러
     * @param {string} url - 요청 URL (옵션)
     */
    static handleNetworkError(error, url = null) {
        this.handle(
            error,
            ErrorType.NETWORK,
            ErrorSeverity.ERROR,
            { url }
        );
    }
    
    /**
     * 저장된 에러 로그 가져오기 (디버깅용)
     * @returns {Array} 에러 로그 배열
     */
    static getErrorLogs() {
        try {
            return JSON.parse(localStorage.getItem('error_logs') || '[]');
        } catch (e) {
            console.error('에러 로그 읽기 실패:', e);
            return [];
        }
    }
    
    /**
     * 에러 로그 초기화
     */
    static clearErrorLogs() {
        try {
            localStorage.removeItem('error_logs');
            console.log('에러 로그가 초기화되었습니다.');
        } catch (e) {
            console.error('에러 로그 초기화 실패:', e);
        }
    }
}

/**
 * 전역 에러 핸들러 설정
 */
window.addEventListener('error', function(event) {
    ErrorHandler.handle(
        event.error || event.message,
        ErrorType.SYSTEM,
        ErrorSeverity.CRITICAL,
        {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }
    );
});

/**
 * Promise rejection 핸들러 설정
 */
window.addEventListener('unhandledrejection', function(event) {
    ErrorHandler.handle(
        event.reason,
        ErrorType.SYSTEM,
        ErrorSeverity.CRITICAL,
        { type: 'unhandled_promise_rejection' }
    );
});
