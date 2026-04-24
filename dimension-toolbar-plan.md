# Plano: Toolbar da Tool de Dimensions

## Objetivo

Criar uma `toolbar` dedicada para a tool de dimensões, com ações rápidas visíveis e labels de texto claros, alinhados com as opções mostradas nas imagens.

Além da toolbar, a representação visual da medida deve seguir um aspeto técnico simples, semelhante ao exemplo fornecido, com linha de cota, linhas de extensão, setas e valor centrado.

No contexto do Illustrator, este plano deve distinguir entre:

- `toolbar nativa` do Illustrator, na barra vertical de tools;
- `panel toolbar` do BIDSTOOLS, caso a integração nativa completa não seja usada na primeira fase.

## Integração com a barra de tools do Illustrator

Segundo a documentação de developer da Adobe para Illustrator, é possível adicionar `custom tools` à toolbar e aos menus através da API/plugin do Illustrator. A documentação de ajuda do Illustrator também indica que ferramentas de terceiros aparecem na toolbar e, por defeito, ficam disponíveis no `All Tools` drawer, podendo ser adicionadas pelo utilizador a toolbars customizadas.

### Conclusão prática para o BIDSTOOLS

- se o BIDSTOOLS for apenas `CEP/HTML panel`, isso não é suficiente por si só para colocar botões diretamente na barra vertical nativa;
- para aparecer como tool nativa com ícone próprio na barra de tools, o BIDSTOOLS deve expor ferramentas via plugin do Illustrator, tipicamente em implementação nativa do lado do host;
- numa primeira fase, a abordagem mais segura é combinar:
  - tools nativas para as ações principais de cota;
  - painel BIDSTOOLS para opções, escala e estilo.

### Papel final da aba `Dimensions`

A aba `Dimensions` no painel BIDSTOOLS não deve ser o local principal para disparar criação de cotas `by Line` ou `by Points`.

O papel final desta aba deve ser:

- definir `defaults` visuais;
- definir `Font Size`, `Stroke Weight`, `Arrow Size`;
- definir `Line Color` e `Text Color`;
- definir texto default de `Label`;
- expor futuras ações como `Refresh Linked Dimensions`, `Reattach` e edição de propriedades da cota selecionada.

### Comportamento esperado no Illustrator

- as tools do BIDSTOOLS devem surgir na secção de ferramentas de terceiros;
- o utilizador pode adicioná-las à toolbar visível através do `All Tools` drawer;
- o utilizador também pode criar uma toolbar própria em `Window > Toolbars > New Toolbar` e colocar lá as tools do BIDSTOOLS.

### Recomendação de implementação

- fase 1: garantir ferramentas de dimensão como `custom tools` do plugin;
- fase 2: usar o painel BIDSTOOLS para configurar escala, cor, tipografia e defaults;
- fase 3: opcionalmente agrupar as tools de dimensão numa experiência mais polida com ícones consistentes e organização previsível no drawer.

## Estrutura proposta da toolbar

- grupo `Horizontal`
- grupo `Vertical`
- grupo `Text`
- grupo `Radial`

Cada item da toolbar deve ter:

- ícone;
- label de texto;
- tooltip com o mesmo nome da ação;
- estado ativo quando a ação estiver selecionada.

### Nota de posicionamento

O plano deve assumir que a posição final na barra vertical depende do workspace e da personalização do utilizador no Illustrator. O plugin deve fornecer as tools; a colocação exata na toolbar visível pode ser feita pelo utilizador ao editar a toolbar.

## Aspeto visual da medida

A cota criada no plugin BIDSTOOLS deve ter uma apresentação próxima da imagem de referência:

- linha de cota horizontal ou vertical;
- linhas de extensão nos extremos;
- setas viradas para o interior;
- valor da medida centrado sobre a linha de cota;
- composição limpa, técnica e legível.

### Elementos visuais esperados

- `extension lines` ligadas aos pontos ou à linha de referência;
- `dimension line` separada do objeto;
- `arrowheads` pequenas e consistentes;
- texto centralizado entre as setas;
- cor configurável no futuro, mas com estilo base técnico e simples.

### Comportamento de layout

- a linha de cota não deve colidir visualmente com o objeto medido;
- o texto deve ficar centrado no vão disponível;
- quando houver pouco espaço, o sistema pode afastar o texto da linha sem perder legibilidade;
- as setas devem manter orientação coerente com a direção da cota;
- o conjunto deve funcionar para horizontal, vertical, diâmetro e raio.

## Lista de dimensões e labels

### Horizontal

- `Horizontal Dimension - by Line`
- `Horizontal Dimension - by Points`

### Vertical

- `Vertical Dimension - by Line`
- `Vertical Dimension - by Points`

### Text

- `Label`

### Radial

- `Diameter Dimension`
- `Radius Dimension`

## Interação da tool

### `by Line`

O modo `by Line` deve funcionar como uma tool interativa no canvas:

1. o utilizador ativa `Horizontal Dimension - by Line` ou `Vertical Dimension - by Line`;
2. a tool entra em modo de espera;
3. o utilizador clica na linha que quer cotar;
4. faz `drag` para definir a distância visual entre a linha original e a linha de cota;
5. ao largar o rato, a cota é criada nessa posição.

### Regras para `by Line`

- a medida deve ser extraída da linha efetivamente escolhida pelo utilizador;
- o `drag` define o offset visual da cota;
- a orientação final deve respeitar a tool ativa:
  - `Horizontal` mede e apresenta horizontalmente;
  - `Vertical` mede e apresenta verticalmente;
- a linha de cota criada deve ficar vinculada à linha original;
- se a linha original aumentar, diminuir ou mudar de posição, a medida deve atualizar;
- o texto da cota deve recalcular usando sempre a escala ativa.

### `by Points`

O modo `by Points` deve funcionar como uma tool interativa no canvas:

1. o utilizador ativa `Horizontal Dimension - by Points` ou `Vertical Dimension - by Points`;
2. seleciona o primeiro ponto de referência;
3. seleciona o segundo ponto de referência;
4. faz `drag` para definir onde a linha de cota fica posicionada;
5. ao largar o rato, a cota é criada nessa posição.

### Regras para `by Points`

- a distância medida deve usar exatamente os dois pontos escolhidos;
- o `drag` define o offset visual da cota em relação à geometria;
- a orientação final deve respeitar a tool ativa:
  - `Horizontal` fixa uma leitura horizontal;
  - `Vertical` fixa uma leitura vertical;
- o valor final mostrado continua a respeitar a escala ativa;
- este fluxo exige integração como `custom tool` nativa no Illustrator, não apenas um botão de painel CEP.

## Vínculo entre geometria e cota

As cotas `by Line` devem ficar ligadas à geometria de origem.

### Resultado esperado

- cada cota guarda referência à linha ou entidade medida;
- cada cota guarda também o tipo de medição e o offset escolhido pelo utilizador;
- quando a linha original muda, a geometria da cota é recalculada;
- o valor numérico é atualizado automaticamente;
- o vínculo deve manter também a escala usada e os settings visuais da cota.

### Implicação técnica

- isto exige identificação persistente da geometria fonte;
- exige metadata no objeto de cota;
- exige rotina de refresh/rebuild da cota;
- idealmente exige notifiers ou mecanismo equivalente no lado nativo do plugin para reagir a mudanças no documento.

## Regra de escala

Todas as medidas mostradas e desenhadas pela tool devem ter em conta a escala ativa escolhida no plugin BIDSTOOLS.

### Regra principal

- o valor geométrico do desenho é lido no documento;
- esse valor é convertido pela escala ativa;
- o texto final da cota mostra a medida real já escalada.

### Escala predefinida

- a escala `default` do plugin BIDSTOOLS deve ser `1:1`.

### Exemplo

- se a distância no desenho for `4.42 m` em contexto `1:1`, a cota mostra `4.42 m`;
- se a escala ativa alterar a leitura real, a cota deve mostrar o valor convertido segundo essa escala;
- ao mudar a escala ativa, novas cotas devem usar essa escala automaticamente.

## Controlo de estilo da cota

O plano deve prever controlo visual básico para que o utilizador consiga ajustar a aparência das cotas no plugin BIDSTOOLS.

### Propriedades configuráveis

- cor das `extension lines`;
- cor da `dimension line`;
- cor das setas;
- cor do texto da medida;
- tamanho da fonte do texto e dos números;
- espessura da linha;
- tamanho das setas.

### Comportamento esperado

- o utilizador deve poder definir um estilo base para novas cotas;
- por defeito, linhas, setas e texto podem usar a mesma cor;
- o tamanho da fonte deve afetar o valor numérico e o texto do `Label`;
- alterações de estilo aplicam-se a novas cotas sem alterar automaticamente cotas já criadas, a menos que exista futura opção explícita para atualizar;
- o estilo deve funcionar de forma consistente em cotas horizontais, verticais, diâmetro e raio.

### Defaults recomendados

- cor base técnica simples, com boa legibilidade sobre fundos claros;
- tamanho de fonte equilibrado para leitura sem ocupar espaço excessivo;
- espessura de linha leve;
- setas pequenas e proporcionais ao texto.

## Ordem recomendada na toolbar

1. `Horizontal Dimension - by Line`
2. `Horizontal Dimension - by Points`
3. `Vertical Dimension - by Line`
4. `Vertical Dimension - by Points`
5. `Label`
6. `Diameter Dimension`
7. `Radius Dimension`

## Labels curtos opcionais

Se for preciso uma versão mais compacta para UI com menos largura:

- `H Dim - Line`
- `H Dim - Points`
- `V Dim - Line`
- `V Dim - Points`
- `Label`
- `Diameter`
- `Radius`

## Notas de UX

- manter os nomes completos no menu e tooltip;
- usar separators visuais entre grupos;
- `Label` deve aparecer como ação de texto associada às dimensões;
- as variantes `by Line` e `by Points` devem ficar lado a lado dentro de cada direção para reduzir ambiguidade;
- `Diameter` e `Radius` devem ficar no fim por serem ações de geometria circular.
- a aparência da cota deve manter consistência visual em todas as ferramentas;
- o utilizador deve perceber facilmente que o valor mostrado já respeita a escala ativa;
- `1:1` deve estar disponível e ativo por defeito até o utilizador escolher outra escala.

## Resultado esperado

Uma toolbar simples e direta, com todas as ações principais de cotagem e um botão de `Label` para texto, pronta para implementação na UI do plugin.

As cotas geradas devem apresentar um aspeto técnico semelhante ao exemplo fornecido e mostrar sempre valores compatíveis com a escala ativa, com `1:1` como escala predefinida no BIDSTOOLS.

Quando a integração nativa estiver ativa, as tools do BIDSTOOLS devem poder aparecer no ecossistema de tools do Illustrator e ser adicionadas pelo utilizador à barra vertical ou a uma toolbar personalizada.
