# Backlog Técnico: Native Dimension Tools

## Objetivo

Transformar a arquitetura nativa do BIDSTOOLS numa sequência concreta de implementação, com ordem recomendada, dependências e critérios de fecho por bloco.

## Princípios

- fechar primeiro o fluxo `by Line`;
- começar por `Horizontal` e depois reutilizar para `Vertical`;
- separar interação, criação de arte, metadata e refresh;
- evitar avançar para `by Points` antes de haver vínculo robusto;
- manter `1:1` como escala default.

## Ordem recomendada

1. base do plugin nativo
2. contratos e tipos
3. tool session
4. hit testing de linha
5. preview interativa
6. criação final da cota
7. metadata e link
8. refresh manual
9. refresh automático
10. vertical by line
11. integração com painel
12. by points

## Fase 0: Base de projeto nativo

### Tarefas

- criar pasta `native/`;
- criar estrutura inicial `sdk/plugin-main`, `tools`, `core`, `bridge`, `docs`;
- criar ficheiros placeholder para entrypoint, registry de tools e registry de notifiers;
- documentar dependências do SDK do Illustrator;
- definir convenção de nomes para tools, ids e metadata.

### Entregáveis

- árvore base do módulo nativo;
- ficheiro de notas de setup;
- convenção inicial de ids BIDSTOOLS.

### Dependências

- nenhuma.

### Critério de fecho

- a estrutura existe e está pronta para receber código funcional.

## Fase 1: Contratos e tipos centrais

### Tarefas

- criar `dimension-types.h`;
- criar `dimension-payloads.h`;
- criar `dimension-metadata-schema.h`;
- fechar enums para `kind`, `orientation`, `link status`;
- fechar structs para `DimensionStyle`, `ScaleDefinition`, `LineSourceRef`, `DimensionPlacement`, `DimensionRecord`.

### Entregáveis

- headers com contratos estáveis;
- exemplos JSON equivalentes em `docs/metadata-examples.json`.

### Dependências

- Fase 0.

### Critério de fecho

- os contratos permitem implementar tool, builder, metadata e refresh sem redefinir shapes.

## Fase 2: Tool registry e ativação

### Tarefas

- registar `Horizontal Dimension - by Line`;
- registar `Vertical Dimension - by Line`;
- definir ids internos das tools;
- garantir ativação e cancelamento básico;
- preparar mensagens de estado da tool.

### Entregáveis

- tool registry operacional;
- tools visíveis no ecossistema nativo do Illustrator.

### Dependências

- Fase 0;
- Fase 1.

### Critério de fecho

- as tools podem ser ativadas e entram em estado `awaiting-source`.

## Fase 3: Tool session e máquina de estados

### Tarefas

- criar `tool-session.h/.cpp`;
- implementar estados `idle`, `awaiting-source`, `dragging-offset`, `committing`, `cancelled`;
- ligar eventos de rato à sessão;
- suportar `Esc` para cancelar;
- limpar estado ao trocar de tool.

### Entregáveis

- motor de sessão reutilizável;
- transições de estado previsíveis.

### Dependências

- Fase 1;
- Fase 2.

### Critério de fecho

- a tool consegue entrar em espera, capturar o início do fluxo e sair sem lixo visual.

## Fase 4: Hit testing de linha

### Tarefas

- criar `line-hit-test.h/.cpp`;
- detetar linha ou segmento suportado sob o cursor;
- devolver `LineSourceRef`;
- validar apenas segmentos lineares simples na v1;
- rejeitar curvas e casos ambíguos.

### Entregáveis

- `LineHitTestService`;
- primeiro `source` estável para `by Line`.

### Dependências

- Fase 1;
- Fase 3.

### Critério de fecho

- clicar numa linha válida devolve fonte consistente;
- clicar fora de alvo válido não cria cota.

## Fase 5: Preview interativa

### Tarefas

- criar `preview-renderer.h/.cpp`;
- criar `drag-preview-state.h/.cpp`;
- desenhar preview temporária com linha de cota, linhas de extensão, setas e texto;
- atualizar preview em tempo real durante `drag`;
- limpar preview ao cancelar ou confirmar.

### Entregáveis

- preview fluida no canvas;
- cálculo inicial de `offsetDistance`.

### Dependências

- Fase 3;
- Fase 4.

### Critério de fecho

- ao fazer `drag`, o utilizador vê a cota antes do commit.

## Fase 6: Builder de geometria e arte final

### Tarefas

- criar `dimension-geometry.h/.cpp`;
- criar `dimension-art-factory.h/.cpp`;
- calcular `dimensionLineStart`, `dimensionLineEnd`, `textAnchor`;
- criar grupo final da cota;
- separar `extension lines`, `dimension line`, `arrowheads`, `label text`;
- aplicar escala e formatar valor.

### Entregáveis

- `DimensionBuilder`;
- criação final de `Horizontal by Line`.

### Dependências

- Fase 1;
- Fase 5.

### Critério de fecho

- `mouse up` cria cota final com layout técnico consistente.

## Fase 7: Metadata e link persistente

### Tarefas

- criar `metadata-reader.h/.cpp`;
- criar `metadata-writer.h/.cpp`;
- criar `dimension-link-store.h/.cpp`;
- gravar `DimensionMetadata` no grupo;
- associar `dimensionId` à fonte;
- persistir `offsetDistance`, `scaleDefinition` e `style`.

### Entregáveis

- metadata bidirecional;
- cota com link persistente.

### Dependências

- Fase 1;
- Fase 6.

### Critério de fecho

- a cota criada pode ser identificada, lida e reconstruída a partir das tags.

## Fase 8: Refresh manual

### Tarefas

- criar `dimension-rebuilder.h/.cpp`;
- criar comando `Refresh Linked Dimensions`;
- criar comando `Rebuild Selected Dimension`;
- recalcular geometria a partir da fonte;
- atualizar texto e arte existente sem duplicação.

### Entregáveis

- rebuild explícito;
- recuperação manual de cotas ligadas.

### Dependências

- Fase 7.

### Critério de fecho

- depois de alterar a linha fonte, o comando de refresh atualiza a cota corretamente.

## Fase 9: Refresh automático

### Tarefas

- criar `document-change-router.h/.cpp`;
- criar `notifier-registry.h/.cpp`;
- mapear mudanças relevantes do documento;
- localizar dimensões afetadas;
- disparar rebuild automático;
- marcar `broken link` quando necessário.

### Entregáveis

- atualização automática;
- deteção básica de links quebrados.

### Dependências

- Fase 8.

### Critério de fecho

- mover ou editar a linha fonte atualiza a cota sem comando manual.

## Fase 10: Vertical by Line

### Tarefas

- reutilizar a infraestrutura de `Horizontal by Line`;
- adaptar cálculo de orientação;
- adaptar preview e arte final;
- validar texto rotacionado e setas verticais.

### Entregáveis

- `Vertical Dimension - by Line` funcional.

### Dependências

- Fase 6;
- Fase 7;
- Fase 8.

### Critério de fecho

- vertical funciona com a mesma robustez do horizontal.

## Fase 11: Integração com painel BIDSTOOLS

### Tarefas

- criar `panel-settings-provider.h/.cpp`;
- ler escala ativa do painel;
- ler `lineColor`, `textColor`, `fontSize`, `strokeWidth`, `arrowSize`;
- suportar defaults e fallback para `1:1`;
- expor comandos de refresh no painel.

### Entregáveis

- contrato estável entre painel CEP e tool nativa;
- settings da UI aplicados na tool nativa.

### Dependências

- Fase 1;
- Fase 6.

### Critério de fecho

- a tool nativa usa os mesmos defaults visíveis no BIDSTOOLS.

## Fase 12: Horizontal/Vertical by Points

### Tarefas

- criar `point-hit-test.h/.cpp`;
- implementar clique no primeiro ponto;
- implementar clique no segundo ponto;
- reutilizar preview com `drag`;
- criar metadata específica para pontos;
- suportar rebuild a partir de índices ou refs persistentes.

### Entregáveis

- `Horizontal Dimension - by Points`;
- `Vertical Dimension - by Points`.

### Dependências

- Fase 3;
- Fase 5;
- Fase 7;
- Fase 8.

### Critério de fecho

- a cota é definida por dois pontos e offset de drag, com vínculo persistente.

## Fase 13: Radial e Label

### Tarefas

- implementar `Diameter Dimension`;
- implementar `Radius Dimension`;
- implementar `Label`;
- integrar com mesmo sistema de style, metadata e refresh quando aplicável.

### Entregáveis

- family completa de tools base.

### Dependências

- Fase 6;
- Fase 7;
- Fase 11.

### Critério de fecho

- todas as tools principais partilham a mesma base nativa.

## Dependências críticas

- sem `metadata schema` fechada, não vale avançar para `refresh`;
- sem `tool session`, não vale avançar para `preview`;
- sem `preview`, a UX de `drag` fica incompleta;
- sem `link store`, não existe atualização real da cota;
- sem `panel settings provider`, a tool nativa fica desalinhada do BIDSTOOLS.

## Primeira slice recomendada

### Meta

Entregar um primeiro fluxo completo mínimo:

- `Horizontal Dimension - by Line`
- clique numa linha;
- `drag` de offset;
- preview;
- commit;
- metadata;
- refresh manual.

### Ordem interna

1. Fase 0
2. Fase 1
3. Fase 2
4. Fase 3
5. Fase 4
6. Fase 5
7. Fase 6
8. Fase 7
9. Fase 8

## Critérios de pronto para testar

- tool aparece como tool nativa;
- o utilizador consegue clicar numa linha válida;
- o `drag` mostra preview correta;
- a cota final é criada na layer técnica;
- a medida respeita a escala ativa;
- cor e tamanho de texto respeitam os defaults;
- a cota guarda link persistente;
- refresh manual reconstrói após editar a linha.

## Resultado esperado

Um backlog claro para sair de documentação e entrar em implementação da arquitetura nativa, com prioridade correta no fluxo `by Line` e base reutilizável para `by Points`, `Radius`, `Diameter` e `Label`.
