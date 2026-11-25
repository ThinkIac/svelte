'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const original=require('./reference/index.cjs'),candidate=require('..');
test('public API, HMR and picker scripts match original byte for byte',()=>{
 assert.deepEqual(Object.keys(candidate).sort(),Object.keys(original).sort());
 assert.equal(candidate.filePickerProtocolClientScript(),original.filePickerProtocolClientScript());
 for(const mode of original.HOT_RELOAD_MODES)for(const badge of [true,false])assert.equal(candidate.hmrClientScript('demo__Index',{mode,badge}),original.hmrClientScript('demo__Index',{mode,badge}));
 for(const mode of [...original.HOT_RELOAD_MODES,'bad',undefined])assert.equal(candidate.isHotReloadMode(mode),original.isHotReloadMode(mode));
});
test('asset matching, digests and compressed contents match original',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'svelte-parity-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const file of ['main.'+'a'.repeat(32)+'.mjs','main.'+'a'.repeat(32)+'.chunk.ABC.mjs','bad.js','../bad'])assert.equal(candidate.versionedAsset(file),original.versionedAsset(file));
 const f=path.join(dir,'main.'+'a'.repeat(32)+'.mjs');fs.writeFileSync(f,'export const text='+JSON.stringify('hello world '.repeat(300)));
 const a=new original.FileDigests(),b=new candidate.FileDigests();assert.deepEqual(await b.graph([f]),await a.graph([f]));
 await original.precompressAssets([f]);const gzip=fs.readFileSync(f+'.gz'),br=fs.readFileSync(f+'.br');await candidate.precompressAssets([f]);assert.deepEqual(fs.readFileSync(f+'.gz'),gzip);assert.deepEqual(fs.readFileSync(f+'.br'),br);
 fs.writeFileSync(f,'export default 42');a.invalidate(f);b.invalidate(f);assert.equal(await b.hash(f),await a.hash(f));assert.equal(await b.hash(f+'.missing'),'gone');
});
test('runtime view helpers and offline client output match original',()=>{
 const bridge={};const a=require('./reference/runtime/views-runtime.cjs').createRuntime(bridge),b=require('../runtime/views-runtime.cjs').createRuntime(bridge);
 for(const f of ['x/views/widgets/Clock.svelte','x/views/widgets','x/views/Index.svelte'])assert.equal(b.isWidgetPath(f),a.isWidgetPath(f));
 const ao=require('./reference/runtime/offline.cjs'),bo=require('../runtime/offline.cjs');assert.deepEqual(Object.keys(bo).sort(),Object.keys(ao).sort());
 for(const n of Object.keys(ao).filter(n=>/ClientScript|WorkerScript/.test(n)))if(typeof ao[n]==='function'&&ao[n].length===0)assert.equal(bo[n](),ao[n]());
});
test('compatibility shared-state transform preserves observable output',()=>{
 const load=file=>{const m={exports:{}};require(file)(require,m,m.exports,__dirname,file,{});return m.exports;};
 const a=load('./reference/compat/views__shared-state.cjs'),b=load('../compat/views__shared-state.cjs');
 for(const source of ['<h1>hello</h1>','<script>let count = 0;</script><button on:click={() => count++}>{count}</button>'])assert.equal(b.transformSharedState(source),a.transformSharedState(source));
});
test('nested widget iteration and removal preserve the registry',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'widgets-parity-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const workspace=path.join(root,'packages'),widgets=path.join(workspace,'demo','views','widgets');fs.mkdirSync(widgets,{recursive:true});fs.writeFileSync(path.join(widgets,'Clock.svelte'),'<h1>clock</h1>');
 const a=new original.SvelteEngine(path.join(root,'a')),b=new candidate.SvelteEngine(path.join(root,'b'));
 a.buildWidgetRegistry(workspace);b.buildWidgetRegistry(workspace);assert.equal(fs.readFileSync(b.widgetRegistryPath,'utf8'),fs.readFileSync(a.widgetRegistryPath,'utf8'));
 fs.rmSync(widgets,{recursive:true});a.buildWidgetRegistry(workspace);b.buildWidgetRegistry(workspace);assert.equal(fs.readFileSync(b.widgetRegistryPath,'utf8'),fs.readFileSync(a.widgetRegistryPath,'utf8'));
});
test('shared-state natural writes traverse nested declarations identically',()=>{
 const load=file=>{const m={exports:{}};require(file)(require,m,m.exports,__dirname,file,{});return m.exports;};
 const a=load('./reference/compat/views__shared-state.cjs'),b=load('../compat/views__shared-state.cjs');
 const source='<script>const state = useState("demo"); const user = state.user; function change() { user.name = "updated"; state.count++; }</script><input bind:value={user.name}><p>{state.count}</p>';
 assert.equal(b.transformSharedState(source),a.transformSharedState(source));
});
test('Tailwind worker produces CSS using the published worker path',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'tailwind-migration-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const source=path.join(root,'Index.svelte');fs.writeFileSync(source,'<h1 class="text-red-500">Hello</h1>');
 const styles=new candidate.TailwindStyles(root);const result=await styles.build({hash:'migration',files:{[source]:'hash'}},{},root);
 assert.equal(typeof result,'string');assert.match(fs.readFileSync(path.join(root,result),'utf8'),/\.text-red-500/);
});
