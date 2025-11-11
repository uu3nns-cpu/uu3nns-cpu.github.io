# RE 프로젝트 리팩토링 계획서

**작성일**: 2025년 11월 11일  
**목적**: 코드 유지보수성 향상, 파일 구조 개선, 네이밍 통일

---

## 📋 목차
1. [현재 상태 분석](#현재-상태-분석)
2. [리팩토링 전략](#리팩토링-전략)
3. [단계별 실행 계획](#단계별-실행-계획)
4. [파일 구조 재설계](#파일-구조-재설계)
5. [코드 통폐합 계획](#코드-통폐합-계획)
6. [네이밍 규칙](#네이밍-규칙)
7. [백업 및 롤백 전략](#백업-및-롤백-전략)

---

## 현재 상태 분석

### 📊 파일 현황
- **HTML**: 16개 (메인 10개, 가이드 6개)
- **CSS**: 15개
- **JavaScript**: 30개 (config 2개 포함)
- **문서**: 7개 (MD 파일)
- **총 라인 수**: 약 15,000줄 이상

### 🚨 주요 문제점

#### 1. JavaScript 파일 분산
```
js/
├── app.js (1,200줄) ⚠️ 너무 큼
├── report-management-part1.js
├── report-management-part2.js
├── report-management-part3.js
├── report-management-part4.js (미사용)
├── report-management-part5.js (미사용)
└── report-management.js (중복?)
```

**문제**: 
- part4, part5는 어디서도 참조되지 않음
- part1~3과 report-management.js의 관계 불명확
- 파일명에 일관성 없음

#### 2. CSS 네이밍 불일치
```
css/
├── components-base.css
├── components-layout.css
├── header-button-unify.css ⚠️ 'unify' vs 'unified'
├── buttons-unified.css ⚠️
├── report-unified.css
└── settings-3column.css ⚠️ 구체적 구현 내용이 파일명에
```

**문제**:
- unified vs unify 혼용
- 3column처럼 구현 방식이 파일명에 드러남 (추상화 부족)

#### 3. 문서 파일 산재
```
루트/
├── app-js-split-plan.md (작업 계획서)
├── FILE_CLEANUP_PLAN.md (정리 계획서)
└── docs/
    ├── ADSENSE_*.md (6개)
    └── report-management-plan.md
```

**문제**: 작업 관련 문서가 루트와 docs에 혼재

---

## 리팩토링 전략

### 🎯 핵심 원칙

1. **점진적 개선**: 한 번에 하나씩, 테스트하며 진행
2. **하위 호환성**: 기존 HTML 파일 수정 최소화
3. **명확한 책임**: 파일 하나당 하나의 명확한 역할
4. **일관된 네이밍**: 프로젝트 전체에 통일된 명명 규칙
5. **문서화 강화**: 변경 이력 및 가이드 문서 작성

### 📐 우선순위

#### 🔴 긴급 (1~2일)
- JavaScript 중복/미사용 파일 정리
- CSS 네이밍 통일

#### 🟡 중요 (3~5일)
- app.js 분할
- report-management 시리즈 통합
- 폴더 구조 재설계

#### 🟢 선택 (1주 이후)
- 문서 재정리
- 주석 및 JSDoc 추가
- 테스트 코드 작성

---

## 단계별 실행 계획

### Phase 1: 백업 및 준비 (1시간)

#### 작업 내용
```bash
# 1. Git 커밋
git add .
git commit -m "refactor: 리팩토링 전 백업 커밋"
git tag backup-20251111

# 2. 백업 폴더 생성
mkdir backup
mkdir backup/deprecated-js
mkdir backup/old-plans

# 3. 현재 구조 문서화
tree /F > backup/structure-before.txt
```

#### 체크리스트
- [ ] Git 상태 정상 확인
- [ ] 모든 변경사항 커밋됨
- [ ] 백업 폴더 생성 완료
- [ ] 구조 문서화 완료

---

### Phase 2: JavaScript 미사용 파일 제거 (30분)

#### 삭제 대상
```
js/
├── autosave.js.backup → backup/deprecated-js/
├── report-management-part4.js → 검토 후 삭제
├── report-management-part5.js → 검토 후 삭제
└── app.js.backup → backup/deprecated-js/ (존재 시)
```

#### 검증 절차
1. 각 파일이 HTML에서 참조되는지 확인
   ```bash
   grep -r "report-management-part4.js" *.html
   grep -r "report-management-part5.js" *.html
   ```

2. 파일 내용 확인 (혹시 필요한 코드가 있는지)
   ```javascript
   // report-management-part4.js 내용 검토
   // 중요한 함수가 있으면 part3에 병합
   ```

3. 백업 후 삭제
   ```bash
   mv js/autosave.js.backup backup/deprecated-js/
   # part4, part5는 검토 후 결정
   ```

#### Git 커밋
```bash
git add .
git commit -m "refactor: 미사용 JavaScript 파일 제거

- autosave.js.backup 백업 폴더로 이동
- report-management-part4.js 제거 (미참조)
- report-management-part5.js 제거 (미참조)"
```

---

### Phase 3: report-management.js 통합 (완료)

#### 현재 상황 분석
```
report-management.html에서 참조:
✓ report-management-part1.js
✓ report-management-part2.js
✓ report-management-part3.js
? report-management.js (로드되지 않음)
```

#### 통합 계획

**옵션 A: 통합 파일 생성** (권장)
```javascript
// js/features/report-management.js (새 파일)
// Part 1, 2, 3를 하나로 통합

// ==================== Part 1: 데이터 로드 ====================
function loadReports() {
    // part1 내용
}

// ==================== Part 2: UI 렌더링 ====================
function renderReportsList() {
    // part2 내용
}

// ==================== Part 3: 보고서 관리 ====================
function deleteReport() {
    // part3 내용
}
```

**옵션 B: 파일 유지 + 이름 변경**
```
report-management-part1.js → report-data-loader.js
report-management-part2.js → report-ui-renderer.js
report-management-part3.js → report-actions.js
```

**선택**: **옵션 A 권장** (관리가 쉬움)

#### 실행 단계
```bash
# 1. 새 디렉토리 생성
mkdir js/features

# 2. 통합 파일 생성
cat js/report-management-part1.js \
    js/report-management-part2.js \
    js/report-management-part3.js \
    > js/features/report-management.js

# 3. HTML 수정
# report-management.html에서:
# - part1~3 script 태그 삭제
# + <script src="js/features/report-management.js">

# 4. 테스트
# 보고서 관리 페이지 모든 기능 확인

# 5. 성공 시 기존 파일 백업
mv js/report-management-part*.js backup/deprecated-js/
```

#### Git 커밋
```bash
git add .
git commit -m "refactor: report-management 파일 통합

- part1~3을 features/report-management.js로 통합
- HTML 참조 업데이트
- 기존 파일 백업 폴더로 이동"
```

---

### Phase 4: CSS 네이밍 통일 (1시간)

#### 변경 대상
```
변경 전                      → 변경 후
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
header-button-unify.css      → header-unified.css
settings-3column.css         → settings-layout.css
```

#### 실행
```bash
# 1. 파일명 변경
mv css/header-button-unify.css css/header-unified.css
mv css/settings-3column.css css/settings-layout.css

# 2. HTML에서 참조 업데이트
# 모든 HTML 파일에서:
# header-button-unify.css → header-unified.css
# settings-3column.css → settings-layout.css

# 3. 검색/치환 (VS Code)
# Ctrl+Shift+H로 프로젝트 전체 검색 후 일괄 치환
```

#### Git 커밋
```bash
git add .
git commit -m "refactor: CSS 파일명 네이밍 통일

- header-button-unify → header-unified
- settings-3column → settings-layout
- 일관된 네이밍 규칙 적용"
```

---

### Phase 5: app.js 분할 (4~6시간)

#### 분할 계획 (보수적 접근)

**1단계: 상수 분리** (이미 완료)
```
✓ js/config/app-constants.js (130줄)
✓ js/config/model-configs.js (50줄)
```

**2단계: 유틸리티 분리** (30분)
```javascript
// js/utils/validation.js
function validateApiKeys() { }
function validateApiKeyFormat() { }

// js/utils/ui-helpers.js
function showToast() { }
function showError() { }
function toggleApiKeyVisibility() { }
```

**3단계: 프롬프트 빌더 분리** (1시간)
```javascript
// js/features/prompt-builder.js
function buildPrompt(input) { }
function buildSystemPrompt() { }
```

**4단계: API 클라이언트 통합** (2시간)
```javascript
// js/core/api-client.js
class ApiClient {
    static async generate(model, input, apiKey) {
        // Groq와 GPT 통합
    }
}
```

#### 최종 구조 (목표)
```
js/
├── core/
│   ├── app.js (200줄) ← 핵심만
│   └── api-client.js (300줄)
├── config/
│   ├── app-constants.js ✓
│   └── model-configs.js ✓
├── features/
│   ├── prompt-builder.js
│   ├── report-management.js
│   └── export-handler.js
├── utils/
│   ├── validation.js
│   ├── ui-helpers.js
│   └── storage.js
└── ...
```

#### Git 커밋 (각 단계마다)
```bash
git commit -m "refactor: app.js 분할 - [단계명]"
```

---

### Phase 6: 폴더 구조 최종 정리 (2시간)

#### 목표 구조
```
RE/
├── docs/                    # 📚 프로젝트 문서
│   ├── guides/              # 사용자 가이드
│   │   ├── adsense/        # AdSense 관련
│   │   └── development/    # 개발 문서
│   ├── plans/              # 작업 계획서
│   │   ├── completed/      # 완료된 계획
│   │   └── active/         # 진행 중 계획
│   └── README.md
│
├── backup/                  # 💾 백업 파일
│   ├── deprecated-js/
│   ├── old-plans/
│   └── structure-before.txt
│
├── src/                     # 🎨 소스 파일
│   ├── css/
│   │   ├── base/           # 기본 스타일
│   │   ├── components/     # 컴포넌트
│   │   ├── pages/          # 페이지별
│   │   └── themes/         # 테마
│   │
│   ├── js/
│   │   ├── core/           # 핵심 로직
│   │   ├── config/         # 설정
│   │   ├── features/       # 기능 모듈
│   │   ├── utils/          # 유틸리티
│   │   └── vendor/         # 외부 라이브러리
│   │
│   └── images/
│       ├── icons/
│       ├── screenshots/
│       └── logos/
│
├── public/                  # 🌐 공개 페이지
│   ├── index.html
│   ├── report.html
│   ├── settings.html
│   └── ...
│
├── guide/                   # 📖 사용자 가이드 (웹)
│
└── [root files]
    ├── README.md
    ├── LICENSE
    └── .gitignore
```

#### 이동 계획
```bash
# 1. 문서 정리
mkdir -p docs/plans/completed
mv app-js-split-plan.md docs/plans/completed/
mv FILE_CLEANUP_PLAN.md docs/plans/completed/

mkdir -p docs/guides/adsense
mv docs/ADSENSE_*.md docs/guides/adsense/
mv docs/AD_INSERTION_GUIDE.md docs/guides/adsense/

# 2. CSS 분류
mkdir -p src/css/base
mkdir -p src/css/components
mkdir -p src/css/pages

mv css/variables.css src/css/base/
mv css/base.css src/css/base/
mv css/layout.css src/css/base/

mv css/components-*.css src/css/components/
mv css/buttons-unified.css src/css/components/

mv css/report-*.css src/css/pages/
mv css/settings*.css src/css/pages/

# 3. JavaScript 이미 정리됨 (Phase 5에서)

# 4. HTML은 root 유지 (URL 변경 방지)
```

---

## 파일 구조 재설계

### 최종 파일 구조 (상세)

```
RE/
│
├── 📄 index.html
├── 📄 report.html
├── 📄 settings.html
├── 📄 report-management.html
├── 📄 data-management.html
├── 📄 changelog.html
├── 📄 donate.html
├── 📄 notice.html
├── 📄 privacy.html
├── 📄 guide.html (리다이렉트)
│
├── 📂 guide/
│   ├── index.html
│   ├── 01-start.html
│   ├── 02-basic.html
│   ├── 03-advanced.html
│   ├── 04-security.html
│   ├── 05-troubleshoot.html
│   └── css/guide-common.css
│
├── 📂 src/
│   ├── 📂 css/
│   │   ├── 📂 base/
│   │   │   ├── variables.css
│   │   │   ├── base.css
│   │   │   └── layout.css
│   │   ├── 📂 components/
│   │   │   ├── components-base.css
│   │   │   ├── components-layout.css
│   │   │   ├── buttons-unified.css
│   │   │   ├── header-unified.css
│   │   │   ├── chatbot.css
│   │   │   ├── markdown-and-usage.css
│   │   │   └── cookie-consent.css
│   │   └── 📂 pages/
│   │       ├── report-unified.css
│   │       ├── report-management.css
│   │       ├── settings.css
│   │       └── settings-layout.css
│   │
│   ├── 📂 js/
│   │   ├── 📂 core/
│   │   │   ├── app.js (200줄)
│   │   │   ├── api-client.js
│   │   │   └── storage-manager.js
│   │   ├── 📂 config/
│   │   │   ├── app-constants.js
│   │   │   └── model-configs.js
│   │   ├── 📂 features/
│   │   │   ├── prompt-builder.js
│   │   │   ├── report-management.js
│   │   │   ├── export-handler.js
│   │   │   ├── preset-manager.js
│   │   │   ├── chatbot.js
│   │   │   └── autosave.js
│   │   ├── 📂 utils/
│   │   │   ├── validation.js
│   │   │   ├── ui-helpers.js
│   │   │   ├── security.js
│   │   │   ├── error-handler.js
│   │   │   └── markdown-renderer.js
│   │   └── 📂 ui/
│   │       ├── common-components.js
│   │       ├── ui-enhancements.js
│   │       ├── settings-preview.js
│   │       └── resize-handler.js
│   │
│   └── 📂 images/
│       ├── RE_서비스안내_포스터.png
│       └── guide/screenshot/
│
├── 📂 docs/
│   ├── 📂 guides/
│   │   ├── 📂 adsense/
│   │   │   ├── ADSENSE_COMPLETE_REPORT.md
│   │   │   ├── ADSENSE_GUIDE.md
│   │   │   ├── ADSENSE_LEGAL_REQUIREMENTS_COMPLETE.md
│   │   │   └── AD_INSERTION_GUIDE.md
│   │   └── 📂 development/
│   │       ├── error-handling-guide.md
│   │       └── API_INTEGRATION.md
│   ├── 📂 plans/
│   │   ├── 📂 completed/
│   │   │   ├── app-js-split-plan.md
│   │   │   ├── FILE_CLEANUP_PLAN.md
│   │   │   └── report-management-plan.md
│   │   └── 📂 active/
│   │       └── (진행 중인 계획)
│   └── README.md
│
├── 📂 backup/
│   ├── deprecated-js/
│   ├── old-plans/
│   └── structure-before.txt
│
├── 📄 README.md
├── 📄 LICENSE
└── 📄 .gitignore
```

---

## 코드 통폐합 계획

### 1. report-management 시리즈

#### Before
```javascript
// report-management-part1.js (300줄)
function loadReports() { }

// report-management-part2.js (250줄)
function renderReport() { }

// report-management-part3.js (200줄)
function deleteReport() { }
```

#### After
```javascript
// js/features/report-management.js (750줄)
/**
 * 보고서 관리 기능
 * - 보고서 목록 로드
 * - UI 렌더링
 * - CRUD 작업
 */

// ==================== 데이터 로드 ====================
function loadReports() {
    // part1 내용
}

// ==================== UI 렌더링 ====================
function renderReportsList() {
    // part2 내용
}

// ==================== 보고서 작업 ====================
function deleteReport(id) {
    // part3 내용
}

function editReport(id) {
    // 새 기능 추가 가능
}
```

### 2. app.js 분할

#### Before (1,200줄)
```javascript
// app.js
const DEFAULT_API_KEYS = { };  // 130줄
const STORAGE_KEYS = { };
const MODEL_CONFIGS = { };    // 50줄

function showToast() { }       // 50줄
function showError() { }

function buildPrompt() { }     // 200줄

function generateWithGroq() { } // 250줄
function generateWithGPT() { }  // 250줄

// ... 기타 300줄
```

#### After (200줄 + 모듈화)
```javascript
// core/app.js (200줄)
import { showToast, showError } from '../utils/ui-helpers.js';
import { buildPrompt } from '../features/prompt-builder.js';
import ApiClient from './api-client.js';

function initialize() {
    loadSettings();
    loadTheme();
    initKeyboardShortcuts();
}

async function generateJournals(event) {
    const input = getInput();
    const { groq, gpt } = getApiKeys();
    
    if (groq) await ApiClient.generate('groq', input, groq);
    if (gpt) await ApiClient.generate('gpt', input, gpt);
}
```

### 3. CSS 통합 전략

#### 현재 문제
```css
/* components-base.css */
.btn { }

/* buttons-unified.css */
.btn--primary { }  /* 중복? */
```

#### 해결 방안
**옵션 A**: 파일 유지 (명확한 역할 분담)
```
components-base.css   → 모든 컴포넌트의 기본 스타일
buttons-unified.css   → 버튼 전용 고급 스타일 (변형, 애니메이션)
```

**옵션 B**: 통합
```css
/* components/buttons.css */
/* 기본 + 고급 스타일 모두 */
.btn { }
.btn--primary { }
.btn--secondary { }
.btn-group { }
```

**선택**: **옵션 A 권장** (이미 잘 분리됨)

---

## 네이밍 규칙

### JavaScript 파일

#### 파일명
```
[category]-[feature].js

예시:
✓ report-management.js
✓ prompt-builder.js
✓ api-client.js
✓ ui-helpers.js

✗ reportManagement.js (camelCase 지양)
✗ report_management.js (snake_case 지양)
```

#### 함수명
```javascript
// ✓ 동사 + 명사
function loadReports() { }
function saveSettings() { }
function generatePrompt() { }

// ✗ 명사만
function reports() { }
function settings() { }
```

#### 변수명
```javascript
// ✓ 명사 또는 형용사
const apiKeys = { };
const isLoading = false;
const reportList = [];

// ✗ 동사
const load = true;
const save = { };
```

### CSS 파일

#### 파일명
```
[scope]-[purpose].css

예시:
✓ components-base.css      # 모든 컴포넌트의 기본
✓ page-report.css          # report 페이지 전용
✓ layout-responsive.css    # 반응형 레이아웃

✗ new-buttons.css          # 모호함
✗ fix-mobile.css           # 임시 수정 느낌
```

#### 클래스명 (BEM 방식)
```css
/* Block */
.report-card { }

/* Element */
.report-card__title { }
.report-card__content { }

/* Modifier */
.report-card--featured { }
.report-card--archived { }
```

### 폴더명
```
소문자, 하이픈 사용

✓ report-management
✓ api-clients
✓ user-settings

✗ ReportManagement
✗ api_clients
✗ user settings (공백 금지)
```

---

## 백업 및 롤백 전략

### 백업 체계

#### 1. Git 태그 전략
```bash
# 각 Phase 완료 시
git tag phase1-backup-20251111
git tag phase2-backup-20251111
git tag phase3-backup-20251111

# 최종 완료 시
git tag refactoring-complete-20251111
```

#### 2. 백업 폴더 구조
```
backup/
├── phase1/
│   ├── deprecated-js/
│   └── structure.txt
├── phase2/
│   ├── old-report-parts/
│   └── changes.md
└── phase3/
    ├── old-css/
    └── mapping.json
```

#### 3. 변경 로그
```markdown
# CHANGELOG.md

## [Refactoring 2025-11-11]

### Added
- js/features/report-management.js (통합 파일)
- js/utils/validation.js
- docs/plans/ 디렉토리

### Changed
- css/header-button-unify.css → css/header-unified.css
- css/settings-3column.css → css/settings-layout.css

### Removed
- js/report-management-part4.js (미사용)
- js/report-management-part5.js (미사용)
- js/autosave.js.backup

### Moved
- app-js-split-plan.md → docs/plans/completed/
- ADSENSE_*.md → docs/guides/adsense/
```

### 롤백 방법

#### 전체 롤백
```bash
# Git 태그로 복원
git reset --hard phase1-backup-20251111

# 또는 백업 파일 복원
cp -r backup/phase1/* .
```

#### 부분 롤백
```bash
# 특정 파일만 복원
git checkout phase1-backup-20251111 -- js/app.js

# 특정 커밋만 되돌리기
git revert <commit-hash>
```

---

## 실행 체크리스트

### ✅ Phase 1: 백업 (완료)
- [x] Git 커밋 완료
- [x] Git 태그 생성
- [x] backup/ 폴더 생성
- [x] 구조 문서화

### ✅ Phase 5: app.js 분할 (완료)
- [x] 유틸리티 분리
- [x] 프롬프트 빌더 분리
- [x] API 클라이언트 통합
- [x] 각 단계마다 테스트
- [x] 각 단계마다 Git 커밋

### ✅ Phase 2: 미사용 파일 제거 (완료)
- [x] `js/report-management.js` 백업 폴더로 이동
- [x] `js/app.js.backup` 백업 폴더로 이동
- [x] HTML 참조 확인
- [x] 기능 테스트

**완료일**: 2025년 11월 11일  
**소요 시간**: 약 10분  
**난이도**: ⭐☆☆☆☆

### ✅ Phase 3: report-management 통합 (완료)
- [x] `js/features/` 디렉토리 생성
- [x] part1~3 통합하여 `report-management.js` 생성
- [x] `report-management.html` 수정
- [x] 기능 테스트 (저장, 삭제, 편집)
- [x] 기존 part 파일들 백업 폴더로 이동
- [x] Git 커밋

**완료일**: 2025년 11월 11일  
**소요 시간**: 약 30분  
**난이도**: ⭐⭐⭐☆☆

---

## 🎯 남은 작업 (진행 순서)

### 📍 Phase 4: CSS 네이밍 통일 (1시간)
- [ ] `header-button-unify.css` → `header-unified.css`
- [ ] `settings-3column.css` → `settings-layout.css`
- [ ] 모든 HTML에서 참조 업데이트
- [ ] 스타일 정상 확인
- [ ] Git 커밋

**예상 시간**: 1시간  
**난이도**: ⭐⭐☆☆☆

---

### ✅ Phase 4: CSS 네이밍 통일 (완료)
- [x] `header-button-unify.css` → `header-unified.css`
- [x] `settings-3column.css` → `settings-layout.css`
- [x] 모든 HTML에서 참조 업데이트
- [x] 스타일 정상 확인
- [x] Git 커밋

**완료일**: 2025년 11월 11일  
**소요 시간**: 약 1시간  
**난이도**: ⭐⭐☆☆☆

---

### 📍 Phase 6: 폴더 구조 정리 (2시간)

#### 🎯 목표
프로젝트 파일을 논리적으로 분류하여 유지보수성 향상

#### 📋 작업 순서

##### Step 1: 문서 폴더 구조 생성 (10분)
```bash
# 1. 디렉토리 생성
mkdir -p docs/plans/completed
mkdir -p docs/plans/active
mkdir -p docs/guides/adsense
mkdir -p docs/guides/development
```

**체크리스트**:
- [x] docs/plans/completed/ 생성 (이미 존재)
- [x] docs/plans/active/ 생성 ✓
- [x] docs/guides/adsense/ 생성 (이미 존재)
- [x] docs/guides/development/ 생성 (이미 존재)

##### Step 2: 문서 파일 이동 (15분)
```bash
# 2-1. 완료된 계획서 이동
mv app-js-split-plan.md docs/plans/completed/
mv FILE_CLEANUP_PLAN.md docs/plans/completed/
mv docs/report-management-plan.md docs/plans/completed/

# 2-2. AdSense 가이드 이동
mv docs/ADSENSE_COMPLETE_REPORT.md docs/guides/adsense/
mv docs/ADSENSE_GUIDE.md docs/guides/adsense/
mv docs/ADSENSE_LEGAL_REQUIREMENTS_COMPLETE.md docs/guides/adsense/
mv docs/AD_INSERTION_GUIDE.md docs/guides/adsense/
mv docs/ADSENSE_SITE_SETUP.md docs/guides/adsense/
mv docs/ADSENSE_AUTO_ADS_SETUP.md docs/guides/adsense/

# 2-3. 개발 문서 정리 (필요 시)
# mv docs/error-handling-guide.md docs/guides/development/
```

**체크리스트**:
- [x] 계획서 3개 이동 확인 (이미 완료)
- [x] AdSense 문서 4개 이동 확인 (이미 완료)
- [x] re_project_refactoring_plan.md → docs/plans/active/ ✓
- [x] docs/ 루트에 불필요한 파일 없음 ✓

##### Step 3: CSS 폴더 구조 생성 (10분)
```bash
# 3. 디렉토리 생성
mkdir -p src/css/base
mkdir -p src/css/components
mkdir -p src/css/pages
```

**체크리스트**:
- [x] src/css/base/ 생성 ✓
- [x] src/css/components/ 생성 ✓
- [x] src/css/pages/ 생성 ✓

##### Step 4: CSS 파일 분류 및 이동 (30분)

**기본 스타일 (base/)**
```bash
# 프로젝트 전역에 영향을 주는 기본 스타일
mv css/variables.css src/css/base/
mv css/base.css src/css/base/
mv css/layout.css src/css/base/
```

**컴포넌트 스타일 (components/)**
```bash
# 재사용 가능한 UI 컴포넌트 스타일
mv css/components-base.css src/css/components/
mv css/components-layout.css src/css/components/
mv css/buttons-unified.css src/css/components/
mv css/header-unified.css src/css/components/
mv css/chatbot.css src/css/components/
mv css/markdown-and-usage.css src/css/components/
mv css/cookie-consent.css src/css/components/
```

**페이지 전용 스타일 (pages/)**
```bash
# 특정 페이지에만 사용되는 스타일
mv css/report-unified.css src/css/pages/
mv css/report-management.css src/css/pages/
mv css/settings.css src/css/pages/
mv css/settings-layout.css src/css/pages/
```

**체크리스트**:
- [x] base/ - 4개 파일 이동 ✓ (이미 분류됨)
- [x] components/ - 7개 파일 이동 ✓ (이미 분류됨)
- [x] pages/ - 4개 파일 이동 ✓ (이미 분류됨)
- [x] css/ → src/css/로 이동 완료 ✓

##### Step 5: HTML 파일 경로 업데이트 (40분)

**중요**: 모든 HTML 파일에서 CSS 경로를 새 경로로 변경해야 합니다.

**변경 예시**:
```html
<!-- Before -->
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components-base.css">

<!-- After -->
<link rel="stylesheet" href="src/css/base/variables.css">
<link rel="stylesheet" href="src/css/base/base.css">
<link rel="stylesheet" href="src/css/components/components-base.css">
```

**일괄 변경 방법** (VS Code):
1. `Ctrl + Shift + H` (전체 검색/치환)
2. 다음 패턴으로 검색하여 치환:

```
# base 파일들
"css/variables.css"     → "src/css/base/variables.css"
"css/base.css"          → "src/css/base/base.css"
"css/layout.css"        → "src/css/base/layout.css"

# components 파일들
"css/components-base.css"      → "src/css/components/components-base.css"
"css/components-layout.css"    → "src/css/components/components-layout.css"
"css/buttons-unified.css"      → "src/css/components/buttons-unified.css"
"css/header-unified.css"       → "src/css/components/header-unified.css"
"css/chatbot.css"              → "src/css/components/chatbot.css"
"css/markdown-and-usage.css"   → "src/css/components/markdown-and-usage.css"
"css/cookie-consent.css"       → "src/css/components/cookie-consent.css"

# pages 파일들
"css/report-unified.css"       → "src/css/pages/report-unified.css"
"css/report-management.css"    → "src/css/pages/report-management.css"
"css/settings.css"             → "src/css/pages/settings.css"
"css/settings-layout.css"      → "src/css/pages/settings-layout.css"
```

**수동 확인이 필요한 HTML 파일 목록**:
- [x] index.html ✓
- [x] report.html ✓
- [x] settings.html ✓
- [x] report-management.html ✓
- [x] data-management.html ✓
- [x] changelog.html ✓
- [x] donate.html ✓
- [x] notice.html ✓
- [x] privacy.html ✓
- [x] guide.html ✓
- [x] guide/index.html (독립 스타일, 변경 제외)
- [x] guide/01-start.html (독립 스타일, 변경 제외)
- [x] guide/02-basic.html (독립 스타일, 변경 제외)
- [x] guide/03-advanced.html (독립 스타일, 변경 제외)
- [x] guide/04-security.html (독립 스타일, 변경 제외)
- [x] guide/05-troubleshoot.html (독립 스타일, 변경 제외)

##### Step 6: 기능 테스트 (20분)

**테스트 체크리스트**:
- [ ] index.html - 메인 페이지 스타일 정상
- [ ] report.html - 보고서 페이지 레이아웃 정상
- [ ] settings.html - 설정 페이지 동작 정상
- [ ] report-management.html - 보고서 관리 UI 정상
- [ ] 모든 버튼 스타일 정상
- [ ] 헤더 스타일 정상
- [ ] 반응형 레이아웃 정상 (모바일/태블릿/데스크톱)
- [ ] 다크모드 전환 정상
- [ ] 챗봇 UI 정상
- [ ] 쿠키 동의 팝업 정상

##### Step 7: 정리 및 커밋 (5분)

**정리 작업**:
```bash
# 빈 폴더 제거 (필요 시)
rmdir css/  # css 폴더가 비었으면

# 백업 디렉토리 정리
mkdir -p backup/old-structure
mv css backup/old-structure/  # 혹시 모를 롤백 대비
```

**Git 커밋**:
```bash
git add .
git commit -m "refactor: 폴더 구조 최종 정리

- docs 디렉토리 구조화 (plans, guides)
- CSS 파일 분류 (base, components, pages)
- 모든 HTML 경로 업데이트
- 테스트 완료"

git tag phase6-complete-20251111
```

#### 🚨 주의사항

1. **경로 변경 후 반드시 브라우저 캐시 클리어**
   - `Ctrl + Shift + Delete` → 캐시된 이미지 및 파일 삭제
   - 또는 `Ctrl + F5`로 강력 새로고침

2. **guide/ 폴더의 CSS는 이동하지 않음**
   - `guide/css/guide-common.css`는 현재 위치 유지
   - 가이드는 독립적인 스타일 사용

3. **롤백 계획**
   ```bash
   # 문제 발생 시
   git reset --hard HEAD~1
   # 또는
   cp -r backup/old-structure/css .
   ```

#### 📊 완료 후 구조

```
RE/
├── src/
│   └── css/
│       ├── base/ (3개)
│       ├── components/ (7개)
│       └── pages/ (4개)
├── docs/
│   ├── plans/
│   │   ├── completed/ (3개)
│   │   └── active/ (0개)
│   └── guides/
│       ├── adsense/ (6개)
│       └── development/
├── backup/
│   └── old-structure/
│       └── css/
└── [HTML 파일들은 루트 유지]
```

**체크리스트 요약**:
- [ ] Step 1: 문서 폴더 생성
- [ ] Step 2: 문서 파일 이동
- [ ] Step 3: CSS 폴더 생성
- [ ] Step 4: CSS 파일 이동
- [ ] Step 5: HTML 경로 업데이트
- [ ] Step 6: 전체 기능 테스트
- [ ] Step 7: Git 커밋

---

## ⏱️ 총 예상 소요 시간

| Phase | 작업 | 시간 | 상태 |
|-------|------|------|------|
| Phase 1 | 백업 | 1시간 | ✅ 완료 |
| Phase 5 | app.js 분할 | 4~6시간 | ✅ 완료 |
| Phase 2 | 미사용 파일 제거 | 10분 | ✅ 완료 |
| Phase 3 | report-management 통합 | 30분 | ✅ 완료 |
| Phase 4 | CSS 네이밍 | 1시간 | ⏳ 대기 |
| Phase 6 | 폴더 구조 정리 | 2시간 | ⏳ 대기 |

**총 남은 시간**: 약 3시간 (0.4일 작업량)