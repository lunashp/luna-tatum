## Cloud Management Demo

간단한 Next.js + Tailwind + shadcn 스타일 UI로 구성된 클라우드 목록/생성/수정 데모입니다. `types.ts`의 타입을 기반으로 Mock 데이터를 생성하고, 500ms 지연이 있는 비동기 함수로 수정 다이얼로그 초기화를 시뮬레이션합니다.

### 실행

```bash
npm i
npm run dev
```

### 구조

- `types.ts`: 과제에서 제공한 타입과 상수(`AWSRegionList`, `CLOUD_GROUP_NAMES`) export
- `lib/mockApi.ts`: Mock 목록/상세, 500ms sleep
- `components/CloudDialog.tsx`: 생성/수정 공용 다이얼로그
- `app/page.tsx`: 테이블 + 생성 버튼 + Row별 수정 버튼
- `components/ui.tsx`: 최소한의 shadcn 유틸(버튼/다이얼로그 등)

### UX 제약

- 프로바이더는 AWS만 활성화, 나머지는 disabled
- `regionList`는 반드시 `global` 포함. Multi-select로 구성
- `cloudGroupName` 또한 Multi-select
- 확인 클릭 시 전송 페이로드를 콘솔 출력 후 닫힘

---

## 실무 관점: 다수 API 관리를 위한 접근 (React Query)

테이텀 시큐리티처럼 400+ API를 다루는 경우 다음 단계를 권장합니다.

1. API 문서 확인 → 2) API 타입 작성 → 3) 공용 클라이언트/훅 구성

### 1) API 문서 확인

- 각 엔드포인트별 메서드, 경로, 요청/응답 스키마, 에러 코드, 인증 스킴을 표로 정리합니다.
- 서버 응답의 페이로드 버전과 브레이킹 체인지 정책(Deprecated 주기)을 확인합니다.

### 2) API 타입 작성

- `/types/api/`에 엔드포인트 단위 타입을 모듈로 분리합니다.
- 예시

```ts
// types/api/cloud.ts
export interface ListCloudsRequest {
  page?: number;
  size?: number;
}
export interface CloudSummary {
  id: string;
  provider: "AWS" | "AZURE" | "GCP";
  name: string;
}
export interface ListCloudsResponse {
  total: number;
  items: CloudSummary[];
}

export interface GetCloudRequest {
  id: string;
}
export type GetCloudResponse = Cloud;

export interface UpsertCloudRequest extends Partial<Cloud> {
  id?: string;
}
export interface UpsertCloudResponse {
  id: string;
}
```

타입은 서버 스키마에서 자동 생성하는 것이 이상적입니다.

- OpenAPI가 있다면 `openapi-typescript`로 타입 생성
- gRPC/Protobuf면 `ts-proto`

### 3) 공용 클라이언트/훅 구성

- `/lib/http.ts`: `fetch` 래퍼. 기본 URL, 타임아웃, 인증 토큰 주입, 공통 에러 처리.
- `/lib/queryKeys.ts`: 키를 함수로 추상화하여 오타 방지 및 일관성 유지.
- `/hooks/queries/cloud.ts`: React Query 훅 모듈화.

예시 키/훅 설계:

```ts
// lib/queryKeys.ts
export const queryKeys = {
  cloud: {
    list: (params?: { page?: number; size?: number }) =>
      ["cloud", "list", params] as const,
    detail: (id: string) => ["cloud", "detail", id] as const,
  },
} as const;

// hooks/queries/cloud.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export function useCloudList(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.cloud.list(params),
    queryFn: () => http.get<ListCloudsResponse>("/clouds", { params }),
    staleTime: 60_000,
  });
}

export function useCloud(id: string) {
  return useQuery({
    queryKey: queryKeys.cloud.detail(id),
    queryFn: () => http.get<GetCloudResponse>(`/clouds/${id}`),
    enabled: !!id,
  });
}

export function useUpsertCloud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertCloudRequest) =>
      http.post<UpsertCloudResponse>("/clouds", body),
    onSuccess: (_, body) => {
      qc.invalidateQueries({ queryKey: queryKeys.cloud.list() });
      if (body.id)
        qc.invalidateQueries({ queryKey: queryKeys.cloud.detail(body.id) });
    },
  });
}
```

운영 팁:

- 에러 핸들링은 인터셉터에서 공통 처리(토큰 만료, 권한 부족, 서버 메시지 표준화)
- 캐싱 전략: 읽기 API는 `staleTime`/`gcTime` 정책을 레벨별로 표준화
- 키 규칙: 도메인 단위로 네임스페이스 → 세부 리소스 → 파라미터 순
- DevTools: `@tanstack/react-query-devtools`를 개발 모드에서 활성화

---

## 실무 관점: 글로벌 서비스 i18n 적용 방안

다국어 적용은 번역 자산(JSON), 사용 코드, 번역 워크플로 3가지를 동시에 관리해야 합니다. 다음 구조/규칙을 권장합니다.

### 1) 폴더/네임스페이스 구조

- `/i18n/`
  - `/locales/`
    - `en/`
      - `common.json`
      - `cloud.json`
    - `ko/`
      - `common.json`
      - `cloud.json`
- 네임스페이스는 화면/도메인 기준으로 분리(`common`, `cloud`, `user` 등).
- 키 네이밍: `scope.component.element.state` 형태 권장. 예: `cloud.dialog.title.create`.

예시(`i18n/locales/en/cloud.json`):

```json
{
  "dialog": {
    "title": {
      "create": "Create Cloud",
      "edit": "Edit Cloud"
    },
    "actions": {
      "cancel": "Cancel",
      "confirm": "Confirm"
    },
    "fields": {
      "provider": "Provider",
      "name": "Name",
      "group": "Cloud Group",
      "regions": "Regions (must include 'global')",
      "eventProcess": "Event Process",
      "userActivity": "User Activity",
      "scheduleScan": "Schedule Scan",
      "awsCredentials": "AWS Credentials",
      "cloudTrailName": "CloudTrail Name"
    },
    "validation": {
      "globalRequired": "Region list must include 'global'."
    }
  },
  "table": {
    "columns": {
      "provider": "Provider",
      "name": "Name",
      "group": "Cloud Group",
      "regions": "Regions",
      "edit": "Edit",
      "delete": "Delete"
    },
    "actions": {
      "editAria": "Edit {{name}}",
      "deleteAria": "Delete {{name}}",
      "deleteConfirm": "Delete cloud \"{{name}}\"?"
    }
  }
}
```

한국어(`i18n/locales/ko/cloud.json`)는 동일 키에 한국어 번역을 매핑합니다.

### 2) 런타임 사용 가이드

- i18n 라이브러리는 `react-i18next` 또는 Next.js 환경에선 `next-i18next`를 권장.
- 컴포넌트에서 네임스페이스 단위로 로드하여 사용:

```tsx
import { useTranslation } from "react-i18next";

export function CloudTitle({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation("cloud");
  return <h1>{isEdit ? t("dialog.title.edit") : t("dialog.title.create")}</h1>;
}
```

- 변수 치환은 `t("table.actions.deleteConfirm", { name })`처럼 사용.
- 키 누락 시에는 `defaultValue`를 제공하거나 빌드 단계에서 누락 검출을 수행합니다.

### 3) 번역 품질/운영 워크플로

- 소스 키(SR, source of truth)는 영어. 기본 PR에서 영어 키 추가 → i18n 봇/CI가 누락 키를 리포트.
- CI 단계에서 다음을 수행:
  - 키 스키마 검증(모든 로케일이 동일한 키 셋을 가졌는지 검사)
  - JSON 포맷/정렬 검사(프리티어 or 스크립트)
  - 미사용 키 탐지(optional)
- 번역 관리 툴을 연동(예: 스프레드시트/전용 TMS). PR 머지 시 JSON을 자동 동기화하는 스크립트를 둡니다.

### 4) 성능/번들 사이즈 최적화

- 네임스페이스/로케일 단위로 청크 분할하여 지연 로드(페이지 진입 시 필요한 네임스페이스만 로드).
- Fallback 언어 체인을 설정하여 일부 키 미번역 시 UX 저하를 방지.
- 캐시 전략: 로컬스토리지에 마지막 로케일 저장, SSG/SSR 시 초기 번역 주입으로 레이아웃 시프트 최소화.

### 5) 코드 규칙 요약

- 하드코딩 문자열 금지. 모두 `t()`를 통해 접근.
- 도메인별 네임스페이스 사용. `common`은 재사용 텍스트만.
- 컴포넌트 테스트 시, i18n Provider 목 설정으로 스냅샷 안정화.

---

## UX 메모: 직관성 보장을 위한 보완점 및 결정사항

본 데모는 디자인 퀄리티를 평가하지 않으므로, 사용성 관점에서 최소한의 직관성 보완을 반영했습니다.

- 리스트 액션 직관화: 텍스트 버튼 대신 `EditIcon`/`TrashIcon` 아이콘 버튼을 제공하고 `aria-label`/`title`을 부여해 접근성 및 명확성을 확보했습니다.
- 삭제 확인: 즉시 삭제 방지를 위해 브라우저 `confirm()`으로 확인 단계를 거치며, 실제 서비스에서는 공용 `Dialog`로 대체하는 것을 권장합니다.
- 필드 유효성: `regionList`는 반드시 `global`을 포함해야 하며, 폼 제출 시 검증 및 경고를 표시합니다. `MultiSelect`에서도 선택 시 자동으로 `global`을 포함시켜 실수 방지.
- 생성/수정 모드 구분: 다이얼로그 헤더와 초기값에 차이를 둡니다. 수정 모드는 500ms 로딩 상태(Loading...)가 표시됩니다.
- 비활성 프로바이더: AWS 외 프로바이더는 `disabled` 처리하여 선택 불가하게 노출(왜 선택 불가인지 즉시 인지 가능).
- 버튼 영역 고정: 다이얼로그 하단에 `취소/확인`을 고정 배치하여 결정 액션의 위치 일관성 보장.
- 반응형 레이아웃: 주요 필드가 2~3열 그리드로 배치되어 데스크톱에서 가독성, 모바일/협소 폭에서는 스택 형태로 자연스럽게 흐름.
- 접근성: 인터랙션 요소에 `aria-label`과 포커스 가능한 버튼을 사용하고, 시각적 상태(ON/OFF)가 텍스트로도 제공되도록 `Toggle` 구현.

### 추가 UX 디테일(강화)

- 필수 표시/힌트: `Cloud Name`, `Regions`, `Access Key`, `Secret Key`에 필수 마크(`*`)와 보조 설명 텍스트를 추가했습니다.
- Secret 표시 전환: `Secret Key` 입력에 Show/Hide 토글을 제공하여 입력 가시성을 제어합니다.
- Proxy 안내: Proxy URL에 사용 목적/선택 사항임을 설명하는 헬프 텍스트를 추가했습니다.
- 스케줄 설정 동적 비활성화: Frequency 선택값에 따라 `Hour`/`Day of Week`/`Date` 필드를 자동 활성/비활성 처리하여 오류 입력을 줄입니다.
- Regions 가이드: `global`이 왜 필요한지 간단 설명을 추가해 이해를 돕습니다.

### 폼 검증(Validation)

- 인라인 검증: 이름/리전/크리덴셜/스케줄 필드에서 필수 조건을 만족하지 않으면 필드 하단에 에러 메시지를 표시합니다.
- 접근성: 에러가 있는 입력에는 `aria-invalid` 속성을 부여합니다.
- 제출 차단: 검증 오류가 존재하면 확인(Submit)을 차단합니다.

---

## QA 체크리스트 (요구사항/UX 기준)

### 기능 요구사항

- [ ] 생성/수정이 동일 컴포넌트(`CloudDialog`)로 동작한다.
- [ ] 생성 다이얼로그는 모든 인풋이 빈 값으로 초기화된다.
- [ ] 수정 다이얼로그는 `fetchCloudById`(500ms sleep) 응답 값으로 초기화된다.
- [ ] 다이얼로그 하단에 `취소`/`확인` 버튼이 존재한다.
- [ ] `취소` 클릭 시 다이얼로그가 닫힌다.
- [ ] `확인` 클릭 시 페이로드가 콘솔에 출력되고 다이얼로그가 닫힌다.
- [ ] 그룹 이름/리전 목록은 `types.ts`의 상수를 사용한다.
- [ ] 리전 목록에는 항상 `global`이 포함된다(선택/제출 모두에서 보장).
- [ ] AWS를 제외한 모든 프로바이더는 `disabled` 상태로 표시된다.
- [ ] `cloudGroupName`/`regionList`는 다중 선택이 가능하다.

### UX/사용성

- [ ] 목록의 편집/삭제는 아이콘 버튼으로 제공되며 툴팁/라벨이 있다.
- [ ] 삭제 시 확인 절차가 존재한다(실서비스는 커스텀 다이얼로그 권장).
- [ ] 로딩 중 수정 다이얼로그에는 `Loading...` 상태가 표시된다.
- [ ] 폼 필드 배치는 2~3열 그리드를 사용해 스캔이 용이하다.
- [ ] 토글은 텍스트(ON/OFF)로 상태가 명확히 드러난다.

### 접근성

- [ ] 인터랙티브 요소에 키보드 포커스가 가능하고, 포커스 스타일이 보인다.
- [ ] 아이콘 버튼에 `aria-label` 또는 `title`이 부여되어 있다.
- [ ] 색상만으로 상태를 전달하지 않으며(텍스트 병기), 대비가 충분하다.

### i18n (권장)

- [ ] 하드코딩 문자열 없이 `t()` 키로 접근한다(데모는 설명만 추가).
- [ ] 키 네임스페이스/구조가 일관적이며, 누락 키 검출 CI가 준비되어 있다.

### 에러/엣지 케이스

- [ ] `regionList`에서 `global` 제거 시도에도 제출 전 검증 또는 선택 시 강제 포함으로 보호된다.
- [ ] 빈 이름 등 필수값 검증이 필요한 경우(실서비스) 에러 표시 전략이 합의되어 있다.
- [ ] 네트워크 오류(실서비스) 시 공통 에러 핸들링/재시도 UX가 정의되어 있다.
