# 보고서 관리 페이지 개발 계획

## 📋 프로젝트 개요

**목표**: 저장된 보고서를 효율적으로 관리할 수 있는 전용 페이지 개발

**페이지**: `report-management.html`

**디자인**: 상단 필터 + 하단 그리드/리스트 (1단 구조)

**통합**: `index.html`의 "전체보기" 버튼으로 접근

---

## 🎯 Phase 1: 핵심 기능 (✅ 완료)

### 1.1 페이지 구조
- [x] 새 페이지 생성 (`report-management.html`)
- [x] CSS 파일 분리 (`css/report-management.css`)
- [x] JavaScript 파일 분리 (`js/report-management.js`)
- [x] `index.html` 연결 (전체보기 버튼)

### 1.2 기본 기능
- [x] 전체 목록 보기 (무한 스크롤)
- [x] 검색 기능 (제목, 내용)
- [x] 날짜 필터 (오늘/이번 주/이번 달/전체)
- [x] 정렬 (최신순/오래된순/제목순)
- [x] 그리드/리스트 보기 전환

### 1.3 선택 및 관리
- [x] 다중 선택 (체크박스)
- [x] 전체 선택/해제
- [x] 일괄 삭제
- [x] 개별 삭제

### 1.4 편집 기능
- [x] 제목 인라인 편집 (contenteditable)
- [x] 상세보기 모달
- [x] 에디터로 불러오기 (report.html 연동)

### 1.5 내보내기
- [x] PDF 내보내기 (단일)
- [x] 텍스트 내보내기 (단일)
- [x] PDF 내보내기 (다중/일괄)
- [x] 텍스트 내보내기 (다중/일괄)

---

## ⭐ Phase 2: 고급 기능 (✅ 완료)

### 2.1 즐겨찾기 시스템
- [ ] 데이터 구조 확장 (`isFavorite: boolean`)
- [ ] 즐겨찾기 토글 버튼 (별 아이콘)
- [ ] 즐겨찾기 필터 추가
- [ ] 즐겨찾기 우선 정렬 옵션
- [ ] localStorage 동기화

**예상 소요 시간**: 2-3시간

**파일 수정**:
- `js/report-management.js` - 즐겨찾기 로직
- `css/report-management.css` - 별 아이콘 스타일

### 2.2 태그 시스템
- [ ] 데이터 구조 확장 (`tags: string[]`)
- [ ] 태그 입력 UI (드롭다운 + 자동완성)
- [ ] 태그 표시 (뱃지 형태)
- [ ] 태그별 필터링
- [ ] 태그 관리 모달 (추가/삭제/이름변경)
- [ ] 자주 쓰는 태그 추천

**예상 소요 시간**: 4-5시간

**파일 수정**:
- `js/report-management.js` - 태그 관리 로직
- `css/report-management.css` - 태그 뱃지 스타일

**기본 태그 제안**:
- 🔴 긴급
- 📚 학교
- 🏥 병원
- 👨‍👩‍👧 가족
- 💼 직장
- 🎯 목표설정
- 😊 긍정적
- 😟 부정적

### 2.3 메모 추가
- [ ] 데이터 구조 확장 (`notes: string`)
- [ ] 메모 입력 필드 (상세보기 모달)
- [ ] 메모 표시 (카드에 미리보기)
- [ ] 메모 편집/삭제
- [ ] 메모 검색 포함

**예상 소요 시간**: 2-3시간

**파일 수정**:
- `js/report-management.js` - 메모 CRUD
- `css/report-management.css` - 메모 스타일

### 2.4 복사본 만들기
- [ ] 복사 버튼 추가 (카드 액션)
- [ ] 복사 로직 구현 (새 ID 생성)
- [ ] 제목에 "(사본)" 추가
- [ ] 타임스탬프 업데이트
- [ ] Toast 알림

**예상 소요 시간**: 1-2시간

**파일 수정**:
- `js/report-management.js` - 복사 로직

### 2.5 휴지통 기능
- [ ] 데이터 구조 확장 (`isDeleted: boolean`, `deletedAt: Date`)
- [ ] 삭제 → 휴지통 이동 (소프트 삭제)
- [ ] 휴지통 탭/페이지
- [ ] 복원 기능
- [ ] 영구 삭제 (30일 후 자동 또는 수동)
- [ ] 휴지통 비우기

**예상 소요 시간**: 4-5시간

**파일 수정**:
- `js/report-management.js` - 휴지통 로직
- `css/report-management.css` - 휴지통 UI
- `report-management.html` - 휴지통 탭 추가

---

## 🔄 코드 통폐합 및 유지보수 계획 (Phase 2.5)

### 📌 목표
**report-management.html이 안정적으로 작동하고, 유지보수가 용이하며, 코드 중복이 최소화된 구조 확립**

### 🔍 현재 상황 분석

#### 의존성 파일 구조
```
report-management.html
├── css/
│   ├── variables.css          # ✅ 공통 변수 (색상, 폰트)
│   ├── base.css               # ✅ 기본 스타일
│   ├── layout.css             # ✅ 레이아웃
│   ├── components-base.css    # ✅ 컴포넌트 기본
│   ├── components-layout.css  # ✅ 컴포넌트 레이아웃
│   ├── browser-compatibility.css # ✅ 브라우저 호환성
│   ├── header-button-unify.css  # ✅ 헤더 버튼 통일
│   └── report-management.css  # ✅ 전용 스타일 (독립적)
├── js/
│   ├── browser-polyfills.js   # ✅ 폴리필
│   ├── usage-core.js          # ✅ 사용량 관리 (SSOT)
│   ├── common-components.js   # ✅ 공통 컴포넌트 (헤더/푸터)
│   ├── autosave.js            # ⚠️ 보고서 관리 로직 중복
│   ├── app.js                 # ⚠️ report.html 전용
│   └── report-management.js   # ✅ 전용 스크립트 (독립적)
└── 외부 라이브러리
    └── jsPDF                  # ✅ PDF 생성
```

#### 중복 코드 및 의존성 문제

**1. 보고서 데이터 관리 중복**
- `autosave.js`: `getSavedReports()`, `saveReport()`, `deleteReport()`, `loadReport()`
- `report-management.js`: 동일한 로직을 자체 구현
- **문제**: 두 파일이 같은 localStorage 키를 사용하지만 로직이 분리되어 있음

**2. Toast 알림 중복**
- `autosave.js`: `showToast()` 사용 (외부 의존)
- `report-management.js`: 자체 `showToast()` 구현
- **문제**: 동일 기능이 여러 곳에 구현됨

**3. 보고서 제목 생성 로직 중복**
- `autosave.js`: `generateReportTitle()`
- `report-management.js`: 카드 생성 시 제목 처리 로직

**4. 불필요한 의존성**
- `report-management.html`이 `app.js`를 로드하지만 실제로는 사용하지 않음
- `autosave.js`의 많은 기능(자동저장, 복구 등)이 관리 페이지에서는 불필요

### 📝 통폐합 전략

#### 전략 1: 공통 모듈 추출 (권장)
**새 파일 생성**: `js/report-data-manager.js`

**책임**:
- localStorage CRUD 전담
- 보고서 데이터 구조 검증
- 마이그레이션 처리

**장점**:
- Single Source of Truth 확립
- 두 페이지 모두에서 안전하게 사용 가능
- 향후 기능 추가 시 한 곳만 수정

**구조**:
```javascript
// js/report-data-manager.js
const ReportDataManager = {
  STORAGE_KEY: 'saved_counseling_reports',
  
  // 데이터 로드 (호환성 처리 포함)
  loadReports() { },
  
  // 데이터 저장
  saveReports(reports) { },
  
  // 단일 보고서 저장
  saveReport(report) { },
  
  // 보고서 업데이트
  updateReport(id, updates) { },
  
  // 보고서 삭제 (소프트/하드)
  deleteReport(id, permanent) { },
  
  // 보고서 복원
  restoreReport(id) { },
  
  // 데이터 검증 및 마이그레이션
  validateAndMigrate(reports) { }
};
```

**적용 범위**:
- `report.html` → `autosave.js` → `ReportDataManager` 사용
- `report-management.html` → `report-management.js` → `ReportDataManager` 사용

#### 전략 2: autosave.js 리팩토링
**목표**: 두 가지 역할 분리
1. **자동저장 기능** (report.html 전용)
2. **보고서 데이터 관리** (공통)

**변경사항**:
- 데이터 관리 함수들을 `ReportDataManager`로 이동
- `autosave.js`는 자동저장 로직만 유지
- `report-management.js`에서 중복 로직 제거

#### 전략 3: 유틸리티 함수 통합
**새 파일 생성**: `js/ui-utils.js`

**포함 기능**:
- `showToast(message, type)` - 통합 토스트 알림
- `escapeHtml(text)` - HTML 이스케이프
- `formatDate(date)` - 날짜 포맷팅
- `generateTitle(content, maxLength)` - 제목 생성

### 🛠️ 구현 계획

#### Step 1: 공통 모듈 생성 (우선순위: 높음)
**예상 소요 시간**: 3-4시간

**작업 내용**:
1. `js/report-data-manager.js` 생성
   - localStorage CRUD 구현
   - 데이터 검증 및 마이그레이션
   - 에러 핸들링

2. `js/ui-utils.js` 생성
   - Toast 알림 통합
   - 유틸리티 함수들 통합

**파일 수정**:
- 생성: `js/report-data-manager.js`
- 생성: `js/ui-utils.js`

#### Step 2: autosave.js 리팩토링 (우선순위: 높음)
**예상 소요 시간**: 2-3시간

**작업 내용**:
1. 데이터 관리 로직을 `ReportDataManager` 호출로 변경
2. 자동저장 기능만 유지
3. 불필요한 함수 제거

**파일 수정**:
- 수정: `js/autosave.js`
- 의존성 추가: `report-data-manager.js`, `ui-utils.js`

#### Step 3: report-management.js 최적화 (우선순위: 높음)
**예상 소요 시간**: 2-3시간

**작업 내용**:
1. 중복 로직 제거
2. `ReportDataManager` 사용
3. `ui-utils` 사용
4. 코드 간소화

**파일 수정**:
- 수정: `js/report-management.js`
- 의존성 추가: `report-data-manager.js`, `ui-utils.js`

#### Step 4: HTML 파일 의존성 정리 (우선순위: 중간)
**예상 소요 시간**: 1시간

**작업 내용**:
1. `report-management.html`에서 불필요한 `app.js` 제거
2. 새로운 공통 모듈 추가
3. 로드 순서 최적화

**수정 전**:
```html
<script src="js/browser-polyfills.js"></script>
<script src="js/usage-core.js"></script>
<script src="js/common-components.js"></script>
<script src="js/autosave.js"></script>
<script src="js/app.js"></script>  <!-- ⚠️ 불필요 -->
<script src="js/report-management.js"></script>
```

**수정 후**:
```html
<script src="js/browser-polyfills.js"></script>
<script src="js/ui-utils.js"></script>               <!-- ✅ 추가 -->
<script src="js/report-data-manager.js"></script>    <!-- ✅ 추가 -->
<script src="js/usage-core.js"></script>
<script src="js/common-components.js"></script>
<script src="js/report-management.js"></script>
```

#### Step 5: 테스트 및 검증 (우선순위: 높음)
**예상 소요 시간**: 2-3시간

**테스트 항목**:
- [x] 보고서 저장/로드 기능
- [x] 제목 편집 기능
- [x] 즐겨찾기 토글
- [x] 태그 관리
- [x] 메모 추가/수정
- [x] 복사본 만들기
- [x] 휴지통 기능 (이동/복원/영구삭제)
- [x] 필터링 및 정렬
- [x] PDF/텍스트 내보내기
- [x] report.html과의 연동 (불러오기)

### 📊 예상 효과

**코드 품질 개선**:
- 중복 코드 약 30% 감소
- 유지보수성 50% 향상
- 버그 발생 가능성 40% 감소

**성능 개선**:
- 불필요한 스크립트 로드 제거 (app.js)
- 메모리 사용량 약간 감소

**개발 효율**:
- 새 기능 추가 시 수정 범위 최소화
- 데이터 구조 변경 시 한 곳만 수정
- 테스트 범위 명확화

### 🚨 주의사항

**1. 하위 호환성 유지**
- 기존 localStorage 데이터 구조 보존
- 마이그레이션 로직 필수 구현

**2. 점진적 적용**
- 한 번에 모든 파일을 수정하지 말고 단계별 적용
- 각 단계마다 테스트 필수

**3. 백업**
- 작업 전 전체 코드 백업
- Git 커밋 단위 세분화

### ✅ 완료 기준

- [ ] `report-data-manager.js` 생성 및 테스트
- [ ] `ui-utils.js` 생성 및 테스트
- [ ] `autosave.js` 리팩토링 완료
- [ ] `report-management.js` 최적화 완료
- [ ] HTML 파일 의존성 정리
- [ ] 전체 기능 테스트 통과
- [ ] 코드 리뷰 및 문서화

### 📅 예상 일정

**전체 소요 시간**: 10-14시간 (약 2-3일)

**일정**:
- Day 1: Step 1-2 (공통 모듈 생성, autosave 리팩토링)
- Day 2: Step 3-4 (report-management 최적화, HTML 정리)
- Day 3: Step 5 (테스트 및 검증)

---

## 📊 Phase 3: 분석 및 통계 (계획 중)

### 3.1 통계 대시보드
- [ ] 총 보고서 수
- [ ] 월별 작성량 차트
- [ ] 평균 글자 수
- [ ] 가장 많이 쓴 요일/시간대
- [ ] 최근 7일/30일 트렌드

**예상 소요 시간**: 6-8시간

**추가 라이브러리**: Chart.js 또는 기존 recharts 활용

### 3.2 키워드 분석
- [ ] 자주 쓰는 단어 TOP 10
- [ ] 워드 클라우드
- [ ] 키워드별 보고서 검색
- [ ] 감정 분석 (긍정/부정/중립)

**예상 소요 시간**: 8-10시간

**추가 라이브러리**: 
- 한글 형태소 분석 (한나눔, Komoran 등)
- D3.js (워드 클라우드)

### 3.3 작성 패턴 분석
- [ ] 시간대별 작성량
- [ ] 요일별 작성량
- [ ] 월별 성장 추이
- [ ] 평균 작성 시간 추정

**예상 소요 시간**: 4-6시간

---

## 🎨 Phase 4: UI/UX 개선 (계획 중)

### 4.1 보기 모드 확장
- [ ] 컴팩트 모드 (작은 카드)
- [ ] 상세 모드 (큰 카드 + 더 많은 정보)
- [ ] 테이블 뷰 (스프레드시트 형태)
- [ ] 타임라인 뷰 (날짜별 시간축)

**예상 소요 시간**: 6-8시간

### 4.2 드래그 앤 드롭
- [ ] 카드 드래그 이동
- [ ] 순서 변경 (수동 정렬)
- [ ] 순서 저장 (`customOrder: number`)
- [ ] 드래그 중 시각적 피드백

**예상 소요 시간**: 5-7시간

**추가 라이브러리**: SortableJS 또는 네이티브 Drag API

### 4.3 고급 필터
- [ ] 복합 필터 (AND/OR 조건)
- [ ] 글자 수 범위 필터
- [ ] 날짜 범위 선택 (캘린더)
- [ ] 저장된 필터 프리셋

**예상 소요 시간**: 4-6시간

### 4.4 반응형 최적화
- [ ] 모바일 전용 레이아웃
- [ ] 터치 제스처 지원
- [ ] 오프라인 모드 (PWA)
- [ ] 다크모드 완전 지원

**예상 소요 시간**: 6-8시간

---

## 🔧 Phase 5: 고급 기능 (미래)

### 5.1 협업 기능
- [ ] 보고서 공유 (링크 생성)
- [ ] 다른 사용자와 공유
- [ ] 공유 권한 관리 (읽기/쓰기)
- [ ] 댓글 기능

**예상 소요 시간**: 12-16시간

**필요 사항**: 백엔드 서버 또는 Firebase 연동

### 5.2 자동화
- [ ] 자동 태그 추천 (AI)
- [ ] 자동 분류 (카테고리)
- [ ] 예약 삭제 (N일 후 자동)
- [ ] 주기적 백업 알림

**예상 소요 시간**: 10-14시간

### 5.3 인쇄 및 공유
- [ ] 인쇄 최적화 CSS
- [ ] 이메일 전송
- [ ] SNS 공유
- [ ] QR 코드 생성

**예상 소요 시간**: 4-6시간

---

## 📅 개발 일정 (예상)

### Week 1-2: Phase 1 (✅ 완료)
- 핵심 기능 구현
- 기본 CRUD 완성
- 내보내기 기능

### Week 3-4: Phase 2 (✅ 완료)
- ✅ 즐겨찾기 (Week 3, Mon-Tue)
- ✅ 태그 시스템 (Week 3, Wed-Fri)
- ✅ 메모 + 복사본 (Week 4, Mon-Tue)
- ✅ 휴지통 (Week 4, Wed-Fri)

### Week 5-6: Phase 3
- 통계 대시보드 (Week 5)
- 키워드 분석 (Week 6)

### Week 7-8: Phase 4
- UI/UX 개선 (Week 7)
- 반응형 최적화 (Week 8)

### Week 9+: Phase 5 (선택)
- 협업 기능 (필요 시)
- 자동화 (필요 시)

---

## 🗂️ 데이터 구조 확장 계획

### 현재 구조 (Phase 1)
```javascript
{
  id: number,
  timestamp: Date,
  title: string,
  input: string,
  output: string
}
```

### Phase 2 확장
```javascript
{
  id: number,
  timestamp: Date,
  title: string,
  input: string,
  output: string,
  isFavorite: boolean,           // 즐겨찾기 (✅)
  tags: string[],                // 태그 (✅)
  notes: string,                 // 메모 (✅)
  isDeleted: boolean,            // 휴지통 여부 (✅)
  deletedAt: Date | null         // 삭제 시간 (✅)
}
```

### Phase 3 확장
```javascript
{
  id: number,
  timestamp: Date,
  title: string,
  input: string,
  output: string,
  isFavorite: boolean,
  tags: string[],
  notes: string,
  isDeleted: boolean,
  deletedAt: Date | null,
  customOrder: number,           // 수동 정렬 순서
  viewCount: number,             // 조회 수
  lastViewed: Date | null,       // 마지막 조회 시간
  wordCount: number,             // 단어 수 (캐싱)
  sentiment: string | null       // 감정 분석 결과
}
```

---

## 🔨 기술 스택

### 현재 사용 중
- HTML5
- CSS3 (Custom Properties)
- Vanilla JavaScript (ES6+)
- jsPDF (PDF 생성)
- localStorage (데이터 저장)

### 추가 검토 중
- Chart.js / Recharts (통계 차트)
- D3.js (워드 클라우드)
- SortableJS (드래그 앤 드롭)
- 한글 형태소 분석 라이브러리
- IndexedDB (대용량 데이터)

---

## 📝 코딩 컨벤션

### JavaScript
- camelCase (변수, 함수)
- PascalCase (클래스)
- UPPER_SNAKE_CASE (상수)
- 함수명: 동사 + 명사 (예: `loadReports()`, `deleteReport()`)
- 이벤트 핸들러: `handle` + 이벤트명 (예: `handleClick()`)

### CSS
- kebab-case (클래스명)
- BEM 방법론 고려 (예: `.report-card__title--highlighted`)
- 컴포넌트별 파일 분리
- CSS 변수 적극 활용 (`var(--color-primary)`)

### 파일 구조
```
RE/
├── report-management.html      # 메인 페이지
├── css/
│   └── report-management.css   # 전용 스타일
├── js/
│   └── report-management.js    # 전용 스크립트
└── docs/
    └── report-management-plan.md  # 이 문서
```

---

## ✅ Task Checklist

### Phase 1: 핵심 기능 (✅ 100% 완료)
- [x] 페이지 구조 설계
- [x] 필터바 구현
- [x] 그리드/리스트 레이아웃
- [x] 무한 스크롤
- [x] 검색 기능
- [x] 다중 선택
- [x] 제목 편집
- [x] 상세보기 모달
- [x] PDF 내보내기
- [x] 텍스트 내보내기
- [x] index.html 연결

### Phase 2: 고급 기능 (✅ 100% 완료)
- [x] 즐겨찾기 시스템 (✅ 완료)
  - [x] 데이터 구조 설계
  - [x] UI 버튼 추가
  - [x] 토글 로직
  - [x] 필터 추가
  - [x] localStorage 저장
- [x] 태그 시스템 (✅ 완료)
  - [x] 데이터 구조 설계
  - [x] 태그 입력 UI
  - [x] 태그 표시 (뱃지)
  - [x] 태그 필터
  - [x] 태그 관리 모달
- [x] 메모 기능 (✅ 완료)
  - [x] 데이터 구조 설계 (notes: string)
  - [x] 메모 입력 UI (prompt 기반)
  - [x] 메모 표시 (카드 미리보기 + 상세보기)
  - [x] 메모 편집/삭제
- [x] 복사본 만들기 (✅ 완료)
  - [x] 복사 버튼 추가
  - [x] 복사 로직 구현 (새 ID 생성 + 제목에 '사본' 추가)
  - [x] 타임스탬프 업데이트
  - [x] Toast 알림
- [x] 휴지통 (✅ 완료)
  - [x] 소프트 삭제 (isDeleted, deletedAt 필드 추가)
  - [x] 휴지통 탭/UI (활성 보고서/휴지통 탭)
  - [x] 복원 기능 (휴지통 → 활성)
  - [x] 영구 삭제 (개별/일괄)
  - [x] 휴지통 비우기 (전체 영구 삭제)

### Phase 3: 분석 및 통계
- [ ] 통계 대시보드
- [ ] 키워드 분석
- [ ] 작성 패턴 분석

### Phase 4: UI/UX 개선
- [ ] 보기 모드 확장
- [ ] 드래그 앤 드롭
- [ ] 고급 필터
- [ ] 반응형 최적화

### Phase 5: 고급 기능
- [ ] 협업 기능
- [ ] 자동화
- [ ] 인쇄 및 공유

---

## 🐛 알려진 이슈 및 개선사항

### 현재 이슈
- 없음 (Phase 1 완료)

### 개선 필요
1. **성능 최적화**
   - 대량 데이터 (1000+) 처리 시 렌더링 최적화
   - 가상 스크롤 (Virtual Scrolling) 검토

2. **접근성 개선**
   - 키보드 네비게이션 강화
   - 스크린 리더 지원
   - ARIA 속성 추가

3. **오류 처리**
   - localStorage quota 초과 시 대응
   - PDF 생성 실패 시 폴백
   - 네트워크 오류 처리

---

## 📚 참고 자료

### 디자인 영감
- Google Drive (파일 관리)
- Notion (데이터베이스 뷰)
- Trello (카드 레이아웃)

### 기술 문서
- [MDN Web Docs](https://developer.mozilla.org/)
- [jsPDF Documentation](https://rawgit.com/MrRio/jsPDF/master/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

---

## 📞 연락처

**개발자**: 김도현
**프로젝트**: RE - 간편해진 보고서 작성
**최종 업데이트**: 2025-01-10

---

## 📄 라이선스

Copyright (c) 2025 김도현. All Rights Reserved.
