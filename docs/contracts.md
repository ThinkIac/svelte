# Contratos de views

## Motor e assets

`SvelteEngine(cacheDir, ...)` mantém compilação SSR/cliente, cache por conteúdo,
dependências, componentes opcionais entre pacotes, widgets, serialização de builds
e validação HMR antes da publicação. Preserva `.svelte`, `.svx`, hidratação,
Tailwind opcional e integração com o seletor de arquivos por eventos do navegador.
Falhas de compilação não devem substituir a última geração válida.

`FileDigests` mantém hashes e invalidação com I/O limitado. `precompressAssets`
produz gzip/Brotli fora do request. `compressedAssets` negocia encoding, rejeita
traversal e deixa Range para o servidor original. `TailwindStyles` usa um worker
Node quando há compilador disponível; o comportamento de fallback foi preservado.

## Publicação

`mountPackageViews(container, pkg, adapters)` monta páginas em `/view/<pacote>/<página>`
e assets em `/svelte-cache`. Views seguem a convenção `views/`; `.public.svelte`
identifica páginas públicas. O host continua responsável pela autorização e aliases.
Não foi acrescentada uma nova sintaxe declarativa de views.

`provideViews(host)` publica prewarm, global data, tema, Tailwind, widgets,
resolução de hot-reload e verificação de páginas públicas. Configuração existente
de views do host é preservada. O alias `createRuntimeModule` permanece no caminho
`runtime-module.cjs`, como antes.

## HMR, offline e compatibilidade

Modos HMR: `always`, `auto`, `prompt`, `manual`. Os scripts do navegador e do
seletor de arquivos são comparados byte a byte com a referência original.
Políticas offline, manifesto, rotas, service worker e cliente continuam em
`runtime/offline.cjs`, também exportados pela raiz.

`compat/views__*.cjs` são fábricas legadas executadas com dependências mediadas pelo
kernel; não são uma segunda composição do runtime. Sua fonte agora também é `.type`.
O transform experimental de shared state continua experimental, sem ativação nova.

## Dependências de plataforma

Leitura de arquivos, hashes, compressão, workers, Express e esbuild ainda requerem
Node. Não foi introduzido um adaptador Rust nem provada execução embarcada.

Com as dependências atuais, o worker Tailwind pode usar o fallback de navegador
no Node 18 por incompatibilidade CommonJS/ESM de dependências upstream. Esse
comportamento já existia; a suíte compara a versão migrada com a referência.
