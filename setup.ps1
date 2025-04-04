# Setup script for Novamind Digital Twin Frontend
Write-Host "🚀 Setting up Novamind Digital Twin Frontend..." -ForegroundColor Blue

# Check if Node.js is installed
$nodeInstalled = $null
try {
    $nodeInstalled = node --version
    Write-Host "✅ Node.js detected: $nodeInstalled" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed! Please install Node.js (version 16 or higher) and try again." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
$npmInstalled = $null
try {
    $npmInstalled = npm --version
    Write-Host "✅ npm detected: $npmInstalled" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed! Please install npm and try again." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies... This may take a few minutes." -ForegroundColor Blue
npm install

# Check if installation was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host "" 
Write-Host "🌟 Welcome to Novamind Digital Twin Frontend! 🌟" -ForegroundColor Magenta
Write-Host "Your premium psychiatric digital twin platform is ready to run." -ForegroundColor Magenta
Write-Host "" 
Write-Host "To start the development server, run:" -ForegroundColor Yellow
Write-Host "cd frontend" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host "" 
Write-Host "The application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Demo login credentials:" -ForegroundColor Cyan
Write-Host "Email: demo@novamind.health" -ForegroundColor Cyan
Write-Host "Password: (any value will work)" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Enjoy exploring your Digital Twin platform! 🧠✨" -ForegroundColor Magenta
