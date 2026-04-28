$outDir = "desktop/src-tauri/target/release/bundle/updater"
$bundleDir = "desktop/src-tauri/target/release/bundle"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$tag = "v$env:VERSION"
$base = "https://github.com/$env:REPO/releases/download/$tag"

# Helper: read signature
function Get-Signature($filePath) {
  $sigPath = "$filePath.sig"
  if (!(Test-Path $sigPath)) {
    throw "Missing signature for $filePath"
  }
  return (Get-Content $sigPath -Raw).Trim()
}

# Detect files
$msi = Get-ChildItem "$bundleDir/msi" -Filter "*$env:VERSION*.msi" | Select-Object -First 1
$exe = Get-ChildItem "$bundleDir/nsis" -Filter "*$env:VERSION*-setup.exe" | Select-Object -First 1

if (-not $msi -or -not $exe) {
  throw "Missing MSI or EXE build output"
}

# Build JSON
$latest = [ordered]@{
  version = $env:VERSION
  notes = @"
## Changelog
- Release `v$env:VERSION` is now available.
- See commit history: https://github.com/$env:REPO/commits/v$env:VERSION

## Artifacts
- Windows setup installer (.exe)
- Windows MSI installer (.msi)

## Windows Install Note
- Windows may show a warning/block screen because the app is not signed with a commercial certificate.
- This is expected for indie apps.

## Bug Reports
- https://github.com/$env:REPO/issues
"@
  pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  platforms = [ordered]@{
    "windows-x86_64" = [ordered]@{
      url = "$base/$($exe.Name)"
      signature = Get-Signature $exe.FullName
    }
    "windows-x86_64-msi" = [ordered]@{
      url = "$base/$($msi.Name)"
      signature = Get-Signature $msi.FullName
    }
    "windows-x86_64-nsis" = [ordered]@{
      url = "$base/$($exe.Name)"
      signature = Get-Signature $exe.FullName
    }
  }
}

$latest | ConvertTo-Json -Depth 10 | Out-File "$outDir/latest.json" -Encoding utf8