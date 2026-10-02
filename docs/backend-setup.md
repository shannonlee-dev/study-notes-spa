# Supabase 백엔드 준비

## 기존 데이터 계약

애플리케이션의 기존 훅은 `notes` 테이블에서 다음 필드를 읽고 씁니다. 아래 모델은 기존 README의 예시를 보존합니다.

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

테이블이 이미 있으면 이 생성문을 반복 실행하지 않습니다. 실제 Supabase 프로젝트의 스키마와 현재 필드를 먼저 확인합니다.

## 환경 설정

프로젝트의 주소와 공개 키를 `.env.example`에서 복사한 `.env`에 설정합니다. 관리자용 `service_role` 키는 브라우저 변수로 사용하지 않습니다. 로그인 화면은 기존 Supabase Auth 구성을 사용하므로 테스트 사용자를 자신의 프로젝트에 준비합니다.

## 접근 정책

이 레포에는 RLS 정책이나 사용자별 소유권 필드를 적용하는 마이그레이션이 없습니다. 화면의 로그인 경로 보호만으로 DB 접근 권한이 제한되지는 않습니다. 실제 읽기·쓰기 허용 범위는 사용하는 Supabase 프로젝트의 RLS 정책을 확인해야 합니다.

기존 모델에는 `user_id`가 없으므로 사용자별 노트 격리 기능을 구현한 것으로 설명하지 않습니다. 소유권 필드·정책·쿼리 변경은 별도의 핵심 기능 변경입니다.

## 수동 확인

1. 환경 변수 설정 후 개발 서버를 다시 시작합니다.
2. 노트 목록이 로드되는지 확인합니다.
3. 비로그인 상태에서 새 노트 경로가 로그인 화면으로 이동하는지 확인합니다.
4. 준비한 테스트 계정으로 로그인합니다.
5. 테스트 노트를 등록·수정·삭제하고 접근 정책이 의도와 일치하는지 확인합니다.
6. 배포 환경 변수와 SPA 경로 새로고침을 확인합니다.

`npm run build` 성공은 원격 DB의 스키마·인증·접근 정책 검증을 의미하지 않습니다.
