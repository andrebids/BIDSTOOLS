param(
  [string]$ExtensionName = "BIDSTOOLS-Measure",
  [string]$PluginPath = "C:\Users\AndreGarcia\Documents\BIDSTOOLS\plugin"
)

$ErrorActionPreference = "Stop"

$extensionsRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$linkPath = Join-Path $extensionsRoot $ExtensionName
$pluginResolved = (Resolve-Path $PluginPath).Path
$csxsVersions = @("CSXS.11", "CSXS.10", "CSXS.9")

New-Item -ItemType Directory -Force -Path $extensionsRoot | Out-Null

foreach ($version in $csxsVersions) {
  $keyPath = "HKCU:\Software\Adobe\$version"
  New-Item -Path $keyPath -Force | Out-Null
  New-ItemProperty -Path $keyPath -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
}

if (Test-Path $linkPath) {
  $existing = Get-Item $linkPath -Force
  if ($existing.LinkType -or ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    Remove-Item $linkPath -Force
  } else {
    throw "A non-link path already exists at $linkPath. Remove it manually before continuing."
  }
}

cmd /c mklink /J "$linkPath" "$pluginResolved" | Out-Null

Write-Host "CEP dev setup complete."
Write-Host "Extension link: $linkPath"
Write-Host "Plugin path:    $pluginResolved"
Write-Host "PlayerDebugMode enabled for: $($csxsVersions -join ', ')"
