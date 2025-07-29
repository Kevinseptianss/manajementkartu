// Mock data generator for SIM cards
// Run this script to add 100 SIM cards to Firebase

const mockData = {
  providers: ['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'Axis'],
  statuses: ['active', 'inactive', 'used'],
  weights: {
    'active': 0.4,    // 40% active
    'inactive': 0.3,  // 30% inactive
    'used': 0.3       // 30% used
  },
  nikPrefixes: ['3201', '3202', '3203', '3204', '3205', '3206', '3207', '3208', '3209', '3210'],
  kkPrefixes: ['3301', '3302', '3303', '3304', '3305', '3306', '3307', '3308', '3309', '3310']
};

// Generate random phone number with Indonesian format
function generatePhoneNumber() {
  const prefixes = ['0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', 
                   '0821', '0822', '0823', '0831', '0832', '0833', '0851', '0852', '0853',
                   '0855', '0856', '0857', '0858', '0895', '0896', '0897', '0898', '0899'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 90000000) + 10000000; // 8 digits
  return prefix + suffix.toString();
}

// Generate random NIK (16 digits)
function generateNIK() {
  const prefix = mockData.nikPrefixes[Math.floor(Math.random() * mockData.nikPrefixes.length)];
  const ddmmyy = String(Math.floor(Math.random() * 900000) + 100000); // 6 digits for birth date
  const sequence = String(Math.floor(Math.random() * 9000) + 1000); // 4 digits sequence
  return prefix + ddmmyy + sequence;
}

// Generate random KK number (16 digits)
function generateKK() {
  const prefix = mockData.kkPrefixes[Math.floor(Math.random() * mockData.kkPrefixes.length)];
  const suffix = String(Math.floor(Math.random() * 900000000000) + 100000000000); // 12 digits
  return prefix + suffix;
}

// Generate random date within last 2 years
function generateRandomDate() {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// Generate random expiry date (1-24 months from activation)
function generateExpiryDate(activationDate) {
  const activation = new Date(activationDate);
  const monthsToAdd = Math.floor(Math.random() * 24) + 1; // 1-24 months
  const expiry = new Date(activation);
  expiry.setMonth(expiry.getMonth() + monthsToAdd);
  return expiry.toISOString().split('T')[0];
}

// Generate random status based on weights
function generateStatus() {
  const rand = Math.random();
  if (rand < mockData.weights.active) return 'active';
  if (rand < mockData.weights.active + mockData.weights.inactive) return 'inactive';
  return 'used';
}

// Generate random grace period days
function generateGracePeriod() {
  return Math.floor(Math.random() * 30) + 1; // 1-30 days
}

// Generate 100 mock SIM cards
export function generateMockSimCards(count = 100) {
  const simCards = [];
  
  for (let i = 1; i <= count; i++) {
    const activationDate = generateRandomDate();
    const status = generateStatus();
    
    const simCard = {
      nomor: generatePhoneNumber(),
      jenisKartu: mockData.providers[Math.floor(Math.random() * mockData.providers.length)],
      masaAktif: activationDate,
      masaTenggang: generateGracePeriod().toString(),
      status: status,
      nik: generateNIK(),
      nomorKK: generateKK(),
      tanggalDigunakan: status === 'used' ? generateRandomDate() : '',
      boxKecilId: '',  // Will be assigned randomly to existing boxes
      boxKecilName: '',
      rakLocation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    simCards.push(simCard);
  }
  
  return simCards;
}

// Generate mock Rak Kartu data
function generateMockRacks(count = 5) {
  const racks = [];
  const locations = ['Gudang A', 'Gudang B', 'Ruang Server', 'Lantai 1', 'Lantai 2'];
  
  for (let i = 0; i < count; i++) {
    const rack = {
      id: `rack_${Date.now()}_${i}`,
      namaRak: `Rak Kartu ${i + 1}`,
      deskripsi: `Rak penyimpanan kartu SIM ${i + 1}`,
      lokasi: locations[Math.floor(Math.random() * locations.length)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    racks.push(rack);
  }
  
  return racks;
}

// Generate mock Box Besar data
function generateMockBoxBesar(count = 10, racks = []) {
  const boxBesar = [];
  
  for (let i = 0; i < count; i++) {
    const randomRak = racks.length > 0 ? racks[Math.floor(Math.random() * racks.length)] : null;
    
    const box = {
      id: `boxbesar_${Date.now()}_${i}`,
      namaBox: `Box Besar ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      deskripsi: `Box besar untuk menyimpan box kecil ${i + 1}`,
      rakId: randomRak ? randomRak.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    boxBesar.push(box);
  }
  
  return boxBesar;
}

// Generate mock Box Kecil data
function generateMockBoxKecil(count = 25, boxBesar = []) {
  const boxKecil = [];
  
  for (let i = 0; i < count; i++) {
    const randomBoxBesar = boxBesar.length > 0 ? boxBesar[Math.floor(Math.random() * boxBesar.length)] : null;
    
    const box = {
      id: `boxkecil_${Date.now()}_${i}`,
      namaBoxKecil: `Box Kecil ${i + 1}`,
      deskripsi: `Box kecil untuk menyimpan kartu SIM ${i + 1}`,
      boxBesarId: randomBoxBesar ? randomBoxBesar.id : null,
      rakId: randomBoxBesar ? randomBoxBesar.rakId : null, // Inherit from Box Besar
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    boxKecil.push(box);
  }
  
  return boxKecil;
}

// Generate complete mock data hierarchy
async function generateCompleteHierarchy() {
  try {
    console.log('Starting complete hierarchy generation...');
    
    // Step 1: Generate Racks
    const racks = generateMockRacks(5);
    console.log(`Generated ${racks.length} racks`);
    
    // Add racks to database
    for (const rack of racks) {
      const response = await fetch('/api/racks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rack)
      });
      
      if (!response.ok) {
        console.error('Failed to add rack:', rack.namaRak);
      }
    }
    
    // Step 2: Generate Box Besar
    const boxBesar = generateMockBoxBesar(10, racks);
    console.log(`Generated ${boxBesar.length} box besar`);
    
    // Add box besar to database
    for (const box of boxBesar) {
      const response = await fetch('/api/boxbesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(box)
      });
      
      if (!response.ok) {
        console.error('Failed to add box besar:', box.namaBox);
      }
    }
    
    // Step 3: Generate Box Kecil
    const boxKecil = generateMockBoxKecil(25, boxBesar);
    console.log(`Generated ${boxKecil.length} box kecil`);
    
    // Add box kecil to database
    for (const box of boxKecil) {
      const response = await fetch('/api/boxkecil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(box)
      });
      
      if (!response.ok) {
        console.error('Failed to add box kecil:', box.namaBoxKecil);
      }
    }
    
    // Step 4: Generate SIM Cards (updated to use real box kecil IDs)
    const simCards = generateMockSimCards(100);
    console.log(`Generated ${simCards.length} SIM cards`);
    
    // Update SIM cards with real box kecil IDs
    for (const card of simCards) {
      if (boxKecil.length > 0) {
        const randomBoxKecil = boxKecil[Math.floor(Math.random() * boxKecil.length)];
        card.boxKecilId = randomBoxKecil.id;
        card.boxKecilName = randomBoxKecil.namaBoxKecil;
        
        // Also set the rak location from the hierarchy
        const associatedBoxBesar = boxBesar.find(bb => bb.id === randomBoxKecil.boxBesarId);
        if (associatedBoxBesar) {
          const associatedRak = racks.find(r => r.id === associatedBoxBesar.rakId);
          if (associatedRak) {
            card.rakLocation = associatedRak.lokasi;
          }
        }
      }
    }
    
    // Add SIM cards to database
    for (const card of simCards) {
      const response = await fetch('/api/simcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
      });
      
      if (!response.ok) {
        console.error('Failed to add SIM card:', card.nomorHp);
      }
    }
    
    console.log('Complete hierarchy generation finished!');
    return {
      racks: racks.length,
      boxBesar: boxBesar.length,
      boxKecil: boxKecil.length,
      simCards: simCards.length
    };
    
  } catch (error) {
    console.error('Error generating complete hierarchy:', error);
    throw error;
  }
}

// Export for use in other files
export default generateMockSimCards;
export { generateMockRacks, generateMockBoxBesar, generateMockBoxKecil, generateCompleteHierarchy };
