# RE 가이드 스크린샷

## 📸 스크린샷 목록

모든 스크린샷 파일은 `guide/screenshot/` 폴더에 위치합니다.
**현재 모든 스크린샷은 SVG 형식의 디자인 목업으로 제작되어 있습니다.**

---

## ✅ 완성된 스크린샷 (SVG)

### 1. 시작하기 (01-start.html)

#### 01-folder-structure.svg ✓
- RE 폴더 구조와 index.html 파일 위치
- 800x400px

#### 01-dashboard-main.svg ✓
- RE 대시보드 전체 화면
- 최근 작성 히스토리, 빠른 링크, 상단 메뉴
- 1200x800px

---

### 2. 기본 사용법 (02-basic.html)

#### 02-groq-login.svg ✓
- Groq Console API Keys 페이지
- API 키 목록 및 생성 버튼
- 1200x800px

#### 02-settings-api.svg ✓
- RE 설정 페이지 - API 키 입력 화면
- Groq/GPT API 키 입력란
- 1200x900px

#### 02-report-page.svg ✓
- 보고서 작성 페이지 레이아웃
- 좌측 입력 영역, 우측 출력 영역
- 1400x900px

#### 02-report-result.svg ✓
- 생성된 보고서 예시
- 섹션별 구조 표시
- 1200x800px

---

### 3. 고급 기능 (03-advanced.html)

#### 03-chatbot-interface.svg ✓
- AI 챗봇 인터페이스
- 대화 메시지 표시
- 800x600px

---

## 🎨 SVG 디자인 특징

### 통일된 디자인 시스템
- **다크 테마**: #1a1b26 (배경), #24283b (카드)
- **컬러 팔레트**: 
  - 파란색: #7aa2f7
  - 초록색: #9ece6a
  - 빨간색: #f7768e
  - 보라색: #667eea
  - 회색: #565f89
- **둥근 모서리**: rx="8" 또는 rx="12"
- **일관된 폰트**: Malgun Gothic, Arial

### 장점
- ✅ 벡터 그래픽으로 확대해도 깨지지 않음
- ✅ 파일 크기가 매우 작음 (10-30KB)
- ✅ 다크모드 완벽 지원
- ✅ 텍스트 수정 및 번역 용이
- ✅ 브라우저에서 바로 렌더링

---

## 🔄 실제 스크린샷으로 교체 (선택사항)

SVG 디자인 목업이 충분하지 않다면 실제 스크린샷으로 교체 가능:

### 교체 방법
1. 실제 RE 앱에서 해당 화면 캡처
2. PNG 또는 JPG로 저장
3. 파일명을 동일하게 유지 (예: `01-dashboard-main.png`)
4. HTML 파일에서 확장자만 수정

### 캡처 가이드라인
- **해상도**: 최소 1920x1080
- **모드**: 다크모드
- **비율**: 16:9 또는 4:3
- **개인정보**: 테스트 데이터 사용

---

## 📝 파일 목록

```
guide/screenshot/
├── 01-folder-structure.svg      ✓ 완성
├── 01-dashboard-main.svg        ✓ 완성
├── 02-groq-login.svg            ✓ 완성
├── 02-settings-api.svg          ✓ 완성
├── 02-report-page.svg           ✓ 완성
├── 02-report-result.svg         ✓ 완성
├── 03-chatbot-interface.svg     ✓ 완성
└── README.md                    ✓ 이 파일
```

---

## 🎯 사용 현황

모든 가이드 페이지에서 SVG 스크린샷을 정상적으로 사용 중입니다.

- **01-start.html**: folder-structure, dashboard-main
- **02-basic.html**: groq-login, settings-api, report-page, report-result
- **03-advanced.html**: chatbot-interface
- **04-security.html**: (스크린샷 불필요)
- **05-troubleshoot.html**: (스크린샷 불필요)

---

## 📦 리소스

- 모든 SVG는 수동으로 제작됨
- 다크 테마 컬러는 Tokyo Night 테마 기반
- 아이콘은 이모지 사용 (크로스 플랫폼 호환성)
