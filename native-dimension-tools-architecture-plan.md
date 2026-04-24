# Plano: Arquitetura Nativa para Tools de Dimensão no Illustrator

## Objetivo

Definir a arquitetura nativa necessária para o BIDSTOOLS suportar tools interativas de dimensão diretamente no canvas do Illustrator, com comportamento semelhante a ferramentas CAD leves:

- clicar numa tool;
- escolher geometria ou pontos;
- fazer `drag` para posicionar a cota;
- criar a medida com vínculo à geometria original;
- atualizar automaticamente a cota quando a geometria muda.

## Motivo para arquitetura nativa

O fluxo desejado para `by Line` e `by Points` não pode ser resolvido apenas com painel `CEP/HTML`.

Estas tools exigem:

- captura de cliques no canvas;
- hit testing sobre linhas e pontos;
- pré-visualização durante `drag`;
- criação da cota no `mouse up`;
- vínculo persistente entre cota e geometria fonte;
- atualização posterior quando a geometria for alterada.

Isto aponta para implementação como `custom tools` nativas do Illustrator.

## Escopo funcional

### Tools alvo

- `Horizontal Dimension - by Line`
- `Horizontal Dimension - by Points`
- `Vertical Dimension - by Line`
- `Vertical Dimension - by Points`
- `Diameter Dimension`
- `Radius Dimension`
- `Label`

### Foco da primeira arquitetura nativa

Fechar primeiro:

- `Horizontal Dimension - by Line`
- `Vertical Dimension - by Line`
- infraestrutura comum de vínculo e atualização

Depois expandir para:

- `by Points`
- `Diameter`
- `Radius`
- `Label`

## Arquitetura proposta

## 1. Camada de tool nativa

Cada tool de dimensão deve existir como uma `custom tool` nativa do Illustrator.

### Responsabilidades

- receber ativação da tool;
- gerir estado de interação;
- capturar alvo clicado;
- seguir o cursor durante `drag`;
- desenhar preview temporária;
- confirmar criação da cota ao terminar;
- cancelar com `Esc` ou mudança de tool.

### Estado mínimo da tool

- `idle`
- `awaiting-source`
- `dragging-offset`
- `committing`
- `cancelled`

## 2. Motor de seleção e hit testing

É necessária uma camada que consiga identificar de forma fiável a geometria alvo no canvas.

### Responsabilidades

- detetar a linha sob o cursor;
- distinguir entre linha válida e geometria não suportada;
- devolver identificador estável da entidade;
- devolver os pontos extremos da linha;
- suportar futura seleção de pontos para `by Points`.

### Regras iniciais

- na v1 nativa, `by Line` aceita apenas segmentos lineares simples;
- curvas e geometrias ambíguas ficam fora do primeiro corte;
- se o clique não apanhar uma linha válida, a tool deve ignorar ou mostrar feedback discreto.

## 3. Motor de preview interativo

Durante o `drag`, o utilizador deve ver uma pré-visualização da cota antes de confirmar.

### Responsabilidades

- calcular offset a partir da posição atual do cursor;
- desenhar preview temporária da linha de cota;
- desenhar `extension lines`;
- desenhar setas;
- desenhar texto da medida;
- respeitar cor, espessura, arrow size e font size do BIDSTOOLS.

### Regras

- preview não deve criar arte final;
- preview deve desaparecer ao cancelar;
- preview deve atualizar em tempo real sem deixar resíduos no documento.

## 4. Motor de criação de cota

Quando o utilizador larga o rato, o sistema cria a cota final.

### Responsabilidades

- criar grupo de dimensão numa layer técnica dedicada;
- desenhar entidades finais da cota;
- guardar metadata técnica no grupo;
- associar a cota à geometria fonte;
- registar orientação, offset e escala.

### Estrutura sugerida da cota

- grupo `dimension root`
- subgrupo `extension lines`
- subgrupo `dimension line`
- subgrupo `arrowheads`
- subgrupo `label text`

## 5. Sistema de metadata e vínculo

O vínculo entre geometria e cota deve ser persistente.

### Metadata mínima na cota

- `dimensionId`
- `dimensionKind`
- `orientation`
- `sourceObjectId`
- `sourceSegmentId`
- `sourcePointA`
- `sourcePointB`
- `offsetDistance`
- `scaleMode`
- `scaleDefinition`
- `style.lineColor`
- `style.textColor`
- `style.fontSize`
- `style.strokeWidth`
- `style.arrowSize`

### Metadata opcional no objeto fonte

- lista de `dimensionIds` associados;
- tags BIDSTOOLS para facilitar refresh inverso.

## 6. Sistema de atualização

Quando a geometria original muda, a cota deve reconstruir-se.

### Estratégia

- identificar alterações relevantes no documento;
- localizar cotas ligadas ao objeto alterado;
- recalcular pontos extremos;
- recalcular offset;
- atualizar geometria da cota;
- atualizar texto da medida.

### Eventos a considerar

- transformação;
- scale;
- move;
- edição de path points;
- delete da geometria fonte.

### Regras de robustez

- se a geometria fonte deixar de existir, a cota deve ficar marcada como `broken link`;
- se o segmento original deixar de ser válido, o sistema deve sinalizar que a cota precisa de reattach;
- updates não devem duplicar cotas.

## 7. Serviço de rebuild

Além de atualização automática, deve existir um serviço explícito de rebuild.

### Ações recomendadas

- `Refresh Linked Dimensions`
- `Rebuild Selected Dimension`
- `Reattach Dimension Source`

### Utilidade

- recuperar de falhas;
- reprocessar cotas após operações complexas;
- simplificar debugging.

## 8. Integração com o painel BIDSTOOLS

O painel CEP continua útil mesmo com tools nativas.

### Papel do painel

- escolher escala ativa;
- configurar estilos;
- mostrar settings da tool;
- mostrar estado da seleção;
- expor comandos de refresh/rebuild;
- servir de fallback administrativo.

### Contrato entre painel e tool nativa

- a tool lê defaults atuais do BIDSTOOLS;
- a tool grava metadata compatível com o painel;
- o painel consegue inspecionar e editar settings de cotas existentes.

## Fluxo: Horizontal Dimension - by Line

1. utilizador ativa a tool nativa;
2. tool entra em `awaiting-source`;
3. utilizador clica numa linha horizontal ou num segmento suportado;
4. sistema resolve `sourceObjectId` e `sourceSegmentId`;
5. tool entra em `dragging-offset`;
6. utilizador move o cursor para definir a distância da cota;
7. preview atualiza em tempo real;
8. utilizador larga o rato;
9. sistema cria a cota final;
10. metadata é gravada;
11. cota fica vinculada à linha fonte.

## Fluxo: Vertical Dimension - by Line

Mesmo fluxo do horizontal, mas com orientação vertical.

## Fluxo futuro: by Points

1. ativar tool;
2. clicar no primeiro ponto;
3. clicar no segundo ponto;
4. fazer `drag` para escolher offset;
5. criar cota;
6. guardar pontos fonte e vínculo.

## Estrutura técnica sugerida no projeto

```text
native/
  sdk/
    tools/
      horizontal-dimension-line-tool/
      vertical-dimension-line-tool/
      horizontal-dimension-points-tool/
      vertical-dimension-points-tool/
      radius-dimension-tool/
      diameter-dimension-tool/
      label-tool/
    core/
      hit-testing/
      preview/
      dimension-builder/
      dimension-linking/
      dimension-refresh/
      metadata/
      scale/
      style/
    bridge/
      panel-sync/
    docs/
      integration-notes.md
```

## Estrutura de ficheiros recomendada

```text
native/
  sdk/
    plugin-main/
      plugin-entry.cpp
      tool-registry.cpp
      tool-registry.h
      notifier-registry.cpp
      notifier-registry.h
    tools/
      horizontal-dimension-line-tool.cpp
      horizontal-dimension-line-tool.h
      vertical-dimension-line-tool.cpp
      vertical-dimension-line-tool.h
      horizontal-dimension-points-tool.cpp
      horizontal-dimension-points-tool.h
      vertical-dimension-points-tool.cpp
      vertical-dimension-points-tool.h
    core/
      contracts/
        dimension-types.h
        dimension-payloads.h
        dimension-metadata-schema.h
      hit-testing/
        line-hit-test.cpp
        line-hit-test.h
        point-hit-test.cpp
        point-hit-test.h
      interaction/
        tool-session.cpp
        tool-session.h
        drag-preview-state.cpp
        drag-preview-state.h
      preview/
        preview-renderer.cpp
        preview-renderer.h
      dimension-builder/
        dimension-geometry.cpp
        dimension-geometry.h
        dimension-art-factory.cpp
        dimension-art-factory.h
      dimension-linking/
        source-resolver.cpp
        source-resolver.h
        dimension-link-store.cpp
        dimension-link-store.h
      dimension-refresh/
        dimension-rebuilder.cpp
        dimension-rebuilder.h
        document-change-router.cpp
        document-change-router.h
      metadata/
        metadata-reader.cpp
        metadata-reader.h
        metadata-writer.cpp
        metadata-writer.h
      scale/
        native-scale-resolver.cpp
        native-scale-resolver.h
      style/
        style-resolver.cpp
        style-resolver.h
    bridge/
      panel-sync/
        panel-settings-provider.cpp
        panel-settings-provider.h
    docs/
      integration-notes.md
      metadata-examples.json
```

## Contratos de dados

## 1. `DimensionToolKind`

Enum lógico para todas as tools suportadas.

```json
{
  "horizontalLine": "horizontalLine",
  "verticalLine": "verticalLine",
  "horizontalPoints": "horizontalPoints",
  "verticalPoints": "verticalPoints",
  "diameter": "diameter",
  "radius": "radius",
  "label": "label"
}
```

## 2. `DimensionOrientation`

```json
{
  "horizontal": "horizontal",
  "vertical": "vertical",
  "radial": "radial",
  "free": "free"
}
```

## 3. `DimensionStyle`

Style resolvido no momento de criação da cota.

```json
{
  "lineColor": "#ff2a2a",
  "textColor": "#ff2a2a",
  "fontSize": 10,
  "strokeWidth": 0.75,
  "arrowSize": 7
}
```

## 4. `ScaleDefinition`

```json
{
  "mode": "document",
  "label": "1:1",
  "drawnUnit": "mm",
  "realUnit": "m",
  "drawnValue": 1,
  "realValue": 0.001,
  "factorLinear": 0.001,
  "factorArea": 0.000001
}
```

## 5. `LineSourceRef`

Referência persistente à geometria fonte da cota `by Line`.

```json
{
  "sourceObjectId": "ai-object-123",
  "sourceSegmentId": "seg-2",
  "sourcePathIndex": 0,
  "pointA": { "x": 12.0, "y": 44.0 },
  "pointB": { "x": 120.0, "y": 44.0 }
}
```

## 6. `PointsSourceRef`

Referência persistente à geometria fonte da cota `by Points`.

```json
{
  "sourceObjectId": "ai-object-123",
  "pointA": { "x": 12.0, "y": 44.0 },
  "pointB": { "x": 120.0, "y": 44.0 },
  "pointAIndex": 0,
  "pointBIndex": 3
}
```

## 7. `DimensionPlacement`

Representa a decisão do utilizador durante o `drag`.

```json
{
  "offsetDistance": 24.0,
  "textAnchor": { "x": 66.0, "y": 68.0 },
  "dimensionLineStart": { "x": 12.0, "y": 68.0 },
  "dimensionLineEnd": { "x": 120.0, "y": 68.0 }
}
```

## 8. `DimensionRecord`

Payload central da cota criada.

```json
{
  "dimensionId": "dim-0001",
  "kind": "horizontalLine",
  "orientation": "horizontal",
  "source": {
    "sourceObjectId": "ai-object-123",
    "sourceSegmentId": "seg-2",
    "sourcePathIndex": 0,
    "pointA": { "x": 12.0, "y": 44.0 },
    "pointB": { "x": 120.0, "y": 44.0 }
  },
  "placement": {
    "offsetDistance": 24.0,
    "textAnchor": { "x": 66.0, "y": 68.0 },
    "dimensionLineStart": { "x": 12.0, "y": 68.0 },
    "dimensionLineEnd": { "x": 120.0, "y": 68.0 }
  },
  "scale": {
    "mode": "document",
    "label": "1:1",
    "drawnUnit": "mm",
    "realUnit": "m",
    "drawnValue": 1,
    "realValue": 0.001,
    "factorLinear": 0.001,
    "factorArea": 0.000001
  },
  "style": {
    "lineColor": "#ff2a2a",
    "textColor": "#ff2a2a",
    "fontSize": 10,
    "strokeWidth": 0.75,
    "arrowSize": 7
  },
  "liveLink": {
    "enabled": true,
    "status": "linked"
  }
}
```

## 9. `DimensionMetadata`

Schema mínimo a gravar no grupo de arte da cota.

```json
{
  "bidstools": {
    "type": "dimension",
    "version": 1,
    "dimensionId": "dim-0001",
    "kind": "horizontalLine",
    "orientation": "horizontal",
    "sourceObjectId": "ai-object-123",
    "sourceSegmentId": "seg-2",
    "offsetDistance": 24.0,
    "scaleMode": "document",
    "scaleDefinition": "1:1",
    "style.lineColor": "#ff2a2a",
    "style.textColor": "#ff2a2a",
    "style.fontSize": 10,
    "style.strokeWidth": 0.75,
    "style.arrowSize": 7,
    "linkStatus": "linked"
  }
}
```

## Contratos entre módulos

## 1. `ToolSession`

Controla o estado da interação da tool ativa.

### Entrada

- ativação da tool;
- eventos de `mouseDown`, `mouseDrag`, `mouseUp`, `cancel`.

### Saída

- `SourceCandidate`
- `PlacementPreview`
- `DimensionCommitRequest`

## 2. `LineHitTestService`

Resolve a linha clicada pelo utilizador.

### Função esperada

- `hitTestLineAtCursor(cursorPosition, documentContext) -> LineSourceRef | null`

## 3. `PreviewRenderer`

Desenha a preview temporária.

### Funções esperadas

- `showPreview(previewPayload)`
- `updatePreview(previewPayload)`
- `clearPreview()`

## 4. `DimensionBuilder`

Transforma `source + placement + style + scale` em arte final.

### Funções esperadas

- `buildDimensionRecord(input) -> DimensionRecord`
- `createDimensionArt(record) -> CreatedDimensionArt`

## 5. `DimensionLinkStore`

Responsável por ler e escrever metadata de vínculo.

### Funções esperadas

- `writeDimensionMetadata(groupRef, dimensionRecord)`
- `readDimensionMetadata(groupRef) -> DimensionMetadata`
- `attachDimensionToSource(sourceRef, dimensionId)`
- `findDimensionsBySource(sourceObjectId) -> dimensionId[]`

## 6. `DimensionRebuilder`

Reconstrói cotas após mudança da geometria.

### Funções esperadas

- `rebuildDimension(dimensionId)`
- `rebuildDimensionsForSource(sourceObjectId)`
- `markBrokenLink(dimensionId, reason)`

## 7. `PanelSettingsProvider`

Expõe ao lado nativo os settings atuais escolhidos no painel BIDSTOOLS.

### Funções esperadas

- `getCurrentScaleDefinition() -> ScaleDefinition`
- `getCurrentDimensionStyle() -> DimensionStyle`
- `getDefaultLabelText() -> string`

## Payloads operacionais

## 1. `DimensionCommitRequest`

```json
{
  "kind": "horizontalLine",
  "orientation": "horizontal",
  "source": {
    "sourceObjectId": "ai-object-123",
    "sourceSegmentId": "seg-2",
    "sourcePathIndex": 0,
    "pointA": { "x": 12.0, "y": 44.0 },
    "pointB": { "x": 120.0, "y": 44.0 }
  },
  "placement": {
    "offsetDistance": 24.0,
    "textAnchor": { "x": 66.0, "y": 68.0 },
    "dimensionLineStart": { "x": 12.0, "y": 68.0 },
    "dimensionLineEnd": { "x": 120.0, "y": 68.0 }
  },
  "scale": {
    "mode": "document",
    "label": "1:1"
  },
  "style": {
    "lineColor": "#ff2a2a",
    "textColor": "#ff2a2a",
    "fontSize": 10,
    "strokeWidth": 0.75,
    "arrowSize": 7
  }
}
```

## 2. `DimensionRefreshRequest`

```json
{
  "dimensionId": "dim-0001",
  "reason": "sourceGeometryChanged"
}
```

## Ownership sugerido por módulo

- developer 1: `tools/` e `interaction/`
- developer 2: `hit-testing/` e `dimension-builder/`
- developer 3: `metadata/`, `dimension-linking/` e `dimension-refresh/`
- developer 4: `bridge/panel-sync/` e contrato com o painel CEP

## Critérios de aceitação da Fase 1

- ativar `Horizontal Dimension - by Line` coloca a tool em modo de espera;
- clicar numa linha válida seleciona a fonte;
- fazer `drag` mostra preview da cota;
- largar cria a cota final;
- a cota grava metadata suficiente para rebuild;
- alterar a linha fonte permite atualizar a cota via comando de refresh;
- a escala `1:1` funciona por defeito;
- a cota respeita cor, font size, stroke weight e arrow size vindos do BIDSTOOLS.

## Fases de implementação

## Fase 1

- criar arquitetura base de tool nativa;
- implementar `Horizontal by Line`;
- implementar `Vertical by Line`;
- criar metadata persistente;
- criar cota vinculada;
- criar comando de rebuild manual.

## Fase 2

- adicionar preview mais polida;
- reagir a updates da geometria automaticamente;
- adicionar deteção de links quebrados;
- integrar melhor com painel BIDSTOOLS.

## Fase 3

- implementar `by Points`;
- implementar `Diameter` e `Radius`;
- adicionar `Label` contextual;
- melhorar UX de snapping e feedback.

## Riscos técnicos

- identificar um `sourceSegmentId` estável em paths editáveis;
- reagir bem a alterações profundas no path;
- garantir performance com muitas cotas vinculadas;
- manter compatibilidade entre metadata, painel e tools nativas;
- gerir preview temporária sem poluir o documento.

## Decisões recomendadas

- não tentar resolver `by Line` e `by Points` só com CEP;
- separar claramente `tool interaction`, `dimension creation` e `dimension refresh`;
- usar metadata rica desde o início;
- implementar primeiro vínculo robusto antes de expandir o número de tools;
- manter `1:1` como escala default do BIDSTOOLS.

## Resultado esperado

Uma base nativa para o BIDSTOOLS suportar tools reais de dimensão no Illustrator, com seleção no canvas, `drag` de posicionamento, vínculo à geometria e atualização automática da medida quando a linha original muda.
