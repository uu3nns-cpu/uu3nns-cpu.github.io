# Google AdSense 광고 삽입 완료 가이드

## 📊 삽입 현황

### ✅ 완료된 페이지
1. **index.html** - 메인 대시보드 하단
2. **notice.html** - 공지사항 하단
3. **changelog.html** - 업데이트 내역 하단
4. **guide/index.html** - 가이드 메인 페이지 하단
5. **guide/01-start.html** - 시작하기 가이드 하단

### 📋 대기 중인 페이지
- guide/02-basic.html
- guide/03-advanced.html
- guide/04-security.html
- guide/05-troubleshoot.html

## 🔧 삽입된 코드

### 1. HEAD 섹션 (자동 광고 스크립트)
모든 페이지의 `<head>` 내, Google Analytics 다음에 추가:

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9257454501555292"
     crossorigin="anonymous"></script>
```

### 2. 페이지 하단 (디스플레이 광고)
각 페이지의 주요 콘텐츠 하단, `</main>` 또는 `</div>` 직전에 추가:

```html
<!-- Google AdSense 디스플레이 광고 -->
<div style="text-align: center; margin: 40px auto; max-width: 728px;">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-9257454501555292"
         data-ad-slot="1234567890"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>
```

## ⚠️ 중요 안내

### 광고 슬롯 ID 교체 필요
현재 모든 광고는 **임시 슬롯 ID (`1234567890`)**를 사용하고 있습니다.

Google AdSense 계정에서 실제 광고 단위를 생성한 후:
1. 각 페이지별 광고 단위 생성
2. 생성된 `data-ad-slot` 값으로 교체

### 광고 슬롯 ID 교체 방법
```bash
# 모든 HTML 파일에서 일괄 교체 (예시)
data-ad-slot="1234567890"  →  data-ad-slot="실제_슬롯_ID"
```

## 📍 권장 광고 배치 위치

| 페이지 | 위치 | 광고 유형 |
|--------|------|-----------|
| index.html | 대시보드 하단 | 배너 광고 (970x90 또는 반응형) |
| notice.html | 공지 내용 하단 | 배너 광고 (728x90) |
| changelog.html | 업데이트 목록 하단 | 배너 광고 (728x90) |
| guide/*.html | 각 가이드 하단 | 배너 광고 (728x90) |

## 🔄 다음 단계

1. **Google AdSense 승인 대기**
   - 사이트를 AdSense에 제출
   - 승인 대기 (보통 1-2주 소요)

2. **광고 단위 생성**
   - 승인 후 AdSense 콘솔에서 광고 단위 생성
   - 각 페이지별로 적절한 크기의 광고 단위 생성

3. **슬롯 ID 업데이트**
   - 임시 ID를 실제 생성된 슬롯 ID로 교체
   - 테스트 및 확인

4. **성능 모니터링**
   - AdSense 보고서에서 광고 성능 확인
   - 필요시 광고 위치 및 크기 조정

## 💡 팁

- **자동 광고**: HEAD에 추가된 스크립트는 Google이 자동으로 최적 위치에 광고를 배치합니다
- **수동 광고**: 하단에 추가된 광고는 정확한 위치에 표시됩니다
- **반응형 광고**: `data-full-width-responsive="true"`로 모바일에서도 자동 조정됩니다

## 📞 문의
광고 관련 문제가 있으면 Google AdSense 고객센터를 통해 문의하세요.
