import assert from 'node:assert/strict';
import test from 'node:test';
import { React, act, createHarness, note } from './helpers/react.js';

const pending = new Map();
globalThis.testSupabase = {
  from() {
    const query = {
      select() {
        return query;
      },
      eq(_key, id) {
        query.id = id;
        return query;
      },
      single() {
        return new Promise((resolve) => pending.set(query.id, resolve));
      },
    };
    return query;
  },
};
const harness = await createHarness();
let current;
function Detail({ id }) {
  current = harness.useNoteDetail(id);
  return React.createElement(
    'p',
    null,
    current.loading ? 'loading' : current.error || current.note?.title,
  );
}

test('a delayed previous detail response cannot replace the current route note', async () => {
  await harness.render(React.createElement(Detail, { id: 'A' }));
  await harness.render(React.createElement(Detail, { id: 'B' }));
  await act(async () => pending.get('B')({ data: note('B'), error: null }));
  assert.equal(document.body.textContent, 'Note B');
  await act(async () => pending.get('A')({ data: note('A'), error: null }));
  assert.equal(current.note.id, 'B');
  assert.equal(document.body.textContent, 'Note B');
});

test('an old error cannot stop the current loading state or overwrite its result', async () => {
  await harness.clear();
  await harness.render(React.createElement(Detail, { id: 'old' }));
  await harness.render(React.createElement(Detail, { id: 'new' }));
  await act(async () =>
    pending.get('old')({ data: null, error: new Error('old failure') }),
  );
  assert.equal(current.loading, true);
  assert.equal(current.error, '');
  await act(async () => pending.get('new')({ data: note('new'), error: null }));
  assert.equal(document.body.textContent, 'Note new');
});

test('current failure is visible and retry can replace it with a note', async () => {
  await harness.clear();
  await harness.render(React.createElement(Detail, { id: 'retry' }));
  await act(async () =>
    pending.get('retry')({ data: null, error: new Error('current failure') }),
  );
  assert.match(document.body.textContent, /current failure/);
  let retry;
  await act(async () => {
    retry = current.refetch();
  });
  await act(async () => pending.get('retry')({ data: note('retry'), error: null }));
  await retry;
  assert.equal(document.body.textContent, 'Note retry');
});

test('a response for a different note ID is rejected before displaying it', async () => {
  await harness.clear();
  await harness.render(React.createElement(Detail, { id: 'expected' }));
  await act(async () => pending.get('expected')({ data: note('other'), error: null }));
  assert.equal(current.note, null);
  assert.ok(current.error);
  assert.doesNotMatch(document.body.textContent, /Note other/);
});

test.after(() => harness.close());
