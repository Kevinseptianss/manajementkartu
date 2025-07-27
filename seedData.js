// Seed sample data to Firebase
// Run: node seedData.js

require('dotenv').config();
const { db } = require('./lib/firebase');

const sampleData = {
  simcards: [
    {
      nomor: '08123456001',
      jenisKartu: 'Telkomsel',
      masaAktif: '2025-12-31',
      masaTenggang: '30',
      lokasiRak: 'Rak A',
      box: 'Box 1',
      kotak: 'Kotak 1',
      status: 'active',
      tanggalDigunakan: '2025-01-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      nomor: '08987654002',
      jenisKartu: 'Indosat',
      masaAktif: '2025-11-30',
      masaTenggang: '30',
      lokasiRak: 'Rak A',
      box: 'Box 1',
      kotak: 'Kotak 2',
      status: 'used',
      tanggalDigunakan: '2025-01-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      nomor: '08555666003',
      jenisKartu: 'XL',
      masaAktif: '2025-10-31',
      masaTenggang: '30',
      lokasiRak: 'Rak B',
      box: 'Box 2',
      kotak: 'Kotak 1',
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  machines: [
    {
      namaMesin: 'Machine Alpha',
      jumlahPort: '8',
      lokasi: 'Ruang Server A',
      keterangan: 'Mesin utama untuk testing',
      gmailAccount: 'machine.alpha@example.com',
      password: 'securepassword123',
      ports: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        portNumber: i + 1,
        status: i < 4 ? 'aktif' : 'kosong',
        boxKecil: i < 4 ? `Box ${i + 1}` : '',
        perdanaNomor: i < 4 ? `0812345600${i + 1}` : '',
        worker: i < 4 ? `Worker ${i + 1}` : '',
        pendapatan: i < 4 ? (i + 1) * 50000 : 0
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      namaMesin: 'Machine Beta',
      jumlahPort: '16',
      lokasi: 'Ruang Server B',
      keterangan: 'Mesin backup',
      gmailAccount: 'machine.beta@example.com',
      password: 'securepassword456',
      ports: Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        portNumber: i + 1,
        status: i < 8 ? 'aktif' : 'kosong',
        boxKecil: i < 8 ? `Box ${i + 1}` : '',
        perdanaNomor: i < 8 ? `0856789000${String(i + 1).padStart(2, '0')}` : '',
        worker: i < 8 ? `Worker ${i + 1}` : '',
        pendapatan: i < 8 ? (i + 1) * 75000 : 0
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  racks: [
    {
      namaKartu: 'Telkomsel Batch 1',
      jumlahKartu: '100',
      lokasi: 'Gudang Utama',
      boxBesar: [
        {
          id: 1,
          namaBox: 'Box Telkomsel A',
          boxKecil: [
            {
              id: 1,
              namaBoxKecil: 'Box Kecil T1',
              perdana: [
                { id: 1, nomor: '08123456001' },
                { id: 2, nomor: '08123456002' }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      namaKartu: 'Indosat Batch 1',
      jumlahKartu: '50',
      lokasi: 'Gudang Utama',
      boxBesar: [
        {
          id: 1,
          namaBox: 'Box Indosat A',
          boxKecil: [
            {
              id: 1,
              namaBoxKecil: 'Box Kecil I1',
              perdana: [
                { id: 1, nomor: '08987654001' },
                { id: 2, nomor: '08987654002' }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

async function seedData() {
  try {
    console.log('🌱 Seeding sample data to Firebase...');
    
    // Seed SIM cards
    console.log('📱 Adding SIM cards...');
    for (const simcard of sampleData.simcards) {
      await db.collection('simcards').add(simcard);
    }
    console.log(`✅ Added ${sampleData.simcards.length} SIM cards`);
    
    // Seed machines
    console.log('🖥️ Adding machines...');
    for (const machine of sampleData.machines) {
      await db.collection('machines').add(machine);
    }
    console.log(`✅ Added ${sampleData.machines.length} machines`);
    
    // Seed racks
    console.log('📦 Adding racks...');
    for (const rack of sampleData.racks) {
      await db.collection('racks').add(rack);
    }
    console.log(`✅ Added ${sampleData.racks.length} racks`);
    
    console.log('🎉 Sample data seeded successfully!');
    console.log('🌐 You can now access your app at: http://localhost:3003');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

seedData();
