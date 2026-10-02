import assert from 'node:assert/strict';
import test from 'node:test';
import { React, act, createHarness, note } from './helpers/react.js';

globalThis.testSupabase = {};
const harness = await createHarness();
function submit() {
  return act(async () =>
    document
      .querySelector('form')
      .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })),
  );
}

test('a rejected save is displayed and consumed at the form event boundary', async () => {
  await harness.render(
    React.createElement(harness.NoteForm, {
      initialValues: note('new'),
      submitLabel: '저장',
      submitting: false,
      onSubmit: async () => {
        throw new Error('Save failed');
      },
    }),
  );
  await submit();
  assert.match(document.querySelector('[role="alert"]').textContent, /Save failed/);
  assert.equal(document.querySelector('[type="submit"]').disabled, false);
});

test('empty fields show accessible validation and prevent save', async () => {
  await harness.clear();
  let saved = false;
  await harness.render(
    React.createElement(harness.NoteForm, {
      submitLabel: '저장',
      submitting: false,
      onSubmit: async () => {
        saved = true;
      },
    }),
  );
  await submit();
  assert.equal(saved, false);
  assert.equal(document.querySelectorAll('[aria-invalid="true"]').length, 3);
  assert.equal(document.querySelectorAll('small[role="alert"]').length, 3);
});

test('edited input updates preview and is passed to the save handler', async () => {
  await harness.clear();
  let saved;
  await harness.render(
    React.createElement(harness.NoteForm, {
      initialValues: note('new'),
      submitLabel: '저장',
      submitting: false,
      onSubmit: async (values) => {
        saved = values;
      },
    }),
  );
  const field = document.getElementById('note-title');
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set.call(field, 'Changed title');
    field.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  assert.equal(
    document.querySelector('.preview-panel strong').textContent,
    'Changed title',
  );
  await submit();
  assert.equal(saved.title, 'Changed title');
  assert.equal(saved.body, 'Body new');
});

test.after(() => harness.close());
