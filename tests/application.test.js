import assert from 'node:assert/strict';
import test from 'node:test';
import { React, act, createHarness, note } from './helpers/react.js';

const user = { id: 'user-1', email: 'reader@example.com' };
let session = null;
let authFailure = '';
let logoutFailure = '';
let notes = [];
const listeners = new Set();
globalThis.testSupabase = {
  auth: {
    getSession: async () => ({ data: { session }, error: null }),
    onAuthStateChange(callback) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback);
            },
          },
        },
      };
    },
    async signInWithPassword() {
      if (authFailure) return { error: new Error(authFailure) };
      session = { user };
      listeners.forEach((callback) => callback('SIGNED_IN', session));
      return { error: null };
    },
    async signOut() {
      if (logoutFailure) return { error: new Error(logoutFailure) };
      session = null;
      listeners.forEach((callback) => callback('SIGNED_OUT', null));
      return { error: null };
    },
  },
  from() {
    const query = {
      operation: 'read',
      select() {
        return query;
      },
      order() {
        return query;
      },
      eq(_key, id) {
        query.id = id;
        return query;
      },
      single() {
        query.one = true;
        return query;
      },
      insert(values) {
        query.operation = 'create';
        query.values = values;
        return query;
      },
      update(values) {
        query.operation = 'update';
        query.values = values;
        return query;
      },
      delete() {
        query.operation = 'delete';
        return query;
      },
      then(resolve, reject) {
        let data;
        if (query.operation === 'create') {
          const created = { ...note('created'), ...query.values };
          notes.push(created);
          data = { id: created.id };
        } else if (query.operation === 'update') {
          notes = notes.map((item) =>
            item.id === query.id ? { ...item, ...query.values } : item,
          );
          data = { id: query.id };
        } else if (query.operation === 'delete') {
          notes = notes.filter((item) => item.id !== query.id);
          data = [{ id: query.id }];
        } else
          data = query.one ? notes.find((item) => item.id === query.id) : [...notes];
        return Promise.resolve({ data, error: null }).then(resolve, reject);
      },
    };
    return query;
  },
};
const harness = await createHarness();
const { MemoryRouter } = await import('react-router-dom');
async function open(path, loggedIn = false) {
  await harness.clear();
  session = loggedIn ? { user } : null;
  authFailure = '';
  logoutFailure = '';
  await harness.render(
    React.createElement(
      MemoryRouter,
      {
        initialEntries: [path],
        future: { v7_startTransition: true, v7_relativeSplatPath: true },
      },
      React.createElement(
        harness.AuthProvider,
        null,
        React.createElement(
          harness.ToastProvider,
          null,
          React.createElement(harness.App),
        ),
      ),
    ),
  );
}
async function setField(id, value) {
  await act(async () => {
    const field = document.getElementById(id);
    const prototype =
      field.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value);
    field.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
}
async function submit() {
  await act(async () =>
    document
      .querySelector('form')
      .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })),
  );
}
function button(label) {
  return [...document.querySelectorAll('button')].find(
    (item) => item.textContent === label,
  );
}

test('anonymous protected registration returns to the requested page after login', async () => {
  await open('/notes/new');
  assert.match(document.querySelector('main').textContent, /Supabase 로그인/);
  await setField('email', user.email);
  await setField('password', 'test-password');
  await submit();
  assert.match(document.querySelector('main').textContent, /새 노트 만들기/);
  assert.equal(document.querySelector('.session-box span').textContent, user.email);
});

test('failed credentials remain on the login screen with a retryable error', async () => {
  await open('/login');
  authFailure = 'Invalid credentials';
  await setField('email', user.email);
  await setField('password', 'wrong');
  await submit();
  assert.match(
    document.querySelector('.form-alert').textContent,
    /Invalid credentials/,
  );
  assert.equal(button('로그인').disabled, false);
  assert.equal(document.querySelector('.session-box'), null);
});

test('restored session opens profile and logout protects it again', async () => {
  await open('/profile', true);
  assert.match(document.querySelector('main').textContent, /reader@example.com/);
  await act(async () => button('로그아웃').click());
  assert.match(document.querySelector('main').textContent, /Supabase 로그인/);
  assert.equal(document.querySelector('.session-box'), null);
});

test('list filters title, body and category and shows pinned state', async () => {
  notes = [
    { ...note('a', 'Unique title'), is_pinned: true },
    { ...note('b', 'Second'), body: 'Unique body', category: 'Database' },
  ];
  await open('/notes');
  assert.equal(document.querySelectorAll('.note-grid article').length, 2);
  assert.match(document.querySelector('.badge').textContent, /Pinned/);
  await setField('filter', 'unique title');
  assert.equal(document.querySelectorAll('.note-grid article').length, 1);
  await setField('filter', 'unique body');
  assert.equal(document.querySelector('.note-grid h2').textContent, 'Second');
  await setField('filter', 'DATABASE');
  assert.equal(document.querySelector('.note-grid h2').textContent, 'Second');
  await setField('filter', 'absent');
  assert.match(document.querySelector('.state--empty').textContent, /없습니다/);
});

test('registration, edit and delete flow render the saved repository state', async () => {
  notes = [];
  await open('/notes/new', true);
  await setField('note-title', ' New title ');
  await setField('note-body', ' New body ');
  await setField('note-category', ' React ');
  await submit();
  assert.equal(document.querySelector('main h2').textContent, 'New title');
  assert.equal(document.querySelector('.note-body').textContent, 'New body');
  await act(async () =>
    document.querySelector('a[href="/notes/created/edit"]').click(),
  );
  assert.equal(document.getElementById('note-title').value, 'New title');
  await setField('note-title', 'Updated title');
  await submit();
  assert.equal(document.querySelector('main h2').textContent, 'Updated title');
  await act(async () => button('삭제').click());
  assert.match(document.querySelector('.state--empty').textContent, /없습니다/);
  assert.equal(document.querySelector('a[href="/notes/created"]'), null);
});

test('logout failure stays visible without an unhandled rejection', async () => {
  await open('/profile', true);
  logoutFailure = 'Sign out failed';
  await act(async () => button('로그아웃').click());
  assert.match(document.querySelector('.toast').textContent, /Sign out failed/);
  assert.equal(document.querySelector('.session-box span').textContent, user.email);
});

test.after(() => harness.close());
