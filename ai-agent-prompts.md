# Prompts separados para agentes IA

## Como usar

Cada prompt abaixo foi escrito para ser enviado isoladamente a um agente IA diferente.

Regras de utilização:

- envia apenas o prompt do workstream correspondente;
- não mistures dois prompts no mesmo agente;
- dá sempre ao agente acesso ao workspace atual;
- mantém os nomes dos ficheiros e contratos já definidos;
- pede ao agente para listar os ficheiros alterados no fim.

---

## Prompt 1: Arquitetura e integração CEP

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Consolidar a base de arquitetura e integração CEP do plugin, sem mexer na lógica de negócio de escala, geometria, transformações ou cotas.

Contexto importante:
- O plugin é um painel CEP para Illustrator.
- A estrutura base já existe em `plugin/`.
- O projeto foi organizado para desenvolvimento paralelo por vários agentes.
- Não deves reestruturar diretórios sem necessidade.

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\CSXS\manifest.xml`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\bridge.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\bootstrap.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\index.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md`

Não podes editar:
- nada em `plugin/host/core/`
- nada em `plugin/client/ui/`
- nada em `installer/`, `releases/` ou `tests/manual/`

Tarefas:
1. Rever e melhorar a integração `client -> host`.
2. Garantir que o bootstrap recarrega módulos corretamente em desenvolvimento.
3. Tornar o formato de resposta host consistente.
4. Melhorar mensagens de erro estruturadas se necessário.
5. Manter as APIs públicas estáveis:
   - `getSelectionInfo`
   - `updateTransform`
   - `createHorizontalDimension`
   - `createVerticalDimension`

Critérios de aceitação:
- o painel continua a abrir;
- a bridge continua a invocar métodos host;
- não há breaking changes nos nomes públicos;
- os outros workstreams ficam desbloqueados.

Entrega esperada:
- resumo do que alteraste;
- lista de ficheiros alterados;
- riscos ou limitações encontradas;
- passos manuais para validar.
```

---

## Prompt 2: Motor de escala e formatação

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar ou melhorar o motor de escala e formatação para replicar o modelo observado do CadTools.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\scale.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\format.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md`

Não podes editar:
- `manifest.xml`
- `bridge.js`
- `selection.jsx`
- `geometry.jsx`
- `transform.jsx`
- `dimensions.jsx`
- `metadata.jsx`

Objetivo técnico:
- suportar `1:1`;
- suportar `38 mm = 1 m`;
- manter precisão interna;
- arredondar apenas na apresentação;
- devolver funções reutilizáveis pelos outros módulos.

Quero que trabalhes nestas funções:
- `parseScale(input)`
- `toRealLength(drawValue, scale)`
- `toRealArea(drawArea, scale)`
- `fromRealLength(realValue, scale)`
- helpers de formatação numérica

Critérios de aceitação:
- o retângulo `63.398 mm x 59.989 mm` com escala `38 mm = 1 m` deve corresponder ao modelo documentado;
- não introduzir dependência de UI;
- não alterar nomes públicos sem necessidade forte;
- código simples e modular.

Se encontrares ambiguidades:
- documenta-as na resposta final em vez de mudares unilateralmente o contrato.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- resultados esperados dos testes principais;
- limitações conhecidas.
```

---

## Prompt 3: Seleção e geometria

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar ou melhorar a leitura da seleção e da geometria do objeto selecionado para alimentar o painel.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\selection.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\geometry.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\guards.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md`

Não podes editar:
- `scale.jsx`
- `format.jsx`
- `transform.jsx`
- `dimensions.jsx`
- `metadata.jsx`
- ficheiros da UI

Objetivo funcional:
- validar documento aberto;
- validar seleção única;
- ler um objeto simples suportado;
- devolver geometria consistente;
- preparar uma saída previsível para `getSelectionInfo`.

Regras:
- priorizar `PathItem` simples e retângulos;
- usar `geometricBounds` / `width` / `height`;
- não usar `visibleBounds` como default;
- devolver erros claros para:
  - sem documento
  - sem seleção
  - seleção múltipla
  - objeto não suportado

Critérios de aceitação:
- `getSelectionInfo` devolve dados consistentes para um retângulo simples;
- a saída fica estável para consumo pela UI;
- o código não invade o workstream de escala além de consumir a API pública já existente.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- casos manuais que testaste;
- riscos ainda em aberto.
```

---

## Prompt 4: Transformações

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar o workstream de transformações para aplicar `X`, `Y`, `W` e `H` ao objeto selecionado.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\transform.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md`

Não podes editar:
- `selection.jsx`
- `geometry.jsx`
- `scale.jsx`
- `dimensions.jsx`
- `metadata.jsx`
- ficheiros da UI

Objetivo funcional:
- receber valores reais do painel;
- converter de valor real para valor de desenho;
- aplicar posição e tamanho;
- respeitar `lock proportions`.

Mantém ou melhora a API pública:
- `updateTransform(payload)`

Payload esperado:
- `x`
- `y`
- `w`
- `h`
- `scaleInput`
- `scaleMode`
- `lockProportions`

Critérios de aceitação:
- editar `W` muda a largura corretamente;
- editar `H` muda a altura corretamente;
- editar `X/Y` move corretamente;
- com lock ativo, as proporções são mantidas;
- em erro, devolver resposta host consistente.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- limitações atuais;
- instruções de teste manual.
```

---

## Prompt 5: Cotas e metadata

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar o workstream de criação de cotas simples e metadata mínima de vínculo com o objeto.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\dimensions.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\host\core\metadata.jsx`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md`

Não podes editar:
- `selection.jsx`
- `geometry.jsx`
- `scale.jsx`
- `transform.jsx`
- ficheiros da UI

Objetivo funcional:
- garantir a layer `BIDSTOOLS_DIMENSIONS`;
- criar cota horizontal;
- criar cota vertical;
- criar linha principal, linhas auxiliares e texto;
- guardar metadata mínima no objeto e/ou grupo criado.

Mantém ou melhora as APIs públicas:
- `createHorizontalDimension(payload)`
- `createVerticalDimension(payload)`

Critérios de aceitação:
- uma cota horizontal é criada para um retângulo simples;
- uma cota vertical é criada para um retângulo simples;
- o grupo vai para a layer dedicada;
- a metadata mínima fica gravada;
- em erro, devolver resposta host consistente.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- passos de teste manual;
- limitações atuais.
```

---

## Prompt 6: UI do painel

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar e melhorar a UI do painel CEP sem mexer na lógica interna do host.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\index.html`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\styles.css`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\index.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\state.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\scale-panel.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\selection-panel.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\transform-panel.js`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\ui\dimensions-panel.js`

Não podes editar:
- `bridge.js`
- `manifest.xml`
- qualquer ficheiro em `plugin/host/`

Objetivo funcional:
- painel limpo e funcional;
- mostrar `Scale`, `Selection`, `Transform`, `Dimensions`;
- estados vazios e erros legíveis;
- inputs claros para `X/Y/W/H`;
- ações ligadas à bridge já existente.

Regras:
- não criar dependências desnecessárias;
- não alterar nomes públicos da bridge;
- preservar uma UI simples, técnica e estável.

Critérios de aceitação:
- o painel abre sem erros;
- com `Refresh`, mostra os dados atuais;
- com erro host, mostra mensagem clara;
- os botões disparam as ações existentes;
- o código fica dividido por blocos UI.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- como validar manualmente;
- limitações atuais.
```

---

## Prompt 7: Instalação e release interna

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Preparar o workstream de instalação e release interna para distribuição a cerca de 11 utilizadores.

Lê obrigatoriamente antes de alterar código:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-internal-release-strategy.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\installer\README.md`
- qualquer ficheiro novo dentro de `C:\Users\AndreGarcia\Documents\BIDSTOOLS\installer\`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\releases\README.md`
- qualquer ficheiro novo dentro de `C:\Users\AndreGarcia\Documents\BIDSTOOLS\releases\`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md`

Não podes editar:
- ficheiros do host
- ficheiros do client
- manifest

Objetivo funcional:
- preparar a base da release interna;
- estruturar pasta de release;
- preparar instruções de instalação;
- se fizer sentido, criar base de instalador Windows;
- deixar o fluxo pronto para beta interna.

Critérios de aceitação:
- existe documentação clara de instalação;
- existe estrutura inicial de release;
- o trabalho não interfere com os workstreams de produto.

Entrega esperada:
- resumo do que implementaste;
- ficheiros alterados;
- como um utilizador interno deverá instalar;
- próximos passos para stable interna.
```

---

## Prompt 8: QA e testes manuais

```text
Estás a trabalhar no projeto de um plugin interno para Adobe Illustrator em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Melhorar a documentação de QA manual do plugin e preparar uma matriz de validação para os workstreams principais.

Lê obrigatoriamente:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\illustrator-plugin-mvp-spec.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\cadtools-calculation-model.md`
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\ai-development-delivery-plan.md`

Podes editar apenas:
- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\README.md`
- qualquer ficheiro novo dentro de `C:\Users\AndreGarcia\Documents\BIDSTOOLS\tests\manual\`

Não podes editar:
- qualquer ficheiro dentro de `plugin/`
- qualquer ficheiro dentro de `installer/`
- qualquer ficheiro dentro de `releases/`

Objetivo funcional:
- criar checklist de smoke test;
- criar casos de teste para escala `1:1`;
- criar casos de teste para `38 mm = 1 m`;
- criar casos para seleção, transform e cotas;
- organizar isto de forma que qualquer tester interno consiga seguir.

Critérios de aceitação:
- a documentação fica clara e executável;
- os resultados esperados principais estão explícitos;
- os testes ficam alinhados com o comportamento pretendido do plugin.

Entrega esperada:
- resumo do que documentaste;
- ficheiros alterados;
- estrutura da matriz de testes;
- lacunas ainda não cobertas.
```

