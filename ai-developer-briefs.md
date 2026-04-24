# Briefs prontos para developers IA

## Como usar

Cada secção abaixo pode ser copiada quase diretamente para um developer IA independente.

A ideia é:

- dar um escopo fechado;
- evitar overlap entre ficheiros;
- forçar critérios de aceitação objetivos;
- facilitar integração posterior.

## Brief 1: Arquitetura e bridge

### Objetivo

Preparar a base do plugin CEP para o resto dos módulos. A tua função é criar a infraestrutura de integração entre painel e host ExtendScript.

### Ownership de escrita

- `plugin/CSXS/manifest.xml`
- `plugin/client/bridge.js`
- `plugin/host/bootstrap.jsx`
- `plugin/host/index.jsx`

### Não editar

- qualquer ficheiro dentro de `plugin/host/core/`
- qualquer ficheiro em `plugin/client/ui/`

### Tarefas

- criar manifest mínimo do plugin CEP para Illustrator;
- criar bootstrap do host;
- criar bridge JS -> ExtendScript;
- definir funções públicas chamadas pela UI;
- devolver erros estruturados.

### Contrato mínimo

Funções bridge:

- `refreshSelection()`
- `applyTransform(payload)`
- `createHorizontalDimension()`
- `createVerticalDimension()`

### Critérios de aceitação

- painel consegue abrir;
- UI consegue invocar 1 função host com sucesso;
- erros vêm em formato consistente;
- os módulos core podem ser carregados pelo bootstrap.

### Testes manuais

- abrir painel;
- carregar botão de teste/refresco;
- confirmar resposta do host.

### Resposta esperada

- resumo do que foi implementado;
- ficheiros alterados;
- instruções de validação;
- limitações conhecidas.

## Brief 2: Motor de escala

### Objetivo

Implementar o motor de escala compatível com o modelo observado do CadTools.

### Ownership de escrita

- `plugin/host/core/scale.jsx`
- `plugin/host/core/format.jsx`
- `tests/manual/scale-tests.md`

### Não editar

- `manifest.xml`
- `bridge.js`
- `geometry.jsx`
- `selection.jsx`

### Fontes obrigatórias

- [cadtools-calculation-model.md](C:/Users/AndreGarcia/Documents/BIDSTOOLS/cadtools-calculation-model.md)
- [illustrator-plugin-mvp-spec.md](C:/Users/AndreGarcia/Documents/BIDSTOOLS/illustrator-plugin-mvp-spec.md)

### Tarefas

- implementar parse de `1:1`;
- implementar parse de `38 mm = 1 m`;
- implementar conversão linear;
- implementar conversão de área;
- implementar arredondamento apenas na apresentação;
- preparar API reutilizável.

### Funções públicas esperadas

- `parseScale(input)`
- `toRealLength(drawValue, scale)`
- `toRealArea(drawArea, scale)`
- `fromRealLength(realValue, scale)`
- `formatLength(value, unit, decimals)`
- `formatArea(value, unit, decimals)`

### Critérios de aceitação

- o caso `63,398 mm × 59,989 mm` com `38 mm = 1 m` devolve resultados compatíveis com o documento de cálculo;
- nenhuma dependência de UI;
- valores internos mantêm precisão.

### Testes manuais

- validar outputs documentados para `1:1`;
- validar outputs documentados para `38 mm = 1 m`.

## Brief 3: Seleção e geometria

### Objetivo

Ler a seleção do Illustrator e devolver um objeto consistente com a geometria necessária para o painel.

### Ownership de escrita

- `plugin/host/core/selection.jsx`
- `plugin/host/core/geometry.jsx`
- `plugin/host/core/guards.jsx`
- `tests/manual/selection-tests.md`

### Não editar

- `scale.jsx`
- `transform.jsx`
- `dimensions.jsx`
- `metadata.jsx`

### Tarefas

- validar documento aberto;
- validar seleção única;
- suportar `PathItem` simples e retângulos;
- ler `geometricBounds`, `width`, `height`, `position`;
- calcular perímetro e área desenhados;
- devolver erros claros.

### Funções públicas esperadas

- `getSelectionInfo()`
- `isSupportedSelection(item)`
- `getDrawMetrics(item)`

### Critérios de aceitação

- sem documento: erro claro;
- sem seleção: erro claro;
- múltipla seleção: erro claro;
- shape simples: dados corretos;
- não usar `visibleBounds` por default.

### Testes manuais

- documento vazio;
- sem seleção;
- retângulo simples;
- objeto não suportado.

## Brief 4: Transformações

### Objetivo

Aplicar transformações `X/Y/W/H` ao objeto selecionado usando os valores reais mostrados no painel.

### Ownership de escrita

- `plugin/host/core/transform.jsx`
- `tests/manual/transform-tests.md`

### Não editar

- `geometry.jsx`
- `selection.jsx`
- `dimensions.jsx`
- `metadata.jsx`

### Dependências funcionais

Usa os contratos já definidos por:

- bridge
- scale engine
- geometry/selection

### Tarefas

- converter valores reais para a unidade de desenho;
- alterar posição;
- alterar tamanho;
- suportar `lock proportions`.

### Funções públicas esperadas

- `updateTransform(payload)`
- `setPosition(payload)`
- `setSize(payload)`

### Critérios de aceitação

- editar `W` altera largura corretamente;
- editar `H` altera altura corretamente;
- editar `X/Y` move corretamente;
- lock proportions funciona.

### Testes manuais

- retângulo simples em `1:1`;
- retângulo simples em `38 mm = 1 m`.

## Brief 5: Cotas e metadata

### Objetivo

Criar cotas horizontais e verticais simples e guardar metadata mínima de vínculo.

### Ownership de escrita

- `plugin/host/core/dimensions.jsx`
- `plugin/host/core/metadata.jsx`
- `tests/manual/dimensions-tests.md`

### Não editar

- `transform.jsx`
- `selection.jsx`
- `geometry.jsx`
- `scale.jsx`

### Tarefas

- criar/garantir a layer `BIDSTOOLS_DIMENSIONS`;
- desenhar linha principal;
- desenhar witness lines;
- criar texto da medida;
- agrupar os elementos;
- guardar tags mínimas.

### Funções públicas esperadas

- `ensureDimensionLayer()`
- `createHorizontalDimension()`
- `createVerticalDimension()`
- `attachDimensionMetadata(baseItem, dimensionGroup)`

### Critérios de aceitação

- cota horizontal é criada;
- cota vertical é criada;
- vai para layer dedicada;
- metadata fica anexada.

### Testes manuais

- criar cota horizontal num retângulo;
- criar cota vertical no mesmo retângulo;
- verificar layer e tags.

## Brief 6: UI do painel

### Objetivo

Implementar a interface do plugin CEP com quatro blocos funcionais.

### Ownership de escrita

- `plugin/client/index.html`
- `plugin/client/styles.css`
- `plugin/client/index.js`
- `plugin/client/state.js`
- `plugin/client/ui/scale-panel.js`
- `plugin/client/ui/selection-panel.js`
- `plugin/client/ui/transform-panel.js`
- `plugin/client/ui/dimensions-panel.js`

### Não editar

- `manifest.xml`
- `bridge.js`
- qualquer ficheiro em `plugin/host/core/`

### Tarefas

- montar layout do painel;
- mostrar estados vazios e erros;
- mostrar geometria e escala;
- permitir editar `X/Y/W/H`;
- permitir criar cotas.

### Critérios de aceitação

- painel abre sem erros;
- mostra estado vazio sem seleção;
- mostra dados com seleção válida;
- botões disparam ações pela bridge.

### Testes manuais

- abrir painel;
- selecionar shape;
- refrescar;
- alterar `W/H`;
- criar cota.

## Brief 7: Instalação e release interna

### Objetivo

Preparar a release interna do plugin para distribuição a cerca de 11 utilizadores.

### Ownership de escrita

- `installer/`
- `docs/`
- `releases/`

### Não editar

- `plugin/client/`
- `plugin/host/core/`

### Fontes obrigatórias

- [illustrator-plugin-internal-release-strategy.md](C:/Users/AndreGarcia/Documents/BIDSTOOLS/illustrator-plugin-internal-release-strategy.md)

### Tarefas

- definir estrutura de release;
- criar setup base Windows;
- preparar instruções de instalação;
- preparar release notes;
- suportar update interno simples.

### Critérios de aceitação

- existe pacote beta instalável;
- existe instrução clara para utilizador final;
- existe versão identificável;
- existe plano de update manual.

### Testes manuais

- instalação em máquina limpa;
- update de versão;
- abertura do Illustrator e do painel.

## Regras gerais para todos os developers IA

- não mudar contratos públicos sem documentar;
- não editar ficheiros fora do scope;
- não reestruturar diretórios sem necessidade;
- se houver blocker, reportar em vez de improvisar arquitetura nova;
- devolver sempre lista de ficheiros alterados e passos de validação.

