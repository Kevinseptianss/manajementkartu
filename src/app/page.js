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
  FiTrendingUp
} from 'react-icons/fi';
import SimCardForm from './components/SimCardForm';
import SimCardList from './components/SimCardList';
import RackManagement from './components/RackManagement';
import MachineManagement from './components/MachineManagement';
import EarningsReport from './components/EarningsReport';
import SearchCard from './components/SearchCard';
import { useSimCards, useMachines, useRacks } from '../hooks/useFirebase';
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
    }).length;
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

        {/* Sidebar Footer Stats */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-slate-900 space-y-1">
              <div className="flex justify-between">
                <span>Total Kartu:</span>
                <span className="font-semibold">{simCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Rak:</span>
                <span className="font-semibold">{racks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Mesin:</span>
                <span className="font-semibold">{machines.length}</span>
              </div>
            </div>
          </div>
        )}
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FiSearch className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-700">Kartu Perlu Di Tembak</p>
                        <p className="text-2xl font-bold text-slate-900">{getCardsNeedShooting()}</p>
                        <p className="text-xs text-red-600">
                          Klik untuk cari per box
                        </p>
                      </div>
                    </div>
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
              <SimCardForm onSubmit={addSimCard} />
              <SimCardList 
                cards={simCards} 
                setCards={setSimCards}
                onUpdate={updateSimCard}
                onDelete={deleteSimCard}
                loading={simCardsLoading}
              />
            </div>
          )}

          {activeTab === 'racks' && (
            <RackManagement 
              racks={racks} 
              onAddRack={addRack} 
              setRacks={setRacks}
              onUpdate={updateRack}
              onDelete={deleteRack}
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
    </div>
  );
}
