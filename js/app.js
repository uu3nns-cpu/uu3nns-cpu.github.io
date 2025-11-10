/**
 * 상담 보고서 작성 도우미 v2.1 - Firefox 호환 버전
 * Firefox localStorage 문제 근본 해결: 보안 함수 통합
 */

// ==================== [중요] 보안 함수 (Firefox 독립 실행 보장) ====================
// security.js의 함수들을 여기에 통합하여 로드 순서 문제 해결

// 간단한 암호화 (Base64 + 간단한 치환) - Firefox 호환
function encodeApiKey(key) {
    if (!key) return '';
    try {
        const utf8Bytes = new TextEncoder().encode(key);
        const base64 = btoa(String.fromCharCode.apply(null, utf8Bytes));
        return base64.split('').reverse().join('');
    } catch (e) {
        console.error('[Security] API 키 인코딩 실패:', e);
        return key;
    }
}

// 복호화 - Firefox 호환
function decodeApiKey(encoded) {
    if (!encoded) return '';
    try {
        const base64 = encoded.split('').reverse().join('');
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.warn('[Security] 새로운 디코딩 실패, 레거시 시도:', e);
        try {
            const base64 = encoded.split('').reverse().join('');
            return decodeURIComponent(escape(atob(base64)));
        } catch (e2) {
            console.warn('[Security] 레거시도 실패, 평문 반환:', e2);
            return encoded;
        }
    }
}

// localStorage에 안전하게 저장
function saveApiKeySafely(keyName, keyValue) {
    try {
        if (!keyValue || !keyValue.trim()) {
            localStorage.removeItem(keyName);
            console.log('[Security] API 키 삭제됨:', keyName);
            return;
        }
        const encoded = encodeApiKey(keyValue.trim());
        localStorage.setItem(keyName, encoded);
        console.log('[Security] API 키 저장 성공:', keyName, '(인코딩 길이: ' + encoded.length + ')');
    } catch (error) {
        console.error('[Security] API 키 저장 실패:', keyName, error);
        throw error;
    }
}

// localStorage에서 안전하게 불러오기
function loadApiKeySafely(keyName) {
    try {
        const encoded = localStorage.getItem(keyName);
        if (!encoded) {
            console.warn('[Security] localStorage에 키 없음:', keyName);
            return '';
        }
        console.log('[Security] localStorage에서 읽음:', keyName, '(인코딩 길이: ' + encoded.length + ')');
        const decoded = decodeApiKey(encoded);
        if (decoded) {
            console.log('[Security] API 키 복호화 성공:', keyName, '(복호화 길이: ' + decoded.length + ')');
        } else {
            console.error('[Security] API 키 복호화 실패 - 빈 문자열:', keyName);
        }
        return decoded;
    } catch (error) {
        console.error('[Security] API 키 로드 실패:', keyName, error);
        return '';
    }
}

// API 키 형식 검증
function validateApiKeyFormat(key, type) {
    if (!key || !key.trim()) return { valid: false, message: 'API 키를 입력해주세요.' };
    const trimmedKey = key.trim();
    if (type === 'groq') {
        if (!trimmedKey.startsWith('gsk_')) {
            return { valid: false, message: 'Groq API 키는 "gsk_"로 시작해야 합니다.' };
        }
        if (trimmedKey.length < 20) {
            return { valid: false, message: 'Groq API 키가 너무 짧습니다.' };
        }
    } else if (type === 'gpt') {
        if (!trimmedKey.startsWith('sk-or-v1-')) {
            return { valid: false, message: 'OpenRouter API 키는 "sk-or-v1-"로 시작해야 합니다.' };
        }
        if (trimmedKey.length < 30) {
            return { valid: false, message: 'OpenRouter API 키가 너무 짧습니다.' };
        }
    }
    return { valid: true };
}

// ==================== 설정 상수 ====================
const DEFAULT_API_KEYS = {
    groq: '',
    gpt: ''
};

const STORAGE_KEYS = {
    GROQ_API: 'groqApiKey',
    GPT_API: 'gptApiKey',
    CUSTOM_PROMPT: 'customPrompt',
    STYLE_SETTINGS: 'styleSettings',
    FORMAT_OPTIONS: 'formatOptions',
    THEME: 'theme',
    FONT_SIZE: 'fontSize',
    DETAIL_LEVEL: 'detailLevel'
};

const SECTION_NAMES = {
    datetime: '상담 일시/회기',
    issue: '주 호소 문제',
    goal: '상담 목표',
    process: '상담 과정/내용',
    technique: '사용한 기법',
    plan: '다음 회기 계획'
};

const STYLE_IDS = [
    'length', 'terminology', 'expression', 'focus', 'technique', 
    'emotion', 'counselor', 'structure', 'plan', 'audience', 'approach'
];

const FORMAT_IDS = [
    'datetime', 'issue', 'goal', 'process', 'technique', 'plan'
];

const STYLE_DESCRIPTIONS = {
    length: {
        '간결하게': '핵심 내용만 간결하게 요약하여 작성한다. 불필요한 세부사항은 제외한다.',
        '상세하게': '구체적이고 상세하게 서술한다. 맥락과 뉘앙스를 충분히 담아 풍부하게 작성한다.'
    },
    terminology: {
        '전문적': '전문 심리학 용어를 적극 사용한다. 이론적 개념과 전문 용어를 포함한다.',
        '평이함': '누구나 이해할 수 있는 쉬운 표현을 사용한다. 전문 용어를 최대한 배제한다.'
    },
    expression: {
        '직접인용': '내담자의 실제 발언을 인용부호로 표시하여 포함한다. 내담자가 한 말을 그대로 인용한다.',
        '관찰위주': '상담사의 관찰과 해석을 중심으로 작성한다. 직접 인용은 최소화하고 분석적 관점을 강조한다.'
    },
    focus: {
        '강점중심': '내담자의 강점, 자원, 긍정적 측면을 강조한다. 어려움도 성장의 기회로 재구성한다.',
        '문제중심': '호소 문제, 증상, 어려움에 초점을 맞춘다. 문제를 직접적이고 철저하게 다룬다.'
    },
    technique: {
        '기법명시': '사용한 상담 기법을 명확히 명시한다 (예: "인지적 재구성(Cognitive Restructuring)", "공감적 경청"). 이론적 근거도 밝힌다.',
        '과정중심': '회기의 흐름과 내담자 반응을 중심으로 서술한다. 기법 이름보다는 실제 과정을 상세히 기술한다.'
    },
    emotion: {
        '정서강조': '정서 표현을 상세히 기술한다. 감정의 변화와 강도를 세밀하게 추적한다.',
        '객관적': '객관적 사실과 관찰 가능한 행동에 집중한다. 주관적 정서 표현은 최소화한다.'
    },
    counselor: {
        '반응포함': '상담사의 반응, 역전이, 치료 과정에 대한 성찰을 포함한다.',
        '내담자만': '내담자에게 주로 초점을 맞춘다. 상담사의 반응은 배경으로 처리한다.'
    },
    structure: {
        '시간순': '회기의 시간 순서대로 구성한다. 처음부터 끝까지 순차적으로 기술한다.',
        '주제별': '주제별로 내용을 묶어서 구성한다. 발생 시점과 무관하게 관련 내용을 함께 배치한다.'
    },
    plan: {
        '구체적': '구체적이고 실행 가능한 계획을 수립한다. 목표, 방법, 과제를 명확히 제시한다.',
        '방향성': '전반적인 방향과 큰 틀의 목표만 제시한다. 유연하고 탐색적인 계획을 세운다.'
    },
    audience: {
        '슈퍼비전': '슈퍼비전을 위해 작성한다. 상담사의 개입, 고민, 질문을 포함한다.',
        '학부모': '학부모/보호자를 위해 작성한다. 쉽고 이해하기 쉬운 언어로, 실용적 정보에 초점을 맞춘다.',
        '기관': '기관 제출용으로 작성한다. 객관적이고 전문적인 톤으로 필요한 정보를 모두 포함한다.'
    },
    approach: {
        '인지행동': '인지행동치료(CBT) 관점을 적용한다. 생각-감정-행동의 연결에 주목하고 인지행동치료 개념을 활용한다.',
        '정신역동': '정신역동적 관점을 적용한다. 무의식적 과정, 방어기제, 전이/역전이를 고려한다.',
        '인간중심': '인간중심 상담 관점을 적용한다. 공감, 무조건적 긍정적 존중, 진솔성을 강조한다.',
        '발달심리': '발달심리학적 관점을 적용한다. 연령에 적합한 과업, 발달 단계, 이정표를 고려한다.',
        '해결중심': '해결중심 단기치료 관점을 적용한다. 강점, 예외 상황, 미래 해결책에 초점을 맞춘다.',
        '게슈탈트': '게슈탈트 치료 관점을 적용한다. 현재 자각, 접촉, 경험적 과정을 중시한다.',
        '가족체계': '가족체계 치료 관점을 적용한다. 관계 패턴, 경계, 체계적 역동을 고려한다.',
        '애착이론': '애착이론 관점을 적용한다. 애착 패턴, 관계 역동, 애착 안정성에 주목한다.',
        '현실치료': '현실치료 관점을 적용한다. 선택, 책임, 현재의 행동을 강조한다.',
        '통합적': '통합적 접근을 사용한다. 내담자 필요에 따라 여러 이론적 관점을 유연하게 결합한다.'
    }
};

// ==================== LocalStorage 관련 ====================
function loadSettings() {
    // API 키 로드 (암호화된 형태로 저장되어 있음)
    const groqKey = loadApiKeySafely(STORAGE_KEYS.GROQ_API);
    const gptKey = loadApiKeySafely(STORAGE_KEYS.GPT_API);
    
    const groqInput = document.getElementById('groqApiKey');
    const gptInput = document.getElementById('gptApiKey');
    if (groqInput) groqInput.value = groqKey;
    if (gptInput) gptInput.value = gptKey;

    // 사용자 정의 프롬프트 로드
    const customPrompt = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROMPT) || '';
    const customPromptInput = document.getElementById('customPrompt');
    if (customPromptInput) customPromptInput.value = customPrompt;

    // 작성 스타일 로드
    const styleSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLE_SETTINGS) || '{}');
    STYLE_IDS.forEach(id => {
        const select = document.getElementById(`style_${id}`);
        if (select && styleSettings[id]) {
            select.value = styleSettings[id];
        }
    });

    // 보고서 형식 로드
    const formatOptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMAT_OPTIONS) || '[]');
    formatOptions.forEach(option => {
        const checkbox = document.getElementById(`format_${option}`);
        if (checkbox) checkbox.checked = true;
    });
}

function validateApiKeys() {
    const groqKey = document.getElementById('groqApiKey').value.trim();
    const gptKey = document.getElementById('gptApiKey').value.trim();
    
    if (!groqKey && !gptKey) {
        return {
            valid: false,
            message: '⚠️ 최소 하나의 API 키를 입력해주세요.'
        };
    }
    
    return { valid: true };
}

function saveSettingsToStorage() {
    // API 키 가져오기
    const groqInput = document.getElementById('groqApiKey');
    const gptInput = document.getElementById('gptApiKey');
    
    const groqKey = groqInput ? groqInput.value.trim() : '';
    const gptKey = gptInput ? gptInput.value.trim() : '';
    
    // API 키 유효성 검사
    const validation = validateApiKeys();
    if (!validation.valid) {
        showError(validation.message);
        
        // 빈 필드에 에러 표시
        const groqInputElem = document.getElementById('groqApiKey');
        const gptInputElem = document.getElementById('gptApiKey');
        if (groqInputElem && !groqInputElem.value.trim()) groqInputElem.classList.add('error');
        if (gptInputElem && !gptInputElem.value.trim()) gptInputElem.classList.add('error');
        
        setTimeout(() => {
            if (groqInputElem) groqInputElem.classList.remove('error');
            if (gptInputElem) gptInputElem.classList.remove('error');
        }, 3000);
        
        return false;
    }

    // API 키 형식 검증
    if (groqKey) {
        const groqValidation = validateApiKeyFormat(groqKey, 'groq');
        if (!groqValidation.valid) {
            showError('Groq: ' + groqValidation.message);
            return false;
        }
    }
    
    if (gptKey) {
        const gptValidation = validateApiKeyFormat(gptKey, 'gpt');
        if (!gptValidation.valid) {
            showError('GPT: ' + gptValidation.message);
            return false;
        }
    }
    
    // API 키 암호화하여 저장
    saveApiKeySafely(STORAGE_KEYS.GROQ_API, groqKey);
    saveApiKeySafely(STORAGE_KEYS.GPT_API, gptKey);

    // 사용자 정의 프롬프트 저장
    const customPromptInput = document.getElementById('customPrompt');
    const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PROMPT, customPrompt);

    // 작성 스타일 저장
    const styleSettings = {};
    STYLE_IDS.forEach(id => {
        const select = document.getElementById(`style_${id}`);
        if (select && select.value) {
            styleSettings[id] = select.value;
        }
    });
    localStorage.setItem(STORAGE_KEYS.STYLE_SETTINGS, JSON.stringify(styleSettings));

    // 보고서 형식 저장 (토글 스위치 지원)
    const formatOptions = [];
    document.querySelectorAll('.format-toggles input[type="checkbox"]:checked, .format-options-toggle input[type="checkbox"]:checked, .format-option input[type="checkbox"]:checked').forEach(cb => {
        formatOptions.push(cb.id.replace('format_', ''));
    });
    localStorage.setItem(STORAGE_KEYS.FORMAT_OPTIONS, JSON.stringify(formatOptions));

    return true;
}

function getApiKeys() {
    return {
        groq: loadApiKeySafely(STORAGE_KEYS.GROQ_API),
        gpt: loadApiKeySafely(STORAGE_KEYS.GPT_API)
    };
}

function getCustomPrompt() {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_PROMPT) || '';
}

function getStyleSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLE_SETTINGS) || '{}');
}

function getFormatOptions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMAT_OPTIONS) || '[]');
}

function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const btns = document.querySelectorAll('.theme-toggle');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        btns.forEach(btn => {
            btn.innerHTML = '☀️';
            btn.title = '다크 모드';
        });
    } else {
        btns.forEach(btn => {
            btn.innerHTML = '🌙';
            btn.title = '라이트 모드';
        });
    }
}

function loadFontSize() {
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    if (savedFontSize) {
        document.body.style.fontSize = savedFontSize + 'px';
    }
}

// ==================== UI 조작 ====================
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('active');
        
        setTimeout(() => {
            errorDiv.classList.remove('active');
        }, 5000);
    }
    
    // 설정 패널이 열려있으면 토스트로도 표시
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel && settingsPanel.classList.contains('active')) {
        showToast(message, 3000);
    } else if (!settingsPanel) {
        // settingsPanel이 없으면 항상 토스트로 표시 (report.html 등)
        showToast(message, 3000);
    }
}

function toggleApiKeyVisibility(type) {
    const inputId = type === 'groq' ? 'groqApiKey' : 'gptApiKey';
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    // 버튼 찾기 - 여러 구조 지원
    let button = null;
    
    // settings.html 구조 (.api-key-item)
    const apiKeyItem = input.closest('.api-key-item');
    if (apiKeyItem) {
        button = apiKeyItem.querySelector('.btn, .btn--small, .btn-toggle-key');
    }
    
    // report.html 구조 (.api-line-input-group)
    if (!button) {
        const apiLineGroup = input.closest('.api-line-input-group');
        if (apiLineGroup) {
            button = apiLineGroup.querySelector('.btn-toggle-visibility');
        }
    }
    
    // 토글 실행
    if (input.type === 'password') {
        input.type = 'text';
        if (button) button.textContent = '숨김';
    } else {
        input.type = 'password';
        if (button) button.textContent = '표시';
    }
}

function clearApiKey(type) {
    const inputId = type === 'groq' ? 'groqApiKey' : 'gptApiKey';
    const storageKey = type === 'groq' ? STORAGE_KEYS.GROQ_API : STORAGE_KEYS.GPT_API;
    const keyName = type === 'groq' ? 'Groq' : 'GPT-4o-mini';
    
    if (confirm(`${keyName} API 키를 삭제하시겠습니까?`)) {
        document.getElementById(inputId).value = '';
        localStorage.removeItem(storageKey);
        showToast(`${keyName} API 키가 삭제되었습니다.`, 1500);
    }
}

function exportApiKeys() {
    const groqInput = document.getElementById('groqApiKey');
    const gptInput = document.getElementById('gptApiKey');
    
    const groqKey = groqInput ? groqInput.value.trim() : '';
    const gptKey = gptInput ? gptInput.value.trim() : '';
    
    if (!groqKey && !gptKey) {
        showError('내보낼 API 키가 없습니다.');
        return;
    }
    
    const apiKeys = {
        groq: groqKey,
        gpt: gptKey,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(apiKeys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'counseling-helper-api-keys.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📥 API 키가 파일로 저장되었습니다.', 2000);
}

function importApiKeys() {
    document.getElementById('apiKeyFileInput').click();
}

function handleApiKeyFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            const groqInput = document.getElementById('groqApiKey');
            const gptInput = document.getElementById('gptApiKey');
            
            if (data.groq && groqInput) {
                groqInput.value = data.groq;
            }
            if (data.gpt && gptInput) {
                gptInput.value = data.gpt;
            }
            
            showToast('📤 API 키가 불러와졌습니다. "설정 저장"을 눌러주세요.', 3000);
        } catch (error) {
            showError('파일을 읽는데 실패했습니다. 올바른 JSON 파일인지 확인해주세요.');
        }
    };
    reader.readAsText(file);
    
    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    event.target.value = '';
}

function resetSettings() {
    if (!confirm('API 키를 제외한 모든 설정을 초기화하시겠습니까?\n\n초기화되는 항목:\n- 나만의 작성 규칙\n- 보고서 기술 설정\n- 보고서 구조 설정\n- 화면 설정 (글씨 크기)\n- 보고서 설정 (분량/상세도)\n- 나의 설정 모음')) {
        return;
    }
    
    console.log('[Reset] 설정 초기화 시작...');
    
    // 1. 사용자 정의 프롬프트 초기화
    const customPromptInput = document.getElementById('customPrompt');
    if (customPromptInput) customPromptInput.value = '';
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_PROMPT);
    console.log('[Reset] 커스텀 프롬프트 초기화 완료');
    
    // 2. 스타일 설정 초기화
    STYLE_IDS.forEach(id => {
        const select = document.getElementById(`style_${id}`);
        if (select) select.value = '';
    });
    localStorage.removeItem(STORAGE_KEYS.STYLE_SETTINGS);
    console.log('[Reset] 스타일 설정 초기화 완료');
    
    // 3. 포맷 옵션 초기화
    document.querySelectorAll('.format-toggles input[type="checkbox"], .format-options-toggle input[type="checkbox"], .format-option input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    localStorage.removeItem(STORAGE_KEYS.FORMAT_OPTIONS);
    console.log('[Reset] 포맷 옵션 초기화 완료');
    
    // 4. 글씨 크기 초기화
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    if (fontSizeSlider) {
        fontSizeSlider.value = 16;
        document.documentElement.style.fontSize = '16px';
        if (typeof updateFontSizeHighlight === 'function') {
            updateFontSizeHighlight('16');
        }
    }
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, '16');
    console.log('[Reset] 글씨 크기 초기화 완료');
    
    // 5. 분량/상세도 초기화
    const detailLevelSlider = document.getElementById('detailLevelSlider');
    if (detailLevelSlider) {
        detailLevelSlider.value = 0;
        if (typeof updateDetailLevelHighlight === 'function') {
            updateDetailLevelHighlight('0');
        }
    }
    localStorage.setItem(STORAGE_KEYS.DETAIL_LEVEL, '0');
    console.log('[Reset] 분량/상세도 초기화 완룈');
    
    // 6. 나의 설정 모음 초기화 (확실하게!)
    console.log('[Reset] 프리셋 초기화 시작...');
    console.log('[Reset] 기존 프리셋:', localStorage.getItem('settings_presets'));
    console.log('[Reset] 기존 활성 ID:', localStorage.getItem('active_preset_id'));
    
    // 프리셋 완전 삭제
    localStorage.removeItem('settings_presets');
    localStorage.setItem('active_preset_id', '0');
    
    console.log('[Reset] 삭제 후 프리셋:', localStorage.getItem('settings_presets'));
    console.log('[Reset] 삭제 후 활성 ID:', localStorage.getItem('active_preset_id'));
    
    // 프리셋 목록 즐시 다시 렌더링
    console.log('[Reset] renderPresetList 호출...');
    if (typeof renderPresetList === 'function') {
        renderPresetList();
        console.log('[Reset] renderPresetList 완료');
    } else {
        console.error('[Reset] renderPresetList 함수를 찾을 수 없음!');
    }
    
    // 프리셋 카운트 업데이트
    const presetCountElem = document.getElementById('presetCount');
    if (presetCountElem) {
        presetCountElem.textContent = '0';
        console.log('[Reset] 프리셋 카운트 0으로 업데이트');
    }
    
    console.log('[Reset] 모든 초기화 완료!');
    showToast('✅ 설정이 초기화되었습니다. (API 키는 유지)', 2000);
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const btn = document.getElementById('settingsBtn');
    panel.classList.toggle('active');
    btn.classList.toggle('active');
    
    // 패널을 닫을 때 저장하지 않은 변경사항 복원
    if (!panel.classList.contains('active')) {
        loadSettings();
    }
}

function toggleApiGuide() {
    const guideContent = document.getElementById('apiGuideContent');
    guideContent.classList.toggle('active');
}

function saveSettings() {
    const success = saveSettingsToStorage();
    
    if (success) {
        showToast('✓ 설정이 저장되었습니다.', 1000);
        
        setTimeout(() => {
            toggleSettings();
        }, 1000);
    }
}

function cancelSettings() {
    toggleSettings();
}

function resetToMain() {
    if (confirm('메인 화면으로 돌아가시겠습니까? 작성 중인 내용이 있다면 사라집니다.')) {
        location.reload();
    }
}

function toggleTheme() {
    const body = document.body;
    const btns = document.querySelectorAll('.theme-toggle');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        btns.forEach(btn => {
            btn.innerHTML = '🌙';
            btn.title = '라이트 모드';
        });
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
        body.classList.add('light-mode');
        btns.forEach(btn => {
            btn.innerHTML = '☀️';
            btn.title = '다크 모드';
        });
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
}

function changeFontSize(delta) {
    const body = document.body;
    const currentSize = parseFloat(getComputedStyle(body).fontSize);
    const newSize = Math.max(12, Math.min(22, currentSize + delta));
    body.style.fontSize = newSize + 'px';
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, newSize);
}

function resetFontSize() {
    document.body.style.fontSize = '16px';
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, 16);
}

function toggleInputSection() {
    const mainContainer = document.querySelector('.main-container');
    mainContainer.classList.toggle('auto-slide');
}

// 글자수 제한 토스트 표시 여부 추적
let hasShownLimitToast = false;

function updateCharCount() {
    const textarea = document.getElementById('inputText');
    const input = textarea.value;
    const currentLength = input.length;
    const maxLength = 7000;
    const remaining = maxLength - currentLength;
    
    const countElement = document.getElementById('inputCount');
    
    // 7000자가 되면 남은 글자수 표시
    if (remaining === 0) {
        countElement.textContent = '최대 7,000자';
        countElement.style.color = 'var(--error)';
        countElement.style.fontWeight = '700';
        countElement.classList.add('warning');
        textarea.classList.add('at-limit');
        
        // 최초 1회만 토스트 표시
        if (!hasShownLimitToast) {
            showToast('⚠️ 최대 글자수(7,000자)에 도달했습니다.', 2500);
            hasShownLimitToast = true;
        }
    } else if (remaining > 0 && currentLength >= maxLength - 1) {
        // 6999자부터 남은 글자수 표시
        countElement.textContent = `남은: ${remaining}자`;
        countElement.style.color = 'var(--error)';
        countElement.style.fontWeight = '700';
        countElement.classList.add('warning');
        textarea.classList.add('at-limit');
    } else {
        // 일반 표시
        countElement.textContent = currentLength.toLocaleString() + '자';
        countElement.style.color = '';
        countElement.style.fontWeight = '';
        countElement.classList.remove('warning');
        textarea.classList.remove('at-limit');
        
        // 글자수가 감소하면 토스트 플래그 초기화
        if (currentLength < maxLength - 100) {
            hasShownLimitToast = false;
        }
    }
    
    // textarea 자동 높이 조절
    if (typeof autoResizeTextarea === 'function') {
        autoResizeTextarea(textarea);
    }
}

function copyInput(event) {
    event.stopPropagation();
    const text = document.getElementById('inputText').value;
    const btn = event.target;
    
    if (!text.trim()) {
        showError('복사할 내용이 없습니다.');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ 복사됨';
        btn.style.background = 'var(--success)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--success)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        showError('복사에 실패했습니다.');
    });
}

function copyToClipboard(model) {
    // 현재 활성 탭이 비교 탭인지 확인
    const activeTab = document.querySelector('.output-tab.active');
    const isCompareTab = activeTab && activeTab.getAttribute('data-tab') === 'compare';
    
    // 모델에 따라 output ID 결정 (비교 탭의 경우 Compare 버전 사용)
    const outputId = isCompareTab 
        ? (model === 'groq' ? 'groqOutputCompare' : 'gptOutputCompare')
        : (model === 'groq' ? 'groqOutput' : 'gptOutput');
    
    // 마크다운 렌더링된 경우 원본 텍스트 사용
    const text = typeof getRawTextForCopy === 'function' 
        ? getRawTextForCopy(outputId)
        : document.getElementById(outputId).textContent;
    
    // 클릭한 버튼 찾기 (event.target을 사용하지 않고 ID로 찾기)
    let btn;
    if (isCompareTab) {
        btn = model === 'groq' 
            ? document.getElementById('groqCopyBtnCompare')
            : document.getElementById('gptCopyBtnCompare');
    } else {
        btn = model === 'groq' 
            ? document.getElementById('groqCopyBtn')
            : document.getElementById('gptCopyBtn');
    }
    
    if (!text || !text.trim()) {
        showError('복사할 내용이 없습니다.');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ 복사됨';
            btn.style.background = 'var(--success-hover)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }).catch(err => {
        showError('복사에 실패했습니다.');
    });
}

function handleKeyDown(event) {
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        generateJournals(event);
    }
}

// ==================== API 호출 ====================

// 모델별 설정
const MODEL_CONFIGS = {
    groq: {
        name: 'Groq',
        displayName: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        temperature: 0.75,
        max_tokens: 3000,
        top_p: 0.92,
        outputId: 'groqOutput',
        loadingId: 'groqLoading',
        copyBtnId: 'groqCopyBtn',
        usageId: 'groqUsage',
        countId: 'groqCount',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        })
    },
    gpt: {
        name: 'GPT',
        displayName: 'GPT-4o-mini',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 3000,
        outputId: 'gptOutput',
        loadingId: 'gptLoading',
        copyBtnId: 'gptCopyBtn',
        usageId: 'gptUsage',
        countId: 'gptCount',
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://counseling-journal.app',
            'X-Title': 'Counseling Journal Tool'
        })
    }
};
function buildPrompt(input) {
    const customPrompt = getCustomPrompt();
    const formatOptions = getFormatOptions();
    const styleSettings = getStyleSettings();
    const detailLevel = parseInt(localStorage.getItem(STORAGE_KEYS.DETAIL_LEVEL) || '0');
    
    let prompt = '';
    
    // 0순위: 나만의 작성 규칙 (사용자 맞춤 지시 - 최우선 적용)
    if (customPrompt) {
        prompt += `【0순위: 나만의 작성 규칙 - 절대 최우선】

${customPrompt}

⚠️ 이 지시사항은 모든 설정보다 우선 적용됩니다.
아래 1~3순위 설정과 충돌 시, 이 규칙을 따릅니다.

`;
    }
    
    // 1순위: 분량/상세도 설정
    if (detailLevel !== 0) {
        const detailConfig = {
            '-45': {
                instruction: '【분량/상세도: 최소】\n\n⚠️ 핵심만 간결하게 작성하라. 상담 메모의 0.4~0.6배 분량으로 작성한다. 불필요한 세부사항, 배경 설명, 부연 설명을 모두 제거한다.',
                multiplier: 0.5
            },
            '-30': {
                instruction: '【분량/상세도: 간결】\n\n핵심 내용 위주로 간결하게 작성한다. 상담 메모의 0.7~0.9배 분량으로 작성하고, 중요한 내용만 선별하여 포함한다.',
                multiplier: 0.8
            },
            '-15': {
                instruction: '【분량/상세도: 약간 간결】\n\n표준보다 약간 짧게 작성한다. 상담 메모의 0.9~1.2배 분량으로 작성한다. 핵심 내용에 집중하되, 필수 맥락은 유지한다.',
                multiplier: 1.1
            },
            '15': {
                instruction: '【분량/상세도: 약간 상세】\n\n표준보다 약간 상세하게 작성한다. 상담 메모의 1.5~1.8배 분량으로 작성한다. 주요 내용에 부가 설명을 추가하고, 맥락과 뉴앙스를 포함한다.',
                multiplier: 1.7
            },
            '30': {
                instruction: '【분량/상세도: 상세】\n\n구체적이고 상세하게 작성한다. 상담 메모의 1.9~2.3배 분량으로 작성한다. 과정, 맥락, 뉴앙스를 충분히 담는다.',
                multiplier: 2.1
            },
            '45': {
                instruction: '【분량/상세도: 최대】\n\n⚠️ 가능한 한 상세하고 풍부하게 작성하라. 상담 메모의 2.3~2.7배 분량으로 작성한다. 모든 세부사항, 맥락, 배경, 뉴앙스를 빠짐없이 포함한다.',
                multiplier: 2.5
            }
        };
        
        const config = detailConfig[detailLevel.toString()];
        if (config) {
            const inputLength = input.length;
            const targetLength = Math.round(inputLength * config.multiplier);
            
            prompt += `【1순위: 분량/상세도 설정】

${config.instruction}

📏 목표 분량: 약 ${targetLength.toLocaleString()}자 (상담 메모 ${inputLength.toLocaleString()}자 기준)

※ 0순위(나만의 작성 규칙)와 충돌 시, 0순위를 우선합니다.

`;
        }
    }
    
    // 2순위: 보고서 구조 설정 (보고서 형식)
    if (formatOptions.length > 0) {
        const sections = formatOptions.map(opt => SECTION_NAMES[opt]).filter(Boolean);
        
        prompt += `【2순위: 보고서 구조 설정】

다음 섹션을 포함하여 작성한다:

${sections.map(s => `• [${s}]`).join('\n')}

※ 각 섹션은 반드시 [섹션명] 형태로 명시한다.
※ 0~1순위와 충돌 시, 상위 순위를 우선합니다.
`;

        if (formatOptions.includes('datetime')) {
            const today = new Date();
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`;
            
            prompt += `
※ [상담 일시/회기] 섹션 작성 시:
  - 메모에 날짜가 없으면 → "${dateStr}" 사용
  - 메모에 회기 정보가 없으면 → "00회" 표기
  - 메모에 명시되어 있으면 → 해당 정보 사용
`;
        }
        
        prompt += `\n`;
    } else {
        // 섹션 형식이 지정되지 않은 경우 - 서술형 작성
        prompt += '【2순위: 보고서 구조 설정 - 서술형 작성】\n\n';
        prompt += '📄 중요: 서술형 보고서로 작성\n';
        prompt += '• [섹션명] 같은 구조적 헤더 사용하지 않기\n';
        prompt += '• 별도 섹션으로 내용 분리하지 않기\n';
        prompt += '• 단락 중심의 연속적이고 자연스러운 흐름으로 작성\n';
        prompt += '• 정보를 문단 속에 자연스럽게 녹여내기\n';
        prompt += '• 전문적이고 객관적인 보고서 어조 유지 (문학적 표현 지양)\n';
        prompt += '※ 0~1순위와 충돌 시, 상위 순위를 우선합니다.';
        prompt += '\n\n';
    }
    
    // 3순위: 보고서 기술 설정 (작성 스타일)
    if (Object.keys(styleSettings).length > 0) {
        prompt += `【3순위: 보고서 기술 설정】

다음 스타일 지침에 따라 보고서를 작성한다:

`;
        Object.keys(styleSettings).forEach(key => {
            const value = styleSettings[key];
            if (STYLE_DESCRIPTIONS[key] && STYLE_DESCRIPTIONS[key][value]) {
                prompt += `• ${STYLE_DESCRIPTIONS[key][value]}\n`;
            }
        });
        
        prompt += `\n※ 0~2순위와 충돌 시, 상위 순위를 우선합니다.\n\n`;
    }
    
    // 입력 메모
    prompt += `【상담 메모】

다음 상담 메모를 바탕으로 전문적인 상담 보고서로 확장하여 작성한다:

${input}

⚠️ 중요 원칙:
• 위 메모의 내용만을 근거로 작성
• 명시된 사실을 자연스럽게 확장
• 새로운 사건이나 정보는 절대 창작하지 않음
• 0~3순위 설정을 모두 고려하여 작성 (0순위가 최우선)`;

    return prompt;
}

// 언어 검증 함수 (한글+영어+기본 기호만 허용)
function containsUnwantedLanguages(text) {
    // 한자 (중국어/일본어 한자)
    const chinesePattern = /[\u4e00-\u9fff\u3400-\u4dbf]/;
    // 일본어 가나 (히라가나, 가타카나)
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    // 키릴 문자 (러시아어 등)
    const cyrillicPattern = /[\u0400-\u04ff]/;
    // 아랍어
    const arabicPattern = /[\u0600-\u06ff]/;
    // 태국어
    const thaiPattern = /[\u0e00-\u0e7f]/;
    
    return chinesePattern.test(text) || 
           japanesePattern.test(text) || 
           cyrillicPattern.test(text) ||
           arabicPattern.test(text) ||
           thaiPattern.test(text);
}

// Groq 생성 (재시도 로직 포함)
async function generateWithGroq(input, apiKey, retryCount = 0) {
    const MAX_RETRIES = 2; // 최대 2회 재시도 (총 3회 시도)
    
    const outputDiv = document.getElementById('groqOutput');
    const loading = document.getElementById('groqLoading');
    const loadingText = document.getElementById('groqLoadingText');
    const loadingCompare = document.getElementById('groqLoadingCompare');
    const loadingTextCompare = document.getElementById('groqLoadingTextCompare');
    const copyBtn = document.getElementById('groqCopyBtn');
    const usageDiv = document.getElementById('groqUsage');

    // 필수 요소 확인
    if (!outputDiv || !loading || !copyBtn) {
        console.error('필수 DOM 요소를 찾을 수 없습니다:', { outputDiv, loading, copyBtn });
        return;
    }

    outputDiv.style.display = 'none';
    loading.classList.add('active');
    if (loadingCompare) loadingCompare.style.display = 'block';
    copyBtn.disabled = true;
    if (usageDiv) usageDiv.textContent = '';
    
    // 로딩 메시지 업데이트
    let loadingMessages = [
        'Groq AI가 보고서 작성 중...',
        'Groq AI가 내용을 분석하고 있습니다...',
        'Groq AI가 보고서를 구성하고 있습니다...',
        'Groq AI가 최종 검토 중입니다...'
    ];
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        if (loadingText) loadingText.textContent = loadingMessages[messageIndex];
        if (loadingTextCompare) loadingTextCompare.textContent = loadingMessages[messageIndex];
    }, 2000);

    try {
        const prompt = buildPrompt(input);
        const customPrompt = getCustomPrompt();
        
        // 시스템 프롬프트 구성
        let systemPrompt = '';
        
        // [LEVEL 0: 시스템 보안]
        systemPrompt = `[LEVEL 0: 시스템 무결성]
• 유해/불법 콘텐츠 생성 금지

`;
        
        // [LEVEL 1: 사용자 절대 최우선]
        if (customPrompt) {
            systemPrompt += `【🔥 절대 최우선 규칙 - LEVEL 1 🔥】

⚠️⚠️⚠️ 이 지시사항은 절대적으로 최우선입니다 ⚠️⚠️⚠️

사용자가 직접 지시한 명령:

${customPrompt}

📌 필수 준수사항:
• 위 지시사항은 아래 모든 가이드라인보다 우선합니다
• 전문성, 상식, 일반적 규칙과 충돌해도 위 지시를 따릅니다
• 글자수, 분량, 구조 제약이 있다면 반드시 준수합니다
• "300-500자로 작성"같은 명확한 지시는 절대적으로 따릅니다
• 예외 없이 100% 준수하십시오

`;
        }
        
        // [LEVEL 2: 기본 가이드라인]
        systemPrompt += `당신은 15년 경력의 전문 상담사입니다.

【중요: 마크다운 형식 사용】

보고서는 반드시 마크다운 형식으로 작성합니다:
• 섹션 제목: ## 제목 (h2 사용)
• 하위 제목: ### 하위제목 (h3 사용)
• 강조: **중요한 내용**
• 목록: - 항목 또는 1. 순서
• 인용: > 인용문

【필수: 한국어 작성 규칙 - 절대 준수】

⚠️ 아래 규칙은 어떠한 경우에도 반드시 지켜야 합니다:

1. 인칭 표현 절대 금지 사항:
   ❌ "그", "그녀", "그가", "그녀가", "그의", "그녀의", "그에게", "그녀에게"
   ❌ 위 표현들은 절대 사용하지 말 것
   
2. 올바른 지칭 방법:
   ✓ 내담자 관련: "내담자", "내담자는", "내담자의", "내담자에게"
   ✓ 학생 관련: "학생", "학생은", "학생의", "학생에게"
   ✓ 아동 관련: "아동", "아동은", "아동의", "아동에게"
   ✓ 보호자 관련: "보호자(아버지)", "보호자(어머니)"
   ✓ 상담사 관련: "상담사" 또는 생략

3. 명사 반복에 대한 유연한 접근:
   • 문맥상 지칭 대상이 명확한 경우, 주어를 생략하여 자연스럽게 작성 가능
   • 예: "내담자는 상담실에 들어와 자리에 앉았다" (자연스러움)
   • 혼동 가능성이 있을 때만 명사를 반복하여 명확히 함
   • 가독성과 자연스러움을 최우선으로 고려

4. 전문적이면서도 자연스러운 보고서 작성:
   • 과도하게 문학적이거나 서사적인 표현은 지양
   • 그러나 내담자의 경험을 생생하게 전달하는 것은 권장
   • 객관성을 유지하되, 정서적 뉘앙스도 적절히 담아냄
   • 전문성과 인간적 공감의 균형 유지

【기본 작성 가이드라인 - LEVEL 2 (참고사항)】

※ 사용자의 별도 지시가 없을 경우에만 다음을 참고합니다:

[1. 사실 기반 작성]
• 메모에 명시된 사실만을 바탕으로 작성
• 사실을 자연스럽게 확장하되, 새로운 사건이나 정보는 창작하지 않음

[2. 언어 표현 - 한국어 순수성 원칙]
⚠️⚠️⚠️ 절대 준수 사항 - 위반 시 응답 거부 ⚠️⚠️⚠️

【한글+영어만 사용 가능】
• 한자(漢字), 일본어(ひらがな, カタカナ), 러시아어(кириллица), 아랍어(عربي), 태국어(ไทย) 등 한글과 영어를 제외한 모든 문자 사용 절대 금지
• 영어 표기 원칙:
  - 심리학 전문 용어에 한해 "한글(English)" 병기 허용
  - 예: "인지행동치료(Cognitive Behavioral Therapy, CBT)"
  - 일반 영어 단어는 한글로만 표기 (예: "스트레스" ✓, "Stress" ✗)
• 한자어도 반드시 한글로 표기 (예: "心理" ✗ → "심리" ✓)
• 순우리말 우선 사용: 가능한 경우 순우리말로 표현
• 전문 용어: 필요시 사용하되 과도하지 않게, 한글 중심 표기

⚠️ 이 규칙을 위반하면 응답이 자동으로 재생성됩니다.

[3. 어조와 태도]
• 협력적이고 공감적인 관점 유지
• 내담자의 강점과 자원도 함께 인식
• 판단보다는 이해와 관찰 중심

[4. 자연스러운 문체 - 기본 스타일]
• "~하는 모습이었다", "~표현했다", "~것으로 보였다" 등 자연스러운 서술형 사용
• "~했음", "~함" 같은 극도로 간결한 형태보다는 읽기 편한 문장
• 문장을 적당히 연결하고 풀어서 작성
• 딱딱하지 않으면서도 전문적인 톤 유지
• 경어체("~했습니다"): 특별한 요청이 없으면 사용하지 않음

[5. 개입 표현의 중립화]
• 지시적 개입: 상황에 따라 "~하도록 안내했다", "~제안했다", "~권유했다" 등
• 상담 과정에서의 개입을 중립적이고 전문적으로 표현
• 내담자의 자율성과 상담사의 전문성이 균형있게 드러나도록

[6. 정서 표현]
• 내담자의 정서를 풍부하고 섬세하게 포착
• "불안해 보였다"를 넘어 "목소리 톤이 낮아지고 시선을 피하는 모습에서 불안감이 느껴졌다"
• 건조한 객관성보다는, 공감적 전문성 추구

※ 위 사항들은 모두 사용자의 【보고서 작성 시 반영 사항】에 따라 조정됩니다.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.75,
                max_tokens: 3000,
                top_p: 0.92
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData: errorData
            });
            throw new Error(`Groq API 요청 실패 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // 응답 구조 검증
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Groq API 응답 구조 오류:', data);
            throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
        }
        
        let result = data.choices[0].message.content;
        
        // 언어 검증: 한글+영어 외 언어 감지
        if (containsUnwantedLanguages(result)) {
            if (retryCount < MAX_RETRIES) {
                console.log(`[Groq] 외국어 감지, 재시도 ${retryCount + 1}/${MAX_RETRIES}`);
                // 로딩 상태 유지하고 재시도
                return await generateWithGroq(input, apiKey, retryCount + 1);
            } else {
                console.warn('[Groq] 최대 재시도 횟수 초과, 외국어 제거 후 표시');
                // 3회 시도 후에도 실패하면 외국어만 제거하고 표시
                result = result.replace(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/g, '');
            }
        }
        
        // 원본 텍스트 저장 (복사 기능을 위해)
        outputDiv.setAttribute('data-raw-text', result);
        
        // 마크다운 렌더링 적용
        if (typeof renderMarkdown === 'function') {
            outputDiv.innerHTML = renderMarkdown(result);
            outputDiv.classList.add('markdown-rendered');
        } else {
            outputDiv.textContent = result;
        }
        
        outputDiv.style.display = 'block';
        outputDiv.classList.remove('empty');
        copyBtn.disabled = false;
        
        // 내보내기 버튼 활성화
        const groqExportBtn = document.getElementById('groqExportBtn');
        if (groqExportBtn) groqExportBtn.disabled = false;

        const groqCountElem = document.getElementById('groqCount');
        if (groqCountElem) groqCountElem.textContent = result.length + '자';
        
        // 비교 탭의 글자수도 업데이트
        const groqCountCompareElem = document.getElementById('groqCountCompare');
        if (groqCountCompareElem) groqCountCompareElem.textContent = result.length + '자';
        
        // 비교 탭의 출력도 즉시 표시 (마크다운 렌더링 적용)
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        if (groqOutputCompare) {
            groqOutputCompare.setAttribute('data-raw-text', result);
            if (typeof renderMarkdown === 'function') {
                groqOutputCompare.innerHTML = renderMarkdown(result);
                groqOutputCompare.classList.add('markdown-rendered');
            } else {
                groqOutputCompare.textContent = result;
            }
            groqOutputCompare.style.display = 'block';
        }
        
        // 비교 탭의 복사 버튼도 활성화
        const groqCopyBtnCompare = document.getElementById('groqCopyBtnCompare');
        if (groqCopyBtnCompare) groqCopyBtnCompare.disabled = false;

        if (data.usage && usageDiv) {
            usageDiv.textContent = `${data.usage.total_tokens} 토큰`;
        }

    } catch (error) {
        clearInterval(messageInterval);
        console.error('Groq Error:', error);
        
        // 사용자에게 더 상세한 오류 메시지 표시
        let errorMessage = 'Groq 오류 발생.';
        
        if (error.message.includes('401')) {
            errorMessage = 'Groq API 키가 유효하지 않습니다. 설정에서 API 키를 확인해주세요.';
        } else if (error.message.includes('429')) {
            errorMessage = 'API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('402')) {
            errorMessage = `${config.displayName} API 크레딧이 부족합니다.`;
        } else if (error.message) {
            errorMessage = `${config.name} 오류: ${error.message}`;
        }
        
        outputDiv.textContent = errorMessage + '\n\n브라우저 콘솔(F12)에서 상세 오류를 확인할 수 있습니다.';
        outputDiv.classList.add('empty');
        outputDiv.style.display = 'block';
    } finally {
        clearInterval(messageInterval);
        loading.classList.remove('active');
        if (loadingCompare) loadingCompare.style.display = 'none';
    }
}

// ==================== 히스토리 기능 ====================
// 히스토리 관련 함수들은 autosave.js에 정의되어 있습니다.
// - saveReport()
// - showReportHistory()
// - loadHistoryReport(index) -> loadReport(reportId)
// - deleteHistoryReport(index) -> deleteReport(reportId)

// ==================== 키보드 단축키 ====================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 입력 필드에서는 일부 단축키만 작동
        const isInputField = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
        
        // Ctrl+Enter: 보고서 생성 (입력 필드에서만)
        if (e.ctrlKey && e.key === 'Enter' && isInputField) {
            e.preventDefault();
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn && !generateBtn.disabled) {
                generateJournals(e);
            }
            return;
        }
        
        // 나머지 단축키는 입력 필드가 아닐 때만 작동
        if (isInputField) return;
        
        // Ctrl+1: Groq 결과 복사
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            const btn = document.getElementById('groqCopyBtn');
            if (btn && !btn.disabled) {
                copyToClipboard('groq');
            }
            return;
        }
        
        // Ctrl+2: GPT 결과 복사
        if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            const btn = document.getElementById('gptCopyBtn');
            if (btn && !btn.disabled) {
                copyToClipboard('gpt');
            }
            return;
        }
        
        // Ctrl+N: 새 보고서 (초기화)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            if (confirm('새 보고서를 작성하시겠습니까?\n현재 내용이 저장되지 않았다면 사라집니다.')) {
                resetToMain();
            }
            return;
        }
        
        // Escape: 모달 닫기
        if (e.key === 'Escape') {
            const shortcutsModal = document.getElementById('shortcutsModal');
            if (shortcutsModal) {
                shortcutsModal.remove();
                return;
            }
        }
        
        // Ctrl+/: 단축키 도움말
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            toggleShortcutsModal();
            return;
        }
    });
}

// 단축키 도움말 표시 (모달 토글)
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
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">모달 닫기</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                        <kbd style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color);">Ctrl+/</kbd>
                        <span style="color: var(--text-secondary); flex: 1; margin-left: 20px;">단축키 도움말</span>
                    </div>
                </div>
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color); color: var(--text-tertiary); font-size: 0.9em; text-align: center;">
                    💡 팁: 이 도움말을 언제든 <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px;">Ctrl+/</kbd>로 다시 볼 수 있습니다.
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

// ==================== 문제 수정된 API 함수 ====================
// GPT 생성 (재시도 로직 포함)
async function generateWithGPT(input, apiKey, retryCount = 0) {
    const MAX_RETRIES = 2; // 최대 2회 재시도 (총 3회 시도)
    
    const outputDiv = document.getElementById('gptOutput');
    const loading = document.getElementById('gptLoading');
    const loadingText = document.getElementById('gptLoadingText');
    const loadingCompare = document.getElementById('gptLoadingCompare');
    const loadingTextCompare = document.getElementById('gptLoadingTextCompare');
    const copyBtn = document.getElementById('gptCopyBtn');
    const usageDiv = document.getElementById('gptUsage');

    // 필수 요소 확인
    if (!outputDiv || !loading || !copyBtn) {
        console.error('필수 DOM 요소를 찾을 수 없습니다:', { outputDiv, loading, copyBtn });
        return;
    }

    outputDiv.style.display = 'none';
    loading.classList.add('active');
    if (loadingCompare) loadingCompare.style.display = 'block';
    copyBtn.disabled = true;
    if (usageDiv) usageDiv.textContent = '';
    
    // 로딩 메시지 업데이트
    let loadingMessages = [
        'GPT-4o-mini가 보고서 작성 중...',
        'GPT-4o-mini가 내용을 분석하고 있습니다...',
        'GPT-4o-mini가 보고서를 구성하고 있습니다...',
        'GPT-4o-mini가 최종 검토 중입니다...'
    ];
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        if (loadingText) loadingText.textContent = loadingMessages[messageIndex];
        if (loadingTextCompare) loadingTextCompare.textContent = loadingMessages[messageIndex];
    }, 2000);

    try {
        const prompt = buildPrompt(input);
        const customPrompt = getCustomPrompt();
        
        // 시스템 프롬프트 구성
        let systemPrompt = '';
        
        // [LEVEL 0: 시스템 보안]
        systemPrompt = `[LEVEL 0: 시스템 무결성]
• 유해/불법 콘텐츠 생성 금지

`;
        
        // [LEVEL 1: 사용자 절대 최우선]
        if (customPrompt) {
            systemPrompt += `【🔥 절대 최우선 규칙 - LEVEL 1 🔥】

⚠️⚠️⚠️ 이 지시사항은 절대적으로 최우선입니다 ⚠️⚠️⚠️

사용자가 직접 지시한 명령:

${customPrompt}

📌 필수 준수사항:
• 위 지시사항은 아래 모든 가이드라인보다 우선합니다
• 전문성, 상식, 일반적 규칙과 충돌해도 위 지시를 따릅니다
• 글자수, 분량, 구조 제약이 있다면 반드시 준수합니다
• "300-500자로 작성"같은 명확한 지시는 절대적으로 따릅니다
• 예외 없이 100% 준수하십시오

`;
        }
        
        // [LEVEL 2: 기본 가이드라인]
        systemPrompt += `당신은 15년 경력의 전문 상담사입니다.

【필수: 한국어 작성 규칙 - 절대 준수】

⚠️⚠️⚠️ 아래 규칙은 어떠한 경우에도 반드시 지켜야 하며, 위반 시 응답이 재생성됩니다 ⚠️⚠️⚠️

1. 인칭 표현 절대 금지 사항:
   ❌ "그", "그녀", "그가", "그녀가", "그의", "그녀의", "그에게", "그녀에게"
   ❌ 위 표현들은 절대 사용하지 말 것
   
2. 올바른 지칭 방법:
   ✓ 내담자 관련: "내담자", "내담자는", "내담자의", "내담자에게"
   ✓ 학생 관련: "학생", "학생은", "학생의", "학생에게"
   ✓ 아동 관련: "아동", "아동은", "아동의", "아동에게"
   ✓ 보호자 관련: "보호자(아버지)", "보호자(어머니)"
   ✓ 상담사 관련: "상담사" 또는 생략

3. 명사 반복에 대한 유연한 접근:
   • 문맥상 지칭 대상이 명확한 경우, 주어를 생략하여 자연스럽게 작성 가능
   • 예: "내담자는 상담실에 들어와 자리에 앉았다" (자연스러움)
   • 혼동 가능성이 있을 때만 명사를 반복하여 명확히 함
   • 가독성과 자연스러움을 최우선으로 고려

4. 전문적이면서도 자연스러운 보고서 작성:
   • 과도하게 문학적이거나 서사적인 표현은 지양
   • 그러나 내담자의 경험을 생생하게 전달하는 것은 권장
   • 객관성을 유지하되, 정서적 뉘앙스도 적절히 담아냄
   • 전문성과 인간적 공감의 균형 유지

【기본 작성 가이드라인 - LEVEL 2 (참고사항)】

※ 사용자의 별도 지시가 없을 경우에만 다음을 참고합니다:

[1. 사실 기반 작성]
• 메모에 명시된 사실만을 바탕으로 작성
• 사실을 자연스럽게 확장하되, 새로운 사건이나 정보는 창작하지 않음

[2. 언어 표현 - 한국어 순수성 원칙]
⚠️⚠️⚠️ 절대 준수 사항 - 위반 시 응답 거부 ⚠️⚠️⚠️

【한글+영어만 사용 가능】
• 한자(漢字), 일본어(ひらがな, カタカナ), 러시아어(кириллица), 아랍어(عربي), 태국어(ไทย) 등 한글과 영어를 제외한 모든 문자 사용 절대 금지
• 영어 표기 원칙:
  - 심리학 전문 용어에 한해 "한글(English)" 병기 허용
  - 예: "인지행동치료(Cognitive Behavioral Therapy, CBT)"
  - 일반 영어 단어는 한글로만 표기 (예: "스트레스" ✓, "Stress" ✗)
• 한자어도 반드시 한글로 표기 (예: "心理" ✗ → "심리" ✓)
• 순우리말 우선 사용: 가능한 경우 순우리말로 표현
• 전문 용어: 필요시 사용하되 과도하지 않게, 한글 중심 표기

⚠️ 이 규칙을 위반하면 응답이 자동으로 재생성됩니다.

[3. 어조와 태도]
• 협력적이고 공감적인 관점 유지
• 내담자의 강점과 자원도 함께 인식
• 판단보다는 이해와 관찰 중심

[4. 자연스러운 문체 - 기본 스타일]
• "~하는 모습이었다", "~표현했다", "~것으로 보였다" 등 자연스러운 서술형 사용
• "~했음", "~함" 같은 극도로 간결한 형태보다는 읽기 편한 문장
• 문장을 적당히 연결하고 풀어서 작성
• 딱딱하지 않으면서도 전문적인 톤 유지
• 경어체("~했습니다"): 특별한 요청이 없으면 사용하지 않음

[5. 개입 표현의 중립화]
• 지시적 개입: 상황에 따라 "~하도록 안내했다", "~제안했다", "~권유했다" 등
• 상담 과정에서의 개입을 중립적이고 전문적으로 표현
• 내담자의 자율성과 상담사의 전문성이 균형있게 드러나도록

[6. 정서 표현]
• 내담자의 정서를 풍부하고 섬세하게 포착
• "불안해 보였다"를 넘어 "목소리 톤이 낮아지고 시선을 피하는 모습에서 불안감이 느껴졌다"
• 건조한 객관성보다는, 공감적 전문성 추구

※ 위 사항들은 모두 사용자의 【보고서 작성 시 반영 사항】에 따라 조정됩니다.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://counseling-journal.app',
                'X-Title': 'Counseling Journal Tool'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GPT API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData: errorData
            });
            throw new Error(`GPT API 요청 실패 (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // 응답 구조 검증
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('GPT API 응답 구조 오류:', data);
            throw new Error('GPT API 응답 형식이 올바르지 않습니다.');
        }
        
        let result = data.choices[0].message.content;
        
        // 언어 검증: 한글+영어 외 언어 감지
        if (containsUnwantedLanguages(result)) {
            if (retryCount < MAX_RETRIES) {
                console.log(`[GPT] 외국어 감지, 재시도 ${retryCount + 1}/${MAX_RETRIES}`);
                // 로딩 상태 유지하고 재시도
                return await generateWithGPT(input, apiKey, retryCount + 1);
            } else {
                console.warn('[GPT] 최대 재시도 횟수 초과, 외국어 제거 후 표시');
                // 3회 시도 후에도 실패하면 외국어만 제거하고 표시
                result = result.replace(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/g, '');
            }
        }
        
        // 원본 텍스트 저장 (복사 기능을 위해)
        outputDiv.setAttribute('data-raw-text', result);
        
        // 마크다운 렌더링 적용
        if (typeof renderMarkdown === 'function') {
            outputDiv.innerHTML = renderMarkdown(result);
            outputDiv.classList.add('markdown-rendered');
        } else {
            outputDiv.textContent = result;
        }
        
        outputDiv.style.display = 'block';
        outputDiv.classList.remove('empty');
        copyBtn.disabled = false;
        
        // 내보내기 버튼 활성화
        const gptExportBtn = document.getElementById('gptExportBtn');
        if (gptExportBtn) gptExportBtn.disabled = false;

        const gptCountElem = document.getElementById('gptCount');
        if (gptCountElem) gptCountElem.textContent = result.length + '자';
        
        // 비교 탭의 글자수도 업데이트
        const gptCountCompareElem = document.getElementById('gptCountCompare');
        if (gptCountCompareElem) gptCountCompareElem.textContent = result.length + '자';
        
        // 비교 탭의 출력도 즉시 표시 (마크다운 렌더링 적용)
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        if (gptOutputCompare) {
            gptOutputCompare.setAttribute('data-raw-text', result);
            if (typeof renderMarkdown === 'function') {
                gptOutputCompare.innerHTML = renderMarkdown(result);
                gptOutputCompare.classList.add('markdown-rendered');
            } else {
                gptOutputCompare.textContent = result;
            }
            gptOutputCompare.style.display = 'block';
        }
        
        // 비교 탭의 복사 버튼도 활성화
        const gptCopyBtnCompare = document.getElementById('gptCopyBtnCompare');
        if (gptCopyBtnCompare) gptCopyBtnCompare.disabled = false;

        if (data.usage && usageDiv) {
            usageDiv.textContent = `${data.usage.total_tokens} 토큰`;
        }

    } catch (error) {
        clearInterval(messageInterval);
        console.error('GPT Error:', error);
        
        // 사용자에게 더 상세한 오류 메시지 표시
        let errorMessage = 'GPT 오류 발생.';
        
        if (error.message.includes('401')) {
            errorMessage = 'GPT API 키가 유효하지 않습니다. 설정에서 API 키를 확인해주세요.';
        } else if (error.message.includes('429')) {
            errorMessage = 'API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('402')) {
            errorMessage = 'GPT API 크레딧이 부족합니다. OpenRouter에서 크레딧을 충전해주세요.';
        } else if (error.message) {
            errorMessage = `GPT 오류: ${error.message}`;
        }
        
        outputDiv.textContent = errorMessage + '\n\n브라우저 콘솔(F12)에서 상세 오류를 확인할 수 있습니다.';
        outputDiv.classList.add('empty');
        outputDiv.style.display = 'block';
    } finally {
        clearInterval(messageInterval);
        loading.classList.remove('active');
        if (loadingCompare) loadingCompare.style.display = 'none';
    }
}

// ==================== 프롬프트 미리보기 ====================
function showPromptPreview() {
    const inputText = document.getElementById('inputText').value.trim() || '예시: 내담자는 최근 학교 문제로 어려움을 겪고 있다고 표현했다.';
    const customPrompt = getCustomPrompt();
    
    // User Prompt 생성
    const userPrompt = buildPrompt(inputText);
    
    // System Prompt 생성 (같은 로직 사용)
    let systemPrompt = '';
    
    systemPrompt = `[LEVEL 0: 시스템 무결성]
• 유해/불법 콘텐츠 생성 금지

`;
    
    if (customPrompt) {
    systemPrompt += `【🔥 절대 최우선 규칙 - LEVEL 1 🔥】

⚠️⚠️⚠️ 이 지시사항은 절대적으로 최우선입니다 ⚠️⚠️⚠️

사용자가 직접 지시한 명령:

${customPrompt}

📌 필수 준수사항:
• 위 지시사항은 아래 모든 가이드라인보다 우선합니다
• 전문성, 상식, 일반적 규칙과 충돌해도 위 지시를 따릅니다
• 글자수, 분량, 구조 제약이 있다면 반드시 준수합니다
• "300-500자로 작성"같은 명확한 지시는 절대적으로 따릅니다
• 예외 없이 100% 준수하십시오

`;
    }
    
    systemPrompt += `당신은 15년 경력의 전문 상담사입니다.

【중요: 마크다운 형식 사용】

보고서는 반드시 마크다운 형식으로 작성합니다:
• 섹션 제목: ## 제목 (h2 사용)
• 하위 제목: ### 하위제목 (h3 사용)
• 강조: **중요한 내용**
• 목록: - 항목 또는 1. 순서
• 인용: > 인용문

【기본 작성 가이드라인 - LEVEL 2 (참고사항)】

※ 사용자의 별도 지시가 없을 경우에만 다음을 참고합니다:
`;

    systemPrompt += `
1. 내담자 지칭: "내담자" 사용 권장
2. 보호자 지칭: "보호자(아버지)", "보호자(어머니)" 등 권장
3. 메모에 명시된 사실만 바탕으로 작성 (사실 창작 지양)
4. 한자: 한글로 표기 권장 (단, 영어는 "한글(English)" 형태 권장)
5. 어조: 협력적이고 공감적인 태도 권장

[기본 문체 권장사항]
- 보고서 형식: "~했다", "~했음", "~한다" 등 간결체 권장
- 경어체("~했습니다"): 가급적 지양 권장
- 강압적 표현: "~시켰다" 대신 "~하도록 격려했다" 권장

※ 위 사항들은 모두 사용자 지시에 따라 변경 가능합니다.`;
    
    // 모달 생성
    const modalHtml = `
        <div class="prompt-preview-modal" id="promptPreviewModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="if(event.target.id === 'promptPreviewModal') this.remove();">
            <div class="prompt-preview-content" style="background: var(--bg-secondary); border-radius: 12px; padding: 30px; max-width: 900px; width: 100%; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" onclick="event.stopPropagation();">
                <div class="prompt-preview-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 15px;">
                    <h2 style="font-size: 1.5em; color: var(--text-primary); margin: 0;">📋 AI에게 전달될 프롬프트</h2>
                    <button onclick="document.getElementById('promptPreviewModal').remove()" style="background: none; border: none; font-size: 1.5em; color: var(--text-tertiary); cursor: pointer; padding: 5px 10px;">✕</button>
                </div>
                
                <div class="prompt-preview-info" style="background: var(--info-bg); border-left: 4px solid var(--info-text); padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9em; color: var(--text-secondary);">
                    💡 이것이 AI에게 실제로 전달되는 프롬프트입니다. "보고서 작성 시 반영 사항"이 최우선으로 적용되는 것을 확인할 수 있습니다.
                </div>
                
                <div class="prompt-section" style="margin-bottom: 20px;">
                    <h3 style="font-size: 1.2em; color: var(--accent-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--accent-primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8em;">1</span>
                        System Prompt (역할 정의)
                    </h3>
                    <pre style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85em; line-height: 1.5; color: var(--text-secondary); max-height: 300px; overflow-y: auto;">${systemPrompt}</pre>
                </div>
                
                <div class="prompt-section" style="margin-bottom: 20px;">
                    <h3 style="font-size: 1.2em; color: var(--accent-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: var(--accent-primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8em;">2</span>
                        User Prompt (사용자 입력)
                    </h3>
                    <pre style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85em; line-height: 1.5; color: var(--text-secondary); max-height: 400px; overflow-y: auto;">${userPrompt}</pre>
                </div>
                
                <div class="prompt-stats" style="display: flex; gap: 15px; padding: 15px; background: var(--bg-tertiary); border-radius: 8px; font-size: 0.9em;">
                    <div style="flex: 1;">
                        <strong style="color: var(--text-primary);">총 길이:</strong>
                        <span style="color: var(--text-secondary);">${(systemPrompt + userPrompt).length.toLocaleString()}자</span>
                    </div>
                    <div style="flex: 1;">
                        <strong style="color: var(--text-primary);">예상 토큰:</strong>
                        <span style="color: var(--text-secondary);">약 ${Math.ceil((systemPrompt + userPrompt).length / 3).toLocaleString()}개</span>
                    </div>
                </div>
                
                <div class="prompt-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="navigator.clipboard.writeText(\'${systemPrompt.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\\n\\n${userPrompt.replace(/'/g, "\\'").replace(/\n/g, '\\n')}\'); showToast('전체 프롬프트가 복사되었습니다.', 2000);" style="padding: 10px 20px; background: var(--accent-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95em; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-hover)';" onmouseout="this.style.background='var(--accent-primary)';">
                        📋 전체 복사
                    </button>
                    <button onclick="document.getElementById('promptPreviewModal').remove()" style="padding: 10px 20px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 0.95em; transition: all 0.2s;" onmouseover="this.style.background='var(--border-color)';" onmouseout="this.style.background='var(--bg-tertiary)';">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// ==================== 내보내기 기능 ====================
function toggleExportMenu(event, model) {
    event.stopPropagation();
    
    // 현재 활성 탭이 비교 탭인지 확인
    const activeTab = document.querySelector('.output-tab.active');
    const isCompareTab = activeTab && activeTab.getAttribute('data-tab') === 'compare';
    
    // 비교 탭의 경우 Compare 버전 메뉴 ID 사용
    const menuId = isCompareTab
        ? (model === 'groq' ? 'groqExportMenuCompare' : 'gptExportMenuCompare')
        : (model === 'groq' ? 'groqExportMenu' : 'gptExportMenu');
    
    const menu = document.getElementById(menuId);
    
    if (!menu) {
        console.error('Export menu not found:', menuId);
        return;
    }
    
    // 다른 메뉴 닫기
    document.querySelectorAll('.export-menu').forEach(m => {
        if (m.id !== menuId) m.classList.remove('active');
    });
    
    menu.classList.toggle('active');
}

// 외부 클릭 시 메뉴 닫기
document.addEventListener('click', function() {
    document.querySelectorAll('.export-menu').forEach(menu => {
        menu.classList.remove('active');
    });
});

function exportAs(model, format) {
    // 현재 활성 탭이 비교 탭인지 확인
    const activeTab = document.querySelector('.output-tab.active');
    const isCompareTab = activeTab && activeTab.getAttribute('data-tab') === 'compare';
    
    // 탭에 따라 올바른 출력 ID 선택
    const outputId = isCompareTab 
        ? (model === 'groq' ? 'groqOutputCompare' : 'gptOutputCompare')  // 비교 탭
        : (model === 'groq' ? 'groqOutput' : 'gptOutput');               // 일반 탭
    
    const content = document.getElementById(outputId).textContent;
    const modelName = model === 'groq' ? 'Groq' : 'GPT-4o-mini';
    const timestamp = new Date().toLocaleString('ko-KR').replace(/[:.\s]/g, '-');
    const filename = `상담보고서_${modelName}_${timestamp}`;
    
    // 메뉴 닫기
    document.querySelectorAll('.export-menu').forEach(menu => {
        menu.classList.remove('active');
    });
    
    switch(format) {
        case 'txt':
            exportAsTxt(content, filename);
            break;
        case 'docx':
            exportAsDocx(content, filename);
            break;
        case 'pdf':
            exportAsPdf(content, filename);
            break;
    }
}

function exportAsTxt(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📝 TXT 파일로 저장되었습니다.', 2000);
}

async function exportAsDocx(content, filename) {
    try {
        // HTML 기반으로 DOCX 형식 생성 (Word가 HTML을 읽을 수 있음)
        // 이 방법은 라이브러리 없이도 작동함
        
        const lines = content.split('\n');
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: '맑은 고딕', 'Malgun Gothic', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            margin: 2.54cm;
        }
        .section-title {
            font-weight: bold;
            font-size: 14pt;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        p {
            margin: 0;
            margin-bottom: 6pt;
        }
    </style>
</head>
<body>
`;
        
        // 라인별로 HTML 생성
        for (const line of lines) {
            const isSectionTitle = line.match(/^\[(.+)\]$/);
            
            if (isSectionTitle) {
                htmlContent += `    <p class="section-title">${line}</p>\n`;
            } else if (line.trim()) {
                htmlContent += `    <p>${line}</p>\n`;
            } else {
                htmlContent += `    <p>&nbsp;</p>\n`;
            }
        }
        
        htmlContent += `</body>\n</html>`;
        
        // Blob 생성 (Word가 읽을 수 있는 HTML 형식)
        const blob = new Blob([htmlContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename + '.doc';  // .doc 확장자 사용
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('📄 Word 파일로 저장되었습니다. (.doc)', 2000);
    } catch (error) {
        console.error('DOCX export error:', error);
        showError('Word 파일 생성 중 오류: ' + error.message);
    }
}

function exportAsPdf(content, filename) {
    try {
        const { jsPDF } = window.jspdf;
        
        // A4 사이즈로 PDF 생성
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // 여백 설정
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxWidth = pageWidth - (margin * 2);
        
        // 한글을 이미지로 변환하여 삽입하는 방식
        // Canvas를 사용하여 텍스트를 이미지로 렌더링
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 캔버스 크기 설정 (A4 비율)
        canvas.width = 794;  // A4 width at 96 DPI
        canvas.height = 1123; // A4 height at 96 DPI
        
        // 배경 흰색으로 설정
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 텍스트 스타일 설정
        ctx.fillStyle = '#000000';
        ctx.font = '14px "Malgun Gothic", "맑은 고딕", sans-serif';
        ctx.textBaseline = 'top';
        
        const lineHeight = 20;
        const marginPx = 60;
        let y = marginPx;
        
        // 텍스트를 라인별로 렌더링
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            // 섹션 제목 확인
            const isSectionTitle = line.match(/^\[(.+)\]$/);
            
            if (isSectionTitle) {
                // 섹션 제목은 볼드체로
                ctx.font = 'bold 16px "Malgun Gothic", "맑은 고딕", sans-serif';
                y += 10; // 추가 여백
            } else {
                ctx.font = '14px "Malgun Gothic", "맑은 고딕", sans-serif';
            }
            
            // 긴 줄은 자동 줄바꿈
            const maxChars = 60;
            if (line.length > maxChars) {
                const words = line.match(/.{1,60}/g) || [line];
                words.forEach(word => {
                    if (y > canvas.height - marginPx) {
                        // 페이지 넘김 처리는 간단히 생략 (한 페이지로 제한)
                        return;
                    }
                    ctx.fillText(word, marginPx, y);
                    y += lineHeight;
                });
            } else {
                if (y < canvas.height - marginPx) {
                    ctx.fillText(line || ' ', marginPx, y);
                    y += lineHeight;
                }
            }
        });
        
        // 캔버스를 이미지로 변환하여 PDF에 추가
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        
        doc.save(filename + '.pdf');
        showToast('🔒 PDF 파일로 저장되었습니다.', 2000);
    } catch (error) {
        console.error('PDF export error:', error);
        showError('PDF 파일 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// ==================== 메인 로직 ====================
async function generateJournals(event) {
    event.stopPropagation();
    const input = document.getElementById('inputText').value.trim();

    if (!input) {
        showError('상담 메모를 먼저 입력해주세요.');
        return;
    }

    // 사용량 체크는 usage-bridge.js에서 처리함
    // 여기서는 API 키만 확인
    const { groq: groqKey, gpt: gptKey } = getApiKeys();

    if (!groqKey && !gptKey) {
        showError('⚠️ 설정에서 API 키를 먼저 입력해주세요.');
        return;
    }

    // 생성 시작 알림
    showToast('🔄 보고서 작성 중...', 1500);

    // 이전 결과 초기화
    if (groqKey) {
        const groqOutput = document.getElementById('groqOutput');
        if (groqOutput) {
            groqOutput.textContent = '';
            groqOutput.style.display = 'none';
        }
        const groqCount = document.getElementById('groqCount');
        if (groqCount) groqCount.textContent = '0자';
        const groqUsage = document.getElementById('groqUsage');
        if (groqUsage) groqUsage.textContent = '';
        const groqCopyBtn = document.getElementById('groqCopyBtn');
        if (groqCopyBtn) groqCopyBtn.disabled = true;
        const groqExportBtn = document.getElementById('groqExportBtn');
        if (groqExportBtn) groqExportBtn.disabled = true;
        const groqSaveBtn = document.getElementById('groqSaveBtn');
        if (groqSaveBtn) groqSaveBtn.disabled = true;
    }
    if (gptKey) {
        const gptOutput = document.getElementById('gptOutput');
        if (gptOutput) {
            gptOutput.textContent = '';
            gptOutput.style.display = 'none';
        }
        const gptCount = document.getElementById('gptCount');
        if (gptCount) gptCount.textContent = '0자';
        const gptUsage = document.getElementById('gptUsage');
        if (gptUsage) gptUsage.textContent = '';
        const gptCopyBtn = document.getElementById('gptCopyBtn');
        if (gptCopyBtn) gptCopyBtn.disabled = true;
        const gptExportBtn = document.getElementById('gptExportBtn');
        if (gptExportBtn) gptExportBtn.disabled = true;
        const gptSaveBtn = document.getElementById('gptSaveBtn');
        if (gptSaveBtn) gptSaveBtn.disabled = true;
    }

    // 엠티 스테이트 숨기고 출력 탭 표시
    const emptyState = document.getElementById('emptyState');
    const outputTabs = document.getElementById('outputTabs');
    if (emptyState) emptyState.style.display = 'none';
    if (outputTabs) outputTabs.style.display = 'flex';

    const generateBtn = document.getElementById('generateBtn');
    const originalBtnText = generateBtn.textContent;
    generateBtn.textContent = '⏳ 작성 중...';
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';

    const promises = [];
    if (groqKey) promises.push(generateWithGroq(input, groqKey));
    if (gptKey) promises.push(generateWithGPT(input, gptKey));

    // 사용량은 usage-bridge.js에서 이미 증가됨 (버튼 클릭 시)
    // 여기서는 추가 증가 불필요

    Promise.all(promises).finally(() => {
        generateBtn.textContent = originalBtnText;
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        
        showToast('✅ 보고서 작성 완료!', 2000);
    });
}

// ==================== 초기화 ====================
function initialize() {
    // UsageCounter 초기화 (최우선)
    if (typeof UsageCounter !== 'undefined' && typeof UsageCounter.init === 'function') {
        console.log('[App] UsageCounter 초기화 시작');
        UsageCounter.init();
        console.log('[App] UsageCounter 초기화 완료');
    } else {
        console.error('[App] UsageCounter를 찾을 수 없습니다!');
    }
    
    // 설정 페이지에서만 loadSettings 호출
    if (document.getElementById('groqApiKey') || document.getElementById('customPrompt')) {
        loadSettings();
    }
    
    loadTheme();
    loadFontSize();
    
    // 대시보드에서 넘어온 히스토리 복원 (report.html에서만 동작)
    const loadReportId = sessionStorage.getItem('loadReportId');
    if (loadReportId && typeof loadReport === 'function') {
        sessionStorage.removeItem('loadReportId');
        setTimeout(() => {
            loadReport(parseInt(loadReportId));
        }, 100);
    }
    
    // 개선 기능 초기화
    if (typeof startAutoSave === 'function') startAutoSave();
    if (typeof restoreAutoSavedInput === 'function' && !loadReportId) restoreAutoSavedInput();
    initKeyboardShortcuts();
    if (typeof initializeUIEnhancements === 'function') initializeUIEnhancements();
    
    // 사용량 제한은 usage-bridge.js에서 처리
    // initializeUsageLimit() 호출 제거
    
    // 마크다운 렌더링 초기화
    if (typeof initializeMarkdownRendering === 'function') initializeMarkdownRendering();
    
    // 첫 실행 가이드
    showFirstRunGuide();
}

function showFirstRunGuide() {
    if (!localStorage.getItem('first_run_complete')) {
        setTimeout(() => {
            showToast('👋 처음 오셨나요? 먼저 설정(⚙️)에서 API 키를 입력해주세요!', 5000);
        }, 500);
        localStorage.setItem('first_run_complete', 'true');
    }
}



// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // UsageCounter가 로드될 때까지 대기
        setTimeout(initialize, 50);
    });
} else {
    // 이미 로드된 경우도 약간 대기
    setTimeout(initialize, 50);
}


