"use client";

import { useState } from 'react';
import { 
  FiGrid, 
  FiSmartphone, 
  FiArchive, 
  FiMonitor, 
  FiDollarSign, 
  FiSearch,
  FiMenu,
  FiX,
  FiUsers,
  FiTrendingUp,
  FiAlertTriangle,
  FiDatabase,
  FiCheck,
  FiLoader,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import SimCardForm from './components/SimCardForm';
import SimCardList from './components/SimCardList';
import RackManagement from './components/RackManagementSeparate';
import MachineManagement from './components/MachineManagement';
import EarningsReport from './components/EarningsReport';
import SearchCard from './components/SearchCard';
import { useSimCards, useMachines, useRacks, useBoxKecil, useBoxBesar } from '../hooks/useFirebase';
import { 
  SkeletonStats, 
  SkeletonForm, 
  SkeletonTable, 
  SkeletonMachine, 
  SkeletonEarnings, 
  SkeletonSearch 
} from './components/SkeletonLoader';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock data modal state
  const [showMockDataModal, setShowMockDataModal] = useState(false);
  const [mockDataForm, setMockDataForm] = useState({
    count: 100,
    selectedBoxKecil: ''
  });
  
  // Progress tracking state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    status: 'preparing', // 'preparing', 'generating', 'completed', 'error'
    message: '',
    errors: [],
    success: 0,
    failed: 0
  });

  // Use Firebase hooks
  const { 
    simCards, 
    addSimCard, 
    updateSimCard, 
    deleteSimCard, 
    setSimCards,
    loading: simCardsLoading 
  } = useSimCards();
  
  const { 
    machines, 
    addMachine, 
    updateMachine, 
    deleteMachine, 
    setMachines,
    loading: machinesLoading 
  } = useMachines();
  
  const { 
    racks, 
    addRack, 
    updateRack, 
    deleteRack, 
    setRacks,
    loading: racksLoading 
  } = useRacks();

  // Hook for Box Kecil data
  const { 
    boxKecil, 
    loading: boxKecilLoading 
  } = useBoxKecil();

  // Hook for Box Besar data
  const { 
    boxBesar, 
    loading: boxBesarLoading 
  } = useBoxBesar();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'simcards', label: 'Kartu SIM', icon: FiSmartphone },
    { id: 'racks', label: 'Rak Kartu', icon: FiArchive },
    { id: 'machines', label: 'Mesin', icon: FiMonitor },
    { id: 'earnings', label: 'Pendapatan', icon: FiDollarSign },
    { id: 'search', label: 'Cari Kartu', icon: FiSearch },
  ];

  // Calculate dashboard stats
  const getTotalWorkers = () => {
    return machines.reduce((total, machine) => {
      return total + machine.ports.filter(port => port.worker && port.worker.trim() !== '').length;
    }, 0);
  };

  const getTotalEarnings = () => {
    return machines.reduce((total, machine) => {
      return total + machine.ports.reduce((machineTotal, port) => machineTotal + (port.pendapatan || 0), 0);
    }, 0);
  };

  const getUsableCardsAfter90Days = () => {
    const today = new Date();
    return simCards.filter(card => {
      if (!card.masaAktif) return false;
      const masaAktifDate = new Date(card.masaAktif);
      const diffTime = today - masaAktifDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 90 && card.status === 'active';
    }).length;
  };

  const getCardsNeedShooting = () => {
    return simCards.filter(card => {
      // Cards that need to be "shot" (could be cards with certain status or criteria)
      return card.status === 'inactive' || (card.masaTenggang && parseInt(card.masaTenggang) <= 7);
    });
  };

  const handleDashboardCardClick = (type) => {
    if (type === 'needShooting') {
      // Navigate to search with filter for cards that need shooting
      setActiveTab('search');
    } else if (type === 'usableAfter90') {
      // Navigate to SIM cards with filter
      setActiveTab('simcards');
    }
  };

  // Get all available Box Kecil for mock data assignment
  const getAllBoxKecil = () => {
    return boxKecil.map(box => {
      // Find associated Box Besar and Rak for display path
      const associatedBoxBesar = boxBesar.find(bb => bb.id === box.boxBesarId);
      const associatedRak = racks.find(r => r.id === box.rakId);
      
      const fullPath = associatedRak && associatedBoxBesar 
        ? `${associatedRak.namaRak || associatedRak.namaKartu} > ${associatedBoxBesar.namaBox} > ${box.namaBoxKecil}`
        : box.namaBoxKecil;

      return {
        id: box.id,
        name: box.namaBoxKecil,
        boxBesarId: box.boxBesarId,
        rakId: box.rakId,
        fullPath: fullPath
      };
    });
  };  // Handle mock data generation
  const handleGenerateMockData = async () => {
    if (!mockDataForm.selectedBoxKecil) {
      alert('Please select a Box Kecil where the mock data will be saved.');
      return;
    }

    if (mockDataForm.count < 1 || mockDataForm.count > 1000) {
      alert('Please enter a valid number between 1 and 1000.');
      return;
    }

    // Close the form modal and show progress modal
    setShowMockDataModal(false);
    setShowProgressModal(true);
    
    // Initialize progress
    setProgressData({
      current: 0,
      total: mockDataForm.count,
      percentage: 0,
      status: 'preparing',
      message: 'Preparing to generate mock data...',
      errors: [],
      success: 0,
      failed: 0
    });

    // Start the generation process
    await generateMockDataWithProgress(mockDataForm.count, mockDataForm.selectedBoxKecil);
  };

  // Function to generate mock data with progress tracking
  const generateMockDataWithProgress = async (count, boxKecilId) => {
    try {
      // Update progress: Fetching racks
      setProgressData(prev => ({
        ...prev,
        status: 'preparing',
        message: 'Fetching existing racks and Box Kecil...'
      }));

      // Load the mock data generator if not available
      if (!window.addMockSimCardsToFirebaseWithProgress) {
        const script = document.createElement('script');
        script.src = '/mockDataGenerator.js';
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create a progress callback function
      window.mockDataProgressCallback = (current, total, success, failed, message, errors = []) => {
        const percentage = Math.round((current / total) * 100);
        setProgressData(prev => ({
          ...prev,
          current,
          total,
          percentage,
          status: current >= total ? 'completed' : 'generating',
          message,
          success,
          failed,
          errors: [...prev.errors, ...errors]
        }));
      };

      // Start generation
      setProgressData(prev => ({
        ...prev,
        status: 'generating',
        message: 'Starting SIM card generation...'
      }));

      // Call the mock data generator with progress tracking
      await window.addMockSimCardsToFirebaseWithProgress(count, boxKecilId, window.mockDataProgressCallback);

      // Final update
      setProgressData(prev => ({
        ...prev,
        status: 'completed',
        message: `Generation completed! ${prev.success} cards added successfully.`
      }));

    } catch (error) {
      console.error('Error generating mock data:', error);
      setProgressData(prev => ({
        ...prev,
        status: 'error',
        message: `Error: ${error.message}`,
        errors: [...prev.errors, error.message]
      }));
    }
  };

  // Close progress modal and refresh data
  const handleCloseProgress = () => {
    setShowProgressModal(false);
    setProgressData({
      current: 0,
      total: 0,
      percentage: 0,
      status: 'preparing',
      message: '',
      errors: [],
      success: 0,
      failed: 0
    });
    
    // Refresh the page to show new data
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-slate-900">
              SIM Manager
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-slate-900'
                }`}
              >
                <IconComponent size={20} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-700 mt-1">
                Sistem Manajemen Kartu SIM dan Perangkat
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMockDataModal(true)}
                className="px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition-colors flex items-center"
              >
                <FiDatabase size={12} className="mr-1" />
                Add Mock Data
              </button>
              <div className="flex items-center space-x-2 text-sm text-slate-700">
                <FiUsers size={16} />
                <span>{getTotalWorkers()} Workers</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-700">
                <FiTrendingUp size={16} />
                <span>Rp {getTotalEarnings().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {(simCardsLoading || machinesLoading || racksLoading) ? (
                <SkeletonStats />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border-gray-100 border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('simcards')}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiSmartphone className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Total Kartu SIM</p>
                        <p className="text-2xl font-bold text-slate-900">{simCards.length}</p>
                        <p className="text-xs text-slate-600">
                          {simCards.filter(card => card.status === 'active').length} aktif
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border-gray-100 border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('machines')}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiUsers className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Total Workers</p>
                        <p className="text-2xl font-bold text-slate-900">{getTotalWorkers()}</p>
                        <p className="text-xs text-slate-600">
                          Across {machines.length} machines
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border-gray-100 border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('racks')}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <FiArchive className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Total Rak</p>
                        <p className="text-2xl font-bold text-slate-900">{racks.length}</p>
                        <p className="text-xs text-slate-600">
                          Storage management
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border-gray-100 border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('earnings')}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FiDollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-slate-900">
                          Rp {getTotalEarnings().toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600">
                          Avg: Rp {getTotalWorkers() > 0 ? Math.round(getTotalEarnings() / getTotalWorkers()).toLocaleString() : 0}/worker
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Stats Cards */}
              {(simCardsLoading || machinesLoading) ? (
                <SkeletonStats />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors"
                    onClick={() => handleDashboardCardClick('usableAfter90')}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FiSmartphone className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Kartu Dapat Digunakan (90+ Hari)</p>
                        <p className="text-2xl font-bold text-slate-900">{getUsableCardsAfter90Days()}</p>
                        <p className="text-xs text-orange-600">
                          Klik untuk lihat detail
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors"
                    onClick={() => handleDashboardCardClick('needShooting')}
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FiSearch className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Kartu Perlu Di Tembak</p>
                        <p className="text-2xl font-bold text-slate-900">{getCardsNeedShooting().length}</p>
                        <p className="text-xs text-red-600">
                          Klik untuk cari per box
                        </p>
                      </div>
                    </div>
                    
                    {/* Show list of cards that need shooting */}
                    {getCardsNeedShooting().length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">
                          Kartu yang perlu di tembak:
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {getCardsNeedShooting().slice(0, 5).map((card, index) => (
                            <div key={card.id || index} className="flex justify-between items-center text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {card.nomor}
                                </p>
                                <p className="text-gray-500 truncate">
                                  {card.jenisKartu} • {card.boxKecilName || 'No Box'}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                card.status === 'inactive' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {card.status === 'inactive' ? 'Inactive' : `${card.masaTenggang}d left`}
                              </span>
                            </div>
                          ))}
                          {getCardsNeedShooting().length > 5 && (
                            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                              +{getCardsNeedShooting().length - 5} kartu lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Machine Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <FiMonitor className="w-5 h-5 mr-2" />
                    Status Mesin
                  </h3>
                  
                  {machines.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">Belum ada mesin yang terdaftar</p>
                  ) : (
                    <div className="space-y-3">
                      {machines.map((machine) => {
                        const activePorts = machine.ports.filter(p => p.status === 'aktif').length;
                        const workersCount = machine.ports.filter(p => p.worker && p.worker.trim() !== '').length;
                        const earnings = machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0);
                        
                        return (
                          <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{machine.namaMesin}</p>
                              <p className="text-sm text-slate-700">{machine.lokasi}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">
                                {activePorts}/{machine.jumlahPort} ports
                              </p>
                              <p className="text-xs text-slate-700">
                                {workersCount} workers • Rp {earnings.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2" />
                    Top Workers
                  </h3>
                  
                  {getTotalWorkers() === 0 ? (
                    <p className="text-slate-600 text-center py-8">Belum ada worker yang terdaftar</p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
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
                          .slice(0, 5)
                          .map((worker, index) => (
                            <div key={worker.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{worker.name}</p>
                                  <p className="text-sm text-slate-700">{worker.ports} ports</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-900">
                                  Rp {worker.totalEarnings.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-700">
                                  Rp {Math.round(worker.totalEarnings / worker.ports).toLocaleString()}/port
                                </p>
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Usage Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <FiSmartphone className="w-5 h-5 mr-2" />
                  Statistik Kartu SIM
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{simCards.length}</p>
                    <p className="text-sm text-blue-800">Total Kartu</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {simCards.filter(card => card.status === 'active').length}
                    </p>
                    <p className="text-sm text-green-800">Kartu Aktif</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {simCards.filter(card => card.status === 'used').length}
                    </p>
                    <p className="text-sm text-yellow-800">Sedang Digunakan</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      {simCards.filter(card => card.status === 'inactive').length}
                    </p>
                    <p className="text-sm text-slate-800">Tidak Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simcards' && (
            <div>
              <SimCardForm onSubmit={addSimCard} racks={racks} />
              <SimCardList 
                cards={simCards} 
                setCards={setSimCards}
                onUpdate={updateSimCard}
                onDelete={deleteSimCard}
                loading={simCardsLoading}
                boxKecil={boxKecil}
                boxBesar={boxBesar}
                racks={racks}
                machines={machines}
              />
            </div>
          )}

          {activeTab === 'racks' && (
            <RackManagement 
              simCards={simCards}
            />
          )}

          {activeTab === 'machines' && (
            <MachineManagement 
              machines={machines} 
              onAddMachine={addMachine} 
              setMachines={setMachines}
              onUpdate={updateMachine}
              onDelete={deleteMachine}
              simCards={simCards}
              setSimCards={setSimCards}
              loading={machinesLoading}
              boxKecil={boxKecil}
              boxBesar={boxBesar}
              racks={racks}
            />
          )}

          {activeTab === 'earnings' && (
            <EarningsReport 
              machines={machines} 
              simCards={simCards} 
              loading={machinesLoading || simCardsLoading}
            />
          )}

          {activeTab === 'search' && (
            <SearchCard 
              simCards={simCards} 
              racks={racks} 
              machines={machines}
              loading={simCardsLoading || racksLoading || machinesLoading}
            />
          )}

        </main>
      </div>

      {/* Mock Data Generation Modal */}
      {showMockDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <FiAlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                Add Mock Data
              </h3>
              <button
                onClick={() => setShowMockDataModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <FiAlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 mb-1">
                    Warning: Dummy Data Generation
                  </h4>
                  <p className="text-sm text-orange-700">
                    This will add dummy/fake SIM card data to your database. 
                    Make sure you don't have real data or it will be mixed with dummy data.
                    Only use this for testing purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Count Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of dummy SIM cards to generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={mockDataForm.count}
                  onChange={(e) => setMockDataForm({
                    ...mockDataForm,
                    count: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter number (1-1000)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: Start with 50-100 cards for testing
                </p>
              </div>

              {/* Box Kecil Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Box Kecil for storage
                </label>
                <select
                  value={mockDataForm.selectedBoxKecil}
                  onChange={(e) => setMockDataForm({
                    ...mockDataForm,
                    selectedBoxKecil: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose Box Kecil...</option>
                  {getAllBoxKecil().map((box) => (
                    <option key={box.id} value={box.id}>
                      {box.fullPath}
                    </option>
                  ))}
                </select>
                {getAllBoxKecil().length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No Box Kecil available. Please create some racks first.
                  </p>
                )}
              </div>

              {/* Data Preview */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-slate-700 mb-2">
                  What will be generated:
                </h5>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Random Indonesian phone numbers (08xx format)</li>
                  <li>• Realistic NIK and KK numbers</li>
                  <li>• Random providers (Telkomsel, Indosat, XL, etc.)</li>
                  <li>• Random activation dates and statuses</li>
                  <li>• Assignment to selected Box Kecil</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMockDataModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateMockData}
                disabled={!mockDataForm.selectedBoxKecil || mockDataForm.count < 1}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <FiCheck className="w-4 h-4 mr-1" />
                Generate {mockDataForm.count} Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                {progressData.status === 'preparing' && <FiLoader className="w-5 h-5 text-blue-600 mr-2 animate-spin" />}
                {progressData.status === 'generating' && <FiLoader className="w-5 h-5 text-blue-600 mr-2 animate-spin" />}
                {progressData.status === 'completed' && <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                {progressData.status === 'error' && <FiXCircle className="w-5 h-5 text-red-600 mr-2" />}
                Generating Mock Data
              </h3>
              {progressData.status === 'completed' || progressData.status === 'error' ? (
                <button
                  onClick={handleCloseProgress}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              ) : null}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{progressData.current} / {progressData.total} ({progressData.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    progressData.status === 'error' ? 'bg-red-500' :
                    progressData.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressData.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            <div className="mb-4">
              <p className={`text-sm ${
                progressData.status === 'error' ? 'text-red-600' :
                progressData.status === 'completed' ? 'text-green-600' : 'text-slate-600'
              }`}>
                {progressData.message}
              </p>
            </div>

            {/* Statistics */}
            {progressData.current > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{progressData.success}</p>
                    <p className="text-xs text-green-800">Successful</p>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{progressData.failed}</p>
                    <p className="text-xs text-red-800">Failed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Details */}
            {progressData.errors.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-red-700 mb-2">Errors:</h5>
                <div className="max-h-32 overflow-y-auto bg-red-50 rounded-lg p-2">
                  {progressData.errors.slice(-5).map((error, index) => (
                    <p key={index} className="text-xs text-red-600 mb-1">
                      • {error}
                    </p>
                  ))}
                  {progressData.errors.length > 5 && (
                    <p className="text-xs text-red-500 italic">
                      ... and {progressData.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              {progressData.status === 'completed' && (
                <button
                  onClick={handleCloseProgress}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FiCheck className="w-4 h-4 mr-1" />
                  Complete & Refresh
                </button>
              )}
              {progressData.status === 'error' && (
                <button
                  onClick={handleCloseProgress}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FiX className="w-4 h-4 mr-1" />
                  Close
                </button>
              )}
              {(progressData.status === 'preparing' || progressData.status === 'generating') && (
                <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md flex items-center">
                  <FiLoader className="w-4 h-4 mr-1 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
