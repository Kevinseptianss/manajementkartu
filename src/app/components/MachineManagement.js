"use client";

import { useState } from 'react';
import { FiMonitor, FiPlus, FiEdit2, FiTrash2, FiSettings, FiUsers, FiDollarSign } from 'react-icons/fi';
import { SkeletonMachine } from './SkeletonLoader';

export default function MachineManagement({ 
  machines, 
  onAddMachine, 
  setMachines, 
  simCards, 
  setSimCards, 
  loading = false,
  boxKecil = [],
  boxBesar = [],
  racks = []
}) {
  // Debug: Log all machines when component receives them
  console.log('🔍 MachineManagement received machines:', machines.map(m => ({ id: m.id, name: m.namaMesin, type: typeof m.id })));
  
  // Debug: Check if IDs are Firebase IDs (string) or timestamp IDs (number)
  machines.forEach(machine => {
    if (typeof machine.id === 'number') {
      console.warn('⚠️ Found timestamp ID instead of Firestore ID:', machine.id, 'for machine:', machine.namaMesin);
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [showPortModal, setShowPortModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [selectedBoxKecil, setSelectedBoxKecil] = useState([]);
  const [injectionData, setInjectionData] = useState({
    totalNeeded: 0,
    totalSelected: 0
  });
  
  // Injection progress state
  const [injectionProgress, setInjectionProgress] = useState({
    isInjecting: false,
    current: 0,
    total: 0,
    currentBox: '',
    currentSIM: '',
    currentPort: 0
  });
  const [formData, setFormData] = useState({
    namaMesin: '',
    jumlahPort: '',
    lokasi: '',
    keterangan: '',
    ports: [],
    gmailAccount: '',
    password: ''
  });

  const [editingMachine, setEditingMachine] = useState(null);
  const [deletingMachine, setDeletingMachine] = useState(null);

  // Worker management state
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    pendapatan: 0
  });
  const [editingWorker, setEditingWorker] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Initialize ports array based on jumlahPort
    const ports = Array.from({ length: parseInt(formData.jumlahPort) }, (_, i) => ({
      id: i + 1,
      portNumber: i + 1,
      status: 'kosong',
      boxKecil: '',
      perdanaNomor: '',
      worker: '',
      pendapatan: 0
    }));

    const machineData = {
      ...formData,
      ports
    };

    try {
      if (editingMachine) {
        // For editing, use the updateMachine function from parent
        // This should update through API and return proper data
        await onAddMachine({ ...machineData, id: editingMachine });
        setEditingMachine(null);
      } else {
        // For new machine, let the API assign the ID and update state properly
        await onAddMachine(machineData);
      }

      // Reset form on success
      setFormData({
        namaMesin: '',
        jumlahPort: '',
        lokasi: '',
        keterangan: '',
        ports: [],
        gmailAccount: '',
        password: ''
      });
      setShowForm(false);

    } catch (error) {
      console.error('Error saving machine:', error);
      alert(`Failed to save machine: ${error.message}`);
      return;
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const deleteMachine = async (id) => {
    // Find the machine to be deleted
    const machineToDelete = machines.find(machine => machine.id === id);
    if (!machineToDelete) {
      alert('Machine not found!');
      return;
    }

    // Count attached SIM cards
    const attachedSIMs = machineToDelete.ports.filter(port => 
      port.perdanaNomor && port.perdanaNomor.trim() !== ''
    );

    // Show confirmation dialog
    const confirmMessage = attachedSIMs.length > 0 
      ? `Are you sure you want to delete "${machineToDelete.namaMesin}"?\n\nThis will detach ${attachedSIMs.length} SIM card(s) currently assigned to this machine:\n${attachedSIMs.map(port => `- Port ${port.portNumber}: ${port.perdanaNomor}`).join('\n')}\n\nThis action cannot be undone.`
      : `Are you sure you want to delete "${machineToDelete.namaMesin}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingMachine(id);

    try {
      // Step 1: Detach all SIM cards from this machine's ports
      if (attachedSIMs.length > 0) {
        console.log(`Detaching ${attachedSIMs.length} SIM cards from machine "${machineToDelete.namaMesin}"...`);
        
        // Update SIM cards status back to 'active'
        setSimCards(prevCards => 
          prevCards.map(card => {
            // Check if this SIM card is attached to any port of the machine being deleted
            const isAttachedToThisMachine = attachedSIMs.some(port => port.perdanaNomor === card.nomor);
            if (isAttachedToThisMachine) {
              return { 
                ...card, 
                status: 'active', 
                tanggalDigunakan: '' 
              };
            }
            return card;
          })
        );
      }

      // Step 2: Delete machine from Firestore
      console.log(`Deleting machine "${machineToDelete.namaMesin}" from database...`);
      const response = await fetch(`/api/machines?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete machine from database');
      }

      // Step 3: Update local state
      setMachines(machines.filter(machine => machine.id !== id));

      console.log(`✅ Successfully deleted machine "${machineToDelete.namaMesin}" and detached ${attachedSIMs.length} SIM card(s)`);
      alert(`Successfully deleted machine "${machineToDelete.namaMesin}"${attachedSIMs.length > 0 ? ` and detached ${attachedSIMs.length} SIM card(s)` : ''}.`);

    } catch (error) {
      console.error('Error deleting machine:', error);
      alert(`Failed to delete machine: ${error.message}`);
    } finally {
      setDeletingMachine(null);
    }
  };

  const editMachine = (machine) => {
    setFormData(machine);
    setEditingMachine(machine.id);
    setShowForm(true);
  };

  const updatePort = async (machineId, portId, updates) => {
    try {
      // Update the database first
      const response = await fetch(`/api/machines/${machineId}/ports`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portId: portId,
          ...updates
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update port in database');
      }

      // Update local state only after successful database update
      updatePortLocalState(machineId, portId, updates);

      console.log(`✅ Port ${portId} updated successfully in database and local state`);
    } catch (error) {
      console.error('Error updating port:', error);
      alert(`Failed to update port: ${error.message}`);
    }
  };

  const updatePortLocalState = (machineId, portId, updates) => {
    setMachines(machines.map(machine => {
      if (machine.id === machineId) {
        return {
          ...machine,
          ports: machine.ports.map(port => 
            port.id === portId ? { ...port, ...updates } : port
          )
        };
      }
      return machine;
    }));
  };

  const getPortStatusColor = (status) => {
    const colors = {
      kosong: 'bg-gray-100 text-gray-800',
      terisi: 'bg-blue-100 text-blue-800',
      aktif: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.kosong;
  };

  // Helper function to get SIM cards for a specific Box Kecil
  const getSimCardsForBoxKecil = (boxKecilId) => {
    return simCards.filter(card => card.boxKecilId === boxKecilId);
  };

  // Helper function to get used SIM cards for a specific Box Kecil
  const getUsedSimCardsForBoxKecil = (boxKecilId) => {
    const usedNumbers = new Set();
    machines.forEach(machine => {
      machine.ports?.forEach(port => {
        if (port.perdanaNomor && port.status === 'aktif') {
          usedNumbers.add(port.perdanaNomor);
        }
      });
    });
    
    return simCards.filter(card => 
      card.boxKecilId === boxKecilId && usedNumbers.has(card.nomor)
    );
  };

  // Helper function to get Box Kecil info with usage statistics (simplified - no hierarchy)
  const getBoxKecilWithStats = () => {
    return boxKecil.map(box => {
      const totalSims = getSimCardsForBoxKecil(box.id).length;
      const usedSims = getUsedSimCardsForBoxKecil(box.id).length;
      const availableSims = totalSims - usedSims;
      
      return {
        ...box,
        totalSims,
        usedSims,
        availableSims
      };
    });
  };

  // Handle inject button click
  const handleInjectClick = (machine) => {
    // Debug: Log machine ID to verify it exists
    console.log('🔍 Selected machine for injection:', {
      id: machine.id,
      name: machine.namaMesin,
      machineObject: machine
    });
    
    // Calculate how many ports are available (not already filled)
    const filledPorts = machine.ports.filter(port => port.perdanaNomor && port.perdanaNomor.trim() !== '').length;
    const availablePorts = machine.jumlahPort - filledPorts;
    
    setSelectedMachine(machine);
    setInjectionData({
      totalNeeded: availablePorts,
      totalSelected: 0
    });
    setSelectedBoxKecil([]);
    setShowInjectModal(true);
  };

  // Handle Box Kecil selection for injection (automatic selection)
  const handleBoxKecilSelect = (boxKecilData) => {
    const existingIndex = selectedBoxKecil.findIndex(item => item.boxKecilId === boxKecilData.id);
    
    if (existingIndex >= 0) {
      // If already selected, remove it
      const updatedSelections = selectedBoxKecil.filter(item => item.boxKecilId !== boxKecilData.id);
      setSelectedBoxKecil(updatedSelections);
      
      // Recalculate total
      const newTotal = updatedSelections.reduce((total, item) => total + item.selectedCount, 0);
      setInjectionData(prev => ({ ...prev, totalSelected: newTotal }));
    } else {
      // If not selected, add it with automatic count
      const stillNeeded = injectionData.totalNeeded - injectionData.totalSelected;
      const autoSelectCount = Math.min(boxKecilData.availableSims, stillNeeded);
      
      if (autoSelectCount > 0) {
        const newSelection = {
          boxKecilId: boxKecilData.id,
          boxKecilName: boxKecilData.namaBoxKecil,
          selectedCount: autoSelectCount,
          availableSims: boxKecilData.availableSims
        };
        
        const updatedSelections = [...selectedBoxKecil, newSelection];
        setSelectedBoxKecil(updatedSelections);
        
        // Update total selected count
        const newTotal = updatedSelections.reduce((total, item) => total + item.selectedCount, 0);
        setInjectionData(prev => ({ ...prev, totalSelected: newTotal }));
      }
    }
  };

  // Auto-select Box Kecil to meet required SIM count
  const handleAutoSelect = () => {
    const needed = injectionData.totalNeeded - injectionData.totalSelected;
    if (needed <= 0) return;
    
    const availableBoxes = getBoxKecilWithStats()
      .filter(box => box.availableSims > 0)
      .sort((a, b) => b.availableSims - a.availableSims); // Sort by available SIMs descending
    
    let remaining = needed;
    const newSelections = [...selectedBoxKecil];
    
    for (const box of availableBoxes) {
      if (remaining <= 0) break;
      
      const currentSelection = newSelections.find(item => item.boxKecilId === box.id);
      const currentCount = currentSelection?.selectedCount || 0;
      const canTakeMore = Math.min(box.availableSims - currentCount, remaining);
      
      if (canTakeMore > 0) {
        if (currentSelection) {
          currentSelection.selectedCount += canTakeMore;
        } else {
          newSelections.push({
            boxKecilId: box.id,
            boxKecilName: box.namaBoxKecil,
            selectedCount: canTakeMore,
            availableSims: box.availableSims
          });
        }
        remaining -= canTakeMore;
      }
    }
    
    setSelectedBoxKecil(newSelections);
    const newTotal = newSelections.reduce((total, item) => total + item.selectedCount, 0);
    setInjectionData(prev => ({ ...prev, totalSelected: newTotal }));
  };

  // Actual SIM injection function
  const handleActualInjection = async () => {
    setInjectionProgress({
      isInjecting: true,
      current: 0,
      total: injectionData.totalSelected,
      currentBox: '',
      currentSIM: '',
      currentPort: 0
    });

    try {
      // Get all available ports (empty ones)
      const availablePorts = selectedMachine.ports.filter(port => 
        !port.perdanaNomor || port.perdanaNomor.trim() === ''
      );

      let currentPortIndex = 0;
      let injectedCount = 0;

      // Process each selected Box Kecil
      for (const selection of selectedBoxKecil) {
        const boxKecilData = getBoxKecilWithStats().find(box => box.id === selection.boxKecilId);
        if (!boxKecilData) continue;

        // Get available SIM cards from this Box Kecil
        const availableSims = getSimCardsForBoxKecil(selection.boxKecilId)
          .filter(sim => {
            // Check if SIM is not already used
            const usedNumbers = new Set();
            machines.forEach(machine => {
              machine.ports?.forEach(port => {
                if (port.perdanaNomor && port.status === 'aktif') {
                  usedNumbers.add(port.perdanaNomor);
                }
              });
            });
            return !usedNumbers.has(sim.nomor);
          })
          .slice(0, selection.selectedCount); // Take only the required amount

        // Inject SIMs to ports
        for (let i = 0; i < availableSims.length && currentPortIndex < availablePorts.length; i++) {
          const sim = availableSims[i];
          const port = availablePorts[currentPortIndex];

          // Update progress
          setInjectionProgress(prev => ({
            ...prev,
            current: injectedCount + 1,
            currentBox: boxKecilData.namaBoxKecil,
            currentSIM: sim.nomor,
            currentPort: port.portNumber
          }));

          try {
            // Debug: Log the machine ID being used for API call
            console.log('🔍 Attempting to update machine port:', {
              machineId: selectedMachine.id,
              portId: port.id,
              portNumber: port.portNumber,
              simNumber: sim.nomor
            });

            // Step 1: Update the port in the database
            const portUpdateResponse = await fetch(`/api/machines/${selectedMachine.id}/ports`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                portId: port.id,
                perdanaNomor: sim.nomor,
                boxKecil: boxKecilData.namaBoxKecil,
                boxKecilId: selection.boxKecilId,
                status: 'aktif'
              }),
            });

            const portUpdateResult = await portUpdateResponse.json();
            if (!portUpdateResult.success) {
              console.error('❌ Port update failed:', {
                machineId: selectedMachine.id,
                error: portUpdateResult.error,
                response: portUpdateResult
              });
              throw new Error(`Failed to update port ${port.portNumber}: ${portUpdateResult.error}`);
            }

            // Step 2: Update the SIM card status in the database
            const simUpdateResponse = await fetch('/api/simcards', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: sim.id,
                status: 'used',
                tanggalDigunakan: new Date().toISOString().split('T')[0]
              }),
            });

            const simUpdateResult = await simUpdateResponse.json();
            if (!simUpdateResult.success) {
              throw new Error(`Failed to update SIM card ${sim.nomor}: ${simUpdateResult.error}`);
            }

            // Step 3: Update local state only after successful database updates
            updatePortLocalState(selectedMachine.id, port.id, {
              perdanaNomor: sim.nomor,
              boxKecil: boxKecilData.namaBoxKecil,
              boxKecilId: selection.boxKecilId,
              status: 'aktif'
            });

            setSimCards(prevCards => 
              prevCards.map(card => 
                card.id === sim.id 
                  ? { ...card, status: 'used', tanggalDigunakan: new Date().toISOString().split('T')[0] }
                  : card
              )
            );

            // Update selectedMachine to reflect the changes in the UI
            setSelectedMachine(prevMachine => ({
              ...prevMachine,
              ports: prevMachine.ports.map(p => 
                p.id === port.id ? { 
                  ...p, 
                  perdanaNomor: sim.nomor,
                  boxKecil: boxKecilData.namaBoxKecil,
                  boxKecilId: selection.boxKecilId,
                  status: 'aktif'
                } : p
              )
            }));

            console.log(`✅ Successfully injected SIM ${sim.nomor} to port ${port.portNumber}`);

          } catch (error) {
            console.error(`❌ Error injecting SIM ${sim.nomor} to port ${port.portNumber}:`, error);
            // Continue with next SIM instead of failing completely
          }

          injectedCount++;
          currentPortIndex++;

          // Add small delay for visual effect and to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Final update
      setInjectionProgress(prev => ({
        ...prev,
        isInjecting: false,
        current: injectedCount,
        currentBox: 'Completed',
        currentSIM: `${injectedCount} SIM cards injected to database`,
        currentPort: 0
      }));

      // Auto-close after 3 seconds to show completion message
      setTimeout(() => {
        setShowInjectModal(false);
        setInjectionProgress({
          isInjecting: false,
          current: 0,
          total: 0,
          currentBox: '',
          currentSIM: '',
          currentPort: 0
        });
      }, 3000);

      console.log(`🎉 Injection completed! ${injectedCount} SIM cards successfully injected and saved to database.`);

    } catch (error) {
      console.error('Error during injection:', error);
      setInjectionProgress(prev => ({
        ...prev,
        isInjecting: false,
        currentBox: 'Error',
        currentSIM: error.message,
        currentPort: 0
      }));
    }
  };

  // Handle port click to show SIM management modal
  const handlePortClick = (machine, port) => {
    setSelectedMachine(machine);
    setSelectedPort(port);
    setShowPortModal(true);
  };

  // Get SIM cards for the selected port's Box Kecil
  const getPortSimCards = () => {
    if (!selectedPort?.boxKecilId) return [];
    return getSimCardsForBoxKecil(selectedPort.boxKecilId);
  };

  const getTotalWorkers = (machine) => {
    return machine.ports.filter(port => port.worker && port.worker.trim() !== '').length;
  };

  const getTotalPendapatan = (machine) => {
    return machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0);
  };

  // Worker management functions
  const handleWorkerClick = () => {
    setShowWorkerModal(true);
  };

  const handleWorkerSubmit = (e) => {
    e.preventDefault();
    if (editingWorker) {
      setWorkers(workers.map(worker => 
        worker.id === editingWorker.id 
          ? { ...workerForm, id: editingWorker.id }
          : worker
      ));
    } else {
      const newWorker = {
        ...workerForm,
        id: Date.now().toString()
      };
      setWorkers([...workers, newWorker]);
    }
    setWorkerForm({ name: '', email: '', phone: '', pendapatan: 0 });
    setEditingWorker(null);
  };

  const editWorker = (worker) => {
    setWorkerForm({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      pendapatan: worker.pendapatan
    });
    setEditingWorker(worker);
  };

  const deleteWorker = (workerId) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      setWorkers(workers.filter(worker => worker.id !== workerId));
    }
  };

  const handleWorkerFormChange = (e) => {
    const { name, value } = e.target;
    setWorkerForm(prev => ({
      ...prev,
      [name]: name === 'pendapatan' ? parseFloat(value) || 0 : value
    }));
  };

  const getAvailableSimCards = () => {
    return simCards.filter(card => card.status === 'active');
  };

  const assignSimCardToPort = async (machineId, portId, simCardId) => {
    try {
      const selectedCard = simCards.find(card => card.id === simCardId);
      if (!selectedCard) {
        throw new Error('SIM card not found');
      }

      // Update the SIM card status in database
      const simResponse = await fetch('/api/simcards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: simCardId,
          status: 'used',
          tanggalDigunakan: new Date().toISOString().split('T')[0]
        }),
      });

      const simResult = await simResponse.json();
      if (!simResult.success) {
        throw new Error(simResult.error || 'Failed to update SIM card in database');
      }

      // Update the port in database
      await updatePort(machineId, portId, {
        perdanaNomor: selectedCard.nomor,
        boxKecil: selectedCard.box,
        status: 'terisi'
      });

      // Update SIM card status in local state
      setSimCards(prevCards => 
        prevCards.map(card => 
          card.id === simCardId 
            ? { ...card, status: 'used', tanggalDigunakan: new Date().toISOString().split('T')[0] }
            : card
        )
      );

      console.log(`✅ SIM card ${selectedCard.nomor} assigned to port successfully`);
    } catch (error) {
      console.error('Error assigning SIM card to port:', error);
      alert(`Failed to assign SIM card: ${error.message}`);
    }
  };

  const removeSimCardFromPort = async (machineId, portId, perdanaNomor) => {
    try {
      // Find the SIM card to update
      const simCard = simCards.find(card => card.nomor === perdanaNomor);
      if (!simCard) {
        throw new Error('SIM card not found');
      }

      // Update the SIM card status in database
      const simResponse = await fetch('/api/simcards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: simCard.id,
          status: 'active',
          tanggalDigunakan: ''
        }),
      });

      const simResult = await simResponse.json();
      if (!simResult.success) {
        throw new Error(simResult.error || 'Failed to update SIM card in database');
      }

      // Clear the port in database
      await updatePort(machineId, portId, {
        perdanaNomor: '',
        boxKecil: '',
        status: 'kosong'
      });

      // Update SIM card status in local state
      setSimCards(prevCards => 
        prevCards.map(card => 
          card.nomor === perdanaNomor 
            ? { ...card, status: 'active', tanggalDigunakan: '' }
            : card
        )
      );

      console.log(`✅ SIM card ${perdanaNomor} removed from port successfully`);
    } catch (error) {
      console.error('Error removing SIM card from port:', error);
      alert(`Failed to remove SIM card: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiMonitor className="w-6 h-6 mr-2" />
          Manajemen Mesin
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          disabled={loading}
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {showForm ? 'Tutup Form' : 'Tambah Mesin Baru'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonMachine />
          <SkeletonMachine />
        </div>
      ) : (
        <>
          {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMachine ? 'Edit Mesin' : 'Tambah Mesin Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mesin
                </label>
                <input
                  type="text"
                  name="namaMesin"
                  value={formData.namaMesin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Port
                </label>
                <input
                  type="number"
                  name="jumlahPort"
                  value={formData.jumlahPort}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  max="128"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Akun Gmail
                </label>
                <input
                  type="email"
                  name="gmailAccount"
                  value={formData.gmailAccount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {editingMachine ? 'Update Mesin' : 'Simpan Mesin'}
              </button>
              {editingMachine && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMachine(null);
                    setFormData({
                      namaMesin: '',
                      jumlahPort: '',
                      lokasi: '',
                      keterangan: '',
                      ports: [],
                      gmailAccount: '',
                      password: ''
                    });
                    setShowForm(false);
                  }}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Machines List */}
      <div className="space-y-6">
        {machines.map((machine) => (
          <div key={machine.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{machine.namaMesin}</h3>
                <p className="text-sm text-gray-600">{machine.lokasi}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInjectClick(machine)}
                  className={`flex items-center text-sm px-2 py-1 border rounded ${
                    (() => {
                      const filledPorts = machine.ports.filter(port => port.perdanaNomor && port.perdanaNomor.trim() !== '').length;
                      const availablePorts = machine.jumlahPort - filledPorts;
                      return availablePorts > 0 
                        ? 'text-purple-600 hover:text-purple-900 border-purple-200 hover:bg-purple-50' 
                        : 'text-gray-400 border-gray-200 cursor-not-allowed';
                    })()
                  }`}
                  disabled={(() => {
                    const filledPorts = machine.ports.filter(port => port.perdanaNomor && port.perdanaNomor.trim() !== '').length;
                    const availablePorts = machine.jumlahPort - filledPorts;
                    return availablePorts === 0;
                  })()}
                  title={(() => {
                    const filledPorts = machine.ports.filter(port => port.perdanaNomor && port.perdanaNomor.trim() !== '').length;
                    const availablePorts = machine.jumlahPort - filledPorts;
                    return availablePorts > 0 
                      ? `Inject SIM cards to ${availablePorts} available ports` 
                      : 'All ports are already filled';
                  })()}
                >
                  <FiSettings className="w-3 h-3 mr-1" />
                  Inject SIM {(() => {
                    const filledPorts = machine.ports.filter(port => port.perdanaNomor && port.perdanaNomor.trim() !== '').length;
                    const availablePorts = machine.jumlahPort - filledPorts;
                    return availablePorts > 0 ? `(${availablePorts})` : '';
                  })()}
                </button>
                <button
                  onClick={handleWorkerClick}
                  className="text-green-600 hover:text-green-900 flex items-center text-sm px-2 py-1 border border-green-200 rounded"
                >
                  <FiUsers className="w-3 h-3 mr-1" />
                  Add Worker
                </button>
                <button
                  onClick={() => editMachine(machine)}
                  className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                  <FiEdit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => deleteMachine(machine.id)}
                  disabled={deletingMachine === machine.id}
                  className={`flex items-center ${
                    deletingMachine === machine.id 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-900'
                  }`}
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  {deletingMachine === machine.id ? 'Deleting...' : 'Hapus'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-600">Total Port</p>
                <p className="text-xl font-semibold text-blue-900">{machine.jumlahPort}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-600">Port Aktif</p>
                <p className="text-xl font-semibold text-green-900">
                  {machine.ports.filter(p => p.status === 'aktif').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-600">Total Workers</p>
                <p className="text-xl font-semibold text-yellow-900">{getTotalWorkers(machine)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-purple-600">Total Pendapatan</p>
                <p className="text-xl font-semibold text-purple-900">
                  Rp {getTotalPendapatan(machine).toLocaleString()}
                </p>
              </div>
            </div>

            {machine.gmailAccount && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm"><strong>Gmail:</strong> {machine.gmailAccount}</p>
                <p className="text-sm"><strong>Password:</strong> {'*'.repeat(machine.password.length)}</p>
              </div>
            )}

            {machine.keterangan && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm"><strong>Keterangan:</strong> {machine.keterangan}</p>
              </div>
            )}

            {/* Ports Grid */}
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Port Status</h4>
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
                {machine.ports.map((port) => (
                  <div
                    key={port.id}
                    className={`p-2 rounded text-xs text-center cursor-pointer hover:opacity-80 ${getPortStatusColor(port.status)}`}
                    onClick={() => handlePortClick(machine, port)}
                    title={`Port ${port.portNumber}\nStatus: ${port.status}\nClick to manage SIM cards`}
                  >
                    <div className="font-medium">{port.portNumber}</div>
                    <div className="text-xs">{port.status === 'kosong' ? 'Empty' : port.status}</div>
                    {port.status !== 'kosong' && (
                      <div className="text-xs mt-1 truncate">
                        {port.perdanaNomor || 'No SIM'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Klik pada port untuk mengedit detail
              </div>
            </div>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada mesin yang ditambahkan</p>
        </div>
      )}

      {/* Inject SIM Modal */}
      {showInjectModal && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Inject SIM to {selectedMachine.namaMesin}
              </h3>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span className="font-medium">Total Ports:</span> {selectedMachine.jumlahPort}
                </div>
                <div>
                  <span className="font-medium">Available Ports:</span> {injectionData.totalNeeded}
                </div>
                <div>
                  <span className="font-medium">Selected SIMs:</span> {injectionData.totalSelected}
                </div>
                <div>
                  <span className={`font-medium ${injectionData.totalSelected >= injectionData.totalNeeded ? 'text-green-600' : 'text-orange-600'}`}>
                    Status: {injectionData.totalSelected >= injectionData.totalNeeded ? 'Ready' : 'Need More'}
                  </span>
                </div>
              </div>
              
              {injectionData.totalNeeded === 0 && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded">
                  ⚠️ All ports are already filled. No injection needed.
                </div>
              )}
              
              {injectionData.totalNeeded > 0 && injectionData.totalSelected < injectionData.totalNeeded && !injectionProgress.isInjecting && (
                <button
                  onClick={() => handleAutoSelect()}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Auto Select ({injectionData.totalNeeded - injectionData.totalSelected} SIMs)
                </button>
              )}
            </div>

            {injectionProgress.isInjecting && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">Injecting SIM Cards...</h4>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(injectionProgress.current / injectionProgress.total) * 100}%` }}
                  ></div>
                </div>
                
                {/* Progress Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Progress:</span> {injectionProgress.current} / {injectionProgress.total}
                  </div>
                  <div>
                    <span className="font-medium">Current Port:</span> {injectionProgress.currentPort}
                  </div>
                  <div>
                    <span className="font-medium">Current Box:</span> {injectionProgress.currentBox}
                  </div>
                  <div>
                    <span className="font-medium">Current SIM:</span> {injectionProgress.currentSIM}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">Select Box Kecil and SIM Count:</h4>
              
              {getBoxKecilWithStats()
                .filter(box => box.availableSims > 0) // Only show boxes with available SIMs
                .sort((a, b) => b.availableSims - a.availableSims) // Sort by available SIMs descending
                .map((boxKecilData) => {
                  const currentSelection = selectedBoxKecil.find(item => item.boxKecilId === boxKecilData.id);
                  const isSelected = !!currentSelection;
                  const selectedCount = currentSelection?.selectedCount || 0;
                  const stillNeeded = injectionData.totalNeeded - injectionData.totalSelected;
                  const wouldSelect = Math.min(boxKecilData.availableSims, stillNeeded + selectedCount);
                  
                  return (
                <div 
                  key={boxKecilData.id} 
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    injectionProgress.isInjecting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md cursor-pointer' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !injectionProgress.isInjecting && handleBoxKecilSelect(boxKecilData)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h5 className="font-medium">{boxKecilData.namaBoxKecil}</h5>
                        {isSelected && (
                          <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                        {boxKecilData.totalSims} Total
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">
                        {boxKecilData.usedSims} Used
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {boxKecilData.availableSims} Available
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {isSelected ? (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-800">
                          <strong>Selected: {selectedCount} SIM cards</strong>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBoxKecilSelect(boxKecilData);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {stillNeeded > 0 ? (
                            <span>
                              Will select: <strong>{wouldSelect} SIM cards</strong>
                              {wouldSelect < boxKecilData.availableSims && (
                                <span className="text-gray-500"> (of {boxKecilData.availableSims} available)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">All ports filled</span>
                          )}
                        </div>
                        {stillNeeded > 0 && (
                          <span className="text-blue-600 text-sm font-medium">Click to select</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowInjectModal(false)}
                disabled={injectionProgress.isInjecting}
                className={`px-4 py-2 rounded ${injectionProgress.isInjecting ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleActualInjection}
                disabled={injectionData.totalSelected !== injectionData.totalNeeded || injectionProgress.isInjecting}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                  injectionData.totalSelected === injectionData.totalNeeded && !injectionProgress.isInjecting
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-400'
                }`}
              >
                {injectionProgress.isInjecting 
                  ? `Injecting... (${injectionProgress.current}/${injectionProgress.total})`
                  : injectionData.totalSelected === injectionData.totalNeeded 
                    ? `Inject ${injectionData.totalSelected} SIM Cards` 
                    : `Need ${injectionData.totalNeeded - injectionData.totalSelected} More SIMs`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Port Management Modal */}
      {showPortModal && selectedMachine && selectedPort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Manage Port {selectedPort.portNumber} - {selectedMachine.namaMesin}
              </h3>
              <button
                onClick={() => setShowPortModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Status:</span> {selectedPort.status}
                </div>
                <div>
                  <span className="font-medium">Current SIM:</span> {selectedPort.perdanaNomor || 'None'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Available SIM Cards:</h4>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Phone Number</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Provider</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getPortSimCards().map((simCard) => (
                      <tr key={simCard.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{simCard.nomor}</td>
                        <td className="px-4 py-2 text-sm">{simCard.provider}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            simCard.nomor === selectedPort.perdanaNomor 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {simCard.nomor === selectedPort.perdanaNomor ? 'In Use' : 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {simCard.nomor === selectedPort.perdanaNomor ? (
                            <button
                              onClick={async () => {
                                await removeSimCardFromPort(selectedMachine.id, selectedPort.id, selectedPort.perdanaNomor);
                                setShowPortModal(false);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Detach
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                // Update SIM card status to used in database
                                try {
                                  const simResponse = await fetch('/api/simcards', {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      id: simCard.id,
                                      status: 'used',
                                      tanggalDigunakan: new Date().toISOString().split('T')[0]
                                    }),
                                  });

                                  const simResult = await simResponse.json();
                                  if (!simResult.success) {
                                    throw new Error(simResult.error || 'Failed to update SIM card in database');
                                  }

                                  // Update port in database
                                  await updatePort(selectedMachine.id, selectedPort.id, {
                                    perdanaNomor: simCard.nomor,
                                    status: 'aktif'
                                  });

                                  // Update SIM card status in local state
                                  setSimCards(prevCards => 
                                    prevCards.map(card => 
                                      card.id === simCard.id 
                                        ? { ...card, status: 'used', tanggalDigunakan: new Date().toISOString().split('T')[0] }
                                        : card
                                    )
                                  );

                                  setShowPortModal(false);
                                } catch (error) {
                                  console.error('Error attaching SIM card:', error);
                                  alert(`Failed to attach SIM card: ${error.message}`);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Attach
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getPortSimCards().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No SIM cards available for this Box Kecil
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPortModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Management Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Worker Management</h3>
              <button
                onClick={() => {
                  setShowWorkerModal(false);
                  setEditingWorker(null);
                  setWorkerForm({ name: '', email: '', phone: '', pendapatan: 0 });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Add/Edit Worker Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h4>
              <form onSubmit={handleWorkerSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={workerForm.name}
                    onChange={handleWorkerFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={workerForm.email}
                    onChange={handleWorkerFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={workerForm.phone}
                    onChange={handleWorkerFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pendapatan (Rp)
                  </label>
                  <input
                    type="number"
                    name="pendapatan"
                    value={workerForm.pendapatan}
                    onChange={handleWorkerFormChange}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWorker(null);
                      setWorkerForm({ name: '', email: '', phone: '', pendapatan: 0 });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {editingWorker ? 'Update Worker' : 'Add Worker'}
                  </button>
                </div>
              </form>
            </div>

            {/* Workers List */}
            <div className="space-y-4">
              <h4 className="font-medium">Workers List</h4>
              
              {workers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No workers added yet. Add your first worker above.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Email</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Phone</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Pendapatan</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {workers.map((worker) => (
                        <tr key={worker.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">{worker.name}</td>
                          <td className="px-4 py-2 text-sm">{worker.email}</td>
                          <td className="px-4 py-2 text-sm">{worker.phone}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="flex items-center">
                              <FiDollarSign className="w-3 h-3 mr-1 text-green-600" />
                              Rp {worker.pendapatan.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => editWorker(worker)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit Worker"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteWorker(worker.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Worker"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total Summary */}
            {workers.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Workers:</span>
                  <span>{workers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Pendapatan:</span>
                  <span className="flex items-center font-semibold text-green-600">
                    <FiDollarSign className="w-4 h-4 mr-1" />
                    Rp {workers.reduce((total, worker) => total + worker.pendapatan, 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowWorkerModal(false);
                  setEditingWorker(null);
                  setWorkerForm({ name: '', email: '', phone: '', pendapatan: 0 });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
