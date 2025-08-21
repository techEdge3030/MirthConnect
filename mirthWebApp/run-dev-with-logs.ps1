# PowerShell script to run npm run dev with rotating logs
param(
    [int]$MaxLines = 500,
    [string]$LogFile = "dev-server.log"
)

function Write-TimestampedLog {
    param([string]$Message, [string]$LogPath)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logLine = "[$timestamp] $Message"
    
    # Write to console
    Write-Host $logLine
    
    # Append to log file
    Add-Content -Path $LogPath -Value $logLine
    
    # Check if we need to rotate the log
    $lineCount = (Get-Content $LogPath | Measure-Object -Line).Lines
    if ($lineCount -gt $MaxLines) {
        $lines = Get-Content $LogPath
        $keepLines = $lines[-$MaxLines..-1]  # Keep last MaxLines lines
        $keepLines | Set-Content $LogPath
        
        $rotateMsg = "[$timestamp] [LOG-ROTATED] Log rotated, keeping last $MaxLines lines"
        Add-Content -Path $LogPath -Value $rotateMsg
        Write-Host $rotateMsg -ForegroundColor Yellow
    }
}

# Ensure we're in the right directory
Set-Location "C:\Projects\Dev_MirthAdmin\mirthWebApp"

# Initialize log file
$logPath = Join-Path (Get-Location) $LogFile
Write-TimestampedLog "Starting npm run dev (client + server)..." $logPath

# Start npm run dev process
$process = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -NoNewWindow -PassThru -RedirectStandardOutput "temp-stdout.txt" -RedirectStandardError "temp-stderr.txt"

# Monitor the output files
$lastStdoutPosition = 0
$lastStderrPosition = 0

Write-TimestampedLog "Process started with PID: $($process.Id)" $logPath
Write-TimestampedLog "Monitoring output... Press Ctrl+C to stop." $logPath

try {
    while (!$process.HasExited) {
        # Check stdout
        if (Test-Path "temp-stdout.txt") {
            $content = Get-Content "temp-stdout.txt" -Raw
            if ($content -and $content.Length -gt $lastStdoutPosition) {
                $newContent = $content.Substring($lastStdoutPosition)
                $newContent.Split("`n") | ForEach-Object {
                    if ($_.Trim()) {
                        Write-TimestampedLog "[STDOUT] $_" $logPath
                    }
                }
                $lastStdoutPosition = $content.Length
            }
        }
        
        # Check stderr
        if (Test-Path "temp-stderr.txt") {
            $content = Get-Content "temp-stderr.txt" -Raw
            if ($content -and $content.Length -gt $lastStderrPosition) {
                $newContent = $content.Substring($lastStderrPosition)
                $newContent.Split("`n") | ForEach-Object {
                    if ($_.Trim()) {
                        Write-TimestampedLog "[STDERR] $_" $logPath
                    }
                }
                $lastStderrPosition = $content.Length
            }
        }
        
        Start-Sleep -Milliseconds 100
    }
} finally {
    # Cleanup
    if (Test-Path "temp-stdout.txt") { Remove-Item "temp-stdout.txt" -Force }
    if (Test-Path "temp-stderr.txt") { Remove-Item "temp-stderr.txt" -Force }
    
    Write-TimestampedLog "Process ended with exit code: $($process.ExitCode)" $logPath
}
