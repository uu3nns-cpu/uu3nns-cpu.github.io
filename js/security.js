/**
 * 보안 관련 유틸리티 함수
 * API 키를 안전하게 저장하고 불러오기
 * Firefox 호환성 개선 버전
 */

// 간단한 암호화 (Base64 + 간단한 치환) - Firefox 호환
function encodeApiKey(key) {
    if (!key) return '';
    try {
        // Firefox에서 안전한 Base64 인코딩
        const utf8Bytes = new TextEncoder().encode(key);
        const base64 = btoa(String.fromCharCode.apply(null, utf8Bytes));
        // 추가 난독화 (간단한 문자 치환)
        return base64.split('').reverse().join('');
    } catch (e) {
        console.error('[Security] API 키 인코딩 실패:', e);
        // 인코딩 실패 시 원본 반환 (레거시 지원)
        return key;
    }
}

// 복호화 - Firefox 호환
function decodeApiKey(encoded) {
    if (!encoded) return '';
    
    try {
        // 역순 복원
        const base64 = encoded.split('').reverse().join('');
        
        // Base64 디코딩 (Firefox 안전)
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (e) {
        // 디코딩 실패 시 레거시 방식 시도
        console.warn('[Security] 새로운 디코딩 실패, 레거시 방식 시도:', e);
        
        try {
            // 레거시 평문 키 또는 구버전 인코딩
            const base64 = encoded.split('').reverse().join('');
            return decodeURIComponent(escape(atob(base64)));
        } catch (e2) {
            // 그것도 실패하면 평문으로 가정 (최초 버전 호환)
            console.warn('[Security] 레거시 디코딩도 실패, 평문으로 반환:', e2);
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
        
        // 디버깅: 복호화 결과 확인
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

// Firefox 디버깅 도구 - 콘솔에서 실행 가능
function debugApiKeys() {
    console.log('=== API 키 디버깅 정보 ===');
    console.log('1. localStorage 원본:');
    const groqEncoded = localStorage.getItem('groqApiKey');
    const gptEncoded = localStorage.getItem('gptApiKey');
    console.log('   - groqApiKey:', groqEncoded ? '존재 (길이: ' + groqEncoded.length + ')' : '없음');
    console.log('   - gptApiKey:', gptEncoded ? '존재 (길이: ' + gptEncoded.length + ')' : '없음');
    
    console.log('\n2. 복호화된 키:');
    const groqKey = loadApiKeySafely('groqApiKey');
    const gptKey = loadApiKeySafely('gptApiKey');
    console.log('   - Groq:', groqKey ? '존재 (길이: ' + groqKey.length + ', 시작: ' + groqKey.substring(0, 10) + '...)' : '없음');
    console.log('   - GPT:', gptKey ? '존재 (길이: ' + gptKey.length + ', 시작: ' + gptKey.substring(0, 15) + '...)' : '없음');
    
    console.log('\n3. 브라우저 정보:');
    console.log('   - User Agent:', navigator.userAgent);
    console.log('   - localStorage 지원:', typeof(Storage) !== "undefined");
    console.log('   - TextEncoder 지원:', typeof(TextEncoder) !== "undefined");
    console.log('   - TextDecoder 지원:', typeof(TextDecoder) !== "undefined");
    
    return {
        groq: groqKey,
        gpt: gptKey
    };
}

// Firefox 긴급 복구 함수 - API 키가 있는데 읽히지 않을 때
function emergencyFixApiKeys() {
    console.log('[Emergency Fix] 시작...');
    
    const groqEncoded = localStorage.getItem('groqApiKey');
    const gptEncoded = localStorage.getItem('gptApiKey');
    
    if (!groqEncoded && !gptEncoded) {
        console.error('[Emergency Fix] localStorage에 API 키가 없습니다!');
        console.log('[Emergency Fix] 설정 페이지에서 API 키를 다시 입력해주세요.');
        return false;
    }
    
    console.log('[Emergency Fix] API 키 재인코딩 시도...');
    
    if (groqEncoded) {
        try {
            const decoded = decodeApiKey(groqEncoded);
            if (decoded && decoded.length > 0) {
                console.log('[Emergency Fix] Groq 키 복호화 성공');
                // 재인코딩하여 저장
                saveApiKeySafely('groqApiKey', decoded);
                console.log('[Emergency Fix] Groq 키 재저장 완료');
            } else {
                console.error('[Emergency Fix] Groq 키 복호화 실패 - 설정에서 다시 입력 필요');
            }
        } catch (e) {
            console.error('[Emergency Fix] Groq 키 처리 실패:', e);
        }
    }
    
    if (gptEncoded) {
        try {
            const decoded = decodeApiKey(gptEncoded);
            if (decoded && decoded.length > 0) {
                console.log('[Emergency Fix] GPT 키 복호화 성공');
                // 재인코딩하여 저장
                saveApiKeySafely('gptApiKey', decoded);
                console.log('[Emergency Fix] GPT 키 재저장 완료');
            } else {
                console.error('[Emergency Fix] GPT 키 복호화 실패 - 설정에서 다시 입력 필요');
            }
        } catch (e) {
            console.error('[Emergency Fix] GPT 키 처리 실패:', e);
        }
    }
    
    console.log('[Emergency Fix] 완료! 페이지를 새로고침(F5) 해주세요.');
    return true;
}
