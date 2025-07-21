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

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [simCards, setSimCards] = useState([]);
  const [racks, setRacks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addSimCard = (card) => {
    setSimCards([...simCards, { ...card, id: Date.now() }]);
  };

  const addRack = (rack) => {
    setRacks([...racks, { ...rack, id: Date.now() }]);
  };

  const addMachine = (machine) => {
    setMachines([...machines, { ...machine, id: Date.now() }]);
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">
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
                    : 'text-gray-700'
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
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-600 space-y-1">
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
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sistem Manajemen Kartu SIM dan Perangkat
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiUsers size={16} />
                <span>{getTotalWorkers()} Workers</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiSmartphone className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Kartu SIM</p>
                      <p className="text-2xl font-bold text-gray-900">{simCards.length}</p>
                      <p className="text-xs text-gray-500">
                        {simCards.filter(card => card.status === 'active').length} aktif
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiUsers className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Workers</p>
                      <p className="text-2xl font-bold text-gray-900">{getTotalWorkers()}</p>
                      <p className="text-xs text-gray-500">
                        Across {machines.length} machines
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiArchive className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Rak</p>
                      <p className="text-2xl font-bold text-gray-900">{racks.length}</p>
                      <p className="text-xs text-gray-500">
                        Storage management
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Rp {getTotalEarnings().toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: Rp {getTotalWorkers() > 0 ? Math.round(getTotalEarnings() / getTotalWorkers()).toLocaleString() : 0}/worker
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiMonitor className="w-5 h-5 mr-2" />
                    Status Mesin
                  </h3>
                  
                  {machines.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada mesin yang terdaftar</p>
                  ) : (
                    <div className="space-y-3">
                      {machines.map((machine) => {
                        const activePorts = machine.ports.filter(p => p.status === 'aktif').length;
                        const workersCount = machine.ports.filter(p => p.worker && p.worker.trim() !== '').length;
                        const earnings = machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0);
                        
                        return (
                          <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{machine.namaMesin}</p>
                              <p className="text-sm text-gray-600">{machine.lokasi}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {activePorts}/{machine.jumlahPort} ports
                              </p>
                              <p className="text-xs text-gray-600">
                                {workersCount} workers • Rp {earnings.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2" />
                    Top Workers
                  </h3>
                  
                  {getTotalWorkers() === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada worker yang terdaftar</p>
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
                                  <p className="font-medium text-gray-900">{worker.name}</p>
                                  <p className="text-sm text-gray-600">{worker.ports} ports</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  Rp {worker.totalEarnings.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">
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
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                    <p className="text-2xl font-bold text-gray-600">
                      {simCards.filter(card => card.status === 'inactive').length}
                    </p>
                    <p className="text-sm text-gray-800">Tidak Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simcards' && (
            <div>
              <SimCardForm onSubmit={addSimCard} />
              <SimCardList cards={simCards} setCards={setSimCards} />
            </div>
          )}

          {activeTab === 'racks' && (
            <RackManagement racks={racks} onAddRack={addRack} setRacks={setRacks} />
          )}

          {activeTab === 'machines' && (
            <MachineManagement machines={machines} onAddMachine={addMachine} setMachines={setMachines} />
          )}

          {activeTab === 'earnings' && (
            <EarningsReport machines={machines} simCards={simCards} />
          )}

          {activeTab === 'search' && (
            <SearchCard simCards={simCards} racks={racks} machines={machines} />
          )}
        </main>
      </div>
    </div>
  );
}
