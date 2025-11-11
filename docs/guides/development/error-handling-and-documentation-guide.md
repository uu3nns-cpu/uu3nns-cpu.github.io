# 에러 처리 통일 및 문서화 개선 가이드

## 📋 개요
이 문서는 RE 프로젝트의 에러 처리 통일 및 JSDoc 문서화 개선에 대한 가이드입니다.

## 🎯 주요 개선 사항

### H. 에러 처리 통일

#### 1. 통합 에러 핸들러 생성
**파일**: `js/error-handler.js` (신규 생성)

**주요 기능**:
- ✅ 모든 에러를 일관된 방식으로 처리
- ✅ 에러 타입 및 심각도 분류
- ✅ 사용자 친화적인 메시지 자동 생성
- ✅ 에러 로그 자동 저장 (디버깅용)
- ✅ 전역 에러 핸들러 설정

**에러 타입**:
```javascript
const ErrorType = {
    VALIDATION: 'validation',  // 입력 검증 에러
    API: 'api',                // API 호출 에러
    STORAGE: 'storage',        // 저장소 에러
    NETWORK: 'network',        // 네트워크 에러
    SYSTEM: 'system'           // 시스템 에러
};
```

**에러 심각도**:
```javascript
const ErrorSeverity = {
    INFO: 'info',          // 정보성 (예: 자동 저장 완료)
    WARNING: 'warning',    // 경고 (예: 입력 형식 오류)
    ERROR: 'error',        // 에러 (예: API 호출 실패)
    CRITICAL: 'critical'   // 심각한 에러 (예: 시스템 충돌)
};
```

#### 2. 에러 핸들러 사용 예시

**기본 사용**:
```javascript
try {
    // 위험한 작업
    someRiskyOperation();
} catch (error) {
    // 통합 에러 핸들러로 처리
    ErrorHandler.handle(error, ErrorType.SYSTEM, ErrorSeverity.ERROR);
}
```

**API 에러**:
```javascript
try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('API 요청 실패');
} catch (error) {
    ErrorHandler.handleApiError(error, 'Groq', { url: apiUrl });
}
```

**검증 에러**:
```javascript
if (!apiKey) {
    ErrorHandler.handleValidationError(
        'API 키를 입력해주세요',
        'apiKeyInput'  // 에러 표시할 필드 ID
    );
}
```

**저장소 에러**:
```javascript
try {
    localStorage.setItem('key', 'value');
} catch (error) {
    ErrorHandler.handleStorageError(error, 'save');
}
```

#### 3. 기존 코드 통합 방법

**Before (기존 코드)**:
```javascript
async function generateWithGroq(input, apiKey) {
    try {
        // API 호출
    } catch (error) {
        console.error('Groq Error:', error);
        
        let errorMessage = 'Groq 오류 발생.';
        if (error.message.includes('401')) {
            errorMessage = 'API 키가 유효하지 않습니다.';
        } else if (error.message.includes('429')) {
            errorMessage = 'API 호출 제한 초과.';
        }
        
        showError(errorMessage);
    }
}
```

**After (개선된 코드)**:
```javascript
async function generateWithGroq(input, apiKey) {
    try {
        // API 호출
    } catch (error) {
        // 통합 에러 핸들러가 자동으로 적절한 메시지 생성
        ErrorHandler.handleApiError(error, 'Groq', { input });
    }
}
```

**장점**:
- ✅ 코드 중복 제거
- ✅ 일관된 에러 메시지
- ✅ 자동 로깅
- ✅ 유지보수 용이

#### 4. 에러 로그 확인 (디버깅용)

**브라우저 콘솔에서**:
```javascript
// 저장된 에러 로그 확인
ErrorHandler.getErrorLogs();

// 에러 로그 초기화
ErrorHandler.clearErrorLogs();
```

**저장되는 정보**:
- 발생 시간
- 에러 메시지
- 스택 트레이스
- 컨텍스트 정보

---

### I. JSDoc 주석 및 문서화

#### 1. JSDoc 기본 문법

**함수 문서화**:
```javascript
/**
 * 함수에 대한 간단한 설명
 * 
 * 더 자세한 설명이 필요한 경우 여기에 작성합니다.
 * 여러 줄로 작성 가능합니다.
 * 
 * @param {string} name - 사용자 이름
 * @param {number} age - 사용자 나이
 * @param {Object} [options] - 선택적 옵션 객체
 * @param {boolean} [options.active=true] - 활성화 여부 (기본값: true)
 * @returns {Object} 사용자 객체
 * @throws {Error} 이름이 비어있을 때
 * 
 * @example
 * const user = createUser('홍길동', 30);
 * console.log(user); // { name: '홍길동', age: 30 }
 */
function createUser(name, age, options = {}) {
    if (!name) throw new Error('이름을 입력해주세요');
    return { name, age, ...options };
}
```

**타입 정의**:
```javascript
/**
 * @typedef {Object} Report
 * @property {number} id - 보고서 ID
 * @property {string} title - 제목
 * @property {string} content - 내용
 * @property {Date} createdAt - 생성 시간
 */

/**
 * 보고서 생성
 * @param {string} title - 제목
 * @param {string} content - 내용
 * @returns {Report} 생성된 보고서
 */
function createReport(title, content) {
    return {
        id: Date.now(),
        title,
        content,
        createdAt: new Date()
    };
}
```

**상수 문서화**:
```javascript
/** @constant {number} 최대 저장 개수 */
const MAX_REPORTS = 50;

/** @constant {string} 저장소 키 */
const STORAGE_KEY = 'reports';
```

**비공개 함수**:
```javascript
/**
 * 내부 헬퍼 함수
 * @param {string} text - 텍스트
 * @returns {string} 정리된 텍스트
 * @private
 */
function sanitizeText(text) {
    return text.trim();
}
```

#### 2. 주요 파일별 문서화 가이드

**app.js**:
```javascript
/**
 * API 키 암호화
 * @param {string} key - 암호화할 API 키
 * @returns {string} 암호화된 키
 */
function encodeApiKey(key) { /* ... */ }

/**
 * 프롬프트 생성 (우선순위 시스템 적용)
 * 
 * 우선순위:
 * - 0순위: 사용자 커스텀 프롬프트 (최우선)
 * - 1순위: 분량/상세도 설정
 * - 2순위: 보고서 구조
 * - 3순위: 작성 스타일
 * 
 * @param {string} input - 상담 메모
 * @returns {string} 완성된 프롬프트
 */
function buildPrompt(input) { /* ... */ }

/**
 * Groq API로 보고서 생성
 * @param {string} input - 상담 메모
 * @param {string} apiKey - API 키
 * @returns {Promise<void>}
 */
async function generateWithGroq(input, apiKey) { /* ... */ }
```

**autosave.js**:
```javascript
/**
 * 자동 저장 시작
 * @returns {void}
 */
function startAutoSave() { /* ... */ }

/**
 * 보고서 저장
 * @param {string|null} customTitle - 사용자 지정 제목
 * @returns {number|null} 보고서 ID (실패 시 null)
 */
function saveReport(customTitle = null) { /* ... */ }

/**
 * 보고서 불러오기
 * @param {number} reportId - 보고서 ID
 * @returns {boolean} 성공 여부
 */
function loadReport(reportId) { /* ... */ }

/**
 * 보고서 검색
 * @param {string} keyword - 검색어
 * @returns {Array} 검색 결과
 */
function searchReports(keyword) { /* ... */ }
```

#### 3. 복잡한 로직 문서화 예시

**프롬프트 빌더**:
```javascript
/**
 * 사용자 설정을 바탕으로 AI용 프롬프트 생성
 * 
 * 이 함수는 여러 설정을 우선순위에 따라 조합하여
 * 최종 프롬프트를 생성합니다.
 * 
 * 우선순위 시스템:
 * - 0순위: 나만의 작성 규칙 (절대 최우선)
 *   - 사용자가 직접 작성한 커스텀 프롬프트
 *   - 다른 모든 설정보다 우선 적용
 * 
 * - 1순위: 분량/상세도 설정
 *   - 보고서 길이 조절 (-45 ~ +45)
 *   - 입력 대비 출력 비율 계산
 * 
 * - 2순위: 보고서 구조 설정
 *   - 섹션 포함 여부 결정
 *   - [상담 일시/회기], [주 호소 문제] 등
 * 
 * - 3순위: 보고서 기술 설정
 *   - 작성 스타일 (간결/상세, 전문적/평이함 등)
 *   - 11가지 스타일 옵션
 * 
 * @param {string} input - 사용자가 입력한 상담 메모
 * @returns {string} 완성된 프롬프트 텍스트
 * 
 * @example
 * const input = "학생이 학교 적응에 어려움을 겪고 있음";
 * const prompt = buildPrompt(input);
 * // 반환: "【0순위: 나만의 작성 규칙】\n..."
 */
function buildPrompt(input) {
    // 설정 로드
    const customPrompt = getCustomPrompt();
    const formatOptions = getFormatOptions();
    const styleSettings = getStyleSettings();
    const detailLevel = parseInt(localStorage.getItem(STORAGE_KEYS.DETAIL_LEVEL) || '0');
    
    let prompt = '';
    
    // 0순위 적용
    if (customPrompt) {
        prompt += `【0순위: 나만의 작성 규칙】\n${customPrompt}\n\n`;
    }
    
    // 1~3순위 적용 (생략)
    
    return prompt;
}
```

**우선순위 시스템**:
```javascript
/**
 * 우선순위 기반 설정 시스템
 * 
 * 이 프로젝트는 4단계 우선순위 시스템을 사용합니다:
 * 
 * 레벨 0: 사용자 커스텀 (최고 우선순위)
 * - "나만의 작성 규칙"에서 설정
 * - 모든 다른 설정을 오버라이드
 * 
 * 레벨 1: 분량/상세도
 * - 전체 보고서 길이 조절
 * - -45 (최소) ~ +45 (최대)
 * 
 * 레벨 2: 구조 설정
 * - 보고서에 포함할 섹션 선택
 * 
 * 레벨 3: 스타일 설정
 * - 작성 스타일 세부 조정
 * 
 * 충돌 해결:
 * - 상위 레벨이 하위 레벨보다 우선
 * - 레벨 0이 명시한 사항은 절대 변경 불가
 * 
 * @constant {Object} PRIORITY_LEVELS
 */
const PRIORITY_LEVELS = {
    CUSTOM: 0,    // 사용자 커스텀
    DETAIL: 1,    // 분량/상세도
    STRUCTURE: 2, // 보고서 구조
    STYLE: 3      // 작성 스타일
};
```

---

## 🔧 적용 방법

### 1. error-handler.js 통합

**index.html**:
```html
<!-- Polyfills (구형 브라우저 지원) -->
<script src="js/browser-polyfills.js"></script>
<script src="js/error-handler.js"></script>  <!-- 추가 -->
<script src="js/cookie-consent.js"></script>
<script src="js/common-components.js"></script>
<script src="js/autosave.js"></script>
<script src="js/app.js"></script>
```

**report.html**:
```html
<script src="js/browser-polyfills.js"></script>
<script src="js/error-handler.js"></script>  <!-- 추가 -->
<!-- ... 나머지 스크립트 ... -->
```

### 2. 기존 코드에 JSDoc 추가

**단계별 적용**:
1. 각 함수 위에 JSDoc 주석 추가
2. 복잡한 로직에 상세 설명 추가
3. 타입 정보 명시
4. 예시 코드 추가 (선택)

**우선순위**:
1. 공개 API 함수 (다른 파일에서 호출)
2. 복잡한 로직 함수 (buildPrompt 등)
3. 유틸리티 함수
4. 내부 헬퍼 함수

### 3. 기존 에러 처리 교체

**app.js의 generateWithGroq/GPT 함수**:
```javascript
// catch 블록을
catch (error) {
    ErrorHandler.handleApiError(error, 'Groq', { input });
    outputDiv.textContent = '⚠️ 오류가 발생했습니다.';
}
```

**autosave.js의 저장 함수들**:
```javascript
catch (error) {
    ErrorHandler.handleStorageError(error, 'save_report');
    return null;
}
```

---

## 📊 개선 효과

### Before (기존)
- ❌ 에러 처리가 파일마다 다름
- ❌ 중복된 에러 처리 코드
- ❌ 일관성 없는 에러 메시지
- ❌ 함수 설명 부족
- ❌ 복잡한 로직 이해 어려움

### After (개선)
- ✅ 통일된 에러 처리
- ✅ 코드 중복 제거
- ✅ 일관된 사용자 경험
- ✅ 자세한 함수 문서화
- ✅ 복잡한 로직 이해 쉬움
- ✅ 자동 에러 로깅
- ✅ 유지보수 용이

---

## 🎓 추가 자료

### JSDoc 공식 문서
- https://jsdoc.app/

### JSDoc 태그 목록
- `@param` - 매개변수
- `@returns` - 반환값
- `@throws` - 발생 에러
- `@example` - 사용 예시
- `@see` - 관련 함수
- `@deprecated` - 사용 중단
- `@private` - 비공개 함수
- `@typedef` - 타입 정의
- `@constant` - 상수

### 에러 핸들링 베스트 프랙티스
1. 항상 try-catch 사용
2. 적절한 에러 타입 분류
3. 사용자 친화적인 메시지
4. 에러 로깅 (디버깅용)
5. 예상 가능한 에러 미리 처리

---

## ✅ 체크리스트

### 에러 처리 통일
- [x] error-handler.js 생성
- [x] index.html에 통합
- [ ] report.html에 통합
- [ ] settings.html에 통합
- [ ] app.js의 API 함수 수정
- [ ] autosave.js의 저장 함수 수정
- [ ] 기타 파일의 에러 처리 수정

### JSDoc 문서화
- [x] app-documented.js 생성 (예시)
- [x] autosave-documented.js 생성 (예시)
- [ ] app.js에 JSDoc 추가
- [ ] autosave.js에 JSDoc 추가
- [ ] preset-manager.js에 JSDoc 추가
- [ ] report-ui.js에 JSDoc 추가
- [ ] 기타 파일에 JSDoc 추가

---

## 📝 참고 사항

1. **error-handler.js**는 최우선으로 로드되어야 합니다
2. JSDoc 주석은 코드 동작을 변경하지 않습니다 (문서화만)
3. 기존 코드는 점진적으로 개선하세요
4. 모든 파일을 한 번에 수정할 필요는 없습니다

---

## 🚀 다음 단계

1. error-handler.js를 모든 HTML 파일에 추가
2. 주요 함수들에 JSDoc 주석 추가
3. 복잡한 로직 (buildPrompt 등)에 상세 설명 추가
4. 에러 처리를 ErrorHandler로 점진적 교체
5. 테스트 및 검증

---

작성일: 2025년 1월
버전: 1.0
