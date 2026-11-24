-- Integra: carga inicial de dados

INSERT INTO ppc (id, data, semestre_ativo, pontos_minimos) VALUES
    (1, '2009-11-20', '2010/1', 15),
    (2, '2013-10-08', '2014/1', 15),
    (3, '2017-11-14', '2018/1', 15),
    (4, '2020-12-03', '2021/1', 15),
    (5, '2023-12-15', '2024/1', 15);

INSERT INTO eixo (id, descricao, limite_pontos, PPC_id) VALUES
    (1, 'Ensino', 10, 5),
    (2, 'Pesquisa', 10, 5),
    (3, 'Cultura e Sociedade', 10, 5),
    (4, 'Representação Estudantil', 10, 5),
    (5, 'Ensino', 8, 4),
    (6, 'Pesquisa e Extensão', 8, 4),
    (7, 'Ensino', 8, 3),
    (8, 'Ensino', 8, 2),
    (9, 'Ensino', 8, 1);

INSERT INTO tipo_de_atividade (id, descricao, unidade, pontos_por_unidade, exige_relacao_curso, ativo, EIXO_id) VALUES
    (1, 'Monitoria em disciplina do curso', 'semestre', 3, FALSE, TRUE, 1),
    (2, 'Curso de curta duração na área', '8 horas', 1, TRUE, TRUE, 1),
    (3, 'Iniciação científica', 'semestre', 5, FALSE, TRUE, 2),
    (4, 'Publicação de artigo em evento', 'artigo', 4, FALSE, TRUE, 2),
    (5, 'Participação em evento científico ou cultural', 'evento', 1, TRUE, TRUE, 3),
    (6, 'Organização de evento', 'evento', 2, FALSE, TRUE, 3),
    (7, 'Representação em colegiado ou órgão estudantil', 'semestre', 2, FALSE, TRUE, 4),
    (8, 'Participação em projeto de ensino', 'semestre', 2, FALSE, FALSE, 5),
    (9, 'Projeto de extensão', 'semestre', 2, FALSE, FALSE, 6),
    (10, 'Monitoria', 'semestre', 3, FALSE, FALSE, 7),
    (11, 'Monitoria', 'semestre', 3, FALSE, FALSE, 8),
    (12, 'Monitoria', 'semestre', 3, FALSE, FALSE, 9);

INSERT INTO servidor_pedagogico (matricula, nome) VALUES
    ('1102345', 'Patrícia Gomes Vieira'),
    ('1256789', 'André Luiz Batista'),
    ('1389012', 'Juliana Freitas Campos'),
    ('1567834', 'Sérgio Ramos Pinheiro'),
    ('1890456', 'Débora Cunha Mattos');

INSERT INTO estudante (matricula, nome, email, data_ingresso, situacao_matricula, PPC_id, SERVIDOR_PEDAGOGICO_matricula, data_lancamento) VALUES
    ('20211BSI0005', 'Rafael Costa Nunes', 'rafael.nunes@estudante.ifes.edu.br', '2021-02-08', 'FORMADO', 5, '1102345', '2025-10-06'),
    ('20221BSI0008', 'Lucas Ferreira Santos', 'lucas.santos@estudante.ifes.edu.br', '2022-02-07', 'ATIVA', 5, NULL, NULL),
    ('20221BSI0017', 'Pedro Henrique Alves', 'pedro.alves@estudante.ifes.edu.br', '2022-02-07', 'TRANCADA', 4, NULL, NULL),
    ('20221BSI0025', 'Bruno Oliveira Teixeira', 'bruno.teixeira@estudante.ifes.edu.br', '2022-02-07', 'ATIVA', 5, NULL, NULL),
    ('20231BSI0042', 'Marina Souza Lima', 'marina.lima@estudante.ifes.edu.br', '2023-02-06', 'ATIVA', 5, NULL, NULL),
    ('20241BSI0031', 'Ana Clara Ribeiro', 'ana.ribeiro@estudante.ifes.edu.br', '2024-02-05', 'ATIVA', 5, NULL, NULL);

INSERT INTO avaliador (matricula, nome, email, setor, ativo) VALUES
    ('1187653', 'Helena Castro Moraes', 'helena.moraes@ifes.edu.br', 'Coordenadoria de Informática', FALSE),
    ('1320984', 'Marcos Vinícius Teixeira', 'marcos.teixeira@ifes.edu.br', 'Coordenadoria de Informática', TRUE),
    ('1498237', 'Fernanda Lopes Barbosa', 'fernanda.barbosa@ifes.edu.br', 'Coordenadoria de Informática', TRUE),
    ('1734562', 'Carla Menezes Rocha', 'carla.rocha@ifes.edu.br', 'Coordenadoria de Informática', TRUE),
    ('2045118', 'Roberto Dias Fonseca', 'roberto.fonseca@ifes.edu.br', 'Coordenadoria de Informática', FALSE),
    ('3051276', 'Tiago Almeida Correia', 'tiago.correia@ifes.edu.br', 'Coordenadoria de Matemática', TRUE);

INSERT INTO mandato (id, data_inicio, data_fim, AVALIADOR_matricula) VALUES
    (1, '2017-02-01', '2019-01-31', '1187653'),
    (2, '2019-02-01', '2021-01-31', '1320984'),
    (3, '2021-02-01', '2023-01-31', '1498237'),
    (4, '2023-02-01', '2025-01-31', '2045118'),
    (5, '2025-02-01', NULL, '1734562');

INSERT INTO janela_de_avaliacao (id, semestre, data_inicio, data_fim, MANDATO_id) VALUES
    (1, '2024/2', '2024-09-16', '2024-10-04', 4),
    (2, '2025/1', '2025-03-10', '2025-03-28', 5),
    (3, '2025/2', '2025-09-15', '2025-10-03', 5),
    (4, '2026/1', '2026-03-09', '2026-03-27', 5),
    (5, '2026/2', '2026-09-14', '2026-10-02', 5);

INSERT INTO pedido_de_avaliacao (id, data_abertura, data_conclusao, status, ESTUDANTE_matricula, JANELA_DE_AVALIACAO_id) VALUES
    (1, '2025-09-16', '2025-09-30', 'CONCLUIDO', '20211BSI0005', 3),
    (2, '2026-03-10', '2026-03-20', 'CONCLUIDO', '20221BSI0008', 4),
    (3, '2026-03-10', '2026-03-20', 'PENDENTE', '20231BSI0042', 4),
    (4, '2026-09-15', NULL, 'ABERTO', '20231BSI0042', 5),
    (5, '2026-09-16', NULL, 'ABERTO', '20221BSI0025', 5);

INSERT INTO atividade (id, descricao, data_inicio, data_fim, data_cadastro, quantidade_unidades, declarou_nao_uso, status, ESTUDANTE_matricula, TIPO_DE_ATIVIDADE_id, TIPO_DE_ATIVIDADE_CONFIRMADA_id, quantidade_confirmada, PEDIDO_DE_AVALIACAO_id) VALUES
    (1, 'Iniciação científica: mineração de dados educacionais', '2023-08-01', '2024-07-31', '2024-08-05', 2, TRUE, 'APROVADA', '20211BSI0005', 3, NULL, NULL, 1),
    (2, 'Curso de Desenvolvimento Web com Django (40h)', '2024-01-08', '2024-01-19', '2024-02-01', 5, TRUE, 'APROVADA', '20211BSI0005', 2, NULL, NULL, 1),
    (3, 'Iniciação científica: visão computacional aplicada', '2024-08-01', '2025-07-31', '2025-08-04', 2, TRUE, 'APROVADA', '20221BSI0008', 3, NULL, NULL, 2),
    (4, 'Monitoria de Banco de Dados I', '2025-03-10', '2025-07-11', '2025-07-15', 1, TRUE, 'APROVADA', '20221BSI0008', 1, NULL, NULL, 2),
    (5, 'Representante discente no Colegiado do BSI', '2025-08-04', '2025-12-12', '2025-12-15', 1, TRUE, 'APROVADA', '20221BSI0008', 7, NULL, NULL, 2),
    (6, 'Monitoria de Programação I', '2024-03-04', '2024-12-13', '2024-12-16', 2, TRUE, 'APROVADA', '20231BSI0042', 1, NULL, NULL, 3),
    (7, 'Pôster na Jornada de Iniciação Científica do Ifes', '2025-10-22', '2025-10-23', '2025-10-27', 1, TRUE, 'APROVADA', '20231BSI0042', 4, 5, NULL, 3),
    (8, 'Curso de Docker e Kubernetes (40h)', '2025-07-14', '2025-07-25', '2025-08-01', 5, TRUE, 'REJEITADA', '20231BSI0042', 2, NULL, NULL, 3),
    (9, 'Iniciação científica: acessibilidade em sistemas web', '2026-02-02', '2026-07-31', '2026-08-03', 1, TRUE, 'EM_AVALIACAO', '20231BSI0042', 3, NULL, NULL, 4),
    (10, 'Representante de turma', '2025-08-04', '2026-07-10', '2026-07-13', 2, TRUE, 'EM_AVALIACAO', '20231BSI0042', 7, NULL, NULL, 4),
    (11, 'Iniciação científica: redes definidas por software', '2024-08-01', '2025-07-31', '2025-08-05', 2, TRUE, 'EM_AVALIACAO', '20221BSI0025', 3, NULL, NULL, 5),
    (12, 'Monitoria de Estrutura de Dados', '2025-03-10', '2025-12-12', '2025-12-15', 2, TRUE, 'EM_AVALIACAO', '20221BSI0025', 1, NULL, NULL, 5),
    (13, 'Semana de Informática do Ifes Serra 2025', '2025-10-20', '2025-10-24', '2025-10-27', 1, TRUE, 'CADASTRADA', '20241BSI0031', 5, NULL, NULL, NULL),
    (14, 'Curso de Git e GitHub (16h)', '2026-01-12', '2026-01-16', '2026-01-20', 2, TRUE, 'CADASTRADA', '20241BSI0031', 2, NULL, NULL, NULL);

INSERT INTO comprovante (id, nome_arquivo, path_arquivo, data_envio, hash, ATIVIDADE_id) VALUES
    (1, 'declaracao_ic_2023-2024.pdf', '/comprovantes/2024/1.pdf', '2024-08-05', 'b074626a519cf597e2535c5533aee5503299e2ae68d19533cbb40a546aeb81fb', 1),
    (2, 'certificado_django_40h.pdf', '/comprovantes/2024/2.pdf', '2024-02-01', '8bde642ede7f17e0d48b908027bc2a3c79ef7f14aec2aab86a1c8b1b2ebc9475', 2),
    (3, 'declaracao_ic_2024-2025.pdf', '/comprovantes/2025/3.pdf', '2025-08-04', '37de3892d6c16f1ae20afe0dad4ff0e1e312a68f566d23441d7f43e8dc5710bd', 3),
    (4, 'declaracao_monitoria_bd1.pdf', '/comprovantes/2025/4.pdf', '2025-07-15', '218a0243bb50a838edd3b37ce80e71ed333e96916460b30ee57498fe83a25d14', 4),
    (5, 'portaria_colegiado_2025-2.pdf', '/comprovantes/2025/5.pdf', '2025-12-15', '85bed6c6dfc3352a8ce5f4980bf2d467f8ce054d9d06b3d83095b8ed714bd62f', 5),
    (6, 'declaracao_monitoria_prog1.pdf', '/comprovantes/2024/6.pdf', '2024-12-16', 'eda8735a0ea60371084659a38c0eb26f83323a3bb1f98ae4c7c2b206b8206b26', 6),
    (7, 'certificado_jornada_ic_2025.pdf', '/comprovantes/2025/7.pdf', '2025-10-27', '57dbcb36d977aee6bc6fa0a44dafe87b1ab87a52be67081a66d1544baa17e0fd', 7),
    (8, 'certificado_docker_kubernetes.pdf', '/comprovantes/2025/8.pdf', '2025-08-01', 'bec83eabbb4a4029e2b374ecbea127f7d389c6b9dbe7d9bfd04fe5cacd080571', 8),
    (9, 'declaracao_ic_2026-1.pdf', '/comprovantes/2026/9.pdf', '2026-08-03', '70a9b5224a2d0668a1abe1a87f4e2430d2f4dd0beda50280ce8cc04786b19914', 9),
    (10, 'declaracao_representante_turma.pdf', '/comprovantes/2026/10.pdf', '2026-07-13', '0b259bb0427860acf4cca7c93d8db51fa4ff85c536ad58b53c9e745f8d3c8abe', 10),
    (11, 'declaracao_ic_redes.pdf', '/comprovantes/2025/11.pdf', '2025-08-05', 'bf26b8a5e14f5daff28e6a65ed0ba18566417d9a989dc6672a728898b553f441', 11),
    (12, 'declaracao_monitoria_ed.pdf', '/comprovantes/2025/12.pdf', '2025-12-15', '3668431b8d23bc3f88b31cf76cb52e2b376643e070111b4ff48472136e75def6', 12),
    (13, 'certificado_semana_informatica_2025.pdf', '/comprovantes/2025/13.pdf', '2025-10-27', 'ec0bb4aa1f26a1f0562261cb20e5b66b35581b8f4672611e6fd7a59eb0db38a7', 13),
    (14, 'certificado_git_github_16h.pdf', '/comprovantes/2026/14.pdf', '2026-01-20', 'f2e062314467756e8dcf1384f24d57cfb8ccf482ffbe6533ffc8e60c4cf40bbc', 14);

INSERT INTO avaliacao (id, data, resultado, justificativa, status, AVALIADOR_matricula, ATIVIDADE_id) VALUES
    (1, '2025-09-29', 'APROVADA', NULL, 'FINALIZADA', '1734562', 1),
    (2, '2025-09-29', 'APROVADA', NULL, 'FINALIZADA', '1734562', 2),
    (3, '2026-03-19', 'APROVADA', NULL, 'FINALIZADA', '1498237', 3),
    (4, '2026-03-19', 'APROVADA', NULL, 'FINALIZADA', '1498237', 4),
    (5, '2026-03-19', 'APROVADA', NULL, 'FINALIZADA', '1498237', 5),
    (6, '2026-03-18', 'APROVADA', NULL, 'FINALIZADA', '1734562', 6),
    (7, '2026-03-18', 'APROVADA', 'Certificado de apresentação de pôster, sem publicação de artigo. Tipo corrigido para participação em evento.', 'FINALIZADA', '1734562', 7),
    (8, '2026-03-19', 'REJEITADA', 'O certificado não identifica o estudante.', 'FINALIZADA', '3051276', 8),
    (9, NULL, NULL, NULL, 'EM_ANDAMENTO', '1734562', 9),
    (10, NULL, NULL, NULL, 'EM_ANDAMENTO', '1734562', 10),
    (11, NULL, NULL, NULL, 'EM_ANDAMENTO', '3051276', 11),
    (12, NULL, NULL, NULL, 'EM_ANDAMENTO', '3051276', 12);

-- os ids da carga foram informados à mão; acerta as sequências para as próximas inclusões
SELECT setval(pg_get_serial_sequence('atividade', 'id'), (SELECT MAX(id) FROM atividade));
SELECT setval(pg_get_serial_sequence('comprovante', 'id'), (SELECT MAX(id) FROM comprovante));
