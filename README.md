# @thinkiac/module-svelte

Motor Svelte 5 reutilizável para Runtime/Lógos: SSR, hidratação, cache de
bundles, páginas `.svx`, widgets, Tailwind opcional e HMR com validação antes
da publicação.

```js
const { SvelteEngine } = require('@thinkiac/module-svelte');

const engine = new SvelteEngine('.svelte-cache');
const html = await engine.render(
  '/workspace/packages/blog/views/Index.svelte',
  'blog__Index',
  {},
  '/workspace/packages',
);
```

`svelte`, `esbuild` e `esbuild-svelte` são dependências do módulo. O compilador
e o runtime de SSR/hidratação usam Svelte 5, com a API de componentes legada
habilitada para preservar os consumidores existentes. O launcher Lógos pode
ser instalado sem este módulo em hosts que não oferecem views.

O módulo também exporta `mountPackageViews(container, pkg, adapters)`, que
registra as rotas de páginas e o cache no mount HTTP fornecido pelo host. Os
adaptadores fornecem o motor, a resolução de páginas públicas e privadas, a
renderização e o middleware estático. O host continua responsável por aplicar
a autorização antes dessas rotas e por normalizar aliases de URL.


## Instalação e composição

```sh
npm install ThinkIac/svelte#main
```

O nome instalado é **`@thinkiac/module-svelte`**; o pacote upstream `svelte` continua
uma dependência separada, fixada em `5.57.3`. Para reprodução, fixe um commit.

O provedor declarado é `views`, na fase `wire`, com dependência obrigatória de `http`
e ordenação opcional depois de `ws`. `prepare()` pré-aquece views e publica readiness;
`install()` monta rotas e eventos. A aplicação HTTP é resolvida quando utilizada.

Os fontes estão em `src/**/*.type`, compilados para `dist`. Fachadas CommonJS
preservam `lib/`, `runtime/` e `compat/`, além do entrypoint principal e dos tipos
TypeScript. Os caminhos duplicados em `runtime/` compartilham a implementação de
`lib/`. Helpers mecânicos foram preservados onde necessários para compatibilidade;
a conversão não promete redução de tamanho nem portabilidade fora do Node.

[Contratos](docs/contracts.md) · [Migração e validação](docs/migration.md)
