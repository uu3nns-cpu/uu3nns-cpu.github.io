# 🗂️ RE 프로젝트 파일 정리 계획

**분석 일시**: 2025년 11월 11일  
**총 파일 수**: HTML 14개, CSS 15개, JS 30개, MD 7개  
**목적**: 사용되지 않는 파일 식별 및 정리 계획 수립

---

## 📋 목차
1. [HTML 파일 분석](#html-파일-분석)
2. [CSS 파일 분석](#css-파일-분석)
3. [JavaScript 파일 분석](#javascript-파일-분석)
4. [문서 파일 분석](#문서-파일-분석)
5. [정리 권장 사항](#정리-권장-사항)
6. [백업 권장 사항](#백업-권장-사항)

---

## HTML 파일 분석

### ✅ 활성 사용 중 (13개)
| 파일명 | 상태 | 참조 CSS | 참조 JS | 비고 |
|--------|------|----------|---------|------|
| `index.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify | browser-polyfills, error-handler, cookie-consent, common-components, autosave, app | 메인 대시보드 |
| `report.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify, chatbot, markdown-and-usage, buttons-unified, report-unified | browser-polyfills, usage-core, common-components, security, preset-manager, report-data-manager, ui-utils, app, autosave, ui-enhancements, settings-preview, report-adapter, resize-handler, chatbot, report-ui, markdown-renderer, compare-tab-fix, input-validation, usage-bridge | 보고서 작성 페이지 |
| `settings.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify, settings, settings-3column | browser-polyfills, common-components, security, preset-manager, app | 설정 페이지 |
| `report-management.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify, report-management | browser-polyfills, usage-core, common-components, report-data-manager, ui-utils, autosave, app, report-management-part1~3 | 보고서 관리 |
| `data-management.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify | browser-polyfills, common-components, security, app, data-management | 데이터 관리 |
| `changelog.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify | browser-polyfills, common-components | 업데이트 내역 |
| `donate.html` | 🟢 활성 | variables, base, layout, components-*, header-button-unify | common-components | 후원 페이지 |
| `notice.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify | browser-polyfills, common-components | 공지사항 |
| `privacy.html` | 🟢 활성 | variables, base, layout, components-*, browser-compatibility, header-button-unify | browser-polyfills, common-components | 개인정보 보호정책 |
| `guide.html` | 🟢 활성 (리다이렉트) | - | - | guide/index.html로 자동 리다이렉트 |
| `guide/index.html` | 🟢 활성 | guide-common | - | 가이드 메인 |
| `guide/01-start.html` | 🟢 활성 | guide-common | - | 빠른 시작 가이드 |
| `guide/02-basic.html` | 🟢 활성 | guide-common | - | 기본 사용법 |
| `guide/03-advanced.html` | 🟢 활성 | guide-common | - | 고급 기능 |
| `guide/04-security.html` | 🟢 활성 | guide-common | - | 보안 가이드 |
| `guide/05-troubleshoot.html` | 🟢 활성 | guide-common | - | 문제 해결 |

### ❌ 미사용 의심 (0개)
현재 모든 HTML 파일이 활성 사용 중입니다.

---

## CSS 파일 분석

### ✅ 활성 사용 중 (15개)
| 파일명 | 사용처 | 우선순위 | 비고 |
|--------|--------|----------|------|
| `variables.css` | 모든 페이지 | 🔴 필수 | CSS 변수 정의 (색상, 간격 등) |
| `base.css` | 모든 페이지 | 🔴 필수 | 기본 스타일, 폰트, 리셋 |
| `layout.css` | 모든 페이지 | 🔴 필수 | 페이지 레이아웃 (header, container 등) |
| `components-base.css` | 모든 페이지 | 🔴 필수 | 기본 컴포넌트 (버튼, 입력, 카드) |
| `components-layout.css` | 모든 페이지 | 🔴 필수 | 레이아웃 컴포넌트 |
| `browser-compatibility.css` | 대부분 페이지 | 🟡 중요 | 구형 브라우저 호환성 |
| `header-button-unify.css` | 대부분 페이지 | 🟡 중요 | 헤더 버튼 통일 스타일 |
| `cookie-consent.css` | index.html | 🟢 선택 | 쿠키 동의 모달 |
| `chatbot.css` | report.html | 🟡 중요 | AI 챗봇 UI |
| `markdown-and-usage.css` | report.html | 🟡 중요 | 마크다운 렌더링 + 사용량 표시 |
| `buttons-unified.css` | report.html | 🟡 중요 | 통일된 버튼 스타일 |
| `report-unified.css` | report.html | 🟡 중요 | 보고서 페이지 전용 |
| `report-management.css` | report-management.html | 🟡 중요 | 보고서 관리 페이지 |
| `settings.css` | settings.html | 🟡 중요 | 설정 페이지 기본 |
| `settings-3column.css` | settings.html | 🟡 중요 | 설정 페이지 3단 레이아웃 |
| `guide-common.css` | guide/ | 🟡 중요 | 가이드 페이지 공통 스타일 |

### ❌ 미사용 의심 (0개)
현재 모든 CSS 파일이 활성 사용 중입니다.

---

## JavaScript 파일 분석

### ✅ 활성 사용 중 (27개)
| 파일명 | 사용처 | 우선순위 | 기능 |
|--------|--------|----------|------|
| `browser-polyfills.js` | 대부분 페이지 | 🔴 필수 | 구형 브라우저 지원 |
| `common-components.js` | 대부분 페이지 | 🔴 필수 | 공통 헤더 생성 |
| `app.js` | 대부분 페이지 | 🔴 필수 | 핵심 앱 로직, API 호출 |
| `security.js` | report, settings, data-management | 🔴 필수 | API 키 암호화/복호화 |
| `preset-manager.js` | report, settings | 🔴 필수 | 프리셋 관리 |
| `usage-core.js` | report, report-management | 🔴 필수 | 사용량 제한 핵심 로직 |
| `autosave.js` | index, report, report-management | 🟡 중요 | 자동 저장 기능 |
| `report-data-manager.js` | report, report-management | 🟡 중요 | 보고서 데이터 관리 |
| `ui-utils.js` | report, report-management | 🟡 중요 | UI 유틸리티 함수 |
| `ui-enhancements.js` | report | 🟡 중요 | UI 향상 기능 |
| `settings-preview.js` | report | 🟡 중요 | 사이드바 설정 프리뷰 |
| `report-adapter.js` | report | 🟡 중요 | 보고서 데이터 어댑터 |
| `resize-handler.js` | report | 🟡 중요 | 반응형 처리 |
| `chatbot.js` | report | 🟡 중요 | AI 챗봇 기능 |
| `report-ui.js` | report | 🟡 중요 | 보고서 UI 로직 |
| `markdown-renderer.js` | report | 🟡 중요 | 마크다운 렌더링 |
| `compare-tab-fix.js` | report | 🟢 선택 | 비교 탭 버그 수정 |
| `input-validation.js` | report | 🟡 중요 | 입력 검증 |
| `usage-bridge.js` | report | 🟡 중요 | 사용량 UI 연결 |
| `report-management-part1.js` | report-management | 🟡 중요 | 보고서 관리 Part 1 |
| `report-management-part2.js` | report-management | 🟡 중요 | 보고서 관리 Part 2 |
| `report-management-part3.js` | report-management | 🟡 중요 | 보고서 관리 Part 3 |
| `data-management.js` | data-management | 🟡 중요 | 데이터 백업/복원 |
| `error-handler.js` | index | 🟢 선택 | 에러 처리 |
| `cookie-consent.js` | index | 🟢 선택 | 쿠키 동의 |

### ⚠️ 미사용 의심 (3개)
| 파일명 | 상태 | 이유 | 조치 권장 |
|--------|------|------|----------|
| `autosave.js.backup` | 🟠 백업 | 파일명에 `.backup` 포함 | 삭제 또는 `/backup` 폴더로 이동 |
| `report-management-part4.js` | 🔴 미참조 | 어떤 HTML에서도 참조되지 않음 | 코드 검토 후 삭제 또는 병합 |
| `report-management-part5.js` | 🔴 미참조 | 어떤 HTML에서도 참조되지 않음 | 코드 검토 후 삭제 또는 병합 |
| `report-management.js` | 🟡 점검 필요 | report-management.html에서 part1-3만 참조 | 통합 파일인지 확인 필요 |

---

## 문서 파일 분석

### ✅ 활성 사용 중 (1개)
| 파일명 | 위치 | 용도 |
|--------|------|------|
| `README.md` | 루트 | 프로젝트 소개 |
| `guide/screenshot/README.md` | guide/screenshot/ | 스크린샷 설명 |

### 📚 문서 보관용 (6개)
| 파일명 | 위치 | 내용 | 보관 권장 |
|--------|------|------|----------|
| `ADSENSE_COMPLETE_REPORT.md` | docs/ | AdSense 완료 보고서 | ✅ 보관 (참고용) |
| `ADSENSE_GUIDE.md` | docs/ | AdSense 가이드 | ✅ 보관 (참고용) |
| `ADSENSE_LEGAL_REQUIREMENTS_COMPLETE.md` | docs/ | AdSense 법적 요구사항 | ✅ 보관 (참고용) |
| `AD_INSERTION_GUIDE.md` | docs/ | 광고 삽입 가이드 | ✅ 보관 (참고용) |
| `error-handling-and-documentation-guide.md` | docs/ | 에러 처리 가이드 | ✅ 보관 (참고용) |
| `report-management-plan.md` | docs/ | 보고서 관리 계획 | ✅ 보관 (참고용) |

---

## 정리 권장 사항

### 🗑️ 즉시 삭제 가능
```
js/autosave.js.backup          # 백업 파일 (이미 autosave.js가 활성)
```

### 🔍 검토 후 삭제/병합
```
js/report-management-part4.js  # 미참조 파일 - 코드 확인 후 결정
js/report-management-part5.js  # 미참조 파일 - 코드 확인 후 결정
js/report-management.js        # 통합 파일인지 확인 필요
```

### 📦 백업 폴더 생성 권장
다음 구조로 정리하면 좋습니다:
```
/backup
  ├── /deprecated-js
  │   ├── autosave.js.backup
  │   ├── report-management-part4.js (검토 후)
  │   └── report-management-part5.js (검토 후)
  └── /docs-archive
      └── (필요시 오래된 문서 이동)
```

---

## 백업 권장 사항

### 정리 전 백업 필수
```bash
# 1. 전체 프로젝트 백업
tar -czf RE_backup_20251111.tar.gz /path/to/RE/

# 2. 또는 Git 커밋
git add .
git commit -m "파일 정리 전 백업"
git tag backup-20251111
```

### 정리 순서
1. ✅ 백업 생성
2. ✅ `/backup` 폴더 생성
3. ✅ `autosave.js.backup` → `/backup/deprecated-js/`로 이동
4. 🔍 `report-management-part4.js` 내용 확인
5. 🔍 `report-management-part5.js` 내용 확인
6. 🔍 `report-management.js` 역할 확인
7. ✅ 미사용 확인 후 삭제 또는 백업 폴더로 이동
8. ✅ 정리 후 테스트 (모든 페이지 작동 확인)

---

## 파일 의존성 맵

### HTML → CSS 의존성
```
모든 페이지
  ├── variables.css (변수 정의)
  ├── base.css (기본 스타일)
  ├── layout.css (레이아웃)
  ├── components-base.css (기본 컴포넌트)
  ├── components-layout.css (레이아웃 컴포넌트)
  ├── browser-compatibility.css (브라우저 호환)
  └── header-button-unify.css (헤더 통일)

report.html 추가
  ├── chatbot.css
  ├── markdown-and-usage.css
  ├── buttons-unified.css
  └── report-unified.css

settings.html 추가
  ├── settings.css
  └── settings-3column.css

report-management.html 추가
  └── report-management.css

guide/ 페이지
  └── guide-common.css
```

### HTML → JS 의존성
```
핵심 공통 (대부분 페이지)
  ├── browser-polyfills.js
  ├── common-components.js
  └── app.js

보안 관련 (report, settings, data-management)
  └── security.js

보고서 관련 (report.html)
  ├── usage-core.js
  ├── preset-manager.js
  ├── report-data-manager.js
  ├── ui-utils.js
  ├── autosave.js
  ├── ui-enhancements.js
  ├── settings-preview.js
  ├── report-adapter.js
  ├── resize-handler.js
  ├── chatbot.js
  ├── report-ui.js
  ├── markdown-renderer.js
  ├── compare-tab-fix.js
  ├── input-validation.js
  └── usage-bridge.js

보고서 관리 (report-management.html)
  ├── usage-core.js
  ├── report-data-manager.js
  ├── ui-utils.js
  ├── autosave.js
  ├── report-management-part1.js
  ├── report-management-part2.js
  └── report-management-part3.js

데이터 관리 (data-management.html)
  └── data-management.js
```

---

## 결론

### ✅ 현재 상태
- **전체 파일**: 66개
- **활성 사용**: 63개 (95.5%)
- **미사용 의심**: 3개 (4.5%)
- **정리 필요**: 최소 1개, 검토 후 최대 4개

### 🎯 정리 목표
1. 백업 파일을 `/backup` 폴더로 정리
2. 미참조 파일 확인 및 정리
3. 프로젝트 구조 깔끔하게 유지

### 📌 주의사항
- **삭제 전 반드시 백업 생성**
- **미참조 파일도 코드 내부에서 동적 로딩될 수 있음**
- **정리 후 모든 페이지 기능 테스트 필수**

---

**작성자**: Claude (AI Assistant)  
**분석 기준**: 파일 간 참조 관계, HTML 내 링크 및 스크립트 태그  
**최종 검토**: 개발자 확인 필요
