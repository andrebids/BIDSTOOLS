# Prompt: implementar atualização automática da seleção sem timer

```text
Estás a trabalhar no projeto em:

C:\Users\AndreGarcia\Documents\BIDSTOOLS

Objetivo:
Implementar a arquitetura híbrida para atualizar automaticamente o painel quando a seleção muda no Illustrator, sem usar timer/polling no painel CEP.

Lê obrigatoriamente antes de alterar código:
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\selection-event-hybrid-architecture-plan.md
- C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md

Contexto:
- O painel CEP já existe e já consegue fazer `refreshSelection()`.
- O cálculo de geometria, perímetro, área e escala já existe no host JSX.
- Não queremos polling no painel.
- Queremos um plugin nativo Illustrator que escute mudança de seleção e envie um evento CEP para o painel.

Objetivo técnico:
1. Criar um plugin nativo C++ para Illustrator.
2. Subscrever `kAIArtSelectionChangedNotifier`.
3. Filtrar notificações redundantes comparando a seleção atual com a última seleção conhecida.
4. Emitir um evento CEP custom:
   - `com.bidstools.selectionChanged`
5. No painel CEP, escutar esse evento e chamar `refreshSelection()` automaticamente.

Escopo de escrita permitido:
- qualquer ficheiro novo dentro de:
  - `C:\Users\AndreGarcia\Documents\BIDSTOOLS\native-plugin\`
- e os ficheiros necessários no painel CEP para ouvir o evento e reagir a ele:
  - `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\bridge.js`
  - `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\client\index.js`
  - `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin\docs\DEVELOPMENT.md`

Não alterar:
- lógica de geometria existente no host JSX
- fórmulas de escala
- UI além do que for estritamente necessário para debug/log

Regras:
- não usar timer/polling no painel para este fluxo;
- o plugin nativo não deve calcular perímetro/área;
- o plugin nativo deve apenas detetar mudança e enviar evento;
- o painel continua a usar `refreshSelection()` para obter os dados reais;
- documenta claramente o evento, a assinatura da seleção e o build do plugin.

Critérios de aceitação:
1. Ao mudar a seleção no Illustrator, o painel recebe um evento sem polling.
2. O painel faz `refreshSelection()` automaticamente.
3. `W`, `H`, perímetro e área atualizam sem clicar em `Refresh`.
4. Eventos redundantes são filtrados.
5. A documentação de build e integração fica incluída.

Entrega esperada:
- resumo do que implementaste
- lista de ficheiros alterados/criados
- como foi feita a filtragem de seleção
- como foi emitido o evento CEP
- como validar manualmente
- limitações conhecidas
```

