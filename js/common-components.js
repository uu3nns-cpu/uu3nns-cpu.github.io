/**
 * Common header/footer renderer + theme controller
 */

const THEME_STORAGE_KEY = 'theme';

function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme, persist = true) {
    const normalized = theme === 'light' ? 'light' : 'dark';
    const root = document.documentElement;
    root.dataset.theme = normalized;
    root.style.colorScheme = normalized;

    document.body.classList.toggle('light-mode', normalized === 'light');

    if (persist) {
        localStorage.setItem(THEME_STORAGE_KEY, normalized);
    }

    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = normalized === 'light' ? '🌙' : '☀️';
        btn.title = normalized === 'light' ? '다크 모드' : '라이트 모드';
        btn.setAttribute('aria-label', btn.title);
    });
}

function initializeTheme() {
    applyTheme(getPreferredTheme(), false);
}

initializeTheme();

function getCommonHeaderTemplate() {
    const isGuidePage = window.location.pathname.includes('/guide/');
    const homeUrl = isGuidePage ? '../index.html' : 'index.html';
    const settingsUrl = isGuidePage ? '../settings.html' : 'settings.html';

    return `
        <div class="header-left">
            <button class="btn btn--icon theme-toggle" type="button" onclick="toggleTheme()" aria-label="테마 전환">☀️</button>
        </div>
        <div class="header-brand" onclick="window.location.href='${homeUrl}'" style="cursor: pointer;" title="홈으로 이동">
            <span class="brand-mark">RE:</span>
            <div class="brand-copy">
                <strong>간편해진 상담 보고서 작성</strong>
            </div>
        </div>
        <div class="header-controls">
            <a href="${settingsUrl}" class="btn btn--icon btn-settings" title="설정">⚙️</a>
        </div>
    `;
}

function getCommonFooterTemplate() {
    const isGuidePage = window.location.pathname.includes('/guide/');
    const base = isGuidePage ? '..' : '.';
    const currentYear = new Date().getFullYear();

    return `
        <footer class="common-footer">
            <div class="footer-content">
                <span class="footer-copy">Copyright © ${currentYear} 김도현. All Rights Reserved.</span>
                <span class="footer-divider">|</span>
                <div class="footer-links">
                    <a href="${base}/guide/index.html" class="footer-link">사용 안내서</a>
                    <a href="${base}/changelog.html" class="footer-link">업데이트 내역</a>
                    <a href="${base}/donate.html" class="footer-link">후원하기</a>
                    <a href="${base}/privacy.html" class="footer-link">개인정보 보호정책</a>
                    <a href="${base}/notice.html" class="footer-link">공지사항</a>
                    <a href="${base}/sitemap.html" class="footer-link">사이트맵</a>
                </div>
            </div>
        </footer>
    `;
}

function renderCommonHeader() {
    const headerElement = document.querySelector('.header, .settings-header, header');
    if (!headerElement || headerElement.dataset.rendered === 'true') {
        return;
    }
    headerElement.classList.add('header');
    headerElement.innerHTML = getCommonHeaderTemplate();
    headerElement.dataset.rendered = 'true';
    applyTheme(document.documentElement.dataset.theme || getPreferredTheme(), false);
}

function renderCommonFooter() {
    const existing = document.querySelector('.common-footer');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', getCommonFooterTemplate());
}

function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, true);
}

function loadTheme() {
    initializeTheme();
}

function toggleShortcutsModal() {
    const existingModal = document.getElementById('shortcutsModal');
    if (existingModal) {
        existingModal.remove();
        return;
    }

    const html = `
        <div class="shortcuts-modal" id="shortcutsModal" role="dialog" aria-modal="true" onclick="if(event.target.id === 'shortcutsModal') this.remove();">
            <div class="shortcuts-content glass-surface" onclick="event.stopPropagation();">
                <div class="shortcuts-header">
                    <h2>⌨️ 단축키 안내</h2>
                    <button type="button" onclick="document.getElementById('shortcutsModal').remove()">×</button>
                </div>
                <div class="shortcuts-list">
                    <div class="shortcut-row"><kbd>Ctrl + Enter</kbd><span>보고서 생성</span></div>
                    <div class="shortcut-row"><kbd>Ctrl + 1</kbd><span>Groq 결과 복사</span></div>
                    <div class="shortcut-row"><kbd>Ctrl + 2</kbd><span>GPT 결과 복사</span></div>
                    <div class="shortcut-row"><kbd>Ctrl + S</kbd><span>설정 저장</span></div>
                    <div class="shortcut-row"><kbd>Esc</kbd><span>모달 닫기</span></div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

function addFooterStyles() {
    return;
}
function initCommonComponents() {
    renderCommonHeader();
    renderCommonFooter();
    addFooterStyles();
    loadTheme();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonComponents);
} else {
    initCommonComponents();
}
