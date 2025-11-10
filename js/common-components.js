/**
 * 공통 Header/Footer 컴포넌트
 * 모든 페이지에서 동일한 Header/Footer를 렌더링
 */

// 공통 Header 템플릿 생성 함수
function getCommonHeaderTemplate() {
    // 현재 페이지가 가이드 폴더 내인지 확인
    const isGuidePage = window.location.pathname.includes('/guide/');
    const homeUrl = isGuidePage ? '../index.html' : 'index.html';
    
    return `
        <div class="header-left">
            <button class="btn btn--icon theme-toggle" onclick="toggleTheme()" title="라이트 모드">🌙</button>
            <button class="btn btn--icon btn-home" onclick="window.location.href='${homeUrl}'" title="대시보드">🏠</button>
        </div>
        <h1 onclick="window.location.href='${homeUrl}'" style="cursor: pointer; font-weight: 800; background: linear-gradient(45deg, #667eea 0%, #764ba2 50%, #667eea 100%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: hologram 3s linear infinite;" title="대시보드로 이동">RE: 간편해진 보고서 작성</h1>
        <div class="header-controls">
            <button class="btn btn--icon btn-shortcuts" onclick="toggleShortcutsModal()" title="키보드 단축키">⌨️</button>
            <a href="${isGuidePage ? '../settings.html' : 'settings.html'}" class="btn btn--icon btn-settings" title="설정">⚙️</a>
        </div>
    `;
}

// 공통 Footer 템플릿 생성 함수
function getCommonFooterTemplate() {
    // 현재 페이지가 가이드 폴더 내인지 확인
    const isGuidePage = window.location.pathname.includes('/guide/');
    const guideUrl = isGuidePage ? 'index.html' : 'guide.html';
    const changelogUrl = isGuidePage ? '../changelog.html' : 'changelog.html';
    const donateUrl = isGuidePage ? '../donate.html' : 'donate.html';
    const privacyUrl = isGuidePage ? '../privacy.html' : 'privacy.html';
    
    return `
        <footer class="common-footer" style="background: var(--bg-secondary); text-align: center; padding: 20px; border-top: 1px solid var(--border-color); color: var(--text-tertiary); font-size: 0.9em; margin-top: auto;">
            <p style="margin: 0; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 15px;">
                <a href="${guideUrl}" class="footer-link" style="color: var(--text-tertiary); text-decoration: none; transition: color 0.2s;">사용 안내서</a>
                <span style="color: var(--border-color);">│</span>
                <a href="${changelogUrl}" class="footer-link" style="color: var(--text-tertiary); text-decoration: none; transition: color 0.2s;">업데이트 내역</a>
                <span style="color: var(--border-color);">│</span>
                <a href="${donateUrl}" class="footer-link" style="color: var(--text-tertiary); text-decoration: none; transition: color 0.2s;">후원하기</a>
                <span style="color: var(--border-color);">│</span>
                <a href="${privacyUrl}" class="footer-link" style="color: var(--text-tertiary); text-decoration: none; transition: color 0.2s;">개인정보처리방침</a>
                <span style="color: var(--border-color);">│</span>
                <span style="color: var(--text-quaternary); font-size: 0.95em;">Copyright © 2025 김도현. All Rights Reserved.</span>
            </p>
        </footer>
    `;
}

/**
 * 공통 Header 렌더링
 */
function renderCommonHeader() {
    const headerElement = document.querySelector('.header, .settings-header, header');
    if (!headerElement) {
        console.warn('Header element not found');
        return;
    }
    
    // Header가 비어있는 경우에만 렌더링 (중복 방지)
    if (headerElement.innerHTML.trim() === '') {
        headerElement.className = 'header'; // 클래스 통일
        headerElement.innerHTML = getCommonHeaderTemplate();
    }
}

/**
 * 공통 Footer 렌더링
 */
function renderCommonFooter() {
    // 기존 footer가 있으면 제거
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
        existingFooter.remove();
    }
    
    // body 끝에 footer 추가
    document.body.insertAdjacentHTML('beforeend', getCommonFooterTemplate());
}

/**
 * 테마 토글 함수
 */
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        if (themeToggle) {
            themeToggle.textContent = '🌙';
            themeToggle.title = '다크 모드';
        }
    } else {
        localStorage.setItem('theme', 'dark');
        if (themeToggle) {
            themeToggle.textContent = '☀️';
            themeToggle.title = '라이트 모드';
        }
    }
}

/**
 * 테마 로드
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) {
            themeToggle.textContent = '🌙';
            themeToggle.title = '다크 모드';
        }
    } else {
        if (themeToggle) {
            themeToggle.textContent = '☀️';
            themeToggle.title = '라이트 모드';
        }
    }
}

/**
 * 단축키 모달 표시
 */
function toggleShortcutsModal() {
    const existingModal = document.getElementById('shortcutsModal');
    if (existingModal) {
        existingModal.remove();
        return;
    }
    
    const html = `
        <div class="shortcuts-modal" id="shortcutsModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="if(event.target.id === 'shortcutsModal') this.remove();">
            <div class="shortcuts-content" style="background: var(--bg-secondary); border-radius: 12px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" onclick="event.stopPropagation();">
                <div class="shortcuts-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 15px;">
                    <h2 style="font-size: 1.5em; color: var(--text-primary); margin: 0;">⌨️ 키보드 단축키</h2>
                    <button onclick="document.getElementById('shortcutsModal').remove()" style="background: none; border: none; font-size: 1.5em; color: var(--text-tertiary); cursor: pointer; padding: 5px 10px;">✕</button>
                </div>
                <div class="shortcuts-list" style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+S</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">설정 열기/닫기</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+Enter</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">보고서 작성</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+1</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">Groq 결과 복사</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+2</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">GPT 결과 복사</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+N</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">새 보고서 (초기화)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Escape</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">모달/패널 닫기</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+/</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">단축키 도움말</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Footer 링크 호버 스타일 추가
 */
function addFooterStyles() {
    const styleId = 'footer-hover-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .common-footer .footer-link:hover {
            color: var(--accent-primary) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 페이지 로드 시 초기화
 */
function initCommonComponents() {
    renderCommonHeader();
    renderCommonFooter();
    addFooterStyles();
    loadTheme();
}

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonComponents);
} else {
    // 이미 로드된 경우
    initCommonComponents();
}
