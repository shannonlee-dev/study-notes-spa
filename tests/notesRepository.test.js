import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from '../src/features/notes/api/notesRepository.js';

function clientFor(response) {
  const calls = [];
  const query = {
    then: (resolve, reject) => Promise.resolve(response).then(resolve, reject),
  };
  for (const method of [
    'select',
    'order',
    'eq',
    'single',
    'insert',
    'update',
    'delete',
  ]) {
    query[method] = (...args) => {
      calls.push([method, ...args]);
      return query;
    };
  }
  return {
    calls,
    from(table) {
      calls.push(['from', table]);
      return query;
    },
  };
}

test('목록 조회는 정렬과 빈 값 정규화를 유지한다', async () => {
  const client = clientFor({
    data: [{ id: 1, title: null, body: null, category: null, is_pinned: 1 }],
    error: null,
  });
  const notes = await listNotes(client);
  assert.equal(notes[0].title, '');
  assert.equal(notes[0].body, '');
  assert.equal(notes[0].category, '');
  assert.equal(notes[0].is_pinned, true);
  assert.deepEqual(client.calls.at(-1), ['order', 'created_at', { ascending: false }]);
});

test('상세 조회는 요청한 ID만 선택한다', async () => {
  const client = clientFor({ data: { id: 7, title: '노트' }, error: null });
  assert.equal((await getNote(client, 7)).id, 7);
  assert.deepEqual(client.calls.slice(-2), [['eq', 'id', 7], ['single']]);
});

test('삭제 결과가 없으면 권한 오류로 처리한다', async () => {
  const client = clientFor({ data: [], error: null });
  await assert.rejects(deleteNote(client, 7), /로그인 후 삭제/);
  assert.deepEqual(client.calls.slice(-2), [
    ['eq', 'id', 7],
    ['select', 'id'],
  ]);
});

test('등록과 수정은 공백을 제거하고 기존 필드만 전송한다', async () => {
  const values = {
    title: ' 제목 ',
    body: ' 본문 ',
    category: ' 분류 ',
    is_pinned: true,
  };
  const expected = { title: '제목', body: '본문', category: '분류', is_pinned: true };
  const createClient = clientFor({ data: { id: 8 }, error: null });
  assert.deepEqual(await createNote(createClient, values), { id: 8 });
  assert.deepEqual(createClient.calls[1], ['insert', expected]);
  const updateClient = clientFor({ data: { id: 8 }, error: null });
  assert.deepEqual(await updateNote(updateClient, 8, values), { id: 8 });
  assert.deepEqual(updateClient.calls.slice(1, 3), [
    ['update', expected],
    ['eq', 'id', 8],
  ]);
});

test('요청 오류 객체를 그대로 호출자에게 전달한다', async () => {
  const error = new Error('원격 요청 실패');
  const client = clientFor({ data: null, error });
  await assert.rejects(listNotes(client), (actual) => actual === error);
});
