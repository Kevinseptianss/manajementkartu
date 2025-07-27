import { db } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get all collections
    const [simCardsSnapshot, machinesSnapshot, racksSnapshot] = await Promise.all([
      db.collection('simcards').get(),
      db.collection('machines').get(),
      db.collection('racks').get()
    ]);
    
    // Process SIM cards
    const simCards = [];
    simCardsSnapshot.forEach(doc => {
      simCards.push({ id: doc.id, ...doc.data() });
    });
    
    // Process machines
    const machines = [];
    machinesSnapshot.forEach(doc => {
      machines.push({ id: doc.id, ...doc.data() });
    });
    
    // Process racks
    const racks = [];
    racksSnapshot.forEach(doc => {
      racks.push({ id: doc.id, ...doc.data() });
    });
    
    // Calculate statistics
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const stats = {
      totalSimCards: simCards.length,
      activeSimCards: simCards.filter(card => card.status === 'active').length,
      usedSimCards: simCards.filter(card => card.status === 'used').length,
      inactiveSimCards: simCards.filter(card => card.status === 'inactive').length,
      
      // Cards available after 90 days (cards that were used 90+ days ago)
      cardsAvailableAfter90Days: simCards.filter(card => {
        if (!card.tanggalDigunakan) return false;
        const usageDate = new Date(card.tanggalDigunakan);
        return usageDate <= ninetyDaysAgo;
      }).length,
      
      // Cards that need to be shot (need to be activated/recharged)
      cardsNeedShooting: simCards.filter(card => {
        if (card.status === 'inactive') return true;
        if (card.masaAktif) {
          const expiryDate = new Date(card.masaAktif);
          const gracePeriod = parseInt(card.masaTenggang) || 0;
          const finalExpiryDate = new Date(expiryDate.getTime() + (gracePeriod * 24 * 60 * 60 * 1000));
          return finalExpiryDate <= now;
        }
        return false;
      }).length,
      
      totalMachines: machines.length,
      totalRacks: racks.length,
      
      // Worker statistics
      totalWorkers: machines.reduce((total, machine) => {
        return total + machine.ports.filter(port => port.worker && port.worker.trim() !== '').length;
      }, 0),
      
      // Earnings statistics
      totalEarnings: machines.reduce((total, machine) => {
        return total + machine.ports.reduce((machineTotal, port) => machineTotal + (port.pendapatan || 0), 0);
      }, 0),
      
      // Port statistics
      totalPorts: machines.reduce((total, machine) => total + parseInt(machine.jumlahPort || 0), 0),
      activePorts: machines.reduce((total, machine) => {
        return total + machine.ports.filter(port => port.status === 'aktif').length;
      }, 0),
      
      // Box statistics by location
      boxesByLocation: racks.reduce((acc, rack) => {
        if (!acc[rack.lokasi]) {
          acc[rack.lokasi] = 0;
        }
        acc[rack.lokasi] += rack.boxBesar?.length || 0;
        return acc;
      }, {}),
      
      // Cards by provider
      cardsByProvider: simCards.reduce((acc, card) => {
        if (!acc[card.jenisKartu]) {
          acc[card.jenisKartu] = 0;
        }
        acc[card.jenisKartu]++;
        return acc;
      }, {}),
      
      // Top workers by earnings
      topWorkers: (() => {
        const workerData = {};
        machines.forEach(machine => {
          machine.ports.forEach(port => {
            if (port.worker && port.worker.trim() !== '') {
              if (!workerData[port.worker]) {
                workerData[port.worker] = {
                  name: port.worker,
                  totalEarnings: 0,
                  ports: 0
                };
              }
              workerData[port.worker].totalEarnings += port.pendapatan || 0;
              workerData[port.worker].ports += 1;
            }
          });
        });
        
        return Object.values(workerData)
          .sort((a, b) => b.totalEarnings - a.totalEarnings)
          .slice(0, 10);
      })()
    };
    
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
