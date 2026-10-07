-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여넣고 Run 하세요.
-- 실행 전에 아래 함수 안의 관리자 UID 목록을 채워주세요. (firestore.rules 의 목록과 똑같이)
-- 여러 번 실행해도 안전합니다.

-- 1) 공개 버킷 생성: 누구나 파일을 "볼" 수 있음 (이미지/음악 재생용). 최대 50MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ccbb', 'ccbb', true, 52428800, array['image/*', 'audio/*'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2) 관리자 판별 함수: Firebase ID 토큰(이 프로젝트에서 발급 + 관리자 UID)인지 확인
create schema if not exists private;

create or replace function private.ccbb_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'iss', '') = 'https://securetoken.google.com/ccbb-6cde8'
     and coalesce(auth.jwt() ->> 'aud', '') = 'ccbb-6cde8'
     and coalesce(auth.jwt() ->> 'sub', '') = any (array[
           '7ihPo3IJYggOt5SMZwxgeWyJ1Eo1',
           'ADMIN_UID_2',
           'ADMIN_UID_3',
           'ADMIN_UID_4',
           'ADMIN_UID_5'
         ]);
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.ccbb_is_admin() to anon, authenticated;

-- 3) 업로드/수정/삭제는 관리자만
--    Firebase 토큰에는 role 클레임이 없어서 Supabase가 anon 역할로 처리하므로 anon도 대상에 포함합니다.
--    (실제 권한은 위 함수의 토큰 검사로 제한됩니다.)
drop policy if exists "ccbb admin select" on storage.objects;
drop policy if exists "ccbb admin insert" on storage.objects;
drop policy if exists "ccbb admin update" on storage.objects;
drop policy if exists "ccbb admin delete" on storage.objects;

create policy "ccbb admin select" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'ccbb' and private.ccbb_is_admin());

create policy "ccbb admin insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'ccbb' and private.ccbb_is_admin());

create policy "ccbb admin update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'ccbb' and private.ccbb_is_admin());

create policy "ccbb admin delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'ccbb' and private.ccbb_is_admin());
