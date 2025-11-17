# Google 서비스 통합 표준 문서

## 📋 목차
1. [개요](#개요)
2. [표준 코드 스니펫](#표준-코드-스니펫)
3. [적용 위치](#적용-위치)
4. [적용 대상 파일](#적용-대상-파일)
5. [적용 순서](#적용-순서)
6. [검증 방법](#검증-방법)

---

## 개요

RE: 프로젝트의 모든 HTML 페이지에 Google Analytics, Search Console, AdSense를 표준화된 방식으로 적용합니다.

### 목적
- 모든 페이지에서 일관된 추적 및 분석
- Search Console을 통한 검색 최적화
- AdSense를 통한 수익화

### 원칙
- 모든 서비스는 `<head>` 태그 내부에 위치
- Analytics → AdSense 순서로 배치
- charset, viewport 다음에 위치

---

## 표준 코드 스니펫

### 1. Google Analytics (gtag.js)
**위치**: `<head>` 태그 내부 상단 (meta 태그 직후)

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

**측정 ID**: `G-RWS3BEEQ84`

---

### 2. Google Search Console
**위치**: gtag.js를 통한 자동 인증 (별도 메타 태그 불필요)

Google Analytics가 설치되어 있으면 Search Console에서 "Google Analytics" 인증 방식을 선택하여 자동 연동됩니다.

만약 메타 태그 방식을 원할 경우:
```html
<meta name="google-site-verification" content="발급받은_인증_코드" />
```

---

### 3. Google AdSense
**위치**: gtag.js 코드 바로 다음

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9257454501555292"
     crossorigin="anonymous"></script>
```

**게시자 ID**: `ca-pub-9257454501555292`

---

## 적용 위치

### 표준 `<head>` 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="copyright" content="Copyright (c) 2025 김해현. All Rights Reserved.">
    <meta name="author" content="김해현">
    <title>페이지 제목 - RE:</title>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RWS3BEEQ84"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RWS3BEEQ84');
    </script>
    
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9257454501555292"
         crossorigin="anonymous"></script>
    
    <!-- CSS 파일들 -->
    <link rel="stylesheet" href="...">
</head>
```

---

## 적용 대상 파일

### ✅ 루트 디렉토리 HTML 파일
- [ ] `index.html`
- [ ] `report.html`
- [ ] `settings.html`
- [ ] `notice.html`
- [ ] `privacy.html`
- [ ] `changelog.html`
- [ ] `donate.html`
- [ ] `sitemap.html`
- [ ] `data-management.html`
- [ ] `report-management.html`
- [ ] `guide.html` (있는 경우)

### ✅ guide 폴더 HTML 파일
- [ ] `guide/index.html`
- [ ] `guide/01-start.html`
- [ ] `guide/02-basic.html`
- [ ] `guide/03-advanced.html`
- [ ] `guide/04-security.html`
- [ ] `guide/05-troubleshoot.html`

---

## 적용 순서

### 1단계: 현재 상태 확인
```bash
# 각 파일에서 현재 Google 코드 존재 여부 확인
- Analytics: 대부분 설치됨
- AdSense: settings.html, report-management.html만 설치됨
- Search Console: 미설치 (gtag.js로 자동 연동)
```

### 2단계: AdSense 코드 추가
AdSense가 없는 모든 파일에 추가:
- 루트 디렉토리: 8개 파일
- guide 폴더: 6개 파일

### 3단계: 코드 순서 표준화
모든 파일에서 Google 서비스 코드 순서 통일:
1. Google Analytics (gtag.js)
2. Google AdSense

### 4단계: 검증
- [ ] 모든 파일에 gtag.js 존재 확인
- [ ] 모든 파일에 AdSense 존재 확인
- [ ] 코드 순서 및 형식 일치 확인

---

## 검증 방법

### 1. 파일별 검증
각 HTML 파일을 열어 `<head>` 태그 내부를 확인:
- ✅ gtag.js 스크립트가 있는가?
- ✅ AdSense 스크립트가 있는가?
- ✅ 순서가 올바른가? (gtag → AdSense)

### 2. 브라우저 개발자 도구 검증
페이지를 열고 F12 → Console:
```javascript
// Google Analytics 확인
console.log(typeof gtag); // "function"이어야 함

// AdSense 확인
console.log(document.querySelector('[src*="adsbygoogle"]')); // null이 아니어야 함
```

### 3. Google 서비스 대시보드 확인
- **Analytics**: 실시간 보고서에서 방문 확인
- **Search Console**: 속성 인증 완료 확인
- **AdSense**: 사이트 목록에 추가 확인

---

## 주의사항

### ⚠️ AdSense 정책
- 페이지당 광고 단위 제한 준수
- 콘텐츠 정책 위반 여부 확인
- 클릭 유도 금지

### ⚠️ Analytics 개인정보
- 개인정보처리방침에 Analytics 사용 명시
- IP 익명화 필요 시 설정 추가

### ⚠️ 성능 고려
- 모든 스크립트가 `async` 속성 사용
- 페이지 로딩 속도에 미치는 영향 최소화

---

## 트러블슈팅

### 문제: Analytics 데이터가 수집되지 않음
**해결**: 
- 측정 ID 확인 (`G-RWS3BEEQ84`)
- 브라우저 광고 차단기 비활성화
- 실시간 보고서에서 24시간 대기

### 문제: AdSense가 표시되지 않음
**해결**:
- 게시자 ID 확인 (`ca-pub-9257454501555292`)
- AdSense 계정 승인 상태 확인
- 광고 단위 생성 및 코드 추가 필요

### 문제: Search Console 인증 실패
**해결**:
- Analytics와 동일한 Google 계정 사용
- "Google Analytics" 인증 방식 선택
- gtag.js가 모든 페이지에 설치되어 있는지 확인

---

## 버전 이력

### v1.0 (2025-01-17)
- 초기 표준 문서 작성
- Analytics, AdSense 표준 코드 정의
- 적용 대상 파일 목록 작성

---

## 참고 자료

- [Google Analytics 설정 가이드](https://support.google.com/analytics/answer/9304153)
- [Google Search Console 도움말](https://support.google.com/webmasters/answer/9008080)
- [Google AdSense 시작 가이드](https://support.google.com/adsense/answer/6242051)

---

## 작성자
- 작성일: 2025-01-17
- 최종 수정: 2025-01-17
- 담당자: RE 프로젝트 개발팀
