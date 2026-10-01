param([switch]$Force)
$ErrorActionPreference = 'Stop'
$caseRoot = $PSScriptRoot
$caseName = Join-Path $caseRoot 'mesh-001'
if (Test-Path -LiteralPath $caseName) {
    if ($Force) {
        $resolved = (Resolve-Path -LiteralPath $caseName).Path
        if (-not $resolved.StartsWith($caseRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Refusing to remove a path outside the case folder.' }
        Remove-Item -LiteralPath $resolved -Recurse -Force
        New-Item -ItemType Directory -Path $caseName | Out-Null
    }
} else {
    New-Item -ItemType Directory -Path $caseName | Out-Null
}
$image = 'opencfd/openfoam-default@sha256:1ba02114b1c025c370f2e269a07677c16c9bea8d990fcd75ac8378aff9d41b50'
$surfaceRoot = Join-Path (Split-Path $caseRoot -Parent) 'hull-input'
docker run --rm --network none --cpus 2 --memory 2g --mount "type=bind,source=$caseRoot,target=/work" --mount "type=bind,source=$surfaceRoot,target=/hull-source,readonly" $image bash /work/run.sh
if ($LASTEXITCODE -ne 0) { throw "Hull mesh check failed: exit $LASTEXITCODE" }
