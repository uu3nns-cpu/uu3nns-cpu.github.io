/**
 * 마크다운 렌더링 시스템
 * - 결과창에 마크다운 스타일 지원
 * - 제목, 강조, 목록, 코드 블록 등 렌더링
 */

/**
 * 마크다운 텍스트를 HTML로 변환
 */
function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // 1. 코드 블록 (```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const language = lang || 'text';
        return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // 2. 인라인 코드 (`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 3. 볼드 + 이탤릭 (***text***)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    
    // 4. 볼드 (**text**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // 5. 이탤릭 (*text* 또는 _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // 6. 취소선 (~~text~~)
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    
    // 7. 제목 (# ~ ######)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // 8. 순서 없는 목록 (-, *, +)
    html = html.replace(/^[\-\*\+]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // 9. 순서 있는 목록 (1., 2., ...)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, function(match) {
        // 이미 <ul>로 감싸져 있지 않은 경우만 <ol>로 감싸기
        if (!match.includes('<ul>')) {
            return '<ol>' + match + '</ol>';
        }
        return match;
    });
    
    // 10. 인용구 (>)
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // 11. 수평선 (---, ***, ___)
    html = html.replace(/^[\-\*_]{3,}$/gm, '<hr>');
    
    // 12. 링크 [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // 13. 줄바꿈 처리 (두 개의 공백 + \n 또는 \n\n)
    html = html.replace(/  \n/g, '<br>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // 14. 단락으로 감싸기
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 출력 영역에 마크다운 렌더링 적용
 */
function applyMarkdownRendering(outputId) {
    const outputDiv = document.getElementById(outputId);
    if (!outputDiv) return;
    
    const rawText = outputDiv.getAttribute('data-raw-text') || outputDiv.textContent;
    
    // 원본 텍스트 저장 (복사 기능을 위해)
    if (!outputDiv.getAttribute('data-raw-text')) {
        outputDiv.setAttribute('data-raw-text', rawText);
    }
    
    // 마크다운 렌더링
    const html = renderMarkdown(rawText);
    outputDiv.innerHTML = html;
    
    // 마크다운 스타일 클래스 추가
    outputDiv.classList.add('markdown-rendered');
}

/**
 * 모든 출력 영역에 마크다운 렌더링 적용
 */
function renderAllMarkdown() {
    const outputIds = [
        'groqOutput',
        'gptOutput',
        'groqOutputCompare',
        'gptOutputCompare'
    ];
    
    outputIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem && elem.textContent.trim()) {
            applyMarkdownRendering(id);
        }
    });
}

/**
 * 복사 기능을 위한 원본 텍스트 반환
 */
function getRawTextForCopy(outputId) {
    const outputDiv = document.getElementById(outputId);
    if (!outputDiv) return '';
    
    // 원본 텍스트가 저장되어 있으면 반환
    const rawText = outputDiv.getAttribute('data-raw-text');
    if (rawText) return rawText;
    
    // 없으면 textContent 반환
    return outputDiv.textContent;
}

/**
 * 마크다운 토글 버튼 추가
 */
function addMarkdownToggleButton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const header = container.querySelector('.output-header-compact, .compare-panel-header');
    if (!header) return;
    
    // 이미 버튼이 있으면 추가하지 않음
    if (header.querySelector('.markdown-toggle-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'btn btn--small markdown-toggle-btn';
    button.textContent = 'MD';
    button.title = '마크다운 스타일 켜기/끄기';
    button.onclick = function() {
        const outputId = containerId.replace('Container', '');
        toggleMarkdownRendering(outputId);
    };
    
    // 버튼을 복사 버튼 앞에 추가
    const copyBtn = header.querySelector('.btn--success');
    if (copyBtn) {
        copyBtn.parentNode.insertBefore(button, copyBtn);
    } else {
        header.appendChild(button);
    }
}

/**
 * 마크다운 렌더링 토글
 */
function toggleMarkdownRendering(outputId) {
    const outputDiv = document.getElementById(outputId);
    if (!outputDiv) return;
    
    if (outputDiv.classList.contains('markdown-rendered')) {
        // 마크다운 끄기 - 원본 텍스트로 복원
        const rawText = outputDiv.getAttribute('data-raw-text') || outputDiv.textContent;
        outputDiv.textContent = rawText;
        outputDiv.classList.remove('markdown-rendered');
    } else {
        // 마크다운 켜기
        applyMarkdownRendering(outputId);
    }
}

/**
 * 초기화
 */
function initializeMarkdownRendering() {
    console.log('[Markdown] 마크다운 렌더링 시스템 초기화');
    
    // 마크다운 토글 버튼 추가 (선택사항)
    // addMarkdownToggleButton('groqOutputContainer');
    // addMarkdownToggleButton('gptOutputContainer');
}
