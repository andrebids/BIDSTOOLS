# Integration Notes

## Current scaffold

- `plugin-main/`: ponto de entrada e registo de tools/notifiers
- `core/contracts/`: tipos e payloads partilhados
- `core/interaction/`: sessão de interação e estado de preview
- `core/hit-testing/`: resolução de linha/ponto sob o cursor
- `core/preview/`: preview temporária durante drag
- `core/dimension-builder/`: geometria e criação de arte final
- `core/dimension-linking/`: vínculo entre cota e fonte
- `core/dimension-refresh/`: rebuild manual/automático
- `core/metadata/`: leitura e escrita de metadata
- `bridge/panel-sync/`: defaults vindos do painel BIDSTOOLS

## First implementation target

- tool: `Horizontal Dimension - by Line`
- session: `awaiting-source -> dragging-offset -> committing`
- source: `LineSourceRef`
- output: `DimensionRecord`
- refresh: manual

## Settings bridge with the CEP panel

The current bridge contract is file-based:

- the BIDSTOOLS CEP panel writes current scale and dimension style to `plugin/shared/panel-settings.json`;
- the native layer reads that file through `PanelSettingsProvider`;
- the initial implementation can safely fallback to native defaults if the file is missing;
- the target source of truth remains the main BIDSTOOLS panel.

Current file payload includes:

- active scale mode and parsed scale definition;
- line/text colors;
- font size;
- stroke width;
- arrow size;
- default label text;
- current dimension mode.
