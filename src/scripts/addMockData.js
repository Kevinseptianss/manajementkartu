/**
 * Script to add 100 mock SIM cards to Firebase
 * Run this in the browser console or as a Node.js script
 */

import { generateMockSimCards } from '../utils/mockDataGenerator.js';

// Function to assign random Box Kecil to SIM cards
function assignRandomBoxKecil(simCards, racks) {
  const allBoxKecil = [];
  
  // Extract all Box Kecil from racks
  racks.forEach(rak => {
    rak.boxBesar?.forEach(boxBesar => {
      boxBesar.boxKecil?.forEach(boxKecil => {
        allBoxKecil.push({
          id: boxKecil.id || `${rak.id}-${boxBesar.id}-${boxKecil.namaBoxKecil}`,
          name: boxKecil.namaBoxKecil,
          rakName: rak.namaRak || rak.namaKartu,
          boxBesarName: boxBesar.namaBox,
          fullPath: `${rak.namaRak || rak.namaKartu} > ${boxBesar.namaBox} > ${boxKecil.namaBoxKecil}`
        });
      });
    });
  });

  // If no Box Kecil available, create some default ones
  if (allBoxKecil.length === 0) {
    console.warn('No Box Kecil found. Please create some racks and boxes first.');
    return simCards.map(card => ({
      ...card,
      boxKecilId: 'temp-box-1',
      boxKecilName: 'Temporary Box 1',
      rakLocation: 'Rak Utama > Box Utama > Temporary Box 1'
    }));
  }

  // Assign random Box Kecil to each SIM card
  return simCards.map(card => {
    const randomBox = allBoxKecil[Math.floor(Math.random() * allBoxKecil.length)];
    return {
      ...card,
      boxKecilId: randomBox.id,
      boxKecilName: randomBox.name,
      rakLocation: randomBox.fullPath
    };
  });
}

// Function to add SIM cards to Firebase via API
async function addSimCardsToFirebase(simCards) {
  const results = {
    success: 0,
    errors: 0,
    details: []
  };

  console.log(`Starting to add ${simCards.length} SIM cards to Firebase...`);

  for (let i = 0; i < simCards.length; i++) {
    try {
      const response = await fetch('/api/simcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simCards[i])
      });

      const result = await response.json();
      
      if (result.success) {
        results.success++;
        console.log(`✅ Added SIM card ${i + 1}/${simCards.length}: ${simCards[i].nomor}`);
      } else {
        results.errors++;
        results.details.push(`Error adding card ${simCards[i].nomor}: ${result.error}`);
        console.error(`❌ Failed to add SIM card ${i + 1}: ${result.error}`);
      }
    } catch (error) {
      results.errors++;
      results.details.push(`Network error for card ${simCards[i].nomor}: ${error.message}`);
      console.error(`❌ Network error adding SIM card ${i + 1}:`, error);
    }

    // Add small delay to avoid overwhelming the server
    if (i < simCards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

// Main function to generate and add mock data
export async function addMockSimCardsToFirebase(count = 100) {
  try {
    console.log('🚀 Generating mock SIM cards...');
    
    // Generate mock SIM cards
    let mockSimCards = generateMockSimCards(count);
    
    // Fetch existing racks to assign Box Kecil
    console.log('📦 Fetching existing racks...');
    const racksResponse = await fetch('/api/racks');
    const racksData = await racksResponse.json();
    
    if (racksData.success && racksData.data.length > 0) {
      mockSimCards = assignRandomBoxKecil(mockSimCards, racksData.data);
      console.log(`✅ Assigned Box Kecil to SIM cards from ${racksData.data.length} available racks`);
    } else {
      console.warn('⚠️ No racks found. SIM cards will be created with temporary box assignments.');
      mockSimCards = assignRandomBoxKecil(mockSimCards, []);
    }
    
    // Add to Firebase
    console.log('💾 Adding SIM cards to Firebase...');
    const results = await addSimCardsToFirebase(mockSimCards);
    
    // Show results
    console.log('\n📊 Results:');
    console.log(`✅ Successfully added: ${results.success} SIM cards`);
    console.log(`❌ Failed to add: ${results.errors} SIM cards`);
    
    if (results.errors > 0) {
      console.log('\n🔍 Error details:');
      results.details.forEach(detail => console.log(`  - ${detail}`));
    }
    
    console.log('\n🎉 Mock data generation completed!');
    return results;
    
  } catch (error) {
    console.error('💥 Fatal error during mock data generation:', error);
    throw error;
  }
}

// Export for use in browser console or other scripts
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for console access
  window.addMockSimCardsToFirebase = addMockSimCardsToFirebase;
  console.log('🔧 Mock data function available in console: addMockSimCardsToFirebase(100)');
}
