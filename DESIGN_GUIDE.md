# RE: Design Guide

> RE 프로젝트의 디자인 시스템 및 스타일 가이드

**버전**: 1.0  
**최종 업데이트**: 2025-11-17

---

## 📋 목차

1. [디자인 철학](#디자인-철학)
2. [색상 시스템](#색상-시스템)
3. [타이포그래피](#타이포그래피)
4. [간격 및 레이아웃](#간격-및-레이아웃)
5. [컴포넌트](#컴포넌트)
6. [Glass Morphism](#glass-morphism)
7. [반응형 디자인](#반응형-디자인)
8. [애니메이션](#애니메이션)

---

## 디자인 철학

### 핵심 원칙

1. **전문성과 접근성의 균형**
   - 상담사를 위한 전문 도구지만, 누구나 쉽게 사용할 수 있어야 함
   - 복잡한 기능을 직관적인 UI로 제공

2. **정보 계층의 명확성**
   - 중요한 정보가 시각적으로 돋보이도록 설계
   - 읽기 편한 타이포그래피와 적절한 여백

3. **일관성**
   - 모든 페이지에서 동일한 디자인 언어 사용
   - 예측 가능한 사용자 경험

4. **현대적 미학**
   - Glass Morphism을 활용한 세련된 UI
   - 부드러운 애니메이션과 전환 효과

---

## 색상 시스템

### Design Tokens (CSS Variables)

모든 색상은 `src/css/base/variables.css`에 CSS 변수로 정의되어 있습니다.

### 다크 모드 (기본)

#### Surface Colors
```css
--surface-1: #191919;          /* 배경 레이어 1 (최하단) */
--surface-2: #2F3437;          /* 배경 레이어 2 */
--surface-3: #3F4447;          /* 배경 레이어 3 */
--surface-glass: rgba(47, 52, 55, 0.6);  /* Glass 효과 */
--surface-border: rgba(255, 255, 255, 0.055);  /* 테두리 */
```

#### Text Colors
```css
--text-primary: rgba(255, 255, 255, 0.92);    /* 주요 텍스트 */
--text-secondary: #9B9A97;                     /* 보조 텍스트 */
--text-tertiary: #787774;                      /* 비활성/힌트 */
```

#### Accent Colors
```css
--accent-primary: #9b8bff;        /* 주요 액션 (보라) */
--accent-primary-rgb: 155, 139, 255;
--accent-hover: #7f6df0;          /* 호버 상태 */
--accent-secondary: #4bd6e5;      /* 보조 액센트 (청록) */
```

#### Semantic Colors
```css
--success: #3dd598;               /* 성공 (초록) */
--success-hover: #26b67f;
--error: #ff6b81;                 /* 오류 (빨강) */
--error-bg: rgba(255, 107, 129, 0.12);
--info-bg: rgba(75, 214, 229, 0.15);
--info-text: #8ae3ff;
--warning: #ffb347;               /* 경고 (주황) */
--warning-bg: rgba(255, 179, 71, 0.15);
```

### 라이트 모드

#### Surface Colors
```css
--surface-1: #fafafa;
--surface-2: #ffffff;
--surface-3: #f5f5f5;
--surface-glass: rgba(255, 255, 255, 0.95);
--surface-border: rgba(0, 0, 0, 0.08);
```

#### Text Colors
```css
--text-primary: #1d2433;
--text-secondary: #495269;
--text-tertiary: #6b738a;
```

#### Accent Colors
```css
--accent-primary: #5d5fea;
--accent-hover: #4f46e5;
--accent-secondary: #1ab6d6;
```

### 사용 예시

```css
/* 버튼 */
.btn--primary {
  background: var(--accent-primary);
  color: var(--text-primary);
}

/* 카드 */
.card {
  background: var(--surface-glass);
  border: 1px solid var(--surface-border);
}

/* 텍스트 */
.title {
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
}
```

---

## 타이포그래피

### 폰트 패밀리

```css
--font-family-base: 'Pretendard Variable', 'Inter', 'Noto Sans KR', 
                    'Segoe UI', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

- **본문**: Pretendard Variable (한글 최적화)
- **코드**: JetBrains Mono (가독성 우수)

### 폰트 크기

```css
--font-size-base: 16px;              /* 기본 (1rem) */
```

**동적 크기 조절**: 사용자가 설정에서 12px ~ 20px 사이로 조절 가능

### 폰트 굵기

```css
--font-weight-regular: 500;          /* 일반 텍스트 */
--font-weight-semibold: 600;         /* 강조 */
--font-weight-bold: 700;             /* 제목 */
```

### 행 간격

```css
--line-height-base: 1.65;            /* 본문 (가독성 최적화) */
```

### 텍스트 스타일 예시

```css
/* 페이지 제목 (h1) */
.page-title {
  font-size: 2rem;                   /* 32px */
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--text-primary);
}

/* 섹션 제목 (h2) */
.section-title {
  font-size: 1.5rem;                 /* 24px */
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
  color: var(--text-primary);
}

/* 카드 제목 (h3) */
.card-title {
  font-size: 1.125rem;               /* 18px */
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* 본문 */
.body-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-base);
  color: var(--text-secondary);
}

/* 캡션/라벨 */
.caption {
  font-size: 0.875rem;               /* 14px */
  color: var(--text-tertiary);
}
```

---

## 간격 및 레이아웃

### Spacing Scale

```css
--space-3xs: 4px;
--space-2xs: 6px;
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Container 너비

```css
--container-max: 1240px;             /* 표준 컨테이너 */
--container-wide: 1440px;            /* 넓은 컨테이너 */
--container-gutter: clamp(1.25rem, 3vw, 3.5rem);  /* 좌우 여백 (반응형) */
```

### 레이아웃 패턴

#### 페이지 컨테이너
```css
.page-container {
  width: min(var(--container-max), calc(100% - var(--container-gutter) * 2));
  margin: 0 auto;
  padding: var(--space-2xl) 0;
}
```

#### Grid 시스템
```css
/* 3칼럼 그리드 */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

/* 2칼럼 그리드 */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}
```

### 여백 사용 지침

- **최소 여백 (4-8px)**: 아이콘 간격, 인라인 요소
- **소형 여백 (12-16px)**: 폼 요소 간격, 카드 내부 패딩
- **중형 여백 (24-32px)**: 섹션 간격, 카드 외부 마진
- **대형 여백 (48-64px)**: 페이지 섹션, 히어로 영역

---

## 컴포넌트

### 버튼 (Button)

#### 기본 구조
```html
<button class="btn btn--primary">버튼 텍스트</button>
```

#### 버튼 종류

**Primary Button** (주요 액션)
```css
.btn--primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  color: white;
  padding: var(--button-padding-md);
  border-radius: var(--radius-btn);
  box-shadow: 0 4px 16px rgba(var(--accent-primary-rgb), 0.3);
}
```

**Secondary Button** (보조 액션)
```css
.btn--secondary {
  background: var(--surface-2);
  color: var(--text-primary);
  border: 1px solid var(--surface-border);
}
```

**Danger Button** (주의 필요)
```css
.btn--danger {
  background: var(--error);
  color: white;
}
```

**Success Button** (완료/확인)
```css
.btn--success {
  background: var(--success);
  color: white;
}
```

#### 버튼 크기
```css
--button-padding-sm: 8px 16px;       /* 작은 버튼 */
--button-padding-md: 12px 24px;      /* 중간 버튼 (기본) */
--button-padding-lg: 16px 32px;      /* 큰 버튼 */
```

```html
<button class="btn btn--primary btn--small">작은 버튼</button>
<button class="btn btn--primary btn--large">큰 버튼</button>
```

#### 호버 효과
```css
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--accent-primary-rgb), 0.4);
}
```

### 카드 (Card)

#### 기본 구조
```html
<div class="card glass-card">
  <h3 class="card-title">제목</h3>
  <p class="card-description">설명</p>
</div>
```

#### 스타일
```css
.card {
  padding: var(--card-padding);
  border-radius: var(--radius-md);
  background: var(--surface-glass);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-card);
  transition: var(--transition-smooth);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--accent-primary-rgb), 0.4);
}
```

### 입력 필드 (Input)

#### 기본 입력
```html
<input type="text" class="input" placeholder="텍스트 입력">
```

```css
.input {
  padding: 12px 16px;
  background: var(--surface-2);
  border: 2px solid var(--surface-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(var(--accent-primary-rgb), 0.1);
}
```

#### 텍스트 영역
```html
<textarea class="input input--textarea" rows="4"></textarea>
```

```css
.input--textarea {
  resize: vertical;
  min-height: 100px;
}
```

#### 선택 상자 (Select)
```html
<select class="input input--select">
  <option value="">선택하세요</option>
  <option value="1">옵션 1</option>
</select>
```

### 토스트 알림 (Toast)

```html
<div class="toast">메시지</div>
```

```css
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: var(--surface-2);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  z-index: var(--z-toast);
  animation: slideUp 0.3s ease;
}
```

### 토글 스위치 (Toggle)

```html
<label class="toggle-item">
  <span>토글 라벨</span>
  <input type="checkbox">
  <span class="toggle-ui"></span>
</label>
```

```css
.toggle-ui {
  width: 44px;
  height: 24px;
  background: var(--surface-3);
  border-radius: 12px;
  position: relative;
  transition: var(--transition-base);
}

.toggle-ui::after {
  content: '';
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: var(--transition-base);
}

input:checked + .toggle-ui {
  background: var(--accent-primary);
}

input:checked + .toggle-ui::after {
  left: 23px;
}
```

---

## Glass Morphism

### 개념

Glass Morphism은 반투명 배경에 블러 효과를 적용하여 유리 같은 질감을 만드는 디자인 기법입니다.

### 구현

```css
.glass-card {
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--surface-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 
              inset 0 1px 0 rgba(255, 255, 255, 0.02);
}
```

### 사용 위치

- 카드 컴포넌트
- 모달 다이얼로그
- 드롭다운 메뉴
- 사이드바/패널

### 주의사항

1. **성능**: `backdrop-filter`는 GPU를 사용하므로 과도하게 사용하지 않음
2. **브라우저 지원**: `-webkit-` 접두사 필수 (Safari 지원)
3. **배경색**: 반투명해야 Glass 효과가 나타남

---

## 반응형 디자인

### Breakpoints

```css
--breakpoint-sm: 640px;     /* 모바일 */
--breakpoint-md: 768px;     /* 태블릿 */
--breakpoint-lg: 1024px;    /* 노트북 */
--breakpoint-xl: 1280px;    /* 데스크톱 */
```

### 미디어 쿼리 사용

```css
/* 모바일 우선 (기본) */
.container {
  padding: var(--space-md);
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: var(--space-lg);
  }
}

/* 데스크톱 이상 */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-xl);
  }
}
```

### 반응형 Grid

```css
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 반응형 타이포그래피

```css
/* Fluid Typography (clamp 사용) */
.title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.body {
  font-size: clamp(0.875rem, 2vw, 1rem);
}
```

---

## 애니메이션

### Transition

```css
--transition-base: 0.25s ease;
--transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 사용 예시

**기본 Transition**
```css
.button {
  transition: all var(--transition-base);
}

.button:hover {
  transform: translateY(-2px);
}
```

**부드러운 Transition**
```css
.modal {
  transition: all var(--transition-smooth);
}
```

**Bounce 효과**
```css
.notification {
  animation: bounce var(--transition-bounce);
}
```

### 애니메이션 예시

**Fade In**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
```

**Slide Up**
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.4s ease;
}
```

**Typing 효과**
```css
@keyframes typing {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}

.typing-indicator {
  animation: typing 1.5s ease infinite;
}
```

---

## Border Radius

```css
--radius-sm: 8px;      /* 작은 요소 (버튼, 입력) */
--radius-md: 16px;     /* 중간 요소 (카드) */
--radius-lg: 24px;     /* 큰 요소 (모달) */
--radius-btn: 999px;   /* 둥근 버튼 (pill) */
```

---

## 그림자 (Shadow)

```css
--shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.3), 
               0 2px 6px rgba(0, 0, 0, 0.15);

--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3), 
               0 4px 8px rgba(0, 0, 0, 0.15);
```

### 사용 예시

```css
/* 부드러운 그림자 */
.element {
  box-shadow: var(--shadow-soft);
}

/* 카드 그림자 */
.card {
  box-shadow: var(--shadow-card);
}

/* 호버 시 강조 */
.card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

---

## Z-index Scale

```css
--z-base: 1;        /* 기본 레이어 */
--z-dropdown: 10;   /* 드롭다운 */
--z-sticky: 20;     /* 고정 요소 (헤더) */
--z-overlay: 30;    /* 오버레이 */
--z-modal: 40;      /* 모달 */
--z-toast: 50;      /* 토스트 알림 */
```

---

## 접근성 (Accessibility)

### 키보드 포커스

```css
.input:focus,
.button:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### 고대비 모드 지원

```css
@media (prefers-contrast: high) {
  .card {
    border: 2px solid var(--text-primary);
  }
}
```

### 동작 감소 설정

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 파일 구조

### CSS 파일 조직

```
src/css/
├── base/
│   ├── variables.css          # 모든 CSS 변수 정의
│   ├── base.css               # 리셋, 기본 스타일
│   ├── layout.css             # 레이아웃 시스템
│   └── browser-compatibility.css  # 브라우저 호환성
│
├── components/
│   ├── components-base.css    # 공통 컴포넌트
│   ├── buttons-unified.css    # 버튼 스타일
│   ├── cards-unified.css      # 카드 스타일
│   ├── header-unified.css     # 헤더 스타일
│   ├── glass-effects.css      # Glass Morphism
│   ├── toast.css              # 토스트 알림
│   └── ...
│
└── pages/
    ├── home-improved.css      # 홈 페이지
    ├── report-unified.css     # 보고서 페이지
    ├── settings-refactored.css # 설정 페이지
    └── ...
```

### 로드 순서

1. **variables.css** (최우선)
2. **base.css**
3. **layout.css**
4. **components-base.css**
5. **페이지별 CSS**

---

## 베스트 프랙티스

### CSS 변수 사용

```css
/* ❌ 나쁜 예 */
.button {
  background: #667eea;
  padding: 12px 24px;
}

/* ✅ 좋은 예 */
.button {
  background: var(--accent-primary);
  padding: var(--button-padding-md);
}
```

### 클래스 네이밍

BEM (Block Element Modifier) 스타일을 느슨하게 적용:

```css
/* Block */
.card { }

/* Element */
.card-title { }
.card-description { }

/* Modifier */
.card--featured { }
.card--large { }
```

### 반응형 유틸리티

```css
/* 모바일에서만 숨김 */
.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: block;
  }
}

/* 데스크톱에서만 숨김 */
@media (max-width: 767px) {
  .hide-desktop {
    display: none;
  }
}
```

---

## 트러블슈팅

### Glass 효과가 작동하지 않음

**원인**: `backdrop-filter` 브라우저 지원 문제

**해결**:
```css
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px); /* Safari 지원 */
}
```

### CSS 변수가 적용되지 않음

**원인**: 변수 로드 순서 문제

**해결**: `variables.css`를 가장 먼저 로드

```html
<link rel="stylesheet" href="src/css/base/variables.css">
<link rel="stylesheet" href="src/css/base/base.css">
```

### 모바일에서 레이아웃 깨짐

**원인**: 고정 너비 사용

**해결**: `min()` 함수로 반응형 너비 설정

```css
/* ❌ 나쁜 예 */
.container {
  width: 1200px;
}

/* ✅ 좋은 예 */
.container {
  width: min(1200px, 100% - 2rem);
}
```

---

## 참고 자료

- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Glass Morphism Generator](https://hype4.academy/tools/glassmorphism-generator)
- [clamp() Calculator](https://clamp.font-size.app/)

---

## 버전 이력

### v1.0 (2025-11-17)
- 초기 디자인 가이드 작성
- 색상 시스템, 타이포그래피, 컴포넌트 문서화
- Glass Morphism 가이드 추가

---

**작성자**: RE 프로젝트 팀  
**최종 업데이트**: 2025-11-17
