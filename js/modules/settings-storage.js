/**
 * Settings & LocalStorage helpers
 * app.js에서 분리해 유지보수성을 높이기 위한 모듈
 */
(function(global) {
    'use strict';

    function loadSettings() {
        const groqKey = loadApiKeySafely(STORAGE_KEYS.GROQ_API);
        const gptKey = loadApiKeySafely(STORAGE_KEYS.GPT_API);

        const groqInput = document.getElementById('groqApiKey');
        const gptInput = document.getElementById('gptApiKey');
        if (groqInput) groqInput.value = groqKey;
        if (gptInput) gptInput.value = gptKey;

        const customPrompt = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROMPT) || '';
        const customPromptInput = document.getElementById('customPrompt');
        if (customPromptInput) customPromptInput.value = customPrompt;

        const styleSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLE_SETTINGS) || '{}');
        STYLE_IDS.forEach(id => {
            const select = document.getElementById(`style_${id}`);
            if (select && styleSettings[id]) {
                select.value = styleSettings[id];
            }
        });

        const formatOptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMAT_OPTIONS) || '[]');
        formatOptions.forEach(option => {
            const checkbox = document.getElementById(`format_${option}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    function validateApiKeys() {
        const groqInput = document.getElementById('groqApiKey');
        const gptInput = document.getElementById('gptApiKey');
        const groqKey = groqInput ? groqInput.value.trim() : '';
        const gptKey = gptInput ? gptInput.value.trim() : '';

        if (!groqKey && !gptKey) {
            return {
                valid: false,
                message: '⚠️ 최소 하나의 API 키를 입력해주세요.'
            };
        }

        return { valid: true };
    }

    function saveSettingsToStorage() {
        const groqInput = document.getElementById('groqApiKey');
        const gptInput = document.getElementById('gptApiKey');

        const groqKey = groqInput ? groqInput.value.trim() : '';
        const gptKey = gptInput ? gptInput.value.trim() : '';

        const validation = validateApiKeys();
        if (!validation.valid) {
            showError(validation.message);

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

        saveApiKeySafely(STORAGE_KEYS.GROQ_API, groqKey);
        saveApiKeySafely(STORAGE_KEYS.GPT_API, gptKey);

        const customPromptInput = document.getElementById('customPrompt');
        const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PROMPT, customPrompt);

        const styleSettings = {};
        STYLE_IDS.forEach(id => {
            const select = document.getElementById(`style_${id}`);
            if (select && select.value) {
                styleSettings[id] = select.value;
            }
        });
        localStorage.setItem(STORAGE_KEYS.STYLE_SETTINGS, JSON.stringify(styleSettings));

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
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
    }

    function loadFontSize() {
        const savedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
        if (savedFontSize) {
            document.body.style.fontSize = savedFontSize + 'px';
        }
    }

    Object.assign(global, {
        loadSettings,
        validateApiKeys,
        saveSettingsToStorage,
        getApiKeys,
        getCustomPrompt,
        getStyleSettings,
        getFormatOptions,
        loadTheme,
        loadFontSize
    });
})(typeof window !== 'undefined' ? window : this);
