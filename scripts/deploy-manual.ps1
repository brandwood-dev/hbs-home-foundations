param(
  [string]$WorkerName = "hbs-home-staging",
  [string]$CompatibilityDate = "2026-08-18",
  [string]$CloudflareConfigHome = "",
  [string]$SupabaseUrl = "",
  [string]$SupabasePublishableKey = "",
  [string]$HbsApiBaseUrl = "",
  [string]$ReleaseSha = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configHome = Join-Path $projectRoot ".wrangler-config"

if (-not $ReleaseSha) {
  $ReleaseSha = (& git -C $projectRoot rev-parse HEAD 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($ReleaseSha)) {
    throw "Impossible de déterminer la révision Git du déploiement."
  }

  $status = (& git -C $projectRoot status --porcelain 2>$null | Out-String).Trim()
  if (-not [string]::IsNullOrWhiteSpace($status)) {
    $ReleaseSha = "$ReleaseSha-dirty"
  }
}

function Read-EnvFile([string]$path) {
  if (-not (Test-Path $path)) {
    return @{}
  }

  $values = @{}
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
      return
    }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) {
      return
    }

    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim().Trim('"')
    if ($name.Length -gt 0) {
      $values[$name] = $value
    }
  }
  return $values
}

Write-Host "=== Deploy manual HBS HOME (Windows) ==="
Write-Host "Projet : $projectRoot"
Write-Host "Worker : $WorkerName"
Write-Host "Release: $ReleaseSha"

$envFiles = @(
  (Join-Path $projectRoot ".env.production"),
  (Join-Path $projectRoot ".env.preview"),
  (Join-Path $projectRoot ".env.staging"),
  (Join-Path $projectRoot ".env.local"),
  (Join-Path $projectRoot ".env")
)
$possibleConfigHomes = @(
  ".wrangler-config",
  (Join-Path $env:APPDATA "xdg.config"),
  (Join-Path $env:APPDATA "wrangler"),
  (Join-Path $env:APPDATA "Cloudflare\wrangler")
)
foreach ($envFile in $envFiles) {
  $loaded = Read-EnvFile $envFile
  if (-not $SupabaseUrl -and $loaded.ContainsKey("VITE_SUPABASE_URL")) {
    $SupabaseUrl = $loaded["VITE_SUPABASE_URL"]
  }
  if (-not $SupabasePublishableKey -and $loaded.ContainsKey("VITE_SUPABASE_PUBLISHABLE_KEY")) {
    $SupabasePublishableKey = $loaded["VITE_SUPABASE_PUBLISHABLE_KEY"]
  }
  if (-not $HbsApiBaseUrl -and $loaded.ContainsKey("VITE_HBS_API_BASE_URL")) {
    $HbsApiBaseUrl = $loaded["VITE_HBS_API_BASE_URL"]
  }
}

if (-not $CloudflareConfigHome) {
  foreach ($candidate in $possibleConfigHomes) {
    if ([string]::IsNullOrWhiteSpace($candidate)) {
      continue
    }
    $candidateConfig = Join-Path $candidate ".wrangler\\config\\default.toml"
    if (Test-Path $candidateConfig) {
      $CloudflareConfigHome = $candidate
      break
    }
  }
}

if (-not $SupabaseUrl) {
  $SupabaseUrl = $env:VITE_SUPABASE_URL
}
if (-not $SupabasePublishableKey) {
  $SupabasePublishableKey = $env:VITE_SUPABASE_PUBLISHABLE_KEY
}
if (-not $HbsApiBaseUrl) {
  $HbsApiBaseUrl = $env:VITE_HBS_API_BASE_URL
}

if (-not $SupabaseUrl -or -not $SupabasePublishableKey) {
  Write-Host "❌ Variables Supabase manquantes."
  Write-Host "Vous devez fournir :"
  Write-Host "  - VITE_SUPABASE_URL"
  Write-Host "  - VITE_SUPABASE_PUBLISHABLE_KEY"
  Write-Host ""
  Write-Host "Modes d’usage possibles :"
  Write-Host "  - Définir en variables d’environnement :"
  Write-Host '      $env:VITE_SUPABASE_URL="https://<project-ref>.supabase.co"'
  Write-Host '      $env:VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"'
  Write-Host "  - Ou relancer :"
  Write-Host '      .\scripts\deploy-manual.ps1 -SupabaseUrl "<url>" -SupabasePublishableKey "<clé>"'
  throw "Variables Supabase manquantes"
}
if (-not $HbsApiBaseUrl) {
  Write-Host "❌ Variable API manquante."
  Write-Host "Vous devez fournir :"
  Write-Host "  - VITE_HBS_API_BASE_URL (ex: https://api-preview.hbs-home.com)"
  Write-Host ""
  Write-Host "Modes d’usage possibles :"
  Write-Host "  - Définir en variable d’environnement :"
  Write-Host '      $env:VITE_HBS_API_BASE_URL="https://api-preview.hbs-home.com"'
  Write-Host "  - Ou relancer :"
  Write-Host '      .\scripts\deploy-manual.ps1 -HbsApiBaseUrl "<url API>" -SupabaseUrl "<url supabase>" -SupabasePublishableKey "<clé>"'
  throw "Variable HBS API base URL manquante"
}

$env:VITE_SUPABASE_URL = $SupabaseUrl
$env:VITE_SUPABASE_PUBLISHABLE_KEY = $SupabasePublishableKey
$env:VITE_HBS_API_BASE_URL = $HbsApiBaseUrl
$env:VITE_APP_ENVIRONMENT = "staging"
$env:VITE_RELEASE_SHA = $ReleaseSha
if (-not $CloudflareConfigHome) {
  $CloudflareConfigHome = (Resolve-Path ".wrangler-config").Path
}
$CloudflareConfigHome = (Resolve-Path $CloudflareConfigHome).Path
$configHome = $CloudflareConfigHome

New-Item -ItemType Directory -Force -Path $configHome | Out-Null

Push-Location $projectRoot
try {
  Write-Host "Étape 1/4 : build de production"
  $env:XDG_CONFIG_HOME = $configHome
  $env:WRANGLER_CONFIG_HOME = $configHome
  bun run build

  Write-Host "Étape 2/4 : contrôle auth Cloudflare"
  $hasToken = [bool]$env:CLOUDFLARE_API_TOKEN
  $profilesToCheck = @(
    "$env:APPDATA\xdg.config\.wrangler\config\default.toml",
    "$env:USERPROFILE\.config\wrangler\config\default.toml",
    "$env:APPDATA\Wrangler\config\default.toml",
    "$env:USERPROFILE\AppData\Roaming\wrangler\config\default.toml",
    "$env:USERPROFILE\AppData\Roaming\.wrangler\config\default.toml",
    "$CloudflareConfigHome\.wrangler\config\default.toml"
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  $hasLocalProfile = $profilesToCheck | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $hasToken -and -not $hasLocalProfile) {
    Write-Host "❌ Aucune authentification Cloudflare détectée."
    Write-Host "Solutions :"
    Write-Host "  - définir CLOUDFLARE_API_TOKEN dans cette session"
    Write-Host "  - ou exécuter une fois : bunx wrangler login"
    throw "Auth Cloudflare manquante"
  }

  Write-Host "Vérification des credentials Cloudflare..."
  bunx wrangler whoami
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Credentials Cloudflare invalides ou périmés."
    throw "Auth Cloudflare invalide"
  }

  Write-Host "Étape 3/4 : nettoyage des artifacts de déploiement"
  if (Test-Path ".wrangler") {
    Remove-Item -Recurse -Force ".wrangler"
  }
  if (Test-Path ".wrangler-config\.wrangler") {
    Remove-Item -Recurse -Force ".wrangler-config\.wrangler"
  }

  Write-Host "Étape 4/4 : déploiement Wrangler"
  bunx wrangler deploy `
    --config ".output/server/wrangler.json" `
    ".output/server/index.mjs" `
    --name $WorkerName `
    --compatibility-date $CompatibilityDate `
    --compatibility-flags nodejs_compat `
    --no-bundle `
    --assets ".output/public"

  if ($LASTEXITCODE -ne 0) {
    throw "wrangler deploy a retourné une erreur ($LASTEXITCODE)"
  }

  Write-Host "✅ Déploiement terminé avec succès."
}
finally {
  Pop-Location
}
