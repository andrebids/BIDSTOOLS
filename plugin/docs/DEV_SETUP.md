# CEP Dev Setup

## Local setup

Project plugin root:

- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin`

Dev setup script:

- `C:\Users\AndreGarcia\Documents\BIDSTOOLS\scripts\setup-illustrator-cep-dev.ps1`

## What the script configures

- CEP extension junction in `%AppData%\Adobe\CEP\extensions\BIDSTOOLS-Measure`
- `PlayerDebugMode=1` in:
  - `HKCU\Software\Adobe\CSXS.11`
  - `HKCU\Software\Adobe\CSXS.10`
  - `HKCU\Software\Adobe\CSXS.9`

## Open the panel

1. Restart Illustrator.
2. Go to `Window > Extensions` or `Window > Extensions (Legacy)`.
3. Open `BIDSTOOLS Measure`.

## DevTools

The extension root contains `.debug` configured for:

- host: `ILST`
- port: `8088`

This is intended for CEP remote debugging in development.
