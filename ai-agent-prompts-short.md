# Prompts curtos para colar diretamente em agentes IA

## Prompt A: Arquitetura / integração CEP

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Melhora a arquitetura e integração CEP do plugin Illustrator sem mexer na lógica de negócio.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\CSXS\manifest.xml
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\bridge.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\bootstrap.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\index.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md

Não editar:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\*
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\*

Objetivos:
- reforçar bridge client -> host
- melhorar recarga dos módulos host em dev
- manter APIs públicas estáveis:
  - getSelectionInfo
  - updateTransform
  - createHorizontalDimension
  - createVerticalDimension

No fim entrega:
- resumo
- ficheiros alterados
- como validar manualmente
- limitações
```

## Prompt B: Escala / formatação

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Implementa e melhora o motor de escala para replicar o modelo observado do CadTools.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\scale.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\format.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md

Não editar:
- outros ficheiros em plugin/host/core/
- ficheiros da UI

Objetivos:
- suportar 1:1
- suportar 38 mm = 1 m
- manter precisão interna
- arredondar só no output
- manter API reutilizável

Casos críticos:
- retângulo 63.398 mm x 59.989 mm
- escala 38 mm = 1 m
- resultados esperados iguais ao documento de cálculo

No fim entrega:
- resumo
- ficheiros alterados
- testes principais
- limitações
```

## Prompt C: Seleção / geometria

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Implementa e melhora a leitura da seleção e geometria para alimentar o painel.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\selection.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\geometry.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\guards.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md

Não editar:
- scale.jsx
- transform.jsx
- dimensions.jsx
- metadata.jsx
- ficheiros da UI

Objetivos:
- validar documento aberto
- validar seleção única
- suportar retângulos e PathItem simples
- usar geometricBounds / width / height
- devolver erros claros

Não usar:
- visibleBounds como default

No fim entrega:
- resumo
- ficheiros alterados
- como validar manualmente
- riscos em aberto
```

## Prompt D: Transformações

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Implementa o módulo de transformações para aplicar X, Y, W e H ao objeto selecionado.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\transform.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md

Não editar:
- selection.jsx
- geometry.jsx
- scale.jsx
- dimensions.jsx
- metadata.jsx
- ficheiros da UI

Objetivos:
- converter valor real para valor de desenho
- aplicar posição
- aplicar tamanho
- respeitar lock proportions
- manter a API updateTransform(payload)

No fim entrega:
- resumo
- ficheiros alterados
- como validar manualmente
- limitações
```

## Prompt E: Cotas / metadata

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Implementa cotas horizontais e verticais simples e metadata mínima.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\dimensions.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\metadata.jsx
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md

Não editar:
- selection.jsx
- geometry.jsx
- scale.jsx
- transform.jsx
- ficheiros da UI

Objetivos:
- garantir layer BIDSTOOLS_DIMENSIONS
- criar cota horizontal
- criar cota vertical
- criar linha principal, auxiliares e texto
- guardar metadata mínima

No fim entrega:
- resumo
- ficheiros alterados
- como validar manualmente
- limitações
```

## Prompt F: UI do painel

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Melhora a UI do painel CEP sem mexer na lógica host.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\index.html
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\styles.css
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\index.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\state.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\scale-panel.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\selection-panel.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\transform-panel.js
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\dimensions-panel.js

Não editar:
- bridge.js
- manifest.xml
- qualquer ficheiro em plugin/host/

Objetivos:
- UI simples e técnica
- blocos Scale, Selection, Transform, Dimensions
- estados vazios e erros claros
- ações ligadas à bridge existente

No fim entrega:
- resumo
- ficheiros alterados
- como validar manualmente
- limitações
```

## Prompt G: Instalação / release interna

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Prepara o workstream de instalação e release interna para distribuição a 11 utilizadores.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-internal-release-strategy.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\installer\README.md
- ficheiros novos dentro de C:\Users\AndreGarcia\Documents\BIDSTOOLS\installer\
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\releases\README.md
- ficheiros novos dentro de C:\Users\AndreGarcia\Documents\BIDSTOOLS\releases\
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md

Não editar:
- plugin/client/*
- plugin/host/*
- manifest.xml

Objetivos:
- preparar documentação de instalação
- preparar base de release
- se fizer sentido, preparar base de instalador Windows

No fim entrega:
- resumo
- ficheiros alterados
- como um utilizador instala
- próximos passos
```

## Prompt H: QA / testes manuais

```text
Projeto: C:\Users\AndreGarcia\Documents\BIDSTOOLS

Trabalho:
Cria uma matriz de QA manual para o plugin.

Lê antes:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md

Podes editar apenas:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md
- ficheiros novos dentro de C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\

Não editar:
- qualquer ficheiro em plugin/
- qualquer ficheiro em installer/
- qualquer ficheiro em releases/

Objetivos:
- smoke tests
- testes para 1:1
- testes para 38 mm = 1 m
- testes para seleção, transform e cotas
- documentação clara para testers internos

No fim entrega:
- resumo
- ficheiros alterados
- estrutura da matriz de testes
- lacunas ainda por cobrir
```

