import { build } from 'esbuild';
import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

export { React, act };

export async function createHarness() {
  const browser = new JSDOM('<div id="root"></div>', { url: 'https://notes.example/' });
  Object.assign(globalThis, {
    window: browser.window,
    document: browser.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: browser.window.navigator,
  });
  const runtime = fileURLToPath(new URL('../../.runtime/', import.meta.url));
  mkdirSync(runtime, { recursive: true });
  const output = `${runtime}ui-tests-${randomUUID()}.cjs`;
  await build({
    stdin: {
      contents: `
export {useNoteDetail} from './src/features/notes/hooks/useNoteDetail.js';
export {useNotes} from './src/features/notes/hooks/useNotes.js';
export {default as NoteForm} from './src/features/notes/components/NoteForm.jsx';
export {default as NewNotePage} from './src/pages/NewNotePage.jsx';
export {default as App} from './src/App.jsx';
export {AuthProvider} from './src/context/AuthContext.jsx';
export {ToastProvider} from './src/context/ToastContext.jsx';`,
      resolveDir: fileURLToPath(new URL('../../', import.meta.url)),
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    jsx: 'automatic',
    plugins: [
      {
        name: 'offline-backend',
        setup(bundler) {
          bundler.onLoad({ filter: /\/lib\/supabase\.js$/ }, () => ({
            contents:
              'export const hasSupabaseConfig=true; export const supabase=globalThis.testSupabase; export function requireSupabase(){return globalThis.testSupabase;}',
            loader: 'js',
          }));
        },
      },
    ],
  });
  const require = createRequire(import.meta.url);
  const components = require(output);
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(document.getElementById('root'));
  return {
    ...components,
    render: async (element) => act(async () => root.render(element)),
    clear: async () => act(async () => root.render(null)),
    close: async () => {
      await act(async () => root.unmount());
      browser.window.close();
      rmSync(output);
    },
  };
}

export function note(id, title = `Note ${id}`) {
  return {
    id,
    title,
    body: `Body ${id}`,
    category: 'React',
    is_pinned: false,
    created_at: '2026-01-01T00:00:00Z',
  };
}
