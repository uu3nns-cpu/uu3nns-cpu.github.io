/**
 * Usage Counter - Single Source of Truth (SSOT)
 * 중앙 집중식 사용량 관리 시스템
 * 
 * 모든 사용량 카운트를 한 곳에서 관리하여 race condition 방지
 */

(function(window) {
    'use strict';
    
    console.log('[UsageCore] 로딩 시작...');
    
    const STORAGE_KEY = 'report_usage_data';
    const MAX_DAILY_USAGE = 30;
    
    // 내부 상태
    let state = {
        date: getTodayDate(),
        count: 0,
        history: []
    };
    
    // 변경 감지 리스너들
    const listeners = [];
    
    /**
     * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
     */
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * localStorage에서 데이터 로드
     */
    function loadFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                console.log('[UsageCore] 저장된 데이터 없음 - 초기 상태 사용');
                return {
                    date: getTodayDate(),
                    count: 0,
                    history: []
                };
            }
            
            const parsed = JSON.parse(data);
            const today = getTodayDate();
            
            // 날짜가 다르면 초기화
            if (parsed.date !== today) {
                console.log('[UsageCore] 날짜 변경 감지 - 카운트 초기화', parsed.date, '->', today);
                return {
                    date: today,
                    count: 0,
                    history: []
                };
            }
            
            console.log('[UsageCore] 저장된 데이터 로드:', parsed);
            return parsed;
        } catch (error) {
            console.error('[UsageCore] 데이터 로드 실패:', error);
            return {
                date: getTodayDate(),
                count: 0,
                history: []
            };
        }
    }
    
    /**
     * localStorage에 데이터 저장
     */
    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            console.log('[UsageCore] 데이터 저장 완료:', state);
        } catch (error) {
            console.error('[UsageCore] 데이터 저장 실패:', error);
        }
    }
    
    /**
     * 모든 리스너에게 변경 알림
     */
    function notifyListeners() {
        console.log('[UsageCore] 리스너 알림:', listeners.length, '개');
        listeners.forEach(callback => {
            try {
                callback(state.count, MAX_DAILY_USAGE - state.count);
            } catch (error) {
                console.error('[UsageCore] 리스너 실행 오류:', error);
            }
        });
    }
    
    /**
     * 자정에 자동 초기화 스케줄링
     */
    function scheduleMidnightReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow - now;
        
        console.log('[UsageCore] 자정 초기화 예약:', Math.round(msUntilMidnight / 1000 / 60), '분 후');
        
        setTimeout(function() {
            console.log('[UsageCore] 자정 - 사용량 자동 초기화');
            state = {
                date: getTodayDate(),
                count: 0,
                history: []
            };
            saveToStorage();
            notifyListeners();
            scheduleMidnightReset(); // 다음 자정 예약
        }, msUntilMidnight);
    }
    
    // Public API
    const UsageCounter = {
        /**
         * 초기화
         */
        init: function() {
            console.log('[UsageCore] 초기화 시작...');
            
            // localStorage에서 데이터 로드
            state = loadFromStorage();
            
            console.log('[UsageCore] 로드된 상태:', {
                date: state.date,
                count: state.count,
                historyLength: state.history.length
            });
            
            // 자정 리셋 스케줄링
            scheduleMidnightReset();
            
            console.log('[UsageCore] 초기화 완료 - 현재 카운트:', state.count, '/', MAX_DAILY_USAGE);
            
            return this;
        },
        
        /**
         * 사용량 증가
         * @param {string} reason - 증가 이유 (로깅용)
         * @returns {number} - 증가 후 카운트
         */
        increment: function(reason) {
            const before = state.count;
            
            // 날짜 확인 (자정 넘어간 경우 대비)
            const today = getTodayDate();
            if (state.date !== today) {
                console.log('[UsageCore] 날짜 변경 감지 - 카운트 초기화');
                state = {
                    date: today,
                    count: 0,
                    history: []
                };
            }
            
            // 카운트 증가
            state.count += 1;
            state.history.push({
                timestamp: new Date().toISOString(),
                reason: reason || 'unknown'
            });
            
            console.log('[UsageCore] 카운트 증가:', before, '->', state.count, '(이유:', reason, ')');
            
            // 저장 및 알림
            saveToStorage();
            notifyListeners();
            
            return state.count;
        },
        
        /**
         * 현재 카운트 조회
         * @returns {number}
         */
        getCount: function() {
            return state.count;
        },
        
        /**
         * 남은 사용 가능 횟수
         * @returns {number}
         */
        getRemaining: function() {
            return Math.max(0, MAX_DAILY_USAGE - state.count);
        },
        
        /**
         * 사용 가능 여부
         * @returns {boolean}
         */
        canGenerate: function() {
            return this.getRemaining() > 0;
        },
        
        /**
         * 변경 감지 리스너 등록
         * @param {Function} callback - (count, remaining) => void
         */
        onChange: function(callback) {
            if (typeof callback === 'function') {
                listeners.push(callback);
                console.log('[UsageCore] 리스너 등록 완료 - 총', listeners.length, '개');
                
                // 즉시 현재 상태 알림 (동기적 실행)
                try {
                    const currentRemaining = this.getRemaining();
                    console.log('[UsageCore] 리스너에게 즉시 알림:', state.count, '/', currentRemaining);
                    callback(state.count, currentRemaining);
                } catch (error) {
                    console.error('[UsageCore] 리스너 즉시 실행 오류:', error);
                }
            }
        },
        
        /**
         * 초기화 (테스트용)
         */
        reset: function() {
            console.log('[UsageCore] 수동 초기화');
            state = {
                date: getTodayDate(),
                count: 0,
                history: []
            };
            saveToStorage();
            notifyListeners();
        },
        
        /**
         * 현재 상태 조회
         */
        getState: function() {
            return Object.assign({}, state);
        }
    };
    
    // 전역 노출
    window.UsageCounter = UsageCounter;
    
    console.log('[UsageCore] 로딩 완료 - window.UsageCounter 사용 가능');
    
})(window);
