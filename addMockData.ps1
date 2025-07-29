# PowerShell script to add 100 mock SIM cards to Firebase
# Run this script from the project root directory

Write-Host "🚀 SIM Card Mock Data Generator" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory (where package.json exists)" -ForegroundColor Red
    exit 1
}

# Check if the development server is running
Write-Host "🔍 Checking if development server is running..." -ForegroundColor Yellow

$serverRunning = $false
$serverUrl = ""

# Check common Next.js ports
$ports = @(3000, 3001, 3002, 3003)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Development server found running on port $port!" -ForegroundColor Green
        $serverRunning = $true
        $serverUrl = "http://localhost:$port"
        break
    } catch {
        # Continue to next port
    }
}

if (-not $serverRunning) {
    Write-Host "❌ Development server is not running on any common port. Please start it first with:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host "   or" -ForegroundColor Yellow  
    Write-Host "   yarn dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Mock Data Generation Plan:" -ForegroundColor Cyan
Write-Host "   • Generate 100 random Indonesian phone numbers" -ForegroundColor White
Write-Host "   • Create realistic NIK and KK numbers" -ForegroundColor White
Write-Host "   • Assign random providers (Telkomsel, Indosat, XL, etc.)" -ForegroundColor White
Write-Host "   • Set random activation dates and statuses" -ForegroundColor White
Write-Host "   • Assign to existing Box Kecil (or create temporary ones)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🎯 Starting mock data generation..." -ForegroundColor Green

# JavaScript code to execute
$jsCode = @"
(async function() {
    console.log('🚀 PowerShell-triggered mock data generation starting...');
    
    // Mock data generator functions
    function generatePhoneNumber() {
        const prefixes = ['0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', 
                         '0821', '0822', '0823', '0831', '0832', '0833', '0851', '0852', '0853',
                         '0855', '0856', '0857', '0858', '0895', '0896', '0897', '0898', '0899'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.floor(Math.random() * 90000000) + 10000000;
        return prefix + suffix.toString();
    }
    
    function generateNIK() {
        const prefixes = ['3201', '3202', '3203', '3204', '3205'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const ddmmyy = String(Math.floor(Math.random() * 900000) + 100000);
        const sequence = String(Math.floor(Math.random() * 9000) + 1000);
        return prefix + ddmmyy + sequence;
    }
    
    function generateKK() {
        const prefixes = ['3301', '3302', '3303', '3304', '3305'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = String(Math.floor(Math.random() * 900000000000) + 100000000000);
        return prefix + suffix;
    }
    
    function generateRandomDate() {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 2);
        const end = new Date();
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return new Date(randomTime).toISOString().split('T')[0];
    }
    
    function generateStatus() {
        const rand = Math.random();
        if (rand < 0.4) return 'active';
        if (rand < 0.7) return 'inactive';
        return 'used';
    }
    
    try {
        // Fetch existing racks
        console.log('📦 Fetching existing racks...');
        const racksResponse = await fetch('$serverUrl/api/racks');
        const racksData = await racksResponse.json();
        
        let allBoxKecil = [];
        if (racksData.success && racksData.data.length > 0) {
            racksData.data.forEach(rak => {
                rak.boxBesar?.forEach(boxBesar => {
                    boxBesar.boxKecil?.forEach(boxKecil => {
                        allBoxKecil.push({
                            id: boxKecil.id || Math.random().toString(36).substr(2, 9),
                            name: boxKecil.namaBoxKecil,
                            fullPath: (rak.namaRak || rak.namaKartu) + ' > ' + boxBesar.namaBox + ' > ' + boxKecil.namaBoxKecil
                        });
                    });
                });
            });
        }
        
        if (allBoxKecil.length === 0) {
            console.warn('⚠️ No Box Kecil found. Creating temporary assignments.');
            allBoxKecil = [{
                id: 'temp-box-1',
                name: 'Temporary Box 1',
                fullPath: 'Rak Utama > Box Utama > Temporary Box 1'
            }];
        }
        
        console.log('✅ Found ' + allBoxKecil.length + ' Box Kecil for assignment');
        
        // Generate and add SIM cards
        const providers = ['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'Axis'];
        const results = { success: 0, errors: 0 };
        
        for (let i = 1; i <= 100; i++) {
            try {
                const activationDate = generateRandomDate();
                const status = generateStatus();
                const randomBox = allBoxKecil[Math.floor(Math.random() * allBoxKecil.length)];
                
                const simCard = {
                    nomor: generatePhoneNumber(),
                    jenisKartu: providers[Math.floor(Math.random() * providers.length)],
                    masaAktif: activationDate,
                    masaTenggang: (Math.floor(Math.random() * 30) + 1).toString(),
                    status: status,
                    nik: generateNIK(),
                    nomorKK: generateKK(),
                    tanggalDigunakan: status === 'used' ? generateRandomDate() : '',
                    boxKecilId: randomBox.id,
                    boxKecilName: randomBox.name,
                    rakLocation: randomBox.fullPath
                };
                
                const response = await fetch('$serverUrl/api/simcards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(simCard)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    results.success++;
                    console.log('✅ Added SIM card ' + i + '/100: ' + simCard.nomor);
                } else {
                    results.errors++;
                    console.error('❌ Failed to add SIM card ' + i + ': ' + result.error);
                }
                
                // Small delay
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                results.errors++;
                console.error('❌ Network error adding SIM card ' + i + ':', error.message);
            }
        }
        
        console.log('\\n📊 Final Results:');
        console.log('✅ Successfully added: ' + results.success + ' SIM cards');
        console.log('❌ Failed to add: ' + results.errors + ' SIM cards');
        console.log('🎉 Mock data generation completed!');
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
})();
"@

# Create a temporary HTML file to run the JavaScript
$tempHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Mock Data Generator</title>
</head>
<body>
    <h1>Mock Data Generator Running...</h1>
    <p>Check the browser console for progress updates.</p>
    <script>
    $jsCode
    </script>
</body>
</html>
"@

$tempFile = [System.IO.Path]::GetTempFileName() + ".html"
$tempHtml | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "🌐 Opening browser to execute mock data generation..." -ForegroundColor Green
Write-Host "📝 Check the browser console for detailed progress..." -ForegroundColor Yellow

# Open the HTML file in the default browser
Start-Process $tempFile

Write-Host ""
Write-Host "✅ Script initiated! The browser should open automatically." -ForegroundColor Green
Write-Host "📋 What to do next:" -ForegroundColor Cyan
Write-Host "   1. Check the browser console (F12) for progress updates" -ForegroundColor White
Write-Host "   2. Wait for completion message" -ForegroundColor White
Write-Host "   3. Refresh your SIM Manager application to see new data" -ForegroundColor White
Write-Host ""
Write-Host "🗑️  The temporary HTML file will be cleaned up automatically." -ForegroundColor Gray

# Wait a bit then clean up
Start-Sleep -Seconds 5
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 PowerShell script completed!" -ForegroundColor Green
