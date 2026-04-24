# Dev Scripts

## Illustrator CEP dev setup

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-illustrator-cep-dev.ps1
```

What it does:

- creates `%AppData%\Adobe\CEP\extensions` if missing
- enables `PlayerDebugMode=1` for `CSXS.11`, `CSXS.10`, and `CSXS.9`
- creates a junction from the CEP extensions folder to this project's `plugin` folder

After running:

1. Restart Illustrator.
2. Open `Window > Extensions` or `Window > Extensions (Legacy)`.
3. Open `BIDSTOOLS Measure`.

The plugin root also includes a `.debug` file configured for `ILST` on port `8088`.
