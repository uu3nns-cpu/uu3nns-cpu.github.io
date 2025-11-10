// === STORAGE_KEYS 병합 가드 (로드 순서 무관하게 작동) ===
(function ensureStorageKeys(){ 
  try {
    var needed = {
      PRESETS: 'settings_presets',
      ACTIVE_PRESET: 'active_preset_id',
      CUSTOM_PROMPT: 'customPrompt',
      STYLE_SETTINGS: 'styleSettings',
      FORMAT_OPTIONS: 'formatOptions',
      THEME: 'theme',
      FONT_SIZE: 'fontSize',
      DETAIL_LEVEL: 'detailLevel',
      GROQ_API: 'groqApiKey',
      GPT_API: 'gptApiKey'
    };
    if (typeof window !== 'undefined') {
      window.STORAGE_KEYS = Object.assign({}, window.STORAGE_KEYS || {}, needed);
    }
  } catch (e) {
    console.error('[ensureStorageKeys] merge failed:', e);
  }
})();

/**
 * 데이터 관리 시스템
 * API 키, 프리셋 백업/복원
 */

// ======================
// 복원 옵션 표시 함수 (HTML에서 먼저 호출되므로 최상단에 배치)
// ======================

function showRestoreOptions(type) {
    const optionsEl = document.getElementById(`${type}RestoreOptions`);
    if (optionsEl) {
        optionsEl.classList.toggle('show');
    }
}

// ======================
// 데이터 현황 확인
// ======================

function refreshStatus() {
    console.log('[Data Management] refreshStatus 호출됨');
    
    // ===== API 키 상태 =====
    let apiCount = 0;
    let apiNames = [];
    
    const groqEncoded = localStorage.getItem(window.STORAGE_KEYS.GROQ_API);
    const gptEncoded = localStorage.getItem(window.STORAGE_KEYS.GPT_API);
    
    let groqKey = '';
    let gptKey = '';
    
    if (typeof loadApiKeySafely === 'function') {
        groqKey = loadApiKeySafely(window.STORAGE_KEYS.GROQ_API);
        gptKey = loadApiKeySafely(window.STORAGE_KEYS.GPT_API);
    } else {
        if (groqEncoded) {
            try {
                const base64 = groqEncoded.split('').reverse().join('');
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                groqKey = new TextDecoder().decode(bytes);
            } catch (e) {
                console.error('[Data Management] Groq 키 디코딩 실패:', e);
            }
        }
        
        if (gptEncoded) {
            try {
                const base64 = gptEncoded.split('').reverse().join('');
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                gptKey = new TextDecoder().decode(bytes);
            } catch (e) {
                console.error('[Data Management] GPT 키 디코딩 실패:', e);
            }
        }
    }
    
    if (groqKey && groqKey.length > 0) {
        apiCount++;
        apiNames.push('Groq');
    }
    if (gptKey && gptKey.length > 0) {
        apiCount++;
        apiNames.push('GPT');
    }
    
    updateStatusCard('api', apiCount, 
        apiCount > 0 ? apiNames.join(', ') : '저장된 API 키가 없습니다');
    
    // ===== 프리셋 상태 =====
    const presets = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.PRESETS) || '[]');
    const customPresets = presets.filter(p => !p.isDefault);
    updateStatusCard('preset', presets.length,
        presets.length > 0 ? `기본 ${presets.filter(p => p.isDefault).length}개 + 사용자 ${customPresets.length}개` : '저장된 설정이 없습니다');
    
    // ===== 보고서 상태 =====
    let reports = [];
    try {
        const savedReports = localStorage.getItem('saved_reports');
        if (savedReports) {
            reports = JSON.parse(savedReports);
            // 배열이 아니면 빈 배열로 초기화
            if (!Array.isArray(reports)) {
                console.warn('[Data Management] saved_reports가 배열이 아닙니다. 초기화합니다.');
                reports = [];
                localStorage.setItem('saved_reports', '[]');
            }
        }
    } catch (e) {
        console.error('[Data Management] 보고서 데이터 파싱 오류:', e);
        reports = [];
        localStorage.setItem('saved_reports', '[]');
    }
    
    const activeReports = reports.filter(r => !r.isDeleted);
    updateStatusCard('reports', activeReports.length,
        activeReports.length > 0 ? `활성 ${activeReports.length}개 / 전체 ${reports.length}개` : '저장된 보고서가 없습니다');
    
    // ===== 전체 데이터 크기 =====
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += new Blob([key + value]).size;
    }
    
    const totalSizeStr = totalSize > 1024 * 1024 
        ? (totalSize / (1024 * 1024)).toFixed(2) + ' MB'
        : (totalSize / 1024).toFixed(2) + ' KB';
    
    document.getElementById('totalSize').textContent = totalSizeStr;
    document.getElementById('totalMeta').textContent = `전체 ${localStorage.length}개 항목`;
    
    // ===== 버튼 상태 업데이트 =====
    const backupApiBtn = document.getElementById('backupApiBtn');
    const backupPresetsBtn = document.getElementById('backupPresetsBtn');
    const backupReportsBtn = document.getElementById('backupReportsBtn');
    const deleteApiBtn = document.getElementById('deleteApiBtn');
    const deletePresetsBtn = document.getElementById('deletePresetsBtn');
    const deleteReportsBtn = document.getElementById('deleteReportsBtn');
    
    if (backupApiBtn) backupApiBtn.disabled = apiCount === 0;
    if (backupPresetsBtn) backupPresetsBtn.disabled = presets.length === 0;
    if (backupReportsBtn) backupReportsBtn.disabled = reports.length === 0;
    
    if (deleteApiBtn) deleteApiBtn.disabled = apiCount === 0;
    if (deletePresetsBtn) deletePresetsBtn.disabled = customPresets.length === 0;
    if (deleteReportsBtn) deleteReportsBtn.disabled = reports.length === 0;
}

function updateStatusCard(type, count, metaText) {
    const countEl = document.getElementById(`${type}Count`);
    const valueEl = document.getElementById(`${type}Value`);
    const metaEl = document.getElementById(`${type}Meta`);
    
    if (countEl) countEl.textContent = count;
    if (valueEl) {
        valueEl.className = count > 0 ? 'status-value' : 'status-value empty';
    }
    if (metaEl) metaEl.textContent = metaText;
}

function calculateSize(str) {
    const bytes = new Blob([str]).size;
    if (bytes > 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes > 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return bytes + ' B';
    }
}

// ======================
// 백업 기능
// ======================

function backupApiKeys() {
    const groqKey = loadApiKeySafely(window.STORAGE_KEYS.GROQ_API);
    const gptKey = loadApiKeySafely(window.STORAGE_KEYS.GPT_API);
    
    if (!groqKey && !gptKey) {
        alert('백업할 API 키가 없습니다.');
        return;
    }
    
    const backupData = {
        version: '1.0',
        appName: 'RE: Report Effortless',
        backupType: 'apiKeys',
        backupDate: new Date().toISOString(),
        encrypted: true,
        data: {
            groqApiKey: groqKey || null,
            gptApiKey: gptKey || null
        }
    };
    
    downloadJson(backupData, 'RE_apikeys_backup');
    showToast('✅ API 키가 백업되었습니다', 2000);
}

function backupPresets() {
    const presets = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.PRESETS) || '[]');
    
    if (presets.length === 0) {
        alert('백업할 설정 모음이 없습니다.');
        return;
    }
    
    const backupData = {
        version: '1.0',
        appName: 'RE: Report Effortless',
        backupType: 'presets',
        backupDate: new Date().toISOString(),
        itemCount: presets.length,
        data: {
            presets: presets,
            activePresetId: localStorage.getItem(window.STORAGE_KEYS.ACTIVE_PRESET) || '0'
        }
    };
    
    downloadJson(backupData, 'RE_presets_backup');
    showToast(`✅ ${presets.length}개의 설정이 백업되었습니다`, 2000);
}

function backupAll() {
    const groqKey = loadApiKeySafely(window.STORAGE_KEYS.GROQ_API);
    const gptKey = loadApiKeySafely(window.STORAGE_KEYS.GPT_API);
    const presets = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.PRESETS) || '[]');
    const reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
    
    const backupData = {
        version: '1.0',
        appName: 'RE: Report Effortless',
        backupType: 'full',
        backupDate: new Date().toISOString(),
        encrypted: true,
        data: {
            apiKeys: {
                groqApiKey: groqKey || null,
                gptApiKey: gptKey || null
            },
            presets: {
                presets: presets,
                activePresetId: localStorage.getItem(window.STORAGE_KEYS.ACTIVE_PRESET) || '0'
            },
            reports: reports,
            settings: {
                customPrompt: localStorage.getItem(window.STORAGE_KEYS.CUSTOM_PROMPT) || '',
                styleSettings: localStorage.getItem(window.STORAGE_KEYS.STYLE_SETTINGS) || '{}',
                formatOptions: localStorage.getItem(window.STORAGE_KEYS.FORMAT_OPTIONS) || '[]',
                fontSize: localStorage.getItem(window.STORAGE_KEYS.FONT_SIZE) || '16',
                detailLevel: localStorage.getItem(window.STORAGE_KEYS.DETAIL_LEVEL) || '0'
            }
        }
    };
    
    downloadJson(backupData, 'RE_full_backup');
    showToast('✅ 전체 데이터가 백업되었습니다', 2000);
}

function backupReports() {
    const reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
    
    if (reports.length === 0) {
        alert('백업할 보고서가 없습니다.');
        return;
    }
    
    const activeReports = reports.filter(r => !r.isDeleted);
    
    const backupData = {
        version: '1.0',
        appName: 'RE: Report Effortless',
        backupType: 'reports',
        backupDate: new Date().toISOString(),
        itemCount: reports.length,
        activeCount: activeReports.length,
        data: {
            reports: reports
        }
    };
    
    downloadJson(backupData, 'RE_reports_backup');
    showToast(`✅ ${reports.length}개의 보고서가 백업되었습니다`, 2000);
}

// ======================
// 복원 기능
// ======================

function restoreApiKeys(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || data.backupType !== 'apiKeys') {
                alert('올바른 API 키 백업 파일이 아닙니다.');
                return;
            }
            
            if (!confirm('API 키를 복원하시겠습니까?\n기존 API 키가 있다면 덮어쓰여집니다.')) {
                return;
            }
            
            let restoredCount = 0;
            
            if (data.data.groqApiKey) {
                saveApiKeySafely(window.STORAGE_KEYS.GROQ_API, data.data.groqApiKey);
                restoredCount++;
            }
            
            if (data.data.gptApiKey) {
                saveApiKeySafely(window.STORAGE_KEYS.GPT_API, data.data.gptApiKey);
                restoredCount++;
            }
            
            refreshStatus();
            alert(`✅ ${restoredCount}개의 API 키가 복원되었습니다.`);
            
        } catch (error) {
            console.error('복원 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    
    reader.readAsText(file);
    document.getElementById('restoreApiInput').value = '';
}

function restorePresets(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || data.backupType !== 'presets') {
                alert('올바른 설정 모음 백업 파일이 아닙니다.');
                return;
            }
            
            const existingPresets = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.PRESETS) || '[]');
            const finalPresets = data.data.presets;
            
            if (!confirm(
                `⚠️ 설정 모음을 복원하시겠습니까?\n\n` +
                `기존 설정: ${existingPresets.length}개 (삭제됨)\n` +
                `복원될 설정: ${finalPresets.length}개\n\n` +
                `모든 기존 설정이 삭제되고 새 설정으로 교체됩니다.`
            )) {
                return;
            }
            
            localStorage.setItem(window.STORAGE_KEYS.PRESETS, JSON.stringify(finalPresets));
            if (data.data.activePresetId) {
                localStorage.setItem(window.STORAGE_KEYS.ACTIVE_PRESET, data.data.activePresetId);
            }
            
            refreshStatus();
            alert(`✅ 설정 모음이 복원되었습니다!\n복원된 설정 수: ${finalPresets.length}개`);
            
        } catch (error) {
            console.error('복원 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    
    reader.readAsText(file);
    document.getElementById('restorePresetsInput').value = '';
}

function restoreAll(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || data.backupType !== 'full') {
                alert('올바른 전체 백업 파일이 아닙니다.');
                return;
            }
            
            if (!confirm(
                `⚠️ 전체 데이터를 복원하시겠습니까?\n\n` +
                `모든 기존 데이터가 삭제되고 백업 파일로 교체됩니다.\n` +
                `이 작업은 되돌릴 수 없습니다!`
            )) {
                return;
            }
            
            localStorage.clear();
            
            // API 키 복원
            if (data.data.apiKeys) {
                if (data.data.apiKeys.groqApiKey) {
                    saveApiKeySafely(window.STORAGE_KEYS.GROQ_API, data.data.apiKeys.groqApiKey);
                }
                if (data.data.apiKeys.gptApiKey) {
                    saveApiKeySafely(window.STORAGE_KEYS.GPT_API, data.data.apiKeys.gptApiKey);
                }
            }
            
            // 프리셋 복원
            if (data.data.presets) {
                localStorage.setItem(window.STORAGE_KEYS.PRESETS, JSON.stringify(data.data.presets.presets));
                
                if (data.data.presets.activePresetId) {
                    localStorage.setItem(window.STORAGE_KEYS.ACTIVE_PRESET, data.data.presets.activePresetId);
                }
            }
            
            // 보고서 복원
            if (data.data.reports) {
                localStorage.setItem('saved_reports', JSON.stringify(data.data.reports));
            }
            
            // 설정 복원
            if (data.data.settings) {
                Object.entries(data.data.settings).forEach(([key, value]) => {
                    if (value) {
                        localStorage.setItem(window.STORAGE_KEYS[key.toUpperCase().replace(/([A-Z])/g, '_$1')] || key, value);
                    }
                });
            }
            
            refreshStatus();
            alert('✅ 전체 데이터가 복원되었습니다!');
            
        } catch (error) {
            console.error('복원 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    
    reader.readAsText(file);
    document.getElementById('restoreAllInput').value = '';
}

// ======================
// 유틸리티
// ======================

function downloadJson(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const fullFilename = `${filename}_${dateStr}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Data Management] 페이지 로드 완료');
    refreshStatus();
    setInterval(refreshStatus, 5000);
});

// 보고서 복원 함수
function restoreReports(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || data.backupType !== 'reports') {
                alert('올바른 보고서 백업 파일이 아닙니다.');
                return;
            }
            
            let existingReports = [];
            try {
                existingReports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
                if (!Array.isArray(existingReports)) {
                    existingReports = [];
                }
            } catch (e) {
                existingReports = [];
            }
            
            const finalReports = data.data.reports;
            
            if (!confirm(
                `⚠️ 보고서를 복원하시겠습니까?\n\n` +
                `기존 보고서: ${existingReports.length}개 (삭제됨)\n` +
                `복원될 보고서: ${finalReports.length}개\n\n` +
                `모든 기존 보고서가 삭제되고 새 보고서로 교체됩니다.`
            )) {
                return;
            }
            
            localStorage.setItem('saved_reports', JSON.stringify(finalReports));
            
            refreshStatus();
            alert(`✅ 보고서가 복원되었습니다!\n복원된 보고서 수: ${finalReports.length}개`);
            
        } catch (error) {
            console.error('복원 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    
    reader.readAsText(file);
    document.getElementById('restoreReportsInput').value = '';
}

// ======================
// 삭제 & 초기화 기능
// ======================

function deleteApiKeys() {
    const groqKey = loadApiKeySafely(window.STORAGE_KEYS.GROQ_API);
    const gptKey = loadApiKeySafely(window.STORAGE_KEYS.GPT_API);
    
    if (!groqKey && !gptKey) {
        alert('삭제할 API 키가 없습니다.');
        return;
    }
    
    let keyList = [];
    if (groqKey) keyList.push('Groq');
    if (gptKey) keyList.push('GPT');
    
    if (!confirm(
        `⚠️ API 키를 삭제하시겠습니까?\n\n` +
        `삭제될 키: ${keyList.join(', ')}\n\n` +
        `이 작업은 되돌릴 수 없습니다!`
    )) {
        return;
    }
    
    localStorage.removeItem(window.STORAGE_KEYS.GROQ_API);
    localStorage.removeItem(window.STORAGE_KEYS.GPT_API);
    
    refreshStatus();
    showToast('✅ API 키가 삭제되었습니다', 2000);
}

function deletePresets() {
    const presets = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.PRESETS) || '[]');
    const customPresets = presets.filter(p => !p.isDefault);
    
    if (customPresets.length === 0) {
        alert('삭제할 사용자 설정이 없습니다.');
        return;
    }
    
    if (!confirm(
        `⚠️ 사용자 설정 프리셋을 삭제하시겠습니까?\n\n` +
        `삭제될 설정: ${customPresets.length}개\n` +
        `기본 설정은 유지됩니다\n\n` +
        `이 작업은 되돌릴 수 없습니다!`
    )) {
        return;
    }
    
    // 기본 설정만 남기고 사용자 설정 삭제
    const defaultPresets = presets.filter(p => p.isDefault);
    localStorage.setItem(window.STORAGE_KEYS.PRESETS, JSON.stringify(defaultPresets));
    
    // 활성 프리셋이 삭제된 경우 기본으로 변경
    const activePresetId = localStorage.getItem(window.STORAGE_KEYS.ACTIVE_PRESET);
    if (activePresetId && !defaultPresets.find(p => p.id === activePresetId)) {
        localStorage.setItem(window.STORAGE_KEYS.ACTIVE_PRESET, '0');
    }
    
    refreshStatus();
    showToast(`✅ ${customPresets.length}개의 사용자 설정이 삭제되었습니다`, 2000);
}

function deleteReports() {
    let reports = [];
    try {
        reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
        if (!Array.isArray(reports)) {
            reports = [];
        }
    } catch (e) {
        console.error('보고서 데이터 파싱 오류:', e);
        reports = [];
    }
    
    if (reports.length === 0) {
        alert('삭제할 보고서가 없습니다.');
        return;
    }
    
    const activeReports = reports.filter(r => !r.isDeleted);
    
    if (!confirm(
        `⚠️ 모든 보고서를 삭제하시겠습니까?\n\n` +
        `전체 보고서: ${reports.length}개\n` +
        `활성 보고서: ${activeReports.length}개\n\n` +
        `이 작업은 되돌릴 수 없습니다!`
    )) {
        return;
    }
    
    localStorage.removeItem('saved_reports');
    
    refreshStatus();
    showToast(`✅ ${reports.length}개의 보고서가 삭제되었습니다`, 2000);
}

function resetAll() {
    if (!confirm(
        `⚠️️ 전체 초기화를 진행하시겠습니까?\n\n` +
        `모든 데이터가 삭제됩니다:\n` +
        `- API 키\n` +
        `- 설정 모음\n` +
        `- 보고서\n` +
        `- 기타 모든 설정\n\n` +
        `이 작업은 절대 되돌릴 수 없습니다!`
    )) {
        return;
    }
    
    // 중요: 이중 확인
    if (!confirm(
        `정말로 전체 초기화하시겠습니까?\n\n` +
        `‼️ 모든 데이터가 영구적으로 삭제됩니다!`
    )) {
        return;
    }
    
    // 백업 권장 메시지
    const doBackup = confirm(
        `초기화 전에 백업을 진행하시겠습니까?\n\n` +
        `'확인'을 누르면 백업 후 초기화합니다.\n` +
        `'취소'를 누르면 바로 초기화합니다.`
    );
    
    if (doBackup) {
        backupAll();
        // 백업 완료 후 3초 대기
        setTimeout(() => {
            proceedReset();
        }, 3000);
    } else {
        proceedReset();
    }
}

function proceedReset() {
    try {
        localStorage.clear();
        sessionStorage.clear();
        
        showToast('✅ 전체 데이터가 초기화되었습니다', 3000);
        
        setTimeout(() => {
            refreshStatus();
            alert('초기화가 완료되었습니다. 페이지를 새로고침합니다.');
            location.reload();
        }, 1000);
    } catch (error) {
        console.error('초기화 오류:', error);
        alert('초기화 중 오류가 발생했습니다.');
    }
}
