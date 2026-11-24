<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projeto

Programa do trabalho de BD do Integra (ver README). Regras obrigatórias:

- Arquitetura em camadas, com dependência só para baixo: `app/` (apresentação) → `src/aplicacao` (casos de uso e portas) → `src/dominio` (regras puras). `src/infra` implementa as portas; só `src/infra/container.ts` instancia implementações.
- O esquema oficial é `db/01-esquema.sql`; `src/infra/banco/esquema.ts` só espelha (gerado com `npx drizzle-kit pull`). Não usar migrations do Drizzle.
- Telas seguem os protótipos da seção 4 do documento de BD; regras citam o ID (RN03, RN05…) nos comentários e mensagens.
- Código e textos em português.
