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

`provideViews(host)` publica prewarm, global data, tema, Tailwind, widgets,
resolução de hot-reload e verificação de páginas públicas. Configuração existente
de views do host é preservada. O alias `createRuntimeModule` permanece no caminho
`runtime-module.cjs`, como antes.

## Grupos de views

O motor descobre `views/<Nome>.<Grupo>.svelte` e `.svx` no workspace em ordem
alfabética de pacote e nome de arquivo. `views/Billing.Widget.svelte` entra no
grupo `Widget` com o alvo `pacote:Billing:Widget`. O sufixo `.public` segue
reservado às rotas públicas. As views de `views/widgets/` também entram no
grupo `Widget` e continuam disponíveis pela API legada de `<Widget>`.
Se um widget estiver nos dois locais com o mesmo nome, o arquivo de primeiro
nível tem precedência.

O compilador disponibiliza `<Slot>` automaticamente. Um grupo literal, como `group="Action"`,
limita os imports ao grupo informado. Uma expressão dinâmica mantém os grupos
no bundle para permitir seleção durante a renderização.

O filtro recebe entradas
`{ pkg, name, group, target, component }`. O comparador ordena a lista filtrada.
`workspace` e as demais props de apresentação são encaminhadas ao componente.
O snippet `children(item, renderItem)` permite envolver cada item.

```svelte
<Slot group="Widget" {workspace} />

<ul>
  <Slot group="Action" filter={item => item.pkg !== 'legacy'} {workspace}>
    {#snippet children(item, renderItem)}
      <li data-target={item.target}>{@render renderItem()}</li>
    {/snippet}
  </Slot>
</ul>
```

`views/Index.svelte` e outras views sem grupo mantêm o endereçamento direto.
Para renderizar uma delas em outra view, use um import estático como
`import Index from 'logos-view:Auth:Index'`, com o nome da pasta do pacote.

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
