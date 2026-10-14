Add-Type -AssemblyName System.Drawing
$path = "C:\Users\PC\.gemini\antigravity-ide\brain\fe9858a8-beeb-40b9-9b16-565d4ac4fb16\scratch\rendered_page1.png"
if (-not (Test-Path $path)) {
    Write-Host "Rendered page image not found at $path"
    exit
}
$bmp = [System.Drawing.Bitmap]::FromFile($path)
Write-Host "Image dimensions: $($bmp.Width) x $($bmp.Height)"

function Get-HexColor($x, $y) {
    $pixel = $bmp.GetPixel($x, $y)
    return "#{0:X2}{1:X2}{2:X2}" -f $pixel.R, $pixel.G, $pixel.B
}

Write-Host "Sidebar background (x=100, y=500):" (Get-HexColor 100 500)
Write-Host "Sidebar active item (x=100, y=240):" (Get-HexColor 100 240)
Write-Host "Dashboard page background (x=700, y=500):" (Get-HexColor 700 500)
Write-Host "Topbar background (x=700, y=60):" (Get-HexColor 700 60)
Write-Host "Topbar search input (x=1000, y=60):" (Get-HexColor 1000 60)
Write-Host "Map card header background (x=700, y=760):" (Get-HexColor 700 760)
Write-Host "Map canvas background (x=700, y=1000):" (Get-HexColor 700 1000)
Write-Host "Agent detail box background (x=2550, y=1100):" (Get-HexColor 2550 1100)
Write-Host "Table header background (x=700, y=1960):" (Get-HexColor 700 1960)
Write-Host "Finance discrepancy banner (x=700, y=4420):" (Get-HexColor 700 4420)
Write-Host "Sync health notice (x=2000, y=4230):" (Get-HexColor 2000 4230)

$bmp.Dispose()

