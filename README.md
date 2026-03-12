# RE: v0.9.1

> 상담 메모를 전문 보고서로 변환하는 AI 기반 도구

![Version](https://img.shields.io/badge/version-0.9.1-blue.svg)
![License](https://img.shields.io/badge/license-Copyright-red.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## 문서 안내
- [Design Guide](DESIGN_GUIDE.md)
- [Google Services Integration](docs/guides/Google_Services_Integration_Standard.md)

## 📖 목차

- [개요](#-개요)
- [주요 기능](#-주요-기능)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [기술 스택](#-기술-스택)
- [설정 가이드](#-설정-가이드)
- [사용 방법](#-사용-방법)
- [개발자 가이드](#-개발자-가이드)
- [라이선스](#-라이선스)

---

## 🎯 개요

**RE:**는 상담사를 위한 상담 메모를 전문 보고서로 자동 변환하는 도구입니다. 

상담 중 작성한 간단한 메모를 입력하면, 두 개의 AI 모델(Groq, GPT-4o-mini)이 동시에 전문적인 보고서를 생성합니다. 생성된 보고서는 AI 챗봇을 통해 대화식으로 실시간 수정이 가능합니다.

### 핵심 가치

- **시간 절약**: 보고서 작성 시간을 50% 이상 단축
- **품질 향상**: 전문적이고 체계적인 보고서 자동 생성
- **유연성**: 11가지 스타일 옵션으로 맞춤 설정
- **보안**: 모든 데이터가 로컬에만 저장 (외부 전송 없음)

---

## ✨ 주요 기능

### 🤖 듀얼 AI 보고서 생성
- Groq와 GPT-4o-mini 두 모델 동시 비교
- 탭 방식으로 결과를 나란히 확인
- 모델별 특성을 활용한 다양한 관점

### 💬 AI 챗봇 실시간 수정
- 보고서 생성 후 대화식으로 수정 요청
- "상담 과정을 더 상세하게" 등 자연어로 지시
- 수정된 부분은 녹색 하이라이트 표시
- 타이핑 애니메이션으로 생성 과정 확인

### ⚙️ 세밀한 커스터마이징
- **분량 조절**: 7단계 (50% ~ 250%)
- **보고서 구조**: 6가지 섹션 선택
- **작성 스타일**: 11가지 옵션
  - 전문성/가독성, 내담자 표현
  - 관점/초점, 기법 서술, 정서 표현
  - 상담자 반응, 구성 방식, 회기 계획
  - 보고서 독자, 이론적 관점
- **나만의 작성 규칙**: 최우선 적용되는 커스텀 프롬프트

### 💾 나의 설정 모음 (프리셋)
- 자주 쓰는 설정 조합을 저장
- 아이콘과 이름으로 쉽게 구분
- 클릭 한 번으로 설정 전환
- 프리셋 별로 독립적인 설정 관리

### 📁 히스토리 관리
- 최근 50개 보고서 자동 저장
- 제목 자동 생성 및 인라인 편집
- 검색 및 필터링 (날짜별, 키워드)
- 최신순/오래된순 정렬

### 🎨 사용자 경험
- 다크/라이트 모드 자동 전환
- 글씨 크기 조절 (12px ~ 20px)
- 키보드 단축키 지원
- 반응형 디자인 (PC 최적화)

### 🛡️ 데이터 관리
- **백업/복원**: JSON 파일로 데이터 관리
- **암호화 저장**: API 키 안전하게 보관
- **선택적 복원**: 전체/히스토리/API 키 개별 관리
- **초기화 옵션**: 필요한 데이터만 삭제

---

## 🚀 빠른 시작

### 1. 다운로드 및 실행

웹사이트 접속 : https://uu3nns-cpu.github.io/report.html

### 2. API 키 설정

**Groq API (무료)**
1. [console.groq.com](https://console.groq.com) 접속
2. Google/GitHub 계정으로 로그인
3. API Keys → Create API Key
4. 생성된 키 복사 (gsk_로 시작)

**GPT-4o-mini API (무료 $5)**
1. [openrouter.ai](https://openrouter.ai) 접속
2. Google 계정으로 로그인
3. Keys → Create Key
4. 생성된 키 복사 (sk-or-v1-로 시작)

### 3. 첫 보고서 작성

1. **메모 입력**: 상담 중 작성한 메모 입력
2. **보고서 작성**: 하단 "보고서 작성" 버튼 클릭
3. **결과 확인**: Groq와 GPT 결과를 비교 탭에서 확인
4. **수정**: 필요시 AI 챗봇으로 실시간 수정

---

## 📁 프로젝트 구조

```
RE/
├── index.html                 # 대시보드 (메인 페이지)
├── report.html                # 보고서 작성 페이지
├── settings.html              # 설정 페이지
├── notice.html                # 공지사항
├── changelog.html             # 업데이트 내역
├── donate.html                # 후원하기
├── data-management.html       # 데이터 관리
├── report-management.html     # 보고서 관리
├── privacy.html               # 개인정보처리방침
├── sitemap.html               # 사이트맵
├── guide.html                 # 리다이렉트 (guide/로 이동)
│
├── src/
│   └── css/
│       ├── base/             # 기본 스타일
│       │   ├── variables.css       # CSS 변수 (색상, 간격)
│       │   ├── base.css            # 기본 스타일
│       │   ├── layout.css          # 레이아웃 시스템
│       │   └── browser-compatibility.css  # 브라우저 호환성
│       ├── components/       # 공통 컴포넌트
│       │   ├── components-base.css
│       │   ├── components-layout.css
│       │   ├── header-unified.css
│       │   ├── buttons-unified.css
│       │   ├── cards-unified.css
│       │   ├── glass-effects.css
│       │   ├── glass-theme-fix.css
│       │   ├── chatbot.css
│       │   ├── cookie-consent.css
│       │   ├── toast.css
│       │   ├── markdown-and-usage.css
│       │   └── common-page-layout.css
│       └── pages/            # 페이지별 스타일
│           ├── home-improved.css
│           ├── settings.css
│           ├── settings-refactored.css
│           ├── report-unified.css
│           ├── report-unified-override.css
│           ├── report-theme.css
│           ├── report-management.css
│           ├── report-management-glass-override.css
│           ├── data-management.css
│           ├── donate-refactored.css
│           ├── changelog.css
│           └── document-pages.css
│
├── js/
│   ├── config/               # 설정 파일
│   │   ├── app-constants.js        # 앱 상수
│   │   └── model-configs.js        # 모델 설정
│   ├── modules/              # 모듈
│   │   ├── settings-storage.js     # 설정 저장/로드
│   │   └── ui-controls.js          # UI 컨트롤
│   ├── features/             # 기능별 모듈
│   │   └── report-management.js    # 보고서 관리
│   ├── browser-polyfills.js   # 브라우저 호환성
│   ├── error-handler.js       # 에러 처리
│   ├── common-components.js   # 공통 컴포넌트 (헤더, 푸터)
│   ├── security.js            # API 키 암호화/복호화
│   ├── app.js                 # 메인 로직 (보고서 생성)
│   ├── autosave.js            # 자동저장, 히스토리
│   ├── preset-manager.js      # 프리셋 관리
│   ├── ui-enhancements.js     # UI 개선
│   ├── settings-preview.js    # 설정 미리보기
│   ├── report-adapter.js      # 보고서 어댑터
│   ├── report-data-manager.js # 보고서 데이터 관리
│   ├── report-ui.js           # 보고서 UI
│   ├── resize-handler.js      # 리사이즈 핸들러
│   ├── chatbot.js             # AI 챗봇
│   ├── markdown-renderer.js   # 마크다운 렌더러
│   ├── compare-tab-fix.js     # 비교 탭 수정
│   ├── input-validation.js    # 입력 검증
│   ├── usage-core.js          # 사용량 관리 (핵심)
│   ├── usage-bridge.js        # 사용량 브리지
│   ├── ui-utils.js            # UI 유틸리티
│   ├── data-management.js     # 데이터 관리
│   └── cookie-consent.js      # 쿠키 동의
│
├── guide/                    # 사용 안내서
│   ├── css/
│   │   └── guide-common.css
│   ├── screenshot/
│   │   └── README.md
│   ├── index.html            # 가이드 메인
│   ├── 01-start.html         # 시작하기
│   ├── 02-basic.html         # 기본 사용법
│   ├── 03-advanced.html      # 고급 기능
│   ├── 04-security.html      # 보안 가이드
│   └── 05-troubleshoot.html  # 문제 해결
│
├── guidevideo/               # 가이드 영상
│   ├── CaseFormulation.mp4
│   ├── GPTAPI2.mp4
│   ├── GroqAPI1.mp4
│   └── ReportPage.mp4
│
├── image/                    # 이미지 리소스
│   └── DESIGN_GUIDE/
│       └── 1763178269151.png
│
├── docs/                     # 개발 문서
│   ├── guides/
│   │   ├── Google_Services_Integration_Standard.md
│   │   └── Google_Services_Integration_Report.md
│   ├── plans/
│   │   ├── active/          # 진행 중인 계획
│   │   └── completed/       # 완료된 계획
│   └── refactoring/         # 리팩토링 문서
│
├── archive/                  # 보관 파일
│
├── README.md                 # 이 파일
├── DESIGN_GUIDE.md          # 디자인 가이드
└── LICENSE                   # 라이선스
```

---

## 🔧 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: CSS 변수, Flexbox, Grid
- **JavaScript (ES6)**: 모듈 없이 순수 JS

### AI 모델
- **Groq**: llama-3.3-70b-versatile
- **GPT-4o-mini**: OpenRouter API

### 저장소
- **LocalStorage**: 모든 데이터 로컬 저장
- **암호화**: API 키 Base64 인코딩

### 추적 및 분석
- **Google Analytics**: gtag.js (측정 ID: G-RWS3BEEQ84)
- **Google AdSense**: 게시자 ID: ca-pub-9257454501555292
- **Google Search Console**: Analytics를 통한 자동 인증

---

## ⚙️ 설정 가이드

### 분량/상세도 설정

| 단계 | 비율 | 설명 |
|------|------|------|
| 최소 | 50% | 핵심만 간결하게 |
| 간결 | 80% | 주요 내용 위주 |
| 약간 간결 | 110% | 표준보다 약간 짧게 |
| **표준** | **140%** | **기본 분량 (권장)** |
| 약간 상세 | 170% | 표준보다 상세하게 |
| 상세 | 210% | 구체적이고 상세하게 |
| 최대 | 250% | 최대한 상세하고 풍부하게 |

### 보고서 구조 설정

- [x] 상담 일시 / 회기
- [x] 주 호소 문제
- [x] 상담 목표
- [x] 상담 과정 / 내용
- [x] 사용한 기법
- [x] 다음 회기 계획

### 보고서 기술 설정

**전문성 / 가독성**
- 전문적: 심리학 용어 활용
- 기본: 균형 잡힌 표현
- 평이함: 쉬운 언어로 설명

**내담자 표현**
- 직접인용: "내담자는 '힘들다'고 표현함"
- 기본: 균형 잡힌 서술
- 관찰위주: "내담자는 힘든 모습을 보임"

**관점 / 초점**
- 강점중심: 긍정적 변화 강조
- 기본: 객관적 관찰
- 문제중심: 어려움 중심 서술

*(나머지 8가지 옵션 생략)*

---

## 📖 사용 방법

### 기본 워크플로우

```
1. 메모 입력
   ↓
2. 설정 확인 (선택)
   ↓
3. 보고서 작성 클릭
   ↓
4. 결과 비교
   ↓
5. AI 챗봇으로 수정 (선택)
   ↓
6. 복사 또는 내보내기
```

### 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl + Enter` | 보고서 작성 |
| `Ctrl + 1` | Groq 결과 복사 |
| `Ctrl + 2` | GPT 결과 복사 |
| `Ctrl + S` | 현재 작업 저장 |
| `Ctrl + /` | 단축키 도움말 |
| `Escape` | 모달 닫기 |

### AI 챗봇 사용 예시

**상세도 조절**
```
"상담 과정을 더 상세하게 작성해줘"
"개입 및 기법 섹션을 간결하게 요약해줘"
```

**내용 추가**
```
"내담자가 눈물을 흘렸던 부분을 추가해줘"
"공감적 경청 기법 사용 내용을 추가해줘"
```

**톤 변경**
```
"더 전문적인 어조로 수정해줘"
"학부모가 읽기 쉽게 다시 작성해줘"
```

---

## 👨‍💻 개발자 가이드

### ⚠️ 중요: Google 서비스 표준 코드

모든 HTML 페이지를 생성하거나 수정할 때는 **반드시 Google Analytics와 AdSense 코드를 포함**해야 합니다.

#### Google Analytics (gtag.js) - 필수
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RWS3BEEQ84"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-RWS3BEEQ84');
</script>
```

#### Google AdSense - 필수
```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9257454501555292"
     crossorigin="anonymous"></script>
```

#### Google Search Console 연동
별도의 메타 태그 불필요. Google Analytics를 통한 자동 인증 방식 사용.

**적용 규칙:**
- ✅ `<head>` 태그 내부, 다른 스크립트보다 먼저 배치
- ✅ Analytics → AdSense 순서로 배치
- ✅ 모든 HTML 페이지에 동일한 코드 사용
- ⚠️ 이 코드가 없으면 추적 및 광고가 작동하지 않음

자세한 내용은 [Google Services Integration Standard](docs/guides/Google_Services_Integration_Standard.md) 문서를 참고하세요.

---

### 로컬 개발 환경

```bash
# 실행
index.html을 더블클릭

# 또는 로컬 서버 (선택)
python -m http.server 8000
# http://localhost:8000
```

### 주요 함수 위치

**app.js**
```javascript
buildPrompt()              // 프롬프트 생성
generateWithGroq()         // Groq API 호출
generateWithGPT()          // GPT API 호출
loadSettings()             // 설정 불러오기
saveSettingsToStorage()    // 설정 저장
```

**autosave.js**
```javascript
saveToHistory()            // 히스토리 저장
loadHistory()              // 히스토리 불러오기
autoSave()                 // 자동 저장
```

**preset-manager.js**
```javascript
saveCurrentAsPreset()      // 프리셋 저장
loadPreset()               // 프리셋 불러오기
deletePreset()             // 프리셋 삭제
```

**chatbot.js**
```javascript
sendChatMessage()          // 챗봇 메시지 전송
updateReportWithChat()     // 보고서 업데이트
highlightChanges()         // 변경 사항 하이라이트
```

### CSS 변수 커스터마이징

```css
/* src/css/base/variables.css */
:root {
  /* 색상 */
  --accent-primary: #9b8bff;
  --success: #3dd598;
  --error: #ff6b81;
  
  /* 간격 */
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  
  /* 글씨 크기 */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

### 프롬프트 수정

```javascript
// app.js 내 STYLE_DESCRIPTIONS 객체
const STYLE_DESCRIPTIONS = {
  terminology: {
    '전문적': '전문 용어를 적극 활용하여...',
    '평이함': '쉬운 언어로 설명하여...'
  }
  // ... 추가
};
```

### 디버깅

```javascript
// 브라우저 콘솔에서
localStorage.clear()        // 모든 데이터 삭제
console.log(loadSettings()) // 현재 설정 확인
```

---

## 📋 FAQ

**Q. 데이터가 사라졌어요**
> 브라우저 캐시 삭제 시 LocalStorage도 삭제됩니다. 정기적으로 데이터 관리 페이지에서 백업하세요.

**Q. API 키가 안전한가요?**
> Base64로 인코딩되어 저장되지만, 완벽한 보안은 아닙니다. 개인 계정의 API 키만 사용하세요.

**Q. 모바일에서도 사용 가능한가요?**
> PC 환경에 최적화되어 있습니다. 모바일은 기본 기능만 사용 가능합니다.

**Q. 인터넷 연결이 필요한가요?**
> 보고서 생성 시에만 필요합니다. 설정 및 히스토리 관리는 오프라인에서도 가능합니다.

**Q. 사용량 제한이 있나요?**
> 무료 API 사용량 보호를 위해 일일 30회 생성 제한이 있습니다. 자정에 초기화됩니다.

**Q. 여러 기기에서 사용하고 싶어요**
> 데이터 관리 페이지에서 백업 파일을 생성하고, 다른 기기에서 복원하세요.

---

## 🔮 향후 계획

### v1.0 목표
- [ ] PDF 직접 내보내기
- [ ] 보고서 템플릿 시스템
- [ ] 추가 AI 모델 지원 (Claude, Gemini)
- [ ] 협업 기능 (팀 프리셋 공유)
- [ ] 모바일 앱 버전

### 개선 예정
- [ ] 다국어 지원 (영어)
- [ ] 음성 입력 지원
- [ ] 자동 완성 기능
- [ ] 통계 대시보드

---

## 📄 라이선스

**Copyright (c) 2025 김도현. All Rights Reserved.**

본 소프트웨어 및 관련 문서 파일(이하 "소프트웨어")에 대한 모든 권리는 저작권자에게 있습니다.

**금지 사항:**
- 저작권자의 명시적 서면 허가 없이 소프트웨어의 사용, 복사, 수정, 병합, 출판, 배포, 재라이선스, 판매를 금지합니다.
- 소프트웨어의 전체 또는 일부를 상업적 목적으로 사용할 수 없습니다.
- 소프트웨어를 기반으로 한 2차 저작물 제작을 금지합니다.

**허용 사항:**
- 개인적인 학습 및 연구 목적으로만 소스 코드를 열람할 수 있습니다.
- 사용 허가를 원하시는 경우 아래 연락처로 문의해주시기 바랍니다.

---

## 📞 문의

- **개발자**: 김도현
- **이메일**: o7some@naver.com
- **버전**: 0.9.1
- **최종 업데이트**: 2025-11-17

---

**Made with ❤️ for Counselors**
