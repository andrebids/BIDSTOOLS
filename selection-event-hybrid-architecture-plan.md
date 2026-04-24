# Plano: atualização automática da seleção sem timer

## Objetivo

Atualizar automaticamente o painel quando a seleção muda no Illustrator, sem usar `timer` / polling contínuo no painel CEP.

Quando o utilizador selecionar um objeto:

- o host nativo deteta a mudança;
- o painel CEP recebe um evento;
- o painel chama `getSelectionInfo()`;
- a UI atualiza `W`, `H`, perímetro e área automaticamente.

## Conclusão técnica

Para Illustrator + CEP, a solução recomendada sem `timer` é uma arquitetura híbrida:

- `CEP panel` para a interface;
- `Illustrator C++ plugin (.aip)` para escutar mudanças de seleção;
- evento CEP custom para comunicar com o painel.

## Base técnica

### CEP

O CEP suporta eventos entre extensões e integração com o lado nativo via PlugPlug / `dispatchEvent/addEventListener`.

Referência:

- Adobe CEP Cookbook  
  https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md?plain=1

### Illustrator SDK

O Illustrator SDK expõe o notifier:

- `kAIArtSelectionChangedNotifier`

Referência:

- Illustrator Plug-in Notifiers  
  https://ai-sdk-2020.84.nz/html/group___notifiers

Observação importante:

- este notifier pode disparar tanto em mudança de seleção como em certas modificações do artwork;
- por isso o plugin deve filtrar eventos redundantes.

## Arquitetura proposta

## 1. Painel CEP

Responsabilidade:

- manter a UI;
- escutar um evento custom vindo do plugin nativo;
- quando recebe esse evento, disparar `refreshSelection()`.

Não deve:

- calcular seleção por polling;
- depender de `setInterval` para este caso.

## 2. Plugin nativo Illustrator

Responsabilidade:

- subscrever `kAIArtSelectionChangedNotifier`;
- comparar a seleção atual com a última seleção conhecida;
- quando houver mudança real, emitir evento CEP.

Não deve:

- calcular perímetro ou área;
- duplicar a lógica geométrica já existente no host JSX.

## 3. Host ExtendScript

Responsabilidade:

- continuar a responder a `getSelectionInfo()`;
- manter a lógica de geometria, escala, perímetro e área;
- continuar como fonte única de cálculo.

## Fluxo completo

1. O utilizador muda a seleção no Illustrator.
2. O Illustrator dispara `kAIArtSelectionChangedNotifier`.
3. O plugin `.aip` recebe esse notifier.
4. O plugin gera uma assinatura da seleção atual.
5. Se a assinatura for diferente da anterior, o plugin emite um evento CEP.
6. O painel CEP recebe o evento.
7. O painel chama `refreshSelection()`.
8. O host ExtendScript devolve os dados atualizados.
9. A UI atualiza automaticamente.

## Evento CEP proposto

### Nome

```text
com.bidstools.selectionChanged
```

### Payload

Pode ser mínimo:

```json
{
  "source": "BIDSTOOLSSelectionNotifier",
  "documentChanged": true
}
```

Na prática, o painel não precisa de receber geometria no evento. Só precisa do trigger.

## Estratégia de filtragem

Como `kAIArtSelectionChangedNotifier` também pode disparar em alterações de artwork, o plugin deve filtrar:

- guardar a última assinatura da seleção;
- gerar nova assinatura em cada notifier;
- só emitir evento se a assinatura mudou.

### Assinatura sugerida

Usar uma representação estável da seleção, por exemplo:

- número de itens selecionados;
- UUID / handle dos itens selecionados;
- ordem normalizada.

### Regras

- mesma assinatura => não emitir evento;
- assinatura nova => emitir evento.

## Debounce recomendado

Mesmo sem timer contínuo, convém coalescer notificações muito próximas.

Estratégia:

- se vierem vários notifiers seguidos com a mesma assinatura, ignorar;
- opcionalmente usar uma pequena janela de coalescing no plugin nativo, não no painel.

## Fases de implementação

## Fase 1: prova técnica

Objetivo:

- criar um plugin `.aip` mínimo;
- subscrever `kAIArtSelectionChangedNotifier`;
- emitir `com.bidstools.selectionChanged`;
- no painel, receber o evento e escrever no log.

Critério de sucesso:

- selecionar objetos no Illustrator gera evento visível no painel, sem `timer`.

## Fase 2: integração funcional

Objetivo:

- ao receber o evento, o painel chama `refreshSelection()`;
- o painel atualiza automaticamente `W`, `H`, perímetro e área.

Critério de sucesso:

- não é preciso clicar `Refresh` para ver a nova seleção.

## Fase 3: robustez

Objetivo:

- filtrar eventos redundantes;
- evitar refresh desnecessário;
- validar cenários reais.

Critério de sucesso:

- mudança rápida entre objetos não degrada o painel;
- o painel não faz refresh em loop.

## Estrutura de projeto sugerida

```text
BIDSTOOLS/
  plugin/
  native-plugin/
    src/
    include/
    docs/
    build/
```

## Divisão de responsabilidades

## Workstream A: plugin nativo C++

Responsável por:

- subscrição do notifier;
- leitura da seleção;
- geração de assinatura;
- emissão do evento CEP.

Entregáveis:

- `BIDSTOOLSSelectionNotifier.aip`
- código C++ do plugin
- instruções de build

## Workstream B: integração CEP

Responsável por:

- `CSInterface.addEventListener(...)`
- callback do evento;
- chamada a `refreshSelection()`;
- evitar duplicação de refresh.

Entregáveis:

- listener no painel;
- integração com UI/log;
- documentação curta.

## Workstream C: validação

Responsável por:

- testar mudança de seleção;
- testar sem seleção;
- testar seleção rápida;
- testar interação com `Transform`.

## Riscos

## 1. Notifier demasiado ruidoso

Mitigação:

- comparar assinatura da seleção;
- ignorar eventos equivalentes.

## 2. Complexidade extra de build

Mitigação:

- plugin nativo mínimo, apenas para eventos;
- manter toda a lógica de cálculo no JSX.

## 3. Distribuição de dois componentes

Mitigação:

- documentar instalação conjunta:
  - painel CEP
  - plugin `.aip`

## Decisão final

Se queres atualização automática da seleção no Illustrator sem `timer`, a solução correta é:

- `CEP panel + C++ notifier plugin + CEP custom event`

É a arquitetura com melhor desempenho e mais alinhada com as capacidades reais de Illustrator + CEP.

