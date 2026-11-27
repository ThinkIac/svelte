'use strict';

const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');
const { SvelteEngine, HOT_RELOAD_MODES, isHotReloadMode } = require('..');

test('exports the Svelte runtime contract', () => {
  assert.equal(typeof SvelteEngine, 'function');
  assert.deepEqual(HOT_RELOAD_MODES, ['always', 'auto', 'prompt', 'manual']);
  assert.equal(isHotReloadMode('auto'), true);
  assert.equal(isHotReloadMode('unexpected'), false);
});

test('renders and hydrates a Svelte page without Logos internals', async () => {
  const root = mkdtempSync(join(tmpdir(), 'thinkiac-svelte-'));
  const workspace = join(root, 'packages');
  const source = join(workspace, 'demo', 'views', 'Index.svelte');
  const cache = join(root, 'cache');
  try {
    mkdirSync(join(workspace, 'demo', 'views'), { recursive: true });
    writeFileSync(source, '<script>export let name = "world";</script><h1>Hello {name}</h1>');
    const html = await new SvelteEngine(cache).render(source, 'demo__Index', { name: 'Svelte' }, workspace);
    assert.match(html, /Hello Svelte/);
    assert.match(html, /svelte-cache\/demo__Index\.DOM\./);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test('Slot renders groups in discovery order and supports filtering, sorting and wrappers', async t => {
  const root = mkdtempSync(join(tmpdir(), 'thinkiac-slot-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workspace = join(root, 'packages');
  const addView = (pkg, file, source) => {
    const folder = join(workspace, pkg, 'views');
    mkdirSync(folder, { recursive: true });
    const view = join(folder, file);
    writeFileSync(view, source);
    return view;
  };

  addView('zeta', 'Alpha.Widget.svelte', '<b>zeta-alpha</b>');
  addView('alpha', 'Zulu.Widget.svelte', '<b>alpha-zulu</b>');
  const removed = addView('alpha', 'Beta.Widget.svelte', '<b>alpha-beta</b>');
  addView('alpha', 'Check.Action.svelte', '<script>let { workspace } = $props();</script><b>{workspace}</b>');
  addView('alpha', 'Help.public.svelte', '<b>public page</b>');
  addView('alpha', 'Detail.svelte', '<b>direct view</b>');
  const source = addView('host', 'Index.svelte', [
    '<script module>export const title = "Slots";</script>',
    '<script>import Detail from "logos-view:alpha:Detail";</script>',
    '<section id="default"><Slot group="Widget" /></section>',
    '<ul><Slot group="Widget" filter={item => item.pkg === "alpha"} sort={(a, b) => b.name.localeCompare(a.name)}>',
    '{#snippet children(item, renderItem)}<li data-target={item.target}>{@render renderItem()}</li>{/snippet}',
    '</Slot></ul>',
    '<Slot group="Action" workspace="workspace-prop" />',
    '<Slot group="public" />',
    '<Widget name="alpha__Zulu" />',
    '<Detail />',
  ].join('\n'));

  const engine = new SvelteEngine(join(root, 'cache'), 0);
  engine.buildWidgetRegistry(workspace);
  const html = await engine.render(source, 'host__Index', {}, workspace);
  assert.deepEqual(html.match(/<b>[^<]+<\/b>/g), [
    '<b>alpha-beta</b>', '<b>alpha-zulu</b>', '<b>zeta-alpha</b>',
    '<b>alpha-zulu</b>', '<b>alpha-beta</b>',
    '<b>workspace-prop</b>', '<b>alpha-zulu</b>', '<b>direct view</b>',
  ]);
  assert.match(html, /data-target="alpha:Zulu:Widget"/);
  assert.match(html, /svelte-cache\/host__Index\.DOM\./);
  assert.deepEqual(engine.affectedComponents(engine.slotRegistryPath), ['host__Index']);

  rmSync(removed);
  addView('alpha', 'New.Widget.svelte', '<b>alpha-new</b>');
  engine.buildWidgetRegistry(workspace);
  const rebuilt = await engine.render(source, 'host__Index', {}, workspace);
  assert.doesNotMatch(rebuilt, /alpha-beta/);
  assert.match(rebuilt, /alpha-new/);
});
