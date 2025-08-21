# Simple script to run npm run dev with rotating timestamped logs
$logFile = "dev-server.log"
$maxLines = 500

# Function to add timestamped log entry and rotate if needed
function Add-TimestampedLog {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logLine = "[$timestamp] $Message"
    
    # Add to log file
    Add-Content -Path $logFile -Value $logLine
    
    # Check if rotation is needed
    $lineCount = (Get-Content $logFile -ErrorAction SilentlyContinue | Measure-Object -Line -ErrorAction SilentlyContinue).Lines
    if ($lineCount -gt $maxLines) {
        $lines = Get-Content $logFile
        $lines[-$maxLines..-1] | Set-Content $logFile
        Add-Content -Path $logFile -Value "[$timestamp] [LOG-ROTATED] Keeping last $maxLines lines"
    }
}

# Start logging
Add-TimestampedLog "=== Starting npm run dev ==="

# Run npm run dev and capture output
npm run dev 2>&1 | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line
    Add-TimestampedLog $line
}
