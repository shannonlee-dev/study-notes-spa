# Supabase 백엔드 준비

## 데이터와 접근 모델

이 앱은 **공유 노트 목록**입니다. 비로그인 방문자는 모든 노트를 읽고, 인증된 사용자는 모든 노트를 등록·수정·삭제할 수 있습니다. `user_id`가 없으며 사용자별 비공개 노트나 작성자만 수정하는 기능은 제공하지 않습니다. 개인 기록을 저장하려면 별도로 소유권 필드·RLS 정책·화면·쿼리를 함께 바꿔야 합니다.

클라이언트의 필드는 `id`, `title`, `body`, `category`, `is_pinned`, `created_at`입니다. [스키마와 정책 SQL](../supabase/schema.sql)은 현재 데이터 계약에 맞춰 공개 읽기와 인증 사용자 쓰기를 설정합니다.

## 새 프로젝트 준비

1. 자신의 Supabase 실습 프로젝트를 만들고 SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다. 이 SQL은 새 테이블을 만드는 용도이며 이미 `notes`가 있으면 실패 후 롤백합니다. 기존 프로젝트에는 덮어쓰지 말고 스키마·권한·기존 RLS 정책을 먼저 비교합니다. 기존 permissive 정책은 새 정책과 OR로 평가되므로 확인 없이 정책을 추가하지 않습니다.
2. Authentication → Users에서 실습용 이메일·비밀번호 사용자를 만듭니다. 이메일 확인이 필요한 설정이면 확인을 완료합니다. 앱에는 회원가입 화면이 없습니다.
3. 프로젝트 설정에서 URL과 공개 키를 확인하고 저장소의 `.env.example`을 `.env`로 복사해 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 채웁니다. 공개 키는 브라우저에 노출되는 키입니다. `service_role`이나 비밀 키를 사용하지 않습니다.
4. `npm ci` 후 개발 서버를 시작합니다. 환경 변수를 바꿨으면 서버를 다시 시작합니다.
5. 로그아웃 상태로 `/notes`와 상세 노트를 읽고 `/notes/new`, 수정 경로, `/profile`은 로그인으로 이동하는지 확인합니다.
6. 실습 사용자로 로그인해 테스트 노트를 등록·수정·삭제합니다. 다른 실습 사용자도 같은 목록을 읽고 변경할 수 있는 공유 모델인지 확인합니다.

## 권한 경계

`ProtectedRoute`는 화면 이동을 제어합니다. DB 권한은 SQL의 테이블 grants와 RLS가 별도로 강제합니다. 익명 역할 `anon`은 SELECT만, `authenticated`는 SELECT·INSERT·UPDATE·DELETE가 허용됩니다. 인증 사용자의 쓰기는 노트 소유자와 관계없이 전체 목록에 적용됩니다.

정책에서 `using (true)`는 공유 노트 행을 허용하는 조건이며 `anon`에 쓰기를 허용한다는 의미가 아닙니다. 관리자·service role이 RLS를 우회할 수 있으므로 브라우저 설정에는 공개 키만 사용합니다.

## 정책 회귀 확인

[정책 검증 SQL](../supabase/test-policies.sql)은 익명 읽기, 익명 INSERT·UPDATE·DELETE 거부, 인증 사용자 INSERT·공유 UPDATE·DELETE를 확인하고 테스트 데이터를 롤백합니다. 실제 데이터를 가진 환경 대신 별도 실습 DB에서 데이터베이스 소유자로 실행합니다.

```bash
# PGHOST, PGPORT, PGDATABASE, PGUSER는 자신의 별도 실습 DB 연결에 설정합니다.
psql -X -v ON_ERROR_STOP=1 -f supabase/schema.sql
psql -X -v ON_ERROR_STOP=1 -f supabase/test-policies.sql
```

일반 PostgreSQL로 검증할 때는 Supabase가 기본 제공하는 `anon`, `authenticated` 역할을 먼저 만들어야 합니다. 이 SQL 검증은 Auth 토큰 발급·만료나 실제 Supabase API를 검증하지 않습니다. `npm test`는 원격 요청만 대체하고 실제 훅·폼·로그인 컨텍스트·보호 경로·검색·CRUD 화면 흐름을 검사합니다.

## 배포 확인

Vercel에도 동일한 공개 환경 변수를 설정하고 상세 경로 새로고침을 확인합니다. `npm run build` 성공은 원격 스키마·인증·접근 정책이나 현재 서비스 상태를 보장하지 않습니다.
