# Integra · Cadastro de Atividades Complementares

Programa do trabalho de Banco de Dados (BSI, Ifes Campus Serra, 2026/2). Implementa o **UC01 — Gerenciar Atividades** do estudante sobre o banco do Integra:

- **Listar** as atividades do estudante, com filtro por situação e eixo (tela 4.2);
- **Incluir** uma atividade com comprovante, mostrando a unidade do tipo e a estimativa de pontos (tela 4.4);
- **Consultar** os dados, a pontuação, o comprovante e a avaliação de uma atividade;
- **Alterar** e **excluir** enquanto a atividade está "Cadastrada" (RN10);
- **Catálogo** dos tipos de atividade do PPC do estudante (tela 4.3).

Regras aplicadas no cadastro: pontos = unidades completas × pontos por unidade (RN03), teto por eixo na estimativa (RN02), nada antes do ingresso (RN04), comprovante repetido só se a atividade anterior foi rejeitada (RN05, por SHA-256), declaração de não uso em estágio ou extensão (RN06), só matrícula ativa cadastra (RF02) e o tipo tem que ser do PPC do estudante.

Ainda não há login (RF01): o estudante é escolhido no canto superior direito.

## Tecnologias

- [Next.js 16](https://nextjs.org) (App Router, React 19, Server Actions) e Tailwind CSS 4 — front e back no mesmo projeto;
- [Drizzle ORM](https://orm.drizzle.team) sobre o driver `pg`, com PostgreSQL (Aiven em produção);
- [Vercel Blob](https://vercel.com/docs/vercel-blob) (privado) para os arquivos dos comprovantes;
- Deploy na Vercel.

## Arquitetura em camadas

```
app/                  Apresentação: páginas, componentes, Server Actions e a rota do comprovante
src/application/      Aplicação: casos de uso (ServicoAtividades) e as portas (interfaces) que eles usam
src/domain/           Domínio: entidades e regras de negócio, em funções puras
src/infrastructure/   Infraestrutura: Drizzle/PostgreSQL, Blob/disco e a raiz de composição (container.ts)
db/                   Scripts do banco: 01-esquema.sql (criação) e 02-carga.sql (carga inicial)
```

As dependências só descem: `app` → `application` → `domain`. A `infrastructure` implementa as portas de `application/portas.ts`, e `infrastructure/container.ts` é o único lugar que liga cada porta à sua implementação. Trocar o banco ou o armazenamento não mexe no serviço nem nas regras. As regras do domínio também rodam no navegador: a estimativa do formulário usa as mesmas funções que o servidor usa para validar.

Para crescer: um novo caso de uso (por exemplo, UC04 Solicitar Avaliação) ganha um serviço em `src/application`, as regras em `src/domain`, os métodos de repositório em `src/infrastructure` e as telas em `app/`.

## Como rodar localmente

Requisitos: Node.js 20+ e Docker (ou outro PostgreSQL).

```bash
npm install
docker compose up -d          # PostgreSQL 17 com db/01-esquema.sql e db/02-carga.sql já aplicados
cp .env.example .env.local    # a URL padrão já aponta para o banco do docker compose
npm run dev                   # http://localhost:3000
```

Sem `BLOB_READ_WRITE_TOKEN`, os comprovantes vão para a pasta `comprovantes-locais/`. Os comprovantes da carga inicial são fictícios: só os arquivos enviados pelo programa abrem.

Para recriar o banco do zero: `docker compose down -v && docker compose up -d`.

## Deploy (Vercel + Aiven)

1. **Banco no Aiven:** crie um serviço PostgreSQL, copie a *Service URI* e baixe o *CA certificate*. Aplique os scripts:
   ```bash
   psql "<SERVICE_URI>" -f db/01-esquema.sql
   psql "<SERVICE_URI>" -f db/02-carga.sql
   ```
2. **Blob:** no projeto da Vercel, em *Storage*, crie um Blob store e conecte ao projeto (isso cria `BLOB_READ_WRITE_TOKEN`).
3. **Variáveis de ambiente** na Vercel:
   - `DATABASE_URL`: a Service URI do Aiven;
   - `DATABASE_CA_CERT`: o conteúdo do `ca.pem` (pode colar com as quebras de linha ou com `\n`).
4. Faça o deploy (`vercel` ou pelo GitHub).

## Variáveis de ambiente

| Variável | Uso |
| :- | :- |
| `DATABASE_URL` | String de conexão do PostgreSQL. |
| `DATABASE_CA_CERT` | CA do Aiven (PEM). Com ela, a conexão usa TLS verificando o servidor. |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob. Sem ele, os arquivos ficam no disco local. |
