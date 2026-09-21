$destino = ".\dist"
if (!(Test-Path $destino)) { 
    New-Item -ItemType Directory -Path $destino | Out-Null 
}

$extensoes = @('.html', '.js', '.svelte', '.css', '.md')
$ignorar = @('node_modules', 'dist', '.git', 'public')

Get-ChildItem -Path . -Recurse -File | Where-Object {
    $arquivo = $_
    $caminho = $arquivo.FullName
    $ext = $arquivo.Extension.ToLower()

    # Se a extensão não estiver na lista, descarta
    if ($extensoes -notcontains $ext) { return $false }

    # Se estiver dentro de pasta ignorada, descarta
    foreach ($pasta in $ignorar) {
        if ($caminho -like "*\$pasta\*") { return $false }
    }

    return $true
} | ForEach-Object {
    $nomeFinal = $_.Name
    if ($_.Extension.ToLower() -eq '.svelte') {
        $nomeFinal = "$($_.Name).txt"
    }

    $caminhoDestino = Join-Path $destino $nomeFinal
    Copy-Item -Path $_.FullName -Destination $caminhoDestino -Force
    Write-Host "Copiado: $($_.Name) -> $nomeFinal" -ForegroundColor Green
}

Write-Host ""
Write-Host "Concluido! Arquivos copiados para a pasta $destino." -ForegroundColor Cyan