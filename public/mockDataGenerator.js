// Browser-compatible mock data generator with progress tracking
// This file can be loaded directly in the browser

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
  const prefixes = ['3201', '3202', '3203', '3204', '3205', '3206', '3207', '3208', '3209', '3210'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const ddmmyy = String(Math.floor(Math.random() * 900000) + 100000);
  const sequence = String(Math.floor(Math.random() * 9000) + 1000);
  return prefix + ddmmyy + sequence;
}

function generateKK() {
  const prefixes = ['3301', '3302', '3303', '3304', '3305', '3306', '3307', '3308', '3309', '3310'];
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

// Advanced mock data generator with progress tracking
async function addMockSimCardsToFirebaseWithProgress(count = 100, specificBoxKecilId = null, progressCallback = null) {
  try {
    console.log(`🚀 Starting to generate and add ${count} mock SIM cards...`);
    
    // Report initial progress
    if (progressCallback) {
      progressCallback(0, count, 0, 0, 'Fetching existing racks...', []);
    }
    
    // Fetch existing data from separate collections
    console.log('📦 Fetching existing data...');
    const [racksResponse, boxBesarResponse, boxKecilResponse] = await Promise.all([
      fetch('/api/racks'),
      fetch('/api/boxbesar'),
      fetch('/api/boxkecil')
    ]);
    
    const racksData = await racksResponse.json();
    const boxBesarData = await boxBesarResponse.json();
    const boxKecilData = await boxKecilResponse.json();
    
    let allBoxKecil = [];
    let selectedBoxKecil = null;
    
    // Build Box Kecil data with proper hierarchy
    if (boxKecilData.success && boxKecilData.data.length > 0) {
      boxKecilData.data.forEach(boxKecil => {
        // Find associated Box Besar and Rak
        const associatedBoxBesar = boxBesarData.success ? 
          boxBesarData.data.find(bb => bb.id === boxKecil.boxBesarId) : null;
        const associatedRak = racksData.success ? 
          racksData.data.find(r => r.id === boxKecil.rakId) : null;
        
        const fullPath = associatedRak && associatedBoxBesar 
          ? `${associatedRak.namaRak} > ${associatedBoxBesar.namaBox} > ${boxKecil.namaBoxKecil}`
          : boxKecil.namaBoxKecil;
        
        const boxData = {
          id: boxKecil.id,
          name: boxKecil.namaBoxKecil,
          fullPath: fullPath
        };
        allBoxKecil.push(boxData);
        
        // If specific Box Kecil is requested, find it
        if (specificBoxKecilId && boxData.id === specificBoxKecilId) {
          selectedBoxKecil = boxData;
        }
      });
    }
    
    // Determine which Box Kecil to use
    let targetBoxKecil;
    if (specificBoxKecilId && selectedBoxKecil) {
      targetBoxKecil = selectedBoxKecil;
      console.log(`✅ Using specific Box Kecil: ${targetBoxKecil.fullPath}`);
    } else if (allBoxKecil.length > 0) {
      targetBoxKecil = allBoxKecil[0]; // Use first available if no specific one
      console.log(`✅ Using first available Box Kecil: ${targetBoxKecil.fullPath}`);
    } else {
      console.warn('⚠️ No Box Kecil found. Creating temporary assignments.');
      targetBoxKecil = {
        id: 'temp-box-1',
        name: 'Temporary Box 1',
        fullPath: 'Rak Utama > Box Utama > Temporary Box 1'
      };
    }
    
    console.log(`📋 All ${count} cards will be assigned to: ${targetBoxKecil.fullPath}`);
    
    // Report progress: Ready to generate
    if (progressCallback) {
      progressCallback(0, count, 0, 0, `Ready to generate ${count} cards in ${targetBoxKecil.fullPath}`, []);
    }
    
    // Generate and add SIM cards
    const providers = ['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'Axis'];
    const results = { success: 0, errors: 0, details: [] };
    
    for (let i = 1; i <= count; i++) {
      try {
        const activationDate = generateRandomDate();
        const status = generateStatus();
        
        const simCard = {
          nomor: generatePhoneNumber(),
          jenisKartu: providers[Math.floor(Math.random() * providers.length)],
          masaAktif: activationDate,
          masaTenggang: (Math.floor(Math.random() * 30) + 1).toString(),
          status: status,
          nik: generateNIK(),
          nomorKK: generateKK(),
          tanggalDigunakan: status === 'used' ? generateRandomDate() : '',
          boxKecilId: targetBoxKecil.id,
          boxKecilName: targetBoxKecil.name,
          rakLocation: targetBoxKecil.fullPath
        };
        
        const response = await fetch('/api/simcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simCard)
        });
        
        const result = await response.json();
        
        if (result.success) {
          results.success++;
          console.log(`✅ Added SIM card ${i}/${count}: ${simCard.nomor}`);
        } else {
          results.errors++;
          results.details.push(`Error adding card ${simCard.nomor}: ${result.error}`);
          console.error(`❌ Failed to add SIM card ${i}: ${result.error}`);
        }
        
        // Report progress after each card
        if (progressCallback) {
          const message = `Generated ${i}/${count} cards - Latest: ${simCard.nomor}`;
          progressCallback(i, count, results.success, results.errors, message, 
            results.details.slice(-1)); // Send only the latest error
        }
        
        // Small delay to avoid overwhelming the server
        if (i < count) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (error) {
        results.errors++;
        const errorMsg = `Network error for card ${i}: ${error.message}`;
        results.details.push(errorMsg);
        console.error(`❌ Network error adding SIM card ${i}:`, error);
        
        // Report error progress
        if (progressCallback) {
          progressCallback(i, count, results.success, results.errors, 
            `Error on card ${i}/${count}`, [errorMsg]);
        }
      }
    }
    
    // Show final results
    console.log('\\n📊 Final Results:');
    console.log(`✅ Successfully added: ${results.success} SIM cards`);
    console.log(`❌ Failed to add: ${results.errors} SIM cards`);
    
    if (results.errors > 0) {
      console.log('\\n🔍 Error details:');
      results.details.forEach(detail => console.log(`  - ${detail}`));
    }
    
    console.log('\\n🎉 Mock data generation completed!');
    
    // Final progress report
    if (progressCallback) {
      const finalMessage = `Completed! ${results.success} successful, ${results.errors} failed`;
      progressCallback(count, count, results.success, results.errors, finalMessage, []);
    }
    
    return results;
    
  } catch (error) {
    console.error('💥 Fatal error during mock data generation:', error);
    if (progressCallback) {
      progressCallback(0, count, 0, 1, `Fatal error: ${error.message}`, [error.message]);
    }
    throw error;
  }
}

// Backward compatible function without progress tracking
async function addMockSimCardsToFirebase(count = 100, specificBoxKecilId = null) {
  return await addMockSimCardsToFirebaseWithProgress(count, specificBoxKecilId, null);
}

// Make functions available globally
window.addMockSimCardsToFirebaseWithProgress = addMockSimCardsToFirebaseWithProgress;
window.addMockSimCardsToFirebase = addMockSimCardsToFirebase;

console.log('🔧 Enhanced mock data generator loaded with progress tracking!');