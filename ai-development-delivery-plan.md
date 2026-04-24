# Plano de entrega para developers IA independentes

## Objetivo

Organizar o desenvolvimento do plugin interno de medição para Adobe Illustrator de forma que vários developers IA possam trabalhar de forma independente, com:

- escopos fechados;
- ownership claro;
- baixo conflito entre ficheiros;
- critérios objetivos de aceitação;
- ordem de integração previsível.

## Resultado esperado

No fim do ciclo, a equipa deve conseguir entregar:

- plugin CEP funcional;
- motor de cálculo compatível com o modelo observado do CadTools;
- painel com `Scale`, `Selection`, `Transform` e `Dimensions`;
- build interna instalável;
- documentação mínima de uso e release.

## Princípios de organização

### 1. Separação por ownership

Cada developer IA recebe:

- uma área funcional clara;
- um conjunto de ficheiros de escrita exclusivos;
- interfaces fixas com os outros módulos.

### 2. Contratos antes de implementação

Antes do desenvolvimento paralelo, devem ficar fechados:

- nomes dos ficheiros;
- funções públicas;
- shape dos payloads JSON;
- regras de escala;
- regras de arredondamento.

### 3. Integração curta

Evitar branches longas.

Cada entrega deve ser:

- pequena;
- testável;
- integrável em pouco tempo.

### 4. Sem overlap desnecessário

Dois developers IA não devem editar os mesmos ficheiros, exceto:

- documentação central;
- ficheiros de integração explicitamente reservados.

## Estrutura de projeto recomendada

```text
plugin/
  CSXS/
    manifest.xml
  client/
    index.html
    styles.css
    index.js
    bridge.js
    state.js
    ui/
      scale-panel.js
      selection-panel.js
      transform-panel.js
      dimensions-panel.js
  host/
    index.jsx
    bootstrap.jsx
    core/
      scale.jsx
      geometry.jsx
      transform.jsx
      dimensions.jsx
      metadata.jsx
      selection.jsx
      format.jsx
      guards.jsx
  docs/
  installer/
  tests/
    manual/
```

## Módulos e contratos centrais

## 1. Contrato de escala

Fonte:

- [cadtools-calculation-model.md](C:/Users/AndreGarcia/Documents/BIDSTOOLS/cadtools-calculation-model.md)

Funções esperadas:

- `parseScale(input)`
- `getEffectiveScale(context)`
- `toRealLength(drawValue, scale)`
- `toRealArea(drawArea, scale)`
- `fromRealLength(realValue, scale)`

## 2. Contrato de seleção

Função esperada:

- `getSelectionInfo()`

Saída mínima:

```json
{
  "supported": true,
  "reason": "",
  "type": "PathItem",
  "layerName": "Layer 1",
  "x": 0.15,
  "y": -0.11,
  "w": 0.06,
  "h": 0.06,
  "perimeter": 0.25,
  "area": 0.00,
  "unit": "m",
  "scaleLabel": "1:1",
  "scaleMode": "document"
}
```

## 3. Contrato de transform

Funções esperadas:

- `updateTransform(payload)`
- `setPosition(payload)`
- `setSize(payload)`

Payload mínimo:

```json
{
  "x": 0.15,
  "y": -0.11,
  "w": 0.06,
  "h": 0.06,
  "unit": "m",
  "lockProportions": true
}
```

## 4. Contrato de cotas

Funções esperadas:

- `createHorizontalDimension()`
- `createVerticalDimension()`
- `ensureDimensionLayer()`

Saída mínima:

```json
{
  "ok": true,
  "dimensionId": "dim-001",
  "layerName": "BIDSTOOLS_DIMENSIONS"
}
```

## 5. Contrato de metadata

Funções esperadas:

- `setTag(item, key, value)`
- `getTag(item, key)`
- `attachScaleMetadata(item, scale)`
- `attachDimensionMetadata(baseItem, dimensionGroup)`

## Plano por workstreams

## Workstream 0: Arquitetura e integração

### Objetivo

Definir os contratos e preparar a base comum para o resto da equipa.

### Ownership

Escrita permitida:

- `plugin/CSXS/manifest.xml`
- `plugin/client/bridge.js`
- `plugin/host/bootstrap.jsx`
- `plugin/host/index.jsx`
- `docs/`

### Responsabilidades

- definir nomes finais dos módulos;
- definir payloads JSON;
- criar bridge UI -> host;
- criar bootstrap ExtendScript com carregamento modular;
- definir convenções de erro e logging.

### Critérios de aceitação

- painel carrega;
- bridge consegue chamar pelo menos um método host;
- contratos estão documentados;
- módulos vazios já existem com assinaturas definidas.

### Dependências

- nenhuma

## Workstream 1: Motor de escala e formatação

### Objetivo

Implementar toda a lógica de:

- parse de escala;
- conversão linear;
- conversão de área;
- arredondamento de apresentação.

### Ownership

Escrita permitida:

- `plugin/host/core/scale.jsx`
- `plugin/host/core/format.jsx`
- `tests/manual/scale-tests.md`

### Responsabilidades

- suportar `1:1`;
- suportar `38 mm = 1 m`;
- suportar `Document-based` e `Layer-based` ao nível lógico;
- devolver valores compatíveis com o modelo documentado do CadTools.

### Critérios de aceitação

- passa os casos documentados em [cadtools-calculation-model.md](C:/Users/AndreGarcia/Documents/BIDSTOOLS/cadtools-calculation-model.md);
- arredondamento apenas no output;
- API sem dependência de UI.

### Dependências

- Workstream 0

## Workstream 2: Seleção e geometria

### Objetivo

Ler a seleção do Illustrator e extrair dados geométricos consistentes.

### Ownership

Escrita permitida:

- `plugin/host/core/selection.jsx`
- `plugin/host/core/geometry.jsx`
- `plugin/host/core/guards.jsx`
- `tests/manual/selection-tests.md`

### Responsabilidades

- validar documento aberto;
- validar seleção única;
- suportar `PathItem` simples e retângulos;
- ler `geometricBounds`, `width`, `height`, `position`;
- calcular perímetro e área desenhados.

### Critérios de aceitação

- devolve erro claro para:
  - sem documento;
  - sem seleção;
  - múltipla seleção;
  - objeto não suportado;
- dados geométricos corretos para retângulo simples;
- não usa `visibleBounds` como default.

### Dependências

- Workstream 0
- integra com Workstream 1

## Workstream 3: Transformações

### Objetivo

Aplicar alterações de `X`, `Y`, `W`, `H` ao objeto selecionado.

### Ownership

Escrita permitida:

- `plugin/host/core/transform.jsx`
- `tests/manual/transform-tests.md`

### Responsabilidades

- converter valores reais -> desenho;
- atualizar posição;
- atualizar tamanho;
- respeitar `lock proportions`.

### Critérios de aceitação

- alterar `W` muda largura corretamente;
- alterar `H` muda altura corretamente;
- alterar `X/Y` move corretamente;
- com lock ativo, mantém proporção.

### Dependências

- Workstream 1
- Workstream 2

## Workstream 4: Cotas e metadata

### Objetivo

Criar cotas horizontais/verticais e persistir vínculo mínimo com o objeto.

### Ownership

Escrita permitida:

- `plugin/host/core/dimensions.jsx`
- `plugin/host/core/metadata.jsx`
- `tests/manual/dimensions-tests.md`

### Responsabilidades

- criar layer `BIDSTOOLS_DIMENSIONS`;
- desenhar linha, witness lines e texto;
- guardar tags mínimas;
- devolver resultado estruturado.

### Critérios de aceitação

- cota horizontal criada corretamente;
- cota vertical criada corretamente;
- output vai para a layer dedicada;
- metadata básica fica guardada.

### Dependências

- Workstream 1
- Workstream 2

## Workstream 5: UI do painel

### Objetivo

Implementar a interface CEP do plugin.

### Ownership

Escrita permitida:

- `plugin/client/index.html`
- `plugin/client/styles.css`
- `plugin/client/index.js`
- `plugin/client/state.js`
- `plugin/client/ui/scale-panel.js`
- `plugin/client/ui/selection-panel.js`
- `plugin/client/ui/transform-panel.js`
- `plugin/client/ui/dimensions-panel.js`

### Responsabilidades

- layout dos quatro blocos;
- inputs e botões;
- render de estados;
- mensagens de erro;
- interação com `bridge.js`.

### Critérios de aceitação

- painel abre;
- mostra estado vazio corretamente;
- renderiza dados de seleção;
- permite disparar `refresh`, `transform`, `create dimension`.

### Dependências

- Workstream 0

## Workstream 6: Empacotamento, instalação e release interna

### Objetivo

Preparar a forma de instalar e atualizar o plugin internamente.

### Ownership

Escrita permitida:

- `installer/`
- `docs/`
- `releases/`

### Responsabilidades

- script de build de release;
- estrutura de pasta de distribuição;
- setup interno Windows;
- release notes;
- instruções de instalação.

### Critérios de aceitação

- existe pacote beta instalável;
- existe plano para stable interna;
- documentação de instalação fica pronta.

### Dependências

- Workstream 0
- idealmente após Workstreams 1 a 5 estabilizarem

## Ordem recomendada de execução

## Fase A

1. Workstream 0
2. Workstream 1
3. Workstream 2
4. Workstream 5

## Fase B

1. Workstream 3
2. Workstream 4

## Fase C

1. Workstream 6
2. estabilização final

## Plano de integração

## Merge 1

- Workstream 0
- Workstream 1
- Workstream 2

Objetivo:

- conseguir `getSelectionInfo()` funcional.

## Merge 2

- Workstream 5

Objetivo:

- UI a mostrar seleção real.

## Merge 3

- Workstream 3

Objetivo:

- UI já altera `X/Y/W/H`.

## Merge 4

- Workstream 4

Objetivo:

- UI já cria cotas.

## Merge 5

- Workstream 6

Objetivo:

- build interna distribuível.

## Regras para entregar trabalho a developers IA

## Formato obrigatório do pedido

Cada developer IA deve receber:

1. objetivo funcional;
2. paths que pode editar;
3. paths que não pode editar;
4. contrato de entrada/saída;
5. critérios de aceitação;
6. testes manuais mínimos;
7. instrução para não alterar manifest/bridge fora do seu scope.

## Formato obrigatório da resposta

Cada developer IA deve devolver:

1. resumo do que implementou;
2. lista de ficheiros alterados;
3. decisões técnicas tomadas;
4. limitações conhecidas;
5. como validar manualmente.

## Template de briefing para developer IA

```text
Objetivo:
Implementar [módulo].

Ownership de escrita:
- [ficheiro 1]
- [ficheiro 2]

Não editar:
- [ficheiro 3]
- [ficheiro 4]

Contrato:
- input: [...]
- output: [...]

Critérios de aceitação:
- [...]

Testes manuais:
- [...]

Notas:
- Não mudar nomes públicos já definidos.
- Não reformatar ficheiros fora do teu scope.
- Se encontrares blocker no contrato, reporta em vez de alterar unilateralmente.
```

## Pacotes prontos a entregar

## Pacote A: Escala

Entregar a um developer IA especializado em lógica.

Escopo:

- `scale.jsx`
- `format.jsx`

Objetivo:

- replicar exatamente o modelo do documento CadTools.

## Pacote B: Seleção/Geometria

Entregar a outro developer IA.

Escopo:

- `selection.jsx`
- `geometry.jsx`
- `guards.jsx`

Objetivo:

- devolver `SelectionInfo` coerente e previsível.

## Pacote C: Transform

Entregar a outro developer IA.

Escopo:

- `transform.jsx`

Objetivo:

- aplicar edição numérica com lock proportions.

## Pacote D: Cotas/Metadata

Entregar a outro developer IA.

Escopo:

- `dimensions.jsx`
- `metadata.jsx`

Objetivo:

- desenhar cotas simples e guardar vínculo mínimo.

## Pacote E: UI

Entregar a outro developer IA.

Escopo:

- `client/`

Objetivo:

- painel funcional e limpo.

## Pacote F: Release interna

Entregar a outro developer IA ou reservar para fase final.

Escopo:

- `installer/`
- `docs/`

Objetivo:

- instalação interna estável.

## Critérios globais de aceitação do projeto

- plugin abre no Illustrator;
- `1:1` funciona;
- `38 mm = 1 m` funciona;
- leitura de `W/H/Perim/Area` compatível com o modelo observado;
- edição de `X/Y/W/H` funciona;
- cota horizontal funciona;
- cota vertical funciona;
- release interna instalável está preparada.

## Decisão final de gestão

Para desenvolvimento paralelo com developers IA independentes, a estrutura mais segura é:

- 1 workstream de arquitetura/integrador;
- 4 workstreams funcionais principais;
- 1 workstream de UI;
- 1 workstream final de release interna.

Isto minimiza colisões, facilita prompts fechados e permite integrar por etapas sem caos.

