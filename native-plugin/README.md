# BIDSTOOLS Selection Notifier

Plugin nativo Illustrator (`.aip`) responsável por:

- subscrever `kAIArtSelectionChangedNotifier`;
- gerar uma assinatura estável da seleção atual;
- filtrar notificações redundantes;
- emitir o evento CEP `com.bidstools.selectionChanged` para o painel `com.bidstools.measure.panel`.

Não calcula geometria, perímetro, área nem escala. O painel continua a chamar `refreshSelection()` para obter os dados reais via JSX.

## Estrutura

- `include/`: headers do plugin
- `src/`: implementação C++

## Evento CEP emitido

Nome:

```text
com.bidstools.selectionChanged
```

Payload JSON:

```json
{
  "source": "BIDSTOOLSSelectionNotifier",
  "documentChanged": true,
  "selectionSignature": "count=1;doc=0x12345678;items=0x00ABCDEF",
  "selectedCount": 1
}
```

## Assinatura da seleção

A assinatura é construída com:

- handle do documento atual;
- número de itens selecionados;
- lista ordenada dos `AIArtHandle` selecionados.

Formato:

```text
count=<n>;doc=<document-handle>;items=<sorted-art-handle-1>,<sorted-art-handle-2>,...
```

Regras:

- mesma assinatura => não emitir evento;
- assinatura diferente => emitir evento;
- sem documento => `no-document`;
- documento sem seleção => `count=0;doc=<document-handle>;items=`.

## Build

Pré-requisitos:

- Visual Studio 2022 com toolset C++;
- CMake 3.21+;
- Illustrator SDK disponível localmente;
- CEP/PlugPlug presente no runtime do Illustrator.

Variáveis esperadas:

```powershell
$env:ILLUSTRATOR_SDK_DIR="C:\SDKs\illustrator-sdk"
```

Configurar e compilar:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\AndreGarcia\Documents\BIDSTOOLS\scripts\build-native-plugin.ps1
```

O script:

- valida `ILLUSTRATOR_SDK_DIR`;
- encontra `cmake` via `PATH` ou via Visual Studio 2022 Build Tools;
- corre `cmake configure` e `cmake --build`;
- produz `native-plugin\build\Release\BIDSTOOLSSelectionNotifier.aip`.

Para forçar reconfiguração limpa:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\AndreGarcia\Documents\BIDSTOOLS\scripts\build-native-plugin.ps1 -Clean
```

Se preferires continuar manualmente, o script equivale a:

```powershell
cmake -S C:\Users\AndreGarcia\Documents\BIDSTOOLS\native-plugin -B C:\Users\AndreGarcia\Documents\BIDSTOOLS\native-plugin\build -G "Visual Studio 17 2022" -A x64 -D ILLUSTRATOR_SDK_DIR="C:\SDKs\illustrator-sdk"
cmake --build C:\Users\AndreGarcia\Documents\BIDSTOOLS\native-plugin\build --config Release
```

## CEP resources obtidos localmente

Para documentação e samples CEP, o workspace pode usar o clone local:

- `external/CEP-Resources` (clone de `Adobe-CEP/CEP-Resources`)

Para referência da DLL histórica `PlugPlugExternalObject` em Windows:

- `external/PlugPlugExternalObject/PlugPlugExternalObject-Win/win64/PlugPlugExternalObject.dll`

Segundo a documentação oficial Adobe CEP, esta biblioteca já vem integrada no Illustrator, por isso o build do `.aip` não depende de um `CEP_SDK_DIR` separado para compilar.

Saída esperada:

```text
native-plugin\build\Release\BIDSTOOLSSelectionNotifier.aip
```

## Instalação

1. Copiar `BIDSTOOLSSelectionNotifier.aip` para a pasta de plugins do Illustrator.
2. Garantir que o painel CEP `com.bidstools.measure.panel` está instalado em modo de desenvolvimento.
3. Reiniciar o Illustrator.
4. Abrir o painel `BIDSTOOLS Measure`.

## Integração

Fluxo:

1. Illustrator dispara `kAIArtSelectionChangedNotifier`.
2. O plugin recompõe a assinatura atual.
3. Se a assinatura mudou, o plugin chama `PlugPlugDispatchEvent`.
4. O painel recebe `com.bidstools.selectionChanged`.
5. O painel chama `refreshSelection()` sem polling.

## Limitações atuais

- O projeto assume disponibilidade do Illustrator SDK e do CEP SDK fora do repositório.
- A assinatura usa handles de documento e arte, adequados para deduplicação durante a sessão atual do Illustrator, não como identificadores persistentes entre sessões.
- O build não foi executado neste workspace porque os SDKs e o toolchain do Illustrator não estão presentes aqui.
