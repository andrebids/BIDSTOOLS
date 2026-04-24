# Especificação MVP: plugin simples de medição para Adobe Illustrator

## Objetivo do MVP

Construir um plugin simples para Illustrator, inspirado na necessidade coberta por ferramentas como `CadTools`, mas reduzido ao essencial:

- escolher escala por documento ou por layer;
- mostrar medições reais da seleção;
- permitir editar medidas básicas no painel;
- criar cotas simples sobre o objeto;
- guardar vínculo mínimo entre objeto e cota.

O MVP deve ser pequeno, previsível e rápido de manter.

## Decisão de produto

### O que o MVP é

- uma ferramenta de **medição e cotagem leve**;
- focada em objetos simples;
- adequada para layouts, sinalética, desenho técnico leve e preparação gráfica.

### O que o MVP não é

- não é um clone de `CadTools`;
- não é CAD paramétrico;
- não tenta suportar todos os tipos de arte do Illustrator na v1;
- não altera os painéis nativos do Illustrator.

## Stack recomendada

### Tecnologia

- `CEP` para o painel UI;
- `HTML/CSS/JavaScript` para interface;
- `CSInterface.js` para ponte UI -> host;
- `ExtendScript (.jsx)` para automação no Illustrator.

### Motivo

- menor custo de implementação;
- acesso suficiente à seleção, layers, bounds, texto, paths e tags;
- bom encaixe para um MVP de painel com ações sobre a seleção.

## Escopo funcional da v1

### 1. Escalas

#### Incluído

- modo `Document-based`;
- modo `Layer-based`;
- preset `1:1`;
- preset custom com formato:
  - `38 mm = 1 m`
  - `50 mm = 1 m`
  - `100 mm = 1 m`
- visualização da escala ativa aplicada à seleção.

#### Regra

- se estiver em `Layer-based`, usa a escala da layer do objeto;
- se não existir, usa a escala default do documento;
- fallback final: `1:1`.

### 2. Leitura da seleção

#### Incluído

- leitura de 1 objeto selecionado;
- mostrar:
  - tipo;
  - nome da layer;
  - X;
  - Y;
  - W;
  - H;
  - perímetro;
  - área;
  - escala aplicada.

#### Objetos suportados na v1

- `PathItem` simples;
- retângulos e quadrados;
- objetos sem clipping mask;
- grupos simples apenas se o Illustrator devolver bounds consistentes.

#### Fora da v1

- múltiplas seleções com cálculo agregado;
- compound paths complexos;
- clipping groups;
- objetos com resultados ambíguos por efeitos visuais.

### 3. Edição de medidas

#### Incluído

- editar `X`, `Y`, `W`, `H`;
- botão/ícone `lock proportions`;
- atualização do objeto ao confirmar o campo;
- conversão entre medida real e pontos internos do Illustrator.

#### Regras

- `W` e `H` editam tamanho;
- `X` e `Y` editam posição;
- com `lock proportions` ativo, alterar `W` recalcula `H`, e vice-versa.

#### Fora da v1

- edição por rotação;
- scale `%`;
- shear;
- transformações avançadas.

### 4. Cotas

#### Incluído

- `Horizontal Dimension`;
- `Vertical Dimension`;
- `Dimension Around Object` opcional se couber no prazo;
- criação automática de:
  - linha principal;
  - extensões;
  - texto da medida;
  - grupo de cota numa layer própria.

#### Estrutura

- layer de saída: `BIDSTOOLS_DIMENSIONS`;
- cada cota criada como `GroupItem`.

#### Fora da v1

- cota angular;
- cota radial;
- cota entre dois pontos arbitrários;
- estilos múltiplos de seta;
- cotagem automática em massa.

### 5. Persistência

#### Incluído

- guardar metadados mínimos em `tags`;
- guardar:
  - modo de escala;
  - fator de escala;
  - preset textual;
  - `uuid` do objeto, quando disponível;
  - identificador do grupo de cota gerado.

#### Objetivo

- permitir `Update Dimensions` no futuro;
- reabrir ficheiro sem perder contexto básico.

### 6. UI do painel

#### Incluído

- secção `Scale`;
- secção `Selection Info`;
- secção `Transform`;
- secção `Dimensions`;
- feedback de erro/estado vazio:
  - sem documento;
  - sem seleção;
  - objeto não suportado.

#### Fora da v1

- histórico;
- presets visuais complexos;
- temas;
- configuração avançada de tipografia/estilo.

## Escopo técnico fechado

### Inputs suportados

- documento Illustrator aberto;
- uma seleção ativa;
- unidades do documento existentes no Illustrator.

### Outputs gerados

- alteração de posição/tamanho do objeto;
- grupo visual de cota;
- tags no objeto e/ou grupo de cota;
- layer de cotagem.

## Regras geométricas da v1

### Unidade interna

- Illustrator trabalha em pontos;
- plugin converte pontos -> unidade visual -> unidade real.

### Fórmulas

- `fator_escala = medida_real / medida_desenhada`
- `perimetro_real = 2 * (w + h) * fator_escala`
- `area_real = (w * h) * fator_escala^2`

### Bounds

Na v1 usar:

- `geometricBounds` como base padrão.

Não usar na v1:

- `visibleBounds` como comportamento principal.

Motivo:

- reduz ambiguidades com stroke, efeitos e sombras.

## Restrições da v1

### Restrições funcionais

- apenas 1 objeto selecionado;
- foco em retângulos e paths simples;
- sem live sync permanente da seleção em tempo real fino;
- sem suporte completo a rotação.

### Restrições de UX

- o utilizador confirma alterações por enter/blur/click;
- não haverá comportamento 100% igual ao painel Transform nativo;
- cotas criadas são objetos Illustrator normais, não entidades paramétricas profundas.

## Arquitetura técnica

## 1. Painel CEP

Responsabilidade:

- renderizar UI;
- recolher input do utilizador;
- chamar funções host via `evalScript`;
- mostrar estado e respostas.

Ficheiros previstos:

- `client/index.html`
- `client/styles.css`
- `client/index.js`
- `client/CSInterface.js`

## 2. Bridge layer

Responsabilidade:

- serializar pedidos da UI;
- chamar funções ExtendScript;
- parsear resposta JSON/string.

Funções:

- `getSelectionInfo()`
- `setScaleMode(mode)`
- `setScalePreset(value)`
- `updateTransform(payload)`
- `createHorizontalDimension()`
- `createVerticalDimension()`
- `refreshPanelState()`

## 3. Host controller em ExtendScript

Responsabilidade:

- orquestração principal;
- validar documento e seleção;
- chamar motores auxiliares.

Ficheiro previsto:

- `host/index.jsx`

## 4. Scale engine

Responsabilidade:

- parse de escalas;
- conversão entre:
  - pontos Illustrator;
  - unidade do documento;
  - unidade real;
- resolver prioridade entre documento e layer.

Funções:

- `parseScaleText()`
- `getEffectiveScaleForItem()`
- `pointsToReal()`
- `realToPoints()`

## 5. Geometry engine

Responsabilidade:

- ler bounds;
- calcular W/H/perímetro/área;
- devolver pontos de ancoragem para cotas.

Funções:

- `getItemBounds()`
- `getRectMetrics()`
- `getDimensionAnchors()`

## 6. Transform engine

Responsabilidade:

- aplicar X/Y/W/H ao objeto;
- preservar proporções quando necessário.

Funções:

- `setWidth()`
- `setHeight()`
- `setPosition()`
- `resizeWithLock()`

## 7. Dimension renderer

Responsabilidade:

- criar a layer de cotas;
- desenhar linhas e texto;
- agrupar elementos;
- devolver referência ao grupo criado.

Funções:

- `ensureDimensionLayer()`
- `drawHorizontalDimension()`
- `drawVerticalDimension()`
- `createDimensionLabel()`

## 8. Metadata store

Responsabilidade:

- ler/escrever `tags`;
- manter vínculo simples entre objeto e cotas.

Funções:

- `setTag(item, key, value)`
- `getTag(item, key)`
- `attachDimensionMetadata()`

## Estrutura de dados sugerida

### Scale config

```json
{
  "mode": "document",
  "presetLabel": "38 mm = 1 m",
  "drawnUnit": "mm",
  "realUnit": "m",
  "drawnValue": 38,
  "realValue": 1,
  "factor": 26.315789
}
```

### Selection info

```json
{
  "supported": true,
  "type": "PathItem",
  "layerName": "Layer 1",
  "x": 0.15,
  "y": -0.11,
  "w": 0.06,
  "h": 0.06,
  "perimeter": 0.24,
  "area": 0.0036,
  "unit": "m",
  "scaleLabel": "1:1"
}
```

## UX do painel

### Bloco `Scale`

- radio `Document-based`
- radio `Layer-based`
- dropdown presets
- campo custom scale
- botão `Apply`

### Bloco `Selection`

- `Length / Perim / Area`
- `Scale`
- nome da layer
- estado de suporte

### Bloco `Transform`

- `X`
- `Y`
- `W`
- `H`
- `lock`
- botão `Update`

### Bloco `Dimensions`

- `Horizontal`
- `Vertical`
- `Create`
- `Clear last` opcional

## Critérios de aceitação da v1

### Escala

- utilizador consegue alternar entre `Document-based` e `Layer-based`;
- plugin interpreta `1:1` e pelo menos 1 escala custom tipo `38 mm = 1 m`;
- a escala ativa aparece no painel.

### Leitura

- ao selecionar um retângulo, o painel mostra `W`, `H`, perímetro e área;
- os valores reais respeitam a escala ativa.

### Edição

- alterar `W` ou `H` muda o tamanho do objeto;
- alterar `X` ou `Y` move o objeto;
- `lock proportions` funciona.

### Cotas

- criar uma cota horizontal gera linha + texto;
- criar uma cota vertical gera linha + texto;
- os elementos são criados numa layer dedicada.

### Robustez mínima

- sem seleção: painel não quebra;
- objeto não suportado: painel mostra mensagem clara;
- documento fechado: painel mostra estado vazio.

## Plano de implementação por semanas

## Semana 1: base técnica

Objetivo:

- scaffold CEP;
- manifest;
- painel básico;
- ponte `CSInterface`;
- comando de teste para ler documento e seleção.

Entrega:

- plugin abre no Illustrator;
- botão `Refresh` devolve dados básicos da seleção.

## Semana 2: escala e leitura geométrica

Objetivo:

- implementar scale engine;
- parse de `1:1` e `38 mm = 1 m`;
- leitura de `geometricBounds`;
- cálculo de `W`, `H`, perímetro e área para retângulos/paths simples.

Entrega:

- painel mostra medições corretas para seleção suportada.

## Semana 3: edição de transform

Objetivo:

- editar `X`, `Y`, `W`, `H`;
- lock proportions;
- validação de inputs;
- feedback de erro.

Entrega:

- utilizador altera posição e tamanho pelo painel.

## Semana 4: cotas básicas

Objetivo:

- criar layer de cotas;
- render horizontal e vertical;
- texto da medida;
- agrupamento dos elementos.

Entrega:

- cotas visíveis e consistentes para objetos simples.

## Semana 5: metadados e estabilização

Objetivo:

- guardar tags;
- refinar estados de erro;
- tratamento básico de objetos não suportados;
- testes manuais.

Entrega:

- MVP funcional e minimamente robusto.

## Semana 6: polimento e release interna

Objetivo:

- revisão UX;
- limpeza de código;
- empacotamento;
- checklist de instalação/teste.

Entrega:

- build candidata a uso interno.

## Backlog pós-MVP

- `Update Dimensions`
- cota por dois pontos
- rotação
- visible bounds vs geometric bounds
- múltiplos estilos de cota
- múltiplas seleções
- suporte melhor a groups/compound paths
- presets guardados por documento
- preferências de tipografia/cor/offset

## Decisão final

O MVP deve manter-se estritamente nestes 4 blocos:

1. `Scale`
2. `Selection Info`
3. `Transform`
4. `Dimensions`

Se o projeto crescer antes disto estar estável, começa a entrar no território do `CadTools`, e deixa de ser o produto simples que estás a pedir.

