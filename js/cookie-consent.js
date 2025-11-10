/**
 * Cookie Consent Manager
 * GDPR/한국 개인정보보호법 준수를 위한 쿠키 동의 관리
 */

(function() {
    'use strict';
    
    const COOKIE_CONSENT_KEY = 'cookie_consent_status';
    const COOKIE_CONSENT_TIMESTAMP = 'cookie_consent_timestamp';
    const CONSENT_EXPIRY_DAYS = 365; // 1년
    
    // 쿠키 동의 상태 확인
    function getConsentStatus() {
        try {
            const status = localStorage.getItem(COOKIE_CONSENT_KEY);
            const timestamp = localStorage.getItem(COOKIE_CONSENT_TIMESTAMP);
            
            if (status && timestamp) {
                const consentDate = new Date(timestamp);
                const expiryDate = new Date(consentDate);
                expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
                
                // 만료 확인
                if (new Date() > expiryDate) {
                    return null; // 만료됨
                }
                
                return status; // 'accepted' 또는 'declined'
            }
            return null; // 아직 선택 안 함
        } catch (e) {
            console.error('Cookie consent status check failed:', e);
            return null;
        }
    }
    
    // 쿠키 동의 상태 저장
    function setConsentStatus(status) {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, status);
            localStorage.setItem(COOKIE_CONSENT_TIMESTAMP, new Date().toISOString());
            return true;
        } catch (e) {
            console.error('Failed to save cookie consent:', e);
            return false;
        }
    }
    
    // Google Analytics 활성화/비활성화
    function toggleGoogleAnalytics(enable) {
        if (typeof gtag === 'function') {
            if (enable) {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            } else {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        }
    }
    
    // 쿠키 배너 HTML 생성
    function createConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.id = 'cookieConsentBanner';
        banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-consent-text">
                    <div class="cookie-consent-title">🍪 쿠키 사용 안내</div>
                    <div class="cookie-consent-description">
                        이 사이트는 사용자 경험 개선과 광고 표시를 위해 쿠키를 사용합니다. 
                        쿠키 사용에 동의하시면 "동의" 버튼을 클릭해주세요.
                        자세한 내용은 <a href="privacy.html" target="_blank">개인정보 처리방침</a>을 확인해주세요.
                    </div>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-consent-btn cookie-consent-btn-accept" onclick="acceptCookies()">
                        ✓ 동의
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-decline" onclick="declineCookies()">
                        ✕ 거부
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-settings" onclick="window.location.href='privacy.html'">
                        설정
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // 페이드인 애니메이션
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }
    
    // 배너 숨기기
    function hideBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
    
    // 쿠키 동의
    window.acceptCookies = function() {
        setConsentStatus('accepted');
        toggleGoogleAnalytics(true);
        hideBanner();
        
        // 사용자 피드백
        console.log('쿠키 사용에 동의하셨습니다.');
    };
    
    // 쿠키 거부
    window.declineCookies = function() {
        setConsentStatus('declined');
        toggleGoogleAnalytics(false);
        hideBanner();
        
        // 사용자 피드백
        console.log('쿠키 사용을 거부하셨습니다. 일부 기능이 제한될 수 있습니다.');
    };
    
    // 페이지 로드 시 쿠키 배너 표시 여부 결정
    function initCookieConsent() {
        const consentStatus = getConsentStatus();
        
        if (consentStatus === null) {
            // 아직 선택하지 않음 → 배너 표시
            createConsentBanner();
        } else if (consentStatus === 'accepted') {
            // 이미 동의함 → Google Analytics 활성화
            toggleGoogleAnalytics(true);
        } else if (consentStatus === 'declined') {
            // 거부함 → Google Analytics 비활성화
            toggleGoogleAnalytics(false);
        }
    }
    
    // DOM 로드 완료 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
        initCookieConsent();
    }
})();
