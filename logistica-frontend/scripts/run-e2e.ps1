param(
  [switch]$Build = $false,
  [string]$TestName = "",
  [switch]$UI = $false,
  [switch]$SkipBackend = $false
)

$FrontendDir = Split-Path -Parent $PSScriptRoot
$RepoRoot = Split-Path -Parent $FrontendDir
$ApiDir = Join-Path $RepoRoot "logistica-api"
$LogDir = Join-Path $FrontendDir ".e2e-logs"
$null = New-Item -ItemType Directory -Path $LogDir -Force

function Cleanup {
  Write-Host "`nStopping servers..." -ForegroundColor Yellow
  Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "next" } | Stop-Process -Force
  Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "manage.py" } | Stop-Process -Force
}

trap { Cleanup; break }

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Logística E2E — Local Runner          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipBackend) {
  Write-Host "[1/4] Starting Django backend..." -ForegroundColor Green

  $djangoLog = Join-Path $LogDir "django.log"
  $djangoErr = Join-Path $LogDir "django.err"

  Push-Location $ApiDir
  try {
    $venvActivate = Join-Path $ApiDir ".venv\Scripts\Activate.ps1"
    if (Test-Path $venvActivate) {
      & $venvActivate
    }
    $job = Start-Job -ScriptBlock {
      param($dir, $log, $err)
      Set-Location $dir
      python manage.py runserver 0.0.0.0:8000 *>"$log" 2>"$err"
    } -ArgumentList $ApiDir, $djangoLog, $djangoErr
    Write-Host "  Django starting (PID: $($job.Id))..." -ForegroundColor Gray
  } finally {
    Pop-Location
  }

  Write-Host "  Waiting for Django at http://localhost:8000..." -NoNewline
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $null = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/docs/" -UseBasicParsing -TimeoutSec 2
      $ready = $true
      break
    } catch {
      Start-Sleep -Seconds 2
    }
  }
  if (-not $ready) { Write-Host " FAILED"; Cleanup; throw "Django did not start within 120s" }
  Write-Host " OK" -ForegroundColor Green
}

Write-Host "[2/4] Starting Next.js frontend..." -ForegroundColor Green

$nextLog = Join-Path $LogDir "next.log"
$nextErr = Join-Path $LogDir "next.err"

Push-Location $FrontendDir
try {
  if ($Build) {
    Write-Host "  Building..." -ForegroundColor Gray
    npm run build *>"$LogDir\build.log" 2>"$LogDir\build.err"
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
  }

  $npm = if ($env:COMSPEC) { "npm.cmd" } else { "npm" }
  $job = Start-Job -ScriptBlock {
    param($dir, $cmd, $log, $err)
    Set-Location $dir
    & $cmd run start *>"$log" 2>"$err"
  } -ArgumentList $FrontendDir, $npm, $nextLog, $nextErr
} finally {
  Pop-Location
}

Write-Host "  Waiting for Next.js at http://localhost:3000..." -NoNewline
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}
if (-not $ready) { Write-Host " FAILED"; Cleanup; throw "Next.js did not start within 120s" }
Write-Host " OK" -ForegroundColor Green

Write-Host "[3/4] Running Playwright tests..." -ForegroundColor Green

Push-Location $FrontendDir
try {
  $e2eArgs = @("run", "e2e", "--")
  if ($TestName) { $e2eArgs += @("--grep", $TestName) }
  if ($UI) {
    npm run e2e:ui 2>&1
  } else {
    if ($TestName) {
      npm run e2e -- --grep $TestName 2>&1
    } else {
      npm run e2e 2>&1
    }
  }
} finally {
  Pop-Location
}

Write-Host "[4/4] Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Logs saved to: $LogDir" -ForegroundColor Gray
Write-Host "Run 'npm run e2e:report' to view HTML report" -ForegroundColor Gray

Cleanup
