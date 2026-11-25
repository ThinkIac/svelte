# Migração para LógosType

Os fontes editáveis estão em `src/**/*.type`; `npm run build` gera `dist/**/*.cjs`.
Os `.cjs` da raiz e dos caminhos públicos são fachadas para essa distribuição.
Não edite `dist` manualmente. O compilador [LogosType](https://github.com/ThinkIac/LogosType)
está fixado por commit no manifest e no lockfile. O artefato inclui `dist`, então
consumidores de produção não precisam carregar o compilador em execução.

Esta é uma migração de linguagem e distribuição, preservando API e semântica.
Comentários de registro continuam declarando os provedores ao Lógos.
A adaptação `createHost` vem de `@thinkiac/module-runtime-compat`, com referência
Git fixada. Não existe dependência `file:` de um diretório vizinho.

As referências originais imutáveis em `test/reference` permitem comparações de
comportamento. Elas não integram o artefato de produção. Os testes não demonstram
equivalência para todas as entradas possíveis.

## Validação

```sh
npm ci
npm test
npm run test:isolated
```

O teste isolado empacota, instala sem dependências de desenvolvimento em uma pasta
temporária e verifica a API pública sem `NODE_PATH`. Integração ao Lógos deve testar
também a composição completa, além da biblioteca.

## Plataforma

Node 18 ou superior para esta biblioteca. A distribuição ThinkIac pode exigir
uma versão superior. Usar `.type` não elimina dependências nativas: esta versão
não demonstra execução em QuickJS ou ESP32. Não há alteração deliberada de
funcionalidade nem adoção de uma nova API de eventos nesta migração.
