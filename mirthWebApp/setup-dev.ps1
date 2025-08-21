Write-Host "Checking for Mirth Connect installation..."
$mirthPath = "C:\Program Files\Mirth Connect"
$mirthExe = "$mirthPath\mcservice.exe"
if (-not (Test-Path $mirthExe)) {
    Write-Host "Mirth Connect not found. Downloading installer..."
    $mirthInstallerUrl = "https://s3.amazonaws.com/downloads.mirthcorp.com/connect/4.5.2.b363/mirthconnect-4.5.2.b363-windows-x64.exe"
    $installerPath = "$env:TEMP\mirthconnect-4.5.2.b363-windows-x64.exe"
    Invoke-WebRequest -Uri $mirthInstallerUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Mirth Connect installer downloaded to $installerPath. Please run the installer and follow the instructions to complete installation."
    Write-Host "After installing Mirth Connect, re-run this script to complete the setup."
    exit 0
}

Write-Host "Checking for Mirth Administrator Launcher..."
$adminLauncherPath = "C:\Program Files\Mirth Connect Administrator Launcher\mirth-administrator-launcher.exe"
if (-not (Test-Path $adminLauncherPath)) {
    Write-Host "Mirth Administrator Launcher not found. Downloading installer..."
    $adminLauncherUrl = "https://s3.us-east-1.amazonaws.com/downloads.mirthcorp.com/connect-client-launcher/mirth-administrator-launcher-1.4.2-windows-x64.exe"
    $adminInstallerPath = "$env:TEMP\mirth-administrator-launcher-1.4.2-windows-x64.exe"
    Invoke-WebRequest -Uri $adminLauncherUrl -OutFile $adminInstallerPath -UseBasicParsing
    Write-Host "Mirth Administrator Launcher installer downloaded to $adminInstallerPath. Please run the installer and follow the instructions to complete installation."
    Write-Host "After installing the Administrator Launcher, re-run this script to complete the setup."
    exit 0
}

Write-Host "Checking for Node.js v16.x..."
$nodeVersion = & node -v 2>$null
if (-not $nodeVersion -or ($nodeVersion -notmatch '^v16\\.')) {
    Write-Host "Node.js v16.x is not installed. Installing Node.js v16.20.2..."
    $msiUrl = "https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi"
    $msiPath = "$env:TEMP\node-v16.20.2-x64.msi"
    Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /qn /norestart" -Wait
    Remove-Item $msiPath
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")
}

Write-Host "Checking for npm..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed. Please install npm manually."
    exit 1
}

Write-Host "Checking for 'concurrently' npm package..."
$hasConcurrently = $false
# Check local node_modules/.bin first
if (Test-Path "node_modules/.bin/concurrently" -or Test-Path "node_modules/.bin/concurrently.cmd") {
    $hasConcurrently = $true
}
# Check globally
if (-not $hasConcurrently) {
    $globalPackages = npm list -g --depth=0 2>$null
    if ($globalPackages -match 'concurrently@') {
        $hasConcurrently = $true
    }
}
if (-not $hasConcurrently) {
    Write-Host "'concurrently' not found. Installing as a devDependency in the root..."
    npm install concurrently@^9.2.0 --save-dev --silent
}

Write-Host "Installing root dependencies..."
npm install --silent

Write-Host "Installing client dependencies..."
Set-Location client
npm install --silent
Set-Location ..

Write-Host "Installing server dependencies..."
Set-Location server
npm install --silent
Set-Location ..

Write-Host "All dependencies installed!"
Write-Host "You can now run: npm run dev" 