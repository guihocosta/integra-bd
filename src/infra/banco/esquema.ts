import { pgTable, foreignKey, unique, check, date, varchar, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const avaliacao = pgTable("avaliacao", {
	data: date(),
	resultado: varchar({ length: 50 }),
	justificativa: varchar({ length: 150 }),
	id: integer().primaryKey().notNull(),
	status: varchar({ length: 50 }).notNull(),
	atividadeId: integer("atividade_id").notNull(),
	avaliadorMatricula: varchar("avaliador_matricula", { length: 50 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.atividadeId],
			foreignColumns: [atividade.id],
			name: "fk_avaliacao_2"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.avaliadorMatricula],
			foreignColumns: [avaliador.matricula],
			name: "fk_avaliacao_3"
		}).onDelete("restrict"),
	unique("un_avaliacao_atividade").on(table.atividadeId),
	check("ck_avaliacao_resultado", sql`(resultado)::text = ANY ((ARRAY['APROVADA'::character varying, 'REJEITADA'::character varying])::text[])`),
	check("ck_avaliacao_status", sql`(((status)::text = 'EM_ANDAMENTO'::text) AND (data IS NULL) AND (resultado IS NULL)) OR (((status)::text = 'FINALIZADA'::text) AND (data IS NOT NULL) AND (resultado IS NOT NULL))`),
]);

export const ppc = pgTable("ppc", {
	data: date().notNull(),
	semestreAtivo: varchar("semestre_ativo", { length: 50 }).notNull(),
	id: integer().primaryKey().notNull(),
	pontosMinimos: integer("pontos_minimos").notNull(),
}, (table) => [
	check("ck_ppc_pontos", sql`pontos_minimos > 0`),
]);

export const eixo = pgTable("eixo", {
	id: integer().primaryKey().notNull(),
	descricao: varchar({ length: 150 }).notNull(),
	limitePontos: integer("limite_pontos").notNull(),
	ppcId: integer("ppc_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ppcId],
			foreignColumns: [ppc.id],
			name: "fk_eixo_2"
		}).onDelete("restrict"),
	check("ck_eixo_limite", sql`limite_pontos > 0`),
]);

export const tipoDeAtividade = pgTable("tipo_de_atividade", {
	id: integer().primaryKey().notNull(),
	descricao: varchar({ length: 150 }).notNull(),
	pontosPorUnidade: integer("pontos_por_unidade").notNull(),
	unidade: varchar({ length: 150 }).notNull(),
	exigeRelacaoCurso: boolean("exige_relacao_curso").notNull(),
	ativo: boolean().notNull(),
	eixoId: integer("eixo_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eixoId],
			foreignColumns: [eixo.id],
			name: "fk_tipo_de_atividade_2"
		}).onDelete("restrict"),
	check("ck_tipo_pontos", sql`pontos_por_unidade > 0`),
]);

export const estudante = pgTable("estudante", {
	matricula: varchar({ length: 50 }).primaryKey().notNull(),
	nome: varchar({ length: 150 }).notNull(),
	email: varchar({ length: 150 }).notNull(),
	dataIngresso: date("data_ingresso").notNull(),
	situacaoMatricula: varchar("situacao_matricula", { length: 50 }).notNull(),
	ppcId: integer("ppc_id").notNull(),
	servidorPedagogicoMatricula: varchar("servidor_pedagogico_matricula", { length: 50 }),
	dataLancamento: date("data_lancamento"),
}, (table) => [
	foreignKey({
			columns: [table.ppcId],
			foreignColumns: [ppc.id],
			name: "fk_estudante_2"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.servidorPedagogicoMatricula],
			foreignColumns: [servidorPedagogico.matricula],
			name: "fk_estudante_3"
		}).onDelete("restrict"),
	check("ck_estudante_lancamento", sql`(servidor_pedagogico_matricula IS NULL) = (data_lancamento IS NULL)`),
]);

export const servidorPedagogico = pgTable("servidor_pedagogico", {
	matricula: varchar({ length: 50 }).primaryKey().notNull(),
	nome: varchar({ length: 150 }).notNull(),
});

export const avaliador = pgTable("avaliador", {
	setor: varchar({ length: 50 }).notNull(),
	nome: varchar({ length: 150 }).notNull(),
	matricula: varchar({ length: 50 }).primaryKey().notNull(),
	email: varchar({ length: 150 }).notNull(),
	ativo: boolean().notNull(),
});

export const mandato = pgTable("mandato", {
	dataInicio: date("data_inicio").notNull(),
	dataFim: date("data_fim"),
	avaliadorMatricula: varchar("avaliador_matricula", { length: 50 }).notNull(),
	id: integer().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.avaliadorMatricula],
			foreignColumns: [avaliador.matricula],
			name: "fk_mandato_2"
		}).onDelete("restrict"),
	check("ck_mandato_datas", sql`data_fim >= data_inicio`),
]);

export const janelaDeAvaliacao = pgTable("janela_de_avaliacao", {
	semestre: varchar({ length: 50 }).notNull(),
	dataInicio: date("data_inicio").notNull(),
	dataFim: date("data_fim").notNull(),
	id: integer().primaryKey().notNull(),
	mandatoId: integer("mandato_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.mandatoId],
			foreignColumns: [mandato.id],
			name: "fk_janela_de_avaliacao_2"
		}).onDelete("restrict"),
	check("ck_janela_datas", sql`data_fim >= data_inicio`),
]);

export const pedidoDeAvaliacao = pgTable("pedido_de_avaliacao", {
	id: integer().primaryKey().notNull(),
	dataAbertura: date("data_abertura").notNull(),
	dataConclusao: date("data_conclusao"),
	status: varchar({ length: 50 }).notNull(),
	estudanteMatricula: varchar("estudante_matricula", { length: 50 }).notNull(),
	janelaDeAvaliacaoId: integer("janela_de_avaliacao_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.estudanteMatricula],
			foreignColumns: [estudante.matricula],
			name: "fk_pedido_de_avaliacao_2"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.janelaDeAvaliacaoId],
			foreignColumns: [janelaDeAvaliacao.id],
			name: "fk_pedido_de_avaliacao_3"
		}).onDelete("restrict"),
	check("ck_pedido_status", sql`(status)::text = ANY ((ARRAY['ABERTO'::character varying, 'CONCLUIDO'::character varying, 'PENDENTE'::character varying])::text[])`),
	check("ck_pedido_datas", sql`data_conclusao >= data_abertura`),
]);

export const atividade = pgTable("atividade", {
	dataCadastro: date("data_cadastro").notNull(),
	declarouNaoUso: boolean("declarou_nao_uso").notNull(),
	status: varchar({ length: 50 }).notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "atividade_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	descricao: varchar({ length: 150 }).notNull(),
	dataInicio: date("data_inicio").notNull(),
	dataFim: date("data_fim").notNull(),
	quantidadeUnidades: integer("quantidade_unidades").notNull(),
	tipoDeAtividadeId: integer("tipo_de_atividade_id").notNull(),
	estudanteMatricula: varchar("estudante_matricula", { length: 50 }).notNull(),
	pedidoDeAvaliacaoId: integer("pedido_de_avaliacao_id"),
	tipoDeAtividadeConfirmadaId: integer("tipo_de_atividade_confirmada_id"),
	quantidadeConfirmada: integer("quantidade_confirmada"),
}, (table) => [
	foreignKey({
			columns: [table.tipoDeAtividadeId],
			foreignColumns: [tipoDeAtividade.id],
			name: "fk_atividade_2"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.estudanteMatricula],
			foreignColumns: [estudante.matricula],
			name: "fk_atividade_3"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.pedidoDeAvaliacaoId],
			foreignColumns: [pedidoDeAvaliacao.id],
			name: "fk_atividade_4"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.tipoDeAtividadeConfirmadaId],
			foreignColumns: [tipoDeAtividade.id],
			name: "fk_atividade_5"
		}).onDelete("restrict"),
	check("ck_atividade_status", sql`(status)::text = ANY ((ARRAY['CADASTRADA'::character varying, 'EM_AVALIACAO'::character varying, 'APROVADA'::character varying, 'REJEITADA'::character varying])::text[])`),
	check("ck_atividade_datas", sql`data_fim >= data_inicio`),
	check("ck_atividade_quantidade", sql`quantidade_unidades > 0`),
	check("ck_atividade_quantidade_confirmada", sql`quantidade_confirmada >= 0`),
]);

export const comprovante = pgTable("comprovante", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "comprovante_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	nomeArquivo: varchar("nome_arquivo", { length: 150 }).notNull(),
	hash: varchar({ length: 150 }).notNull(),
	pathArquivo: varchar("path_arquivo", { length: 150 }).notNull(),
	dataEnvio: date("data_envio").notNull(),
	atividadeId: integer("atividade_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.atividadeId],
			foreignColumns: [atividade.id],
			name: "fk_comprovante_2"
		}).onDelete("restrict"),
	unique("un_comprovante_atividade").on(table.atividadeId),
]);
