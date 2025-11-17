/**
 * UI control helpers extracted from app.js for better modularity
 */
(function(global) {
    'use strict';

    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('active');

            setTimeout(() => {
                errorDiv.classList.remove('active');
            }, 5000);
        }

        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel && settingsPanel.classList.contains('active')) {
            showToast(message, 3000);
        } else if (!settingsPanel) {
            showToast(message, 3000);
        }
    }

    function toggleApiKeyVisibility(type) {
        const inputId = type === 'groq' ? 'groqApiKey' : 'gptApiKey';
        const input = document.getElementById(inputId);

        if (!input) return;

        let button = null;

        const apiKeyItem = input.closest('.api-key-item');
        if (apiKeyItem) {
            button = apiKeyItem.querySelector('.btn, .btn--small, .btn-toggle-key');
        }

        if (!button) {
            const apiLineGroup = input.closest('.api-line-input-group');
            if (apiLineGroup) {
                button = apiLineGroup.querySelector('.btn-toggle-visibility');
            }
        }

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
        const fileInput = document.getElementById('apiKeyFileInput');
        if (fileInput) {
            fileInput.click();
        }
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

        event.target.value = '';
    }

    function resetSettings() {
        if (!confirm('API 키를 제외한 모든 설정을 초기화하시겠습니까?\n\n초기화되는 항목:\n- 보고서 생성 규칙\n- 보고서 구조 설정\n- 문체 스타일 설정\n- 화면 설정 (글꼴 크기)\n- 보고서 옵션 (분량/구체도)\n- 즐겨 찾는 설정 모음')) {
            return;
        }

        const styleSelects = document.querySelectorAll('.style-select select');
        styleSelects.forEach(select => {
            select.value = '';
            select.dispatchEvent(new Event('change'));
        });

        localStorage.removeItem(STORAGE_KEYS.STYLE_SETTINGS);

        document.querySelectorAll('.format-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        localStorage.removeItem(STORAGE_KEYS.FORMAT_OPTIONS);

        document.querySelectorAll('.format-toggles input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        localStorage.removeItem(STORAGE_KEYS.FORMAT_TOGGLES);

        const customPromptInput = document.getElementById('customPrompt');
        if (customPromptInput) {
            customPromptInput.value = '';
        }
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_PROMPT);

        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 16;
            document.documentElement.style.fontSize = '16px';
            if (typeof updateFontSizeHighlight === 'function') {
                updateFontSizeHighlight('16');
            }
        }
        localStorage.setItem(STORAGE_KEYS.FONT_SIZE, '16');

        const detailLevelSlider = document.getElementById('detailLevelSlider');
        if (detailLevelSlider) {
            detailLevelSlider.value = 0;
            if (typeof updateDetailLevelHighlight === 'function') {
                updateDetailLevelHighlight('0');
            }
        }
        localStorage.setItem(STORAGE_KEYS.DETAIL_LEVEL, '0');

        localStorage.removeItem('settings_presets');
        localStorage.setItem('active_preset_id', '0');

        if (typeof renderPresetList === 'function') {
            renderPresetList();
        }

        const presetCountElem = document.getElementById('presetCount');
        if (presetCountElem) {
            presetCountElem.textContent = '0';
        }

        showToast('✅ 설정이 초기화되었습니다. (API 키는 유지)', 2000);
    }

    function toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        const btn = document.getElementById('settingsBtn');

        if (!panel || !btn) return;

        panel.classList.toggle('active');
        btn.classList.toggle('active');

        if (!panel.classList.contains('active')) {
            loadSettings();
        }
    }

    function toggleApiGuide() {
        const guideContent = document.getElementById('apiGuideContent');
        if (guideContent) {
            guideContent.classList.toggle('active');
        }
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
        if (confirm('메인 화면으로 돌아가시겠어요? 작성 중인 내용은 사라집니다.')) {
            location.reload();
        }
    }

    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.dataset.theme || 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // 테마 적용
        html.dataset.theme = nextTheme;
        localStorage.setItem('theme', nextTheme);
        
        // applyTheme 함수가 있으면 호출 (하위 호환성)
        if (typeof applyTheme === 'function') {
            applyTheme(nextTheme, false);
        }
        
        console.log('[Theme] 테마 전환:', currentTheme, '→', nextTheme);
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

    Object.assign(global, {
        showError,
        toggleApiKeyVisibility,
        clearApiKey,
        exportApiKeys,
        importApiKeys,
        handleApiKeyFile,
        resetSettings,
        toggleSettings,
        toggleApiGuide,
        saveSettings,
        cancelSettings,
        resetToMain,
        toggleTheme,
        changeFontSize,
        resetFontSize
    });
})(typeof window !== 'undefined' ? window : this);
