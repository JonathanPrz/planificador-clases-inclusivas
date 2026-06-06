param(
    [string]$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path,
    [string]$TargetRoot = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path "aula-clara")
)

$ErrorActionPreference = "Stop"

if (Test-Path -LiteralPath $TargetRoot) {
    throw "La carpeta destino ya existe: $TargetRoot"
}

New-Item -ItemType Directory -Path $TargetRoot | Out-Null

$files = @(
    "index.html",
    "styles.css",
    "app.js",
    "content.js",
    "data.js",
    "dua.js",
    "metrics.js",
    "navigation.js",
    "report.js",
    "supports.js",
    "tabs.js",
    "theme.js",
    "sw.js"
)

foreach ($file in $files) {
    Copy-Item -LiteralPath (Join-Path $SourceRoot $file) -Destination (Join-Path $TargetRoot $file)
}

New-Item -ItemType Directory -Path (Join-Path $TargetRoot "docs") | Out-Null

@"
# Aula Clara

Version comercial inicial derivada del prototipo original creado por Jonathan Perez.

Esta copia debe sanitizarse antes de publicarse o venderse:

- retirar referencias a Duoc, UIE y Campus Arauco;
- reemplazar logos y cabeceras PDF;
- reemplazar credenciales de metricas;
- reconstruir contenidos editoriales desde fuentes publicas;
- crear documentacion propia.

No publicar esta copia hasta completar `SANITIZACION.md`.
"@ | Set-Content -LiteralPath (Join-Path $TargetRoot "README.md") -Encoding UTF8

@"
# Sanitizacion Pendiente

## Marca

- [ ] Reemplazar nombre por Aula Clara en la interfaz.
- [ ] Retirar logos UIE y referencias a Duoc UC.
- [ ] Reemplazar cabeceras y pies de pagina del PDF.

## Contenidos

- [ ] Revisar referencias `source: 'Duoc UC'`.
- [ ] Retirar documentos institucionales no publicos.
- [ ] Reescribir recomendaciones con fuentes publicas.

## Metricas

- [ ] Reemplazar `clarityProjectId` por proyecto comercial.
- [ ] Reemplazar Supabase URL y anon key.
- [ ] Reemplazar formulario de retroalimentacion.

## Validacion

- [ ] Buscar y resolver rastros: Duoc, UIE, Campus Arauco, Unidad de Inclusion.
- [ ] Probar navegacion completa.
- [ ] Generar PDF y revisar marca.
- [ ] Inicializar repositorio Git nuevo.
"@ | Set-Content -LiteralPath (Join-Path $TargetRoot "SANITIZACION.md") -Encoding UTF8

$indexPath = Join-Path $TargetRoot "index.html"
$index = Get-Content -LiteralPath $indexPath -Raw
$index = $index.Replace("Planificador Inclusivo UIE", "Aula Clara")
$index = $index.Replace("Herramienta de apoyo docente Duoc UC", "Herramienta web para apoyo docente inclusivo")
$index = $index.Replace("clarityProjectId: 'x2en890zie'", "clarityProjectId: 'CLARITY_PROJECT_ID'")
$index = $index.Replace("supabaseUrl: 'https://xgcmudquxxdrgpjrqslc.supabase.co'", "supabaseUrl: 'https://TU-PROYECTO.supabase.co'")
$index = $index -replace "supabaseAnonKey: '[^']+'", "supabaseAnonKey: 'SUPABASE_ANON_KEY'"
Set-Content -LiteralPath $indexPath -Value $index -Encoding UTF8

Write-Output "Copia tecnica inicial creada en: $TargetRoot"
Write-Output "Revisa SANITIZACION.md antes de publicar o inicializar Git."
