$ErrorActionPreference = "Stop"
Write-Host "?? Setting up project..."
if (!(Get-Command node -ErrorAction SilentlyContinue)) { Write-Host "? Node.js required"; exit 1 }
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env; Write-Host "?? Created .env" }
npx prisma generate
npx prisma db push
Write-Host "? Setup complete! Run 'npm run dev' to start."
