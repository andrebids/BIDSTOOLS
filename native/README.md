# Native SDK Scaffold

Scaffold inicial para a futura implementação nativa das tools interativas de dimensão do BIDSTOOLS no Adobe Illustrator.

## Objetivo desta tranche

- materializar a arquitetura nativa em código;
- fechar contratos base entre módulos;
- preparar a divisão entre tool interaction, preview, builder, metadata e refresh;
- evitar acoplamento prematuro ao SDK real antes de estabilizar os fluxos.

## Estado atual

Esta pasta contém:

- headers e stubs C++ de módulos centrais;
- contratos de dados para `DimensionRecord`, `DimensionStyle`, `ScaleDefinition` e refs de source;
- placeholders para tool registry, notifier registry e tools `by Line`.

Não contém ainda:

- integração real com o SDK do Illustrator;
- build system;
- hit testing real no canvas;
- criação real de arte no documento.

## Próximo passo recomendado

Ligar estes stubs ao SDK real do Illustrator e começar pela slice:

- `Horizontal Dimension - by Line`
- tool activation
- line hit testing
- drag preview
- commit
- metadata
- refresh manual
