param(
  [string]$IllustratorSdkDir = $env:ILLUSTRATOR_SDK_DIR,
  [string]$SourceDir = (Join-Path $PSScriptRoot "..\native-plugin"),
  [string]$BuildDir = (Join-Path $PSScriptRoot "..\native-plugin\build"),
  [ValidateSet("Debug", "Release", "RelWithDebInfo", "MinSizeRel")]
  [string]$Configuration = "Release",
  [string]$Generator = "Visual Studio 17 2022",
  [ValidateSet("x64")]
  [string]$Platform = "x64",
  [switch]$Clean,
  [switch]$OpenBuildDir
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  throw $Message
}

function Resolve-RequiredPath([string]$PathValue, [string]$Label) {
  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    Fail "$Label is missing. Pass -$Label or define the matching environment variable."
  }

  if (-not (Test-Path -LiteralPath $PathValue)) {
    Fail "$Label path does not exist: $PathValue"
  }

  return (Resolve-Path -LiteralPath $PathValue).Path
}

function Normalize-IllustratorSdkRoot([string]$PathValue) {
  $resolved = Resolve-RequiredPath $PathValue "IllustratorSdkDir"

  if (Test-Path -LiteralPath (Join-Path $resolved "illustratorapi")) {
    return $resolved
  }

  Fail "Illustrator SDK root must contain 'illustratorapi': $resolved"
}

function Find-CMakeExecutable([string]$VisualStudioPath) {
  $command = Get-Command "cmake" -ErrorAction SilentlyContinue
  if ($null -ne $command) {
    return $command.Source
  }

  $visualStudioCMake = Join-Path $VisualStudioPath "Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
  if (Test-Path -LiteralPath $visualStudioCMake) {
    return $visualStudioCMake
  }

  Fail "cmake was not found. Install CMake 3.21+ or the Visual Studio CMake component."
}

function Assert-VisualStudio2022() {
  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (-not (Test-Path -LiteralPath $vswhere)) {
    Fail "Visual Studio locator not found at '$vswhere'. Install Visual Studio 2022 with Desktop development for C++."
  }

  $installationPath = & $vswhere `
    -version "[17.0,18.0)" `
    -latest `
    -products * `
    -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
    -property installationPath

  if ([string]::IsNullOrWhiteSpace($installationPath)) {
    Fail "Visual Studio 2022 with C++ tools was not found."
  }

  return $installationPath.Trim()
}

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$sourceRoot = Resolve-RequiredPath $SourceDir "SourceDir"
$buildRoot = [System.IO.Path]::GetFullPath($BuildDir)
$illustratorSdkRoot = Normalize-IllustratorSdkRoot $IllustratorSdkDir

if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot "CMakeLists.txt"))) {
  Fail "SourceDir does not look like the native plugin project: $sourceRoot"
}

$visualStudioPath = Assert-VisualStudio2022
$cmakeExe = Find-CMakeExecutable $visualStudioPath

if ($Clean -and (Test-Path -LiteralPath $buildRoot)) {
  if (-not $buildRoot.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    Fail "Refusing to remove build directory outside repository root: $buildRoot"
  }

  Remove-Item -LiteralPath $buildRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null

$configureArgs = @(
  "-S", $sourceRoot,
  "-B", $buildRoot,
  "-G", $Generator,
  "-A", $Platform,
  "-D", "ILLUSTRATOR_SDK_DIR=$illustratorSdkRoot"
)

$buildArgs = @(
  "--build", $buildRoot,
  "--config", $Configuration
)

Write-Host "Repository:      $repoRoot"
Write-Host "Source:          $sourceRoot"
Write-Host "Build:           $buildRoot"
Write-Host "Configuration:   $Configuration"
Write-Host "Generator:       $Generator"
Write-Host "Platform:        $Platform"
Write-Host "Illustrator SDK: $illustratorSdkRoot"
Write-Host "Visual Studio:   $visualStudioPath"
Write-Host "CMake:           $cmakeExe"

& $cmakeExe @configureArgs
if ($LASTEXITCODE -ne 0) {
  Fail "CMake configure failed."
}

& $cmakeExe @buildArgs
if ($LASTEXITCODE -ne 0) {
  Fail "CMake build failed."
}

$artifactPath = Join-Path $buildRoot "$Configuration\BIDSTOOLSSelectionNotifier.aip"
if (-not (Test-Path -LiteralPath $artifactPath)) {
  Fail "Build finished but artifact was not found at: $artifactPath"
}

Write-Host ""
Write-Host "Build succeeded."
Write-Host "Artifact: $artifactPath"

if ($OpenBuildDir) {
  Start-Process explorer.exe "/select,`"$artifactPath`""
}
