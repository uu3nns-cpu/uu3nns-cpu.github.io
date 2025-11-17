/* ==================== report-new.html 어댑터 ==================== */
/* 기존 app.js의 함수를 새로운 UI 구조에 맞게 오버라이드 */

// generateJournals 함수를 새로운 UI에 맞게 수정
const originalGenerateJournals = window.generateJournals;

window.generateJournals = async function(event) {
    event.stopPropagation();
    const input = document.getElementById('inputText').value.trim();

    if (!input) {
        showError('상담 메모를 먼저 입력해주세요.');
        return;
    }

    // API 키 확인
    const { groq: groqKey, gpt: gptKey } = getApiKeys();

    // 모델 설정 확인
    const enabledModels = JSON.parse(localStorage.getItem('enabledModels') || '{"groq":true,"gpt":true}');
    
    const useGroq = enabledModels.groq !== false && groqKey;
    const useGPT = enabledModels.gpt !== false && gptKey;

    if (!useGroq && !useGPT) {
        showError('⚠️ API 키가 설정되지 않았거나 모든 모델이 비활성화되어 있습니다.\n\n해결 방법:\n1. 페이지 상단 "⚙️ 설정" 버튼 클릭\n2. API 키 입력 후 "설정 저장" 클릭\n3. 화면 설정에서 사용할 모델 선택\n4. 페이지 새로고침 (F5)');
        return;
    }

    // 생성 시작 알림
    showToast('🔄 보고서 작성 중...', 1500);

    // 적절한 탭으로 전환
    if (useGroq && useGPT) {
        switchOutputTab('compare');
    } else if (useGroq) {
        switchOutputTab('groq');
    } else if (useGPT) {
        switchOutputTab('gpt');
    }

    // 이전 결과 초기화
    if (useGroq) {
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
        
        // 비교 탭도 초기화
        const groqOutputCompare = document.getElementById('groqOutputCompare');
        if (groqOutputCompare) groqOutputCompare.textContent = '';
        const groqCountCompare = document.getElementById('groqCountCompare');
        if (groqCountCompare) groqCountCompare.textContent = '0자';
        const groqCopyBtnCompare = document.getElementById('groqCopyBtnCompare');
        if (groqCopyBtnCompare) groqCopyBtnCompare.disabled = true;
        const groqExportBtnCompare = document.getElementById('groqExportBtnCompare');
        if (groqExportBtnCompare) groqExportBtnCompare.disabled = true;
    }
    if (useGPT) {
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
        
        // 비교 탭도 초기화
        const gptOutputCompare = document.getElementById('gptOutputCompare');
        if (gptOutputCompare) gptOutputCompare.textContent = '';
        const gptCountCompare = document.getElementById('gptCountCompare');
        if (gptCountCompare) gptCountCompare.textContent = '0자';
        const gptCopyBtnCompare = document.getElementById('gptCopyBtnCompare');
        if (gptCopyBtnCompare) gptCopyBtnCompare.disabled = true;
        const gptExportBtnCompare = document.getElementById('gptExportBtnCompare');
        if (gptExportBtnCompare) gptExportBtnCompare.disabled = true;
    }

    // 빈 상태 숨기고 탭 컨테이너 표시
    const emptyState = document.getElementById('emptyState');
    const outputTabs = document.getElementById('outputTabs');
    
    if (emptyState) emptyState.style.display = 'none';
    if (outputTabs) outputTabs.style.display = 'flex';

    const generateBtn = document.getElementById('generateBtn');
    const originalBtnText = generateBtn ? generateBtn.textContent : '보고서 작성';
    if (generateBtn) {
        generateBtn.textContent = '⏳ 작성 중...';
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.6';
    }

    const promises = [];
    if (useGroq) promises.push(generateWithGroq(input, groqKey));
    if (useGPT) promises.push(generateWithGPT(input, gptKey));

    Promise.all(promises).finally(() => {
        if (generateBtn) {
            generateBtn.textContent = originalBtnText;
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
        }
        
        showToast('✅ 보고서 작성 완료!', 2000);
        
        // 설정에 따라 적절한 탭으로 전환
        if (useGroq && useGPT) {
            switchOutputTab('compare');
        } else if (useGroq) {
            switchOutputTab('groq');
        } else if (useGPT) {
            switchOutputTab('gpt');
        }
        
        // 비교 탭 내용 동기화 (두 모델이 모두 사용된 경우에만)
        if (useGroq && useGPT) {
            setTimeout(() => {
                const groqOutput = document.getElementById('groqOutput');
                const gptOutput = document.getElementById('gptOutput');
                const groqOutputCompare = document.getElementById('groqOutputCompare');
                const gptOutputCompare = document.getElementById('gptOutputCompare');
                const groqCount = document.getElementById('groqCount');
                const gptCount = document.getElementById('gptCount');
                const groqCountCompare = document.getElementById('groqCountCompare');
                const gptCountCompare = document.getElementById('gptCountCompare');
                
                if (groqOutput && groqOutputCompare) {
                    groqOutputCompare.textContent = groqOutput.textContent;
                    // 버튼 활성화
                    const groqCopyBtnCompare = document.getElementById('groqCopyBtnCompare');
                    const groqExportBtnCompare = document.getElementById('groqExportBtnCompare');
                    if (groqOutput.textContent && groqCopyBtnCompare) groqCopyBtnCompare.disabled = false;
                    if (groqOutput.textContent && groqExportBtnCompare) groqExportBtnCompare.disabled = false;
                }
                if (gptOutput && gptOutputCompare) {
                    gptOutputCompare.textContent = gptOutput.textContent;
                    // 버튼 활성화
                    const gptCopyBtnCompare = document.getElementById('gptCopyBtnCompare');
                    const gptExportBtnCompare = document.getElementById('gptExportBtnCompare');
                    if (gptOutput.textContent && gptCopyBtnCompare) gptCopyBtnCompare.disabled = false;
                    if (gptOutput.textContent && gptExportBtnCompare) gptExportBtnCompare.disabled = false;
                }
                if (groqCount && groqCountCompare) {
                    groqCountCompare.textContent = groqCount.textContent;
                }
                if (gptCount && gptCountCompare) {
                    gptCountCompare.textContent = gptCount.textContent;
                }
            }, 100);
        }
    });
};

// 초기화 시 설정 미리보기 로드
document.addEventListener('DOMContentLoaded', function() {
    if (typeof loadSettingsPreview === 'function') {
        loadSettingsPreview();
    }
});
