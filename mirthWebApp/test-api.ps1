# Test Mirth Connect API endpoints for channel groups
$baseUrl = "http://172.23.33.179:8080"
$headers = @{
    'Accept' = 'application/json'
    'Content-Type' = 'application/json'
    'X-Requested-With' = 'OpenAPI'
}

Write-Host "Testing Mirth Connect API endpoints..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow

# Test login first with form data
Write-Host "`n1. Testing login..." -ForegroundColor Cyan
try {
    $loginHeaders = @{
        'Accept' = 'application/json'
        'Content-Type' = 'application/x-www-form-urlencoded'
        'X-Requested-With' = 'OpenAPI'
    }
    $loginBody = "username=admin&password=admin"
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/_login" -Method POST -Body $loginBody -Headers $loginHeaders -SessionVariable websession
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Response: $($loginResponse | ConvertTo-Json)"
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Dump full channels response
Write-Host "`n2. Dumping full /api/channels response to channels.json..." -ForegroundColor Cyan
try {
    $channelsResponse = Invoke-RestMethod -Uri "$baseUrl/api/channels" -Method GET -Headers $headers -WebSession $websession
    $channelsResponse | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 channels.json
    Write-Host "✅ Dumped channels.json" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get channels: $($_.Exception.Message)" -ForegroundColor Red
}

# Dump full channel groups response
Write-Host "`n3. Dumping full /api/channelgroups response to channelgroups.json..." -ForegroundColor Cyan
try {
    $groupsResponse = Invoke-RestMethod -Uri "$baseUrl/api/channelgroups" -Method GET -Headers $headers -WebSession $websession
    $groupsResponse | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 channelgroups.json
    Write-Host "✅ Dumped channelgroups.json" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get channel groups: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI dump completed!" -ForegroundColor Green 