# Estudo de viabilidade: plugin de medição e escala para Adobe Illustrator

## Objetivo

Criar um plugin/painel para Adobe Illustrator que permita:

- escolher a escala ativa por `Document-based` ou `Layer-based`;
- usar escalas como `1:1` e escalas técnicas customizadas, por exemplo `38 mm = 1 m`;
- ao selecionar um retângulo/quadrado ou outro objeto, mostrar:
  - perímetro;
  - área;
  - escala aplicada;
  - X, Y, W, H;
- alterar medidas diretamente no painel, de forma semelhante ao painel Transform;
- inserir cotas/medidas desenhadas sobre o objeto;
- opcionalmente guardar metadados de escala e cotagem no próprio objeto.

## Conclusão executiva

Sim, é tecnicamente possível.

A forma mais segura para um MVP hoje é um **painel HTML baseado em CEP + lógica host em ExtendScript**, porque:

- o Illustrator continua a suportar painéis HTML/JavaScript via CEP;
- o Illustrator expõe objetos do documento, layers, page items, bounds, width/height, tags e text frames para automação;
- já existe prova de mercado e prova técnica de extensões que fazem dimensionamento em Illustrator.

Para integração mais profunda com a UI nativa do Illustrator, ferramentas personalizadas no toolbar, overlays mais sofisticados e comportamento mais próximo de plugins nativos, a rota é **C++ Illustrator SDK**. Essa rota é viável, mas é bastante mais cara e lenta.

## Recomendação de stack

### Opção A: CEP + ExtendScript

**Recomendado para MVP**

Usar:

- painel HTML/CSS/JS para UI;
- `CSInterface.js` para comunicar com o host;
- ExtendScript (`.jsx`) para ler seleção, layers, bounds, criar textos, linhas e guardar tags.

Vantagens:

- entrega rápida;
- UI flexível;
- suficiente para seleção, leitura/escrita de medidas, cotas e escalas;
- baixo risco para um primeiro produto.

Limitações:

- não altera o painel nativo Transform do Illustrator;
- sincronização com seleção tende a ser por eventos disponíveis e/ou polling;
- UX menos "nativa" do que um plugin C++.

### Opção B: C++ Illustrator SDK

**Recomendado apenas se quiser integração profunda**

Usar:

- plugin `.aip` em C++;
- suites do Illustrator SDK para seleção, art items, annotators, menus e overlays.

Vantagens:

- maior controlo;
- melhor performance em documentos grandes;
- possibilidade de UI e comportamento mais próximos do Illustrator.

Limitações:

- desenvolvimento e manutenção muito mais caros;
- maior complexidade de build, packaging e compatibilidade por versão;
- curva de aprendizagem significativamente maior.

### Opção C: UXP

**Não recomendo como primeira aposta para este caso**

Há sinais oficiais de integração do Illustrator com UXP, mas a documentação pública e o percurso de implementação para Illustrator não estão tão claros quanto o ecossistema CEP/SDK. Para este produto específico, o menor risco continua a ser CEP ou C++.

## Viabilidade por funcionalidade

### 1. Escala `Document-based` e `Layer-based`

**Viável**

Implementação proposta:

- `Document-based`: guardar a escala no documento ativo;
- `Layer-based`: guardar a escala por layer;
- prioridade de resolução:
  1. escala explícita do layer do objeto selecionado;
  2. escala default do documento;
  3. fallback `1:1`.

Onde guardar:

- em `tags` do objeto ou layer quando possível;
- ou em `note`/metadados auxiliares;
- opcionalmente em preferências do plugin para defaults globais.

### 2. Escalas como `1:1` e `38 mm = 1 m`

**Viável**

Modelo recomendado:

- normalizar tudo para um multiplicador real;
- exemplo `1:1` -> fator `1.0`;
- exemplo `38 mm = 1 m`:
  - 38 mm desenhados representam 1000 mm reais;
  - fator real = `1000 / 38 = 26.315789...`;
  - logo `medida_real = medida_desenhada * 26.315789...`.

No painel, isto pode ser apresentado como:

- `1:1`
- `38 mm = 1 m`
- ou internamente `1 : 26.315789`.

### 3. Selecionar um quadrado/retângulo e mostrar perímetro e área

**Viável**

Para objetos retangulares simples:

- largura = `PageItem.width`;
- altura = `PageItem.height`;
- perímetro real = `2 * (w + h) * fator_escala`;
- área real = `(w * h) * fator_escala^2`.

Para paths fechados genéricos:

- área pode vir de `PathItem.area` em pontos quadrados;
- perímetro pode ser calculado somando segmentos entre path points;
- em curvas Bézier, o perímetro exato exige aproximação numérica.

Recomendação de MVP:

- suportar primeiro retângulos e paths poligonais simples;
- depois expandir para curvas e compound paths.

### 4. Alterar medidas no painel como na imagem

**Viável**

O painel pode ter campos:

- X
- Y
- W
- H
- rotação
- escala %

Quando o utilizador edita:

- W/H: atualizar `resize()` ou `transform()`;
- X/Y: atualizar `position`/`translate()`;
- manter proporções com ícone de corrente;
- converter entrada real para pontos do Illustrator usando a escala inversa.

Importante:

- isto não modifica o painel nativo do Illustrator;
- cria um painel próprio com comportamento semelhante.

### 5. Inserir medidas/cotas no objeto

**Viável**

O plugin pode desenhar automaticamente:

- linha de cota;
- linhas auxiliares;
- setas ou ticks;
- texto com o valor;
- grupo de cotagem numa layer própria, por exemplo `MEASUREMENTS`.

Também pode:

- criar cotas horizontais, verticais e entre dois pontos;
- associar a cota ao objeto via `tags`;
- regenerar cotas quando o objeto muda.

### 6. Guardar metadados no objeto

**Viável**

Estratégia recomendada:

- usar `PageItem.tags` para guardar pares chave/valor;
- usar `PageItem.uuid` para ligar objeto base e grupo de cotas;
- guardar algo como:
  - `bidstools.scale.mode = layer`
  - `bidstools.scale.factor = 26.315789`
  - `bidstools.dim.linkedDimensionGroup = <uuid>`

Isto permite:

- reabrir documento e manter contexto;
- atualizar cotas existentes;
- distinguir cotas geradas pelo plugin de arte normal.

## Arquitetura funcional sugerida

### Módulos

1. `Scale Engine`
   Converte entre pontos do Illustrator, unidades do documento e unidades reais.

2. `Selection Inspector`
   Lê seleção ativa, deteta tipo de objeto, bounds, layer e metadata.

3. `Geometry Engine`
   Calcula largura, altura, perímetro, área e pontos de ancoragem para cotas.

4. `Transform Engine`
   Aplica alterações de W/H/X/Y/rotação respeitando lock ratio e escala.

5. `Dimension Renderer`
   Cria textos, linhas e grupos visuais de cotagem.

6. `Metadata Store`
   Guarda e lê tags do documento, layer e objetos.

7. `Panel UI`
   Implementa a interface semelhante às imagens fornecidas.

## Fluxo UX proposto

### Painel principal

- grupo `Scale`
  - radio `Document-based`
  - radio `Layer-based`
  - dropdown/preset de escala
  - campo customizado: `38 mm = 1 m`

- grupo `Selection`
  - tipo de objeto
  - layer
  - escala efetiva
  - perímetro
  - área

- grupo `Transform`
  - X
  - Y
  - W
  - H
  - lock proportions
  - rotação
  - scale %

- grupo `Dimensions`
  - Horizontal
  - Vertical
  - By points
  - Around object
  - Update existing
  - Remove dimensions

## Limitações reais

### Técnicas

- o Illustrator trabalha internamente em pontos, por isso toda a UI precisa de conversão robusta;
- perímetro de curvas não é trivial se quiser precisão CAD-like;
- `area` em paths complexos e auto-intersectantes pode produzir resultados contraintuitivos;
- objetos com stroke, efeitos, clipping masks e grupos exigem decidir entre `geometricBounds` e `visibleBounds`;
- sincronização "live" com alterações manuais no canvas pode exigir refresh periódico.

### Produto

- isto não substitui um CAD;
- a precisão terá de ser claramente definida: geometria vetorial do Illustrator com regras do plugin;
- se o objetivo for tolerâncias técnicas, snapping rigoroso e constraints paramétricos, Illustrator não é a base ideal.

## Riscos e mitigação

### Risco 1: documentos com grupos, clipping masks e compound paths

Mitigação:

- limitar MVP a `PathItem`, `GroupItem` simples e retângulos;
- mostrar estado `unsupported/partial support` quando necessário.

### Risco 2: cotas desatualizadas após edição manual do objeto

Mitigação:

- botão `Update Dimensions`;
- vínculo por `uuid` + `tags`;
- opcional: refresh automático da seleção atual.

### Risco 3: diferença entre bounds geométricos e visuais

Mitigação:

- opção no painel:
  - `Use geometric bounds`
  - `Use visible bounds`

### Risco 4: suporte cross-version

Mitigação:

- definir versões mínimas de Illustrator logo no início;
- testar pelo menos em Windows e macOS nas versões alvo.

## Plano por fases

### Fase 0: prova técnica

Objetivo:

- validar leitura da seleção;
- calcular W/H/área/perímetro;
- aplicar escala `1:1` e `38 mm = 1 m`;
- editar W/H/X/Y de um retângulo;
- gerar uma cota vertical simples.

Entrega:

- protótipo interno sem acabamento.

### Fase 1: MVP

Objetivo:

- painel funcional;
- `Document-based` e `Layer-based`;
- presets de escala + escala custom;
- leitura de seleção;
- perímetro e área para retângulos e paths simples;
- edição de X/Y/W/H;
- cotas horizontais e verticais;
- grupo/layer de cotas;
- persistência de metadata.

Entrega:

- primeira versão utilizável.

### Fase 2: robustez

Objetivo:

- suporte melhor a grupos;
- update de cotas existentes;
- controlo de units/bounds;
- melhor tratamento de rotação;
- preferências persistentes;
- UX melhorada.

### Fase 3: avançado

Objetivo:

- cotas entre dois pontos;
- múltiplos estilos de cota;
- perímetro de curvas com aproximação refinada;
- batch dimensioning;
- export/report de medições.

## Estimativa de esforço

### CEP + ExtendScript

- prova técnica: `3 a 5 dias`
- MVP sólido: `2 a 4 semanas`
- versão robusta: `4 a 8 semanas`

### C++ SDK

- prova técnica: `1 a 2 semanas`
- MVP sólido: `6 a 10 semanas`
- versão robusta: `2 a 4 meses`

## Decisão recomendada

Se o objetivo é validar negócio e chegar depressa a algo utilizável:

- começar com **CEP + ExtendScript**.

Se depois houver necessidade de:

- overlays mais nativos;
- ferramentas próprias no Illustrator;
- performance superior;
- comportamento tipo plugin profundo;

então evoluir ou reimplementar componentes críticos em **C++ SDK**.

## Fontes

- Adobe Illustrator developer page: https://developer.adobe.com/illustrator/
- Adobe CEP resources: https://github.com/Adobe-CEP/CEP-Resources
- Adobe CEP getting started guides: https://github.com/Adobe-CEP/Getting-Started-guides
- Adobe blog, Illustrator SDK/plugin note: https://blog.developer.adobe.com/en/publish/2021/01/an-illustrator-25-1-update-for-plugin-developers
- Illustrator scripting reference, `PageItem`: https://ai-scripting.docsforadobe.dev/jsobjref/PageItem/
- Illustrator scripting reference, `PathItem.area`: https://ai-scripting.docsforadobe.dev/jsobjref/PathItem/
- Illustrator scripting reference, positioning and dimensions: https://ai-scripting.docsforadobe.dev/scripting/positioning/
- Illustrator scripting reference, `Layer`: https://ai-scripting.docsforadobe.dev/jsobjref/Layer/
- Illustrator scripting reference, `Tag` and `Tags`: https://ai-scripting.docsforadobe.dev/jsobjref/Tag/ and https://ai-scripting.docsforadobe.dev/jsobjref/Tags/
- Existing Illustrator dimensioning extension example: https://github.com/adamdehaven/specify

