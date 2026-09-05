param(
  [string]$Import
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$appDir = Join-Path $repoRoot "anniversary_app"

Push-Location $appDir
try {
  if ($Import) {
    flutter run -d windows --dart-entrypoint-args="--import=$Import"
  } else {
    flutter run -d windows
  }
} finally {
  Pop-Location
}
