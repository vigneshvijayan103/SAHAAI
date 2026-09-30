$root = "C:\Users\vvijayakumar\Learning\Sahaai"

# Start User React application
Start-Process powershell.exe -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$root\sahaai-web'; npm run dev"

# Start Worker React application
Start-Process powershell.exe -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$root\sahaai-worker'; npm run dev"

# Start .NET API
Start-Process powershell.exe -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$root\Sahaai.api'; dotnet run"