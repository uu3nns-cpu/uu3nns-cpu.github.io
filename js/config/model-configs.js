/**
 * model-configs.js
 * AI 모델별 설정 정의
 * 
 * 사용법:
 * <script src="js/config/model-configs.js"></script>
 * <script src="js/app.js"></script>
 */

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

console.log('[ModelConfigs] 모델 설정 로드 완료');
