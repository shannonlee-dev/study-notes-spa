# Field Notes

Field Notes는 React 18 기반 SPA입니다. 서비스 주제는 학습 기록 관리이고, 단일 핵심 데이터는 Supabase `notes` 테이블입니다. 목록, 상세, 등록, 수정, 삭제 흐름은 모두 원격 Supabase 데이터를 기준으로 작성했습니다.

## 기술 스택

- React 18
- Vite
- React Router
- Supabase JavaScript SDK
- 순수 CSS

## 로컬 설치와 실행

```sh
npm install
npm run dev
```

프로덕션 빌드:

```sh
npm run build
```

## 환경변수

`.env.example`을 `.env`로 복사하고 Supabase 값을 입력합니다.

```sh
cp .env.example .env
```

```text
VITE_SUPABASE_URL=<Supabase project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

`.env`와 `.env.local`은 `.gitignore`에 포함되어 있습니다. 실제 키는 GitHub에 푸시하지 않고, 배포 서비스 대시보드의 Environment Variables에 별도로 등록합니다.

## Supabase 데이터

`notes` 테이블 예시:

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);
```

인증 보너스를 확인하려면 Supabase Auth에서 이메일/비밀번호 로그인을 활성화하고 테스트 사용자를 준비합니다. 등록, 수정, 삭제 페이지와 프로필 페이지는 보호 라우트입니다.

## 라우트

- `/`: 서비스 주제와 핵심 데이터 안내
- `/login`: Supabase Auth 로그인
- `/notes`: 원격 노트 목록, 필터, 빈 상태, 에러 상태
- `/notes/:id`: 라우트 파라미터 기반 상세 조회와 삭제
- `/notes/new`: 보호 라우트, controlled input 등록 폼
- `/notes/:id/edit`: 보호 라우트, 수정 폼
- `/profile`: 보호 라우트, 로그인 사용자 표시
- `*`: Not Found

## 컴포넌트와 상태 설계

페이지 컴포넌트는 `src/pages`에 두고, 재사용 UI는 `src/components`에 분리했습니다. `Button`, `TextInput`, `TextArea`, `Card`, `Loading`, `ErrorState`, `EmptyState`, `Badge`, `NoteList`, `NoteForm`, `Layout`, `ProtectedRoute`는 props에 따라 표시나 동작이 달라집니다.

props는 부모가 자식에게 전달하는 입력값으로 사용했고, state는 사용자의 입력, 요청 상태, 원격 데이터처럼 화면을 다시 그려야 하는 값에 배치했습니다. 폼 입력 state는 `NoteForm` 안에 두고, 목록/상세 데이터 state와 로딩/에러 state는 `useNotes`, `useNoteDetail`, `useNoteMutations` 커스텀 훅에 두었습니다.

`useEffect`는 목록과 상세 데이터를 불러올 때 실행됩니다. 의존성 배열에는 `fetchNotes`, `fetchNote`처럼 `useCallback`으로 고정한 요청 함수가 들어가므로 라우트 파라미터 `id`가 바뀌면 상세 요청이 다시 실행됩니다.

비동기 흐름은 로딩, 성공, 실패, 빈 상태를 공통 컴포넌트로 표현합니다. `Loading`, `ErrorState`, `EmptyState`를 핵심 화면에서 재사용해 페이지마다 상태 UI를 새로 만들지 않았습니다.

라우팅, 컴포넌트, 상태, 이벤트, 렌더링 연결은 다음 흐름으로 확인할 수 있습니다.

- 필터 입력 변경: `NotesPage`의 `filter` state가 바뀌고 `filteredNotes`가 다시 계산되어 목록 렌더링이 변합니다.
- 폼 입력 변경: `NoteForm`의 controlled input state가 바뀌고 미리보기 패널이 즉시 변합니다.
- 등록/수정 제출: submit 이벤트가 Supabase insert/update 호출로 이어지고 성공 후 상세 페이지로 이동하며 알림 state가 표시됩니다.
- 삭제 클릭: delete 이벤트가 Supabase delete 호출로 이어지고 목록 페이지 이동과 알림 렌더링이 발생합니다.

## 제출 링크

- 배포 URL: `https://codyssey-mission.vercel.app/`
- GitHub 저장소 URL: `https://github.com/shannonlee-dev/codyssey-mission`
- 과제 폴더 URL: `https://github.com/shannonlee-dev/codyssey-mission/tree/main/2026-main-4-2`
