/**
 * 설정 프리셋 관리
 * localStorage 키: 'settings_presets', 'active_preset_id'
 */

const PRESETS_KEY = 'settings_presets';
const ACTIVE_PRESET_KEY = 'active_preset_id';

// 기본 프리셋 정의
const DEFAULT_PRESETS = [
    {
        id: 1,
        name: "상담일지",
        icon: "📝",
        settings: {
            detailLevel: "0",
            enabledFormats: [],
            enabledStyles: {},
            customPrompt: ""
        },
        isDefault: true,
        description: "자유로운 서술형 일지",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: "회기보고서",
        icon: "📊",
        settings: {
            detailLevel: "15",
            enabledFormats: ["datetime", "issue", "goal", "process", "technique", "plan"],
            enabledStyles: {
                style_approach: "통합적"
            },
            customPrompt: ""
        },
        isDefault: true,
        description: "구조화된 전문 보고서",
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: "사례개념화",
        icon: "🧠",
        settings: {
            detailLevel: "0",
            enabledFormats: [],
            enabledStyles: {},
            customPrompt: `다음 구조로 사례개념화를 작성하세요:

1. 내담자 개요
   - 인구통계학적 정보
   - 주 호소 문제

2. 배경 정보
   - 발달력 및 가족력
   - 중요 생활 사건

3. 문제의 개념화
   - 인지적 측면 (핵심 신념, 자동적 사고)
   - 정서적 측면 (주요 감정 패턴)
   - 행동적 측면 (문제 행동 및 패턴)
   - 대인관계적 측면

4. 유지 요인
   - 문제를 지속시키는 요인들

5. 치료적 개입 방향
   - 단기 목표
   - 장기 목표
   - 권장 개입 기법`
        },
        isDefault: true,
        description: "이론 기반 사례 분석",
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        name: "사례개념화(상세)",
        icon: "🔬",
        settings: {
            detailLevel: "15",
            enabledFormats: [],
            enabledStyles: {},
            customPrompt: `다음 구조로 사례개념화를 작성하세요:

1. 내담자 개요
   - 인구통계학적 정보: 연령, 성별, 학년/직업, 가족구성, 의뢰 경로
   - 주 호소 문제: 내담자 자신의 표현으로 직접 인용, 발생 시기와 빈도, 심각도 수준

2. 배경 정보
   - 발달력: 출생/영유아기, 아동기, 청소년기의 주요 발달 과업 달성 여부
   - 가족력: 가족 관계 역동, 애착 패턴, 가족 내 정신건강 이력
   - 중요 생활 사건: 외상 경험, 상실 경험, 주요 전환점이 된 사건들과 그 영향

3. 문제의 개념화
   - 인지적 측면
     * 핵심 신념: 자기/타인/세상에 대한 근본적 믿음 (구체적 진술문으로)
     * 중간 신념: 조건적 가정, 규칙, 태도
     * 자동적 사고: 특정 상황에서 반복되는 사고 패턴 (예시 포함)
   - 정서적 측면
     * 주요 감정: 우울, 불안, 분노 등의 구체적 정서와 강도
     * 감정 조절 능력: 감정 인식, 표현, 조절 수준
     * 회피하는 감정과 그 이유
   - 행동적 측면
     * 문제 행동: 관찰 가능한 구체적 행동 (빈도, 기간, 맥락)
     * 회피 행동: 어떤 상황/사람/감정을 피하는지
     * 안전 행동: 불안을 일시적으로 낮추려는 역기능적 대처
   - 대인관계적 측면
     * 애착 스타일과 관계 패턴
     * 대인관계에서의 반복되는 갈등 주제
     * 사회적 지지 체계의 질과 양

4. 유지 요인 (악순환 구조)
   - 인지-정서-행동의 상호작용 패턴
   - 환경적/체계적 강화 요인
   - 이차적 이득 (문제 행동으로 얻는 것)
   - 변화에 대한 저항 요인

5. 보호 요인 및 강점
   - 내담자의 대처 자원과 회복탄력성
   - 긍정적 관계 및 지지 체계
   - 치료 동기와 변화 준비도
   - 과거 성공 경험 및 활용 가능한 강점

6. 치료적 개입 방향
   - 단기 목표 (4-8회기)
     * 측정 가능하고 구체적으로 (예: "불안 점수 7→4로 감소")
     * 우선순위와 근거
   - 장기 목표 (전체 상담 기간)
     * 궁극적 변화 방향과 기대 성과
   - 권장 개입 기법
     * 주요 치료 기법과 그 선택 근거
     * 회기별 예상 개입 순서
     * 주의사항 및 금기사항
   - 예후 및 제한점
     * 예상되는 치료 경과
     * 잠재적 어려움과 대응 방안

7. 슈퍼비전 요청 사항
   - 상담자가 어려움을 느끼는 지점
   - 개념화에 대한 피드백이 필요한 부분
   - 개입 방향에 대한 자문 요청

※ 각 항목은 구체적 근거와 함께 작성하고, 이론적 관점을 명시할 것
※ 내담자의 강점과 자원을 균형있게 포함할 것
※ 문화적 맥락과 환경적 요인을 고려할 것`
        },
        isDefault: true,
        description: "전문적이고 체계적인 사례 분석",
        createdAt: new Date().toISOString()
    },
    {
        id: 5,
        name: "임상적 관점",
        icon: "💊",
        settings: {
            detailLevel: "15",
            enabledFormats: ["datetime", "issue", "process"],
            enabledStyles: {
                style_terminology: "전문적",
                style_expression: "관찰위주",
                style_emotion: "객관적",
                style_structure: "주제별"
            },
            customPrompt: `DSM-5 진단 기준과 의료적 관점에서 작성하세요:

1. 주 진단 및 감별 진단
   - 해당 진단 기준 충족 여부
   - 증상의 시작 시기, 기간, 심각도
   - 기능 손상 정도 (사회적, 직업적, 일상생활)

2. 임상적 평가
   - 정신상태 검사 (MSE) 소견
   - 현재 증상의 빈도와 강도
   - 자살/자해 위험성 평가
   - 약물 복용 이력 및 효과

3. 병력 및 경과
   - 과거 정신과 치료력
   - 가족력 (정신건강 관련)
   - 의학적 상태 및 약물

4. 치료 계획
   - 치료 목표 (측정 가능한 형태로)
   - 심리치료 접근법 및 근거
   - 약물치료 병행 필요성 검토
   - 입원/응급 개입 필요성

5. 예후 및 권고사항
   - 예상 치료 기간 및 빈도
   - 치료 반응 예측 요인
   - 추가 평가 필요성 (심리검사, 신경과 자문 등)

※ 객관적이고 전문적인 용어 사용
※ 주관적 해석보다 관찰 가능한 사실 중심
※ 의료적 필요성과 치료 근거 명확히`
        },
        isDefault: true,
        description: "DSM-5 기반 의료적 관점",
        createdAt: new Date().toISOString()
    },
    {
        id: 6,
        name: "타기관 의뢰서",
        icon: "🤝",
        settings: {
            detailLevel: "-15",
            enabledFormats: ["datetime", "issue", "goal"],
            enabledStyles: {
                style_terminology: "전문적",
                style_expression: "관찰위주",
                style_focus: "문제중심"
            },
            customPrompt: `타기관 연계를 위한 의뢰서 형식으로 작성하세요:

1. 의뢰 기본 정보
   - 내담자 기본 정보 (연령, 성별, 직업/학년)
   - 의뢰 사유 (핵심 문제 1-2문장)
   - 의뢰 기관명 및 협조 요청 사항

2. 현재 상태 요약
   - 주 호소 문제 및 증상
   - 증상 발현 시기 및 기간
   - 일상생활 기능 수준
   - 위험 요인 (자해/자살, 공격성 등)

3. 상담 경과
   - 본 기관에서의 상담 기간 및 횟수
   - 주요 개입 내용
   - 현재까지의 변화
   - 한계 및 추가 지원 필요성

4. 의뢰 목적
   - 정신과 진료 (약물치료 검토)
   - 심리검사 (종류 명시)
   - 전문 치료 (입원, DBT, 집단치료 등)
   - 사회복지 서비스 연계
   - 기타 (구체적 명시)

5. 협조 요청 사항
   - 평가/치료 후 회신 요청
   - 정보 공유 범위
   - 연락처 및 담당자 정보

※ 간결하고 핵심적으로
※ 전문 기관 간 소통에 적합한 형식
※ 개인정보 보호 고려 (필요한 정보만)
※ 의뢰 사유와 협조사항 명확히`
        },
        isDefault: true,
        description: "연계를 위한 간결한 의뢰 문서",
        createdAt: new Date().toISOString()
    }
];

// 프리셋 초기화 (최초 실행 시)
function initializePresets() {
    const existing = localStorage.getItem(PRESETS_KEY);
    if (!existing) {
        // 최초 실행: 기본 프리셋 저장
        localStorage.setItem(PRESETS_KEY, JSON.stringify(DEFAULT_PRESETS));
        localStorage.setItem(ACTIVE_PRESET_KEY, '0'); // 0 = 프리셋 없음 (수동 설정)
    } else {
        // 기존 프리셋 있음: 새로운 기본 프리셋 추가
        const existingPresets = JSON.parse(existing);
        const existingIds = existingPresets.map(p => p.id);
        
        // DEFAULT_PRESETS 중 없는 것만 추가
        const newPresets = DEFAULT_PRESETS.filter(dp => !existingIds.includes(dp.id));
        
        if (newPresets.length > 0) {
            const updated = [...existingPresets, ...newPresets];
            localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
        }
    }
}

// 모든 프리셋 가져오기
function getAllPresets() {
    const presetsJson = localStorage.getItem(PRESETS_KEY);
    return presetsJson ? JSON.parse(presetsJson) : DEFAULT_PRESETS;
}

// 활성 프리셋 ID 가져오기
function getActivePresetId() {
    const activeId = localStorage.getItem(ACTIVE_PRESET_KEY);
    return activeId ? parseInt(activeId) : 0;
}

// 활성 프리셋 설정
function setActivePreset(presetId) {
    localStorage.setItem(ACTIVE_PRESET_KEY, presetId.toString());
}

// 현재 설정 수집
function getCurrentSettings() {
    // 상세도
    const detailLevel = document.getElementById('detailLevelSlider')?.value || '0';
    
    // 보고서 구조
    const formatCheckboxes = {
        'datetime': document.getElementById('format_datetime'),
        'issue': document.getElementById('format_issue'),
        'goal': document.getElementById('format_goal'),
        'process': document.getElementById('format_process'),
        'technique': document.getElementById('format_technique'),
        'plan': document.getElementById('format_plan')
    };
    
    const enabledFormats = [];
    for (const [key, checkbox] of Object.entries(formatCheckboxes)) {
        if (checkbox && checkbox.checked) {
            enabledFormats.push(key);
        }
    }
    
    // 보고서 기술
    const styleSelects = [
        'style_terminology', 'style_expression', 'style_focus', 'style_technique',
        'style_emotion', 'style_counselor', 'style_structure', 'style_plan',
        'style_audience', 'style_approach'
    ];
    
    const enabledStyles = {};
    styleSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.value && select.value !== '') {
            enabledStyles[id] = select.value;
        }
    });
    
    // 커스텀 프롬프트
    const customPrompt = document.getElementById('customPrompt')?.value || '';
    
    return {
        detailLevel,
        enabledFormats,
        enabledStyles,
        customPrompt
    };
}

// 설정 적용
function applySettings(settings) {
    // 상세도
    const detailSlider = document.getElementById('detailLevelSlider');
    if (detailSlider && settings.detailLevel !== undefined) {
        detailSlider.value = settings.detailLevel;
        updateDetailLevelHighlight(settings.detailLevel);
    }
    
    // 보고서 구조 - 모두 OFF 후 활성화
    const formatCheckboxes = {
        'datetime': document.getElementById('format_datetime'),
        'issue': document.getElementById('format_issue'),
        'goal': document.getElementById('format_goal'),
        'process': document.getElementById('format_process'),
        'technique': document.getElementById('format_technique'),
        'plan': document.getElementById('format_plan')
    };
    
    // 모두 OFF
    Object.values(formatCheckboxes).forEach(checkbox => {
        if (checkbox) checkbox.checked = false;
    });
    
    // 활성화된 항목만 ON
    if (settings.enabledFormats) {
        settings.enabledFormats.forEach(format => {
            const checkbox = formatCheckboxes[format];
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // 보고서 기술 - 모두 기본값으로
    const styleSelects = [
        'style_terminology', 'style_expression', 'style_focus', 'style_technique',
        'style_emotion', 'style_counselor', 'style_structure', 'style_plan',
        'style_audience', 'style_approach'
    ];
    
    // 모두 기본값으로
    styleSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = '';
    });
    
    // 활성화된 항목만 설정
    if (settings.enabledStyles) {
        Object.entries(settings.enabledStyles).forEach(([id, value]) => {
            const select = document.getElementById(id);
            if (select) select.value = value;
        });
    }
    
    // 커스텀 프롬프트
    const customPrompt = document.getElementById('customPrompt');
    if (customPrompt) {
        customPrompt.value = settings.customPrompt || '';
    }
}

// 프리셋 저장
function saveCurrentAsPreset() {
    const name = prompt('프리셋 이름을 입력하세요:');
    if (!name || name.trim() === '') return;
    
    const description = prompt('설명을 입력하세요 (선택사항):') || '';
    
    const presets = getAllPresets();
    const newId = Date.now();
    
    const newPreset = {
        id: newId,
        name: name.trim(),
        icon: "⚙️",
        settings: getCurrentSettings(),
        isDefault: false,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        useCount: 0
    };
    
    presets.push(newPreset);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    
    showToast(`✅ "${name}" 프리셋이 저장되었습니다.`, 2000);
    renderPresetList();
}

// 프리셋 불러오기
function loadPreset(presetId) {
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
        showToast('❌ 프리셋을 찾을 수 없습니다.', 2000);
        return;
    }
    
    applySettings(preset.settings);
    setActivePreset(presetId);
    
    // 사용 횟수 증가
    preset.useCount = (preset.useCount || 0) + 1;
    preset.lastUsed = new Date().toISOString();
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    
    showToast(`✅ "${preset.name}" 프리셋을 적용했습니다.`, 2000);
    renderPresetList();
}

// 프리셋 삭제
function deletePreset(presetId) {
    event.stopPropagation(); // 카드 클릭 방지
    
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) return;
    
    if (preset.isDefault) {
        if (!confirm(`기본 프리셋 "${preset.name}"을(를) 삭제하시겠습니까?\n(언제든지 초기화로 복원 가능합니다)`)) {
            return;
        }
    } else {
        if (!confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) {
            return;
        }
    }
    
    const filtered = presets.filter(p => p.id !== presetId);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
    
    // 활성 프리셋이 삭제된 경우
    if (getActivePresetId() === presetId) {
        setActivePreset(0);
    }
    
    showToast(`✅ "${preset.name}" 프리셋이 삭제되었습니다.`, 2000);
    renderPresetList();
}

// 프리셋 수정
function editPreset(presetId, event) {
    event.stopPropagation(); // 카드 클릭 방지
    
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) return;
    
    const newName = prompt('새 이름을 입력하세요:', preset.name);
    if (!newName || newName.trim() === '') return;
    
    preset.name = newName.trim();
    preset.updatedAt = new Date().toISOString();
    
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    showToast(`✅ 프리셋 이름이 변경되었습니다.`, 2000);
    renderPresetList();
}

// 프리셋 목록 렌더링 - 간소화된 한 줄 레이아웃
function renderPresetList() {
    const container = document.getElementById('presetList');
    const countElement = document.getElementById('presetCount');
    
    if (!container) return;
    
    const presets = getAllPresets();
    const activeId = getActivePresetId();
    
    if (countElement) {
        countElement.textContent = presets.length;
    }
    
    if (presets.length === 0) {
        container.innerHTML = `
            <div class="preset-empty">
                <div class="preset-empty-icon">📋</div>
                <div class="preset-empty-text">
                    저장된 프리셋이 없습니다.<br>
                    "현재 설정 저장" 버튼으로 프리셋을 만들어보세요.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = presets.map(preset => {
        const isActive = preset.id === activeId;
        
        return `
            <div class="btn-card preset-item ${isActive ? 'active' : ''}" onclick="loadPreset(${preset.id})">
                <div class="preset-info-compact">
                    <span class="preset-icon">${preset.icon}</span>
                    <span class="preset-name-text">${preset.name}</span>
                    ${preset.isDefault ? '<span class="preset-badge-compact">기본</span>' : ''}
                    ${isActive ? '<span class="preset-badge-compact preset-badge-active">적용중</span>' : ''}
                </div>
                <button class="btn-delete-preset" onclick="event.stopPropagation(); deletePreset(${preset.id})" title="삭제">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.5 2V1.5C6.5 1.22386 6.72386 1 7 1H9C9.27614 1 9.5 1.22386 9.5 1.5V2M2 4H14M12.5 4V13C12.5 13.8284 11.8284 14.5 11 14.5H5C4.17157 14.5 3.5 13.8284 3.5 13V4M6.5 7V11M9.5 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// 모든 프리셋 초기화 (설정 초기화용)
function clearAllPresets() {
    if (!confirm('모든 프리셋을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n기본 프리셋도 모두 삭제되며, 나중에 초기화로 복원할 수 있습니다.')) {
        return false;
    }
    
    // 모든 프리셋 삭제
    localStorage.removeItem(PRESETS_KEY);
    
    // 활성 프리셋 초기화 (아무것도 선택하지 않은 상태)
    localStorage.setItem(ACTIVE_PRESET_KEY, '0');
    
    // 목록 다시 렌더링
    if (typeof renderPresetList === 'function') {
        renderPresetList();
    }
    
    return true;
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializePresets();
        renderPresetList();
    });
} else {
    initializePresets();
    renderPresetList();
}
