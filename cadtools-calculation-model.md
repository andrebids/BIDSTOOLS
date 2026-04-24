# Modelo de cálculo observado: referência CadTools

## Objetivo

Documentar o modelo de cálculo que deve ser replicado no plugin para produzir resultados compatíveis com o comportamento observado no `CadTools`, pelo menos para:

- `X`
- `Y`
- `W`
- `H`
- `Perim`
- `Area`

em objetos simples, com foco em retângulos/quadrados.

## Caso observado

### Geometria desenhada no Illustrator

- `W = 63,398 mm`
- `H = 59,989 mm`

### Escala ativa

- `38 mm = 1,00 m`

### Resultado mostrado pelo CadTools

- `W = 1,67 m`
- `H = 1,58 m`
- `Perim = 6,49 m`
- `Area = 2,63 sq m`
- `X = 3,87 m`
- `Y = -2,78 m`

## Conclusão principal

O `CadTools` parece aplicar uma transformação direta por fator de escala:

- grandezas lineares escalam linearmente;
- grandezas de área escalam com o quadrado do fator;
- arredondamento visual a 2 casas decimais.

## Modelo matemático

## 1. Escala linear

Para uma escala textual no formato:

```text
A unidade_desenho = B unidade_real
```

o fator linear é:

```text
fator_linear = B / A
```

na unidade de saída desejada.

### Exemplo

Para:

```text
38 mm = 1 m
```

temos:

```text
fator_linear = 1 / 38
```

Isto significa:

- cada `38 mm` desenhados representam `1 m` real;
- cada `1 mm` desenhado representa `1/38 m`.

## 2. Grandezas lineares

Aplicar:

```text
valor_real = valor_desenhado * fator_linear
```

Isto vale para:

- `X`
- `Y`
- `W`
- `H`
- comprimento
- perímetro

## 3. Grandezas de área

Aplicar:

```text
fator_area = fator_linear²
area_real = area_desenhada * fator_area
```

ou equivalentemente:

```text
area_real = area_desenhada / A²
```

quando:

- `A` está na unidade desenhada;
- `B = 1` unidade real.

### Exemplo `38 mm = 1 m`

```text
fator_linear = 1 / 38
fator_area = 1 / 1444
```

## Fórmulas implementáveis

## Entrada base

Assumindo:

- o plugin lê `W` e `H` geométricos em `mm`;
- `X` e `Y` também são convertidos para `mm` antes da escala;
- `Perim_draw = 2 × (W_draw + H_draw)`;
- `Area_draw = W_draw × H_draw`.

## Saída

### Para `38 mm = 1 m`

```text
W_real_m = W_draw_mm / 38
H_real_m = H_draw_mm / 38
X_real_m = X_draw_mm / 38
Y_real_m = Y_draw_mm / 38
Perim_real_m = Perim_draw_mm / 38
Area_real_m2 = Area_draw_mm2 / 1444
```

## Verificação com o caso real

### Input

```text
W_draw = 63,398 mm
H_draw = 59,989 mm
```

### Cálculo

```text
W_real = 63,398 / 38 = 1,668368421 m
H_real = 59,989 / 38 = 1,578657895 m
Perim_draw = 2 × (63,398 + 59,989) = 246,774 mm
Perim_real = 246,774 / 38 = 6,494052632 m
Area_draw = 63,398 × 59,989 = 3803,182622 mm²
Area_real = 3803,182622 / 1444 = 2,633782979 m²
```

### Apresentação com 2 casas

```text
W = 1,67 m
H = 1,58 m
Perim = 6,49 m
Area = 2,63 m²
```

Isto coincide com o resultado observado no `CadTools`.

## Hipótese para `X` e `Y`

Os valores observados sugerem fortemente que `X` e `Y` seguem a mesma regra:

```text
X_real = X_draw / 38
Y_real = Y_draw / 38
```

Ou seja:

- o `CadTools` parece pegar na posição geométrica do objeto em relação ao origin atual do documento;
- converte essa posição para a unidade do desenho;
- aplica exatamente o mesmo fator linear da escala.

## Regra de arredondamento observada

Com base no screenshot:

- `W`, `H`, `Perim`, `Area`, `X`, `Y` parecem ser mostrados com `2 casas decimais`;
- o valor interno deve manter precisão maior;
- arredondar apenas no output.

### Regra recomendada

```text
valor_display = round(valor_interno, 2)
```

Não usar o valor arredondado para cálculos seguintes.

## Bounds a usar

## Recomendação

Para replicar o comportamento esperado em objetos simples:

- usar `geometricBounds`, `width` e `height`;
- não usar `visibleBounds` como regra principal;
- ignorar stroke na geometria do MVP.

## Motivo

O caso observado bate com dimensão geométrica do shape, não com aparência visual expandida por stroke/efeitos.

## Pipeline de cálculo recomendado para o plugin

## 1. Ler geometria Illustrator

Obter:

- `left`
- `top`
- `width`
- `height`
- `geometricBounds`

## 2. Converter para unidade de desenho

Normalizar tudo para uma unidade base consistente, idealmente:

- `mm`

## 3. Resolver escala ativa

Exemplo:

- `1:1`
- `38 mm = 1 m`
- escala document-based ou layer-based

## 4. Aplicar fator de escala

### Grandezas lineares

```text
valor_real = valor_draw_mm * fator_linear
```

### Grandezas de área

```text
valor_real_area = valor_draw_mm2 * fator_linear²
```

## 5. Formatar output

- unidade final: `m`
- área final: `sq m`
- arredondamento visual: `2 casas`

## Regras para edição no painel

Se o utilizador editar `W` ou `H` em unidade real:

### Exemplo

Quer `W = 2,00 m` com escala `38 mm = 1 m`

Então o valor a aplicar ao objeto no desenho é:

```text
W_draw_mm = W_real_m × 38
```

Regra geral:

```text
valor_draw = valor_real / fator_linear
```

Para área, não há edição direta recomendada no MVP.

## Tabela de referência rápida

### Escala `1:1`

Se o desenho estiver em `mm` e a saída for em `m`:

```text
fator_linear = 1 / 1000
fator_area = 1 / 1000000
```

### Escala `38 mm = 1 m`

```text
fator_linear = 1 / 38
fator_area = 1 / 1444
```

## Casos de teste recomendados

## Caso A: 1:1

Input:

- `W = 63,398 mm`
- `H = 59,989 mm`

Esperado:

- `W = 0,06 m`
- `H = 0,06 m`
- `Perim = 0,25 m`
- `Area = 0,00 m²`

com output arredondado a 2 casas.

## Caso B: 38 mm = 1 m

Input:

- `W = 63,398 mm`
- `H = 59,989 mm`

Esperado:

- `W = 1,67 m`
- `H = 1,58 m`
- `Perim = 6,49 m`
- `Area = 2,63 m²`

## Limites desta conclusão

Este modelo está validado para:

- shape simples;
- leitura de `W/H/Perim/Area`;
- escala `38 mm = 1 m`.

Ainda falta validar separadamente:

- objects com stroke;
- rotação;
- groups;
- compound paths;
- clipping masks;
- origem do `X/Y` em diferentes ruler origins;
- se o `CadTools` usa `top-left`, `bottom-left` ou outro referencial em todos os cenários.

## Decisão de implementação

Para o MVP, o plugin deve copiar este comportamento:

1. usar geometria simples;
2. calcular em unidade base do desenho;
3. aplicar escala linear;
4. aplicar escala ao quadrado para área;
5. arredondar apenas na apresentação.

Isto é o caminho mais seguro para produzir números compatíveis com o `CadTools` nos casos principais.

