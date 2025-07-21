"use client";

import { useState } from 'react';
import { FiDollarSign, FiUsers, FiMonitor, FiTrendingUp, FiBarChart } from 'react-icons/fi';

export default function EarningsReport({ machines, simCards }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedMachine, setSelectedMachine] = useState('all');

  const getTotalWorkers = () => {
    if (selectedMachine === 'all') {
      return machines.reduce((total, machine) => {
        return total + machine.ports.filter(port => port.worker && port.worker.trim() !== '').length;
      }, 0);
    } else {
      const machine = machines.find(m => m.id === selectedMachine);
      return machine ? machine.ports.filter(port => port.worker && port.worker.trim() !== '').length : 0;
    }
  };

  const getTotalEarnings = () => {
    if (selectedMachine === 'all') {
      return machines.reduce((total, machine) => {
        return total + machine.ports.reduce((machineTotal, port) => machineTotal + (port.pendapatan || 0), 0);
      }, 0);
    } else {
      const machine = machines.find(m => m.id === selectedMachine);
      return machine ? machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0) : 0;
    }
  };

  const getWorkerEarnings = () => {
    const workerData = {};
    
    const machinesToProcess = selectedMachine === 'all' 
      ? machines 
      : machines.filter(m => m.id === selectedMachine);

    machinesToProcess.forEach(machine => {
      machine.ports.forEach(port => {
        if (port.worker && port.worker.trim() !== '') {
          if (!workerData[port.worker]) {
            workerData[port.worker] = {
              name: port.worker,
              totalEarnings: 0,
              ports: 0,
              machines: new Set()
            };
          }
          workerData[port.worker].totalEarnings += port.pendapatan || 0;
          workerData[port.worker].ports += 1;
          workerData[port.worker].machines.add(machine.namaMesin);
        }
      });
    });

    return Object.values(workerData).map(worker => ({
      ...worker,
      machines: Array.from(worker.machines)
    }));
  };

  const getMachineEarnings = () => {
    return machines.map(machine => ({
      id: machine.id,
      name: machine.namaMesin,
      location: machine.lokasi,
      totalPorts: machine.jumlahPort,
      activePorts: machine.ports.filter(p => p.status === 'aktif').length,
      totalWorkers: machine.ports.filter(port => port.worker && port.worker.trim() !== '').length,
      totalEarnings: machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0),
      avgEarningsPerPort: machine.ports.length > 0 
        ? machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0) / machine.ports.length 
        : 0
    }));
  };

  const getTopWorkers = () => {
    return getWorkerEarnings()
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);
  };

  const getCardUsageStats = () => {
    const totalCards = simCards.length;
    const activeCards = simCards.filter(card => card.status === 'active').length;
    const usedCards = simCards.filter(card => card.status === 'used').length;
    const inactiveCards = simCards.filter(card => card.status === 'inactive').length;

    return {
      total: totalCards,
      active: activeCards,
      used: usedCards,
      inactive: inactiveCards,
      usageRate: totalCards > 0 ? ((usedCards / totalCards) * 100).toFixed(1) : 0
    };
  };

  const workerEarnings = getWorkerEarnings();
  const machineEarnings = getMachineEarnings();
  const topWorkers = getTopWorkers();
  const cardStats = getCardUsageStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiBarChart className="w-6 h-6 mr-2" />
          Laporan Pendapatan
        </h2>
        
        <div className="flex gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>

          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Mesin</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.namaMesin}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rp {getTotalEarnings().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workers</p>
              <p className="text-2xl font-semibold text-gray-900">{getTotalWorkers()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMonitor className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mesin</p>
              <p className="text-2xl font-semibold text-gray-900">
                {selectedMachine === 'all' ? machines.length : 1}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rata-rata per Worker</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rp {getTotalWorkers() > 0 ? Math.round(getTotalEarnings() / getTotalWorkers()).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Usage Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Penggunaan Kartu</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{cardStats.total}</p>
            <p className="text-sm text-gray-600">Total Kartu</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{cardStats.active}</p>
            <p className="text-sm text-gray-600">Kartu Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{cardStats.used}</p>
            <p className="text-sm text-gray-600">Sedang Digunakan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{cardStats.inactive}</p>
            <p className="text-sm text-gray-600">Tidak Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{cardStats.usageRate}%</p>
            <p className="text-sm text-gray-600">Tingkat Penggunaan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Workers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Workers</h3>
          
          {topWorkers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data worker</p>
          ) : (
            <div className="space-y-3">
              {topWorkers.map((worker, index) => (
                <div key={worker.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-600">
                        {worker.ports} port • {worker.machines.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp {worker.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rp {Math.round(worker.totalEarnings / worker.ports).toLocaleString()}/port
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Machine Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa Mesin</h3>
          
          {machineEarnings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data mesin</p>
          ) : (
            <div className="space-y-3">
              {machineEarnings
                .sort((a, b) => b.totalEarnings - a.totalEarnings)
                .map((machine) => (
                  <div key={machine.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{machine.name}</p>
                        <p className="text-sm text-gray-600">{machine.location}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        Rp {machine.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>Port: {machine.activePorts}/{machine.totalPorts}</div>
                      <div>Workers: {machine.totalWorkers}</div>
                      <div>Avg: Rp {Math.round(machine.avgEarningsPerPort).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Worker Report */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Detail Workers</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Port
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pendapatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata-rata per Port
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workerEarnings
                .sort((a, b) => b.totalEarnings - a.totalEarnings)
                .map((worker) => (
                  <tr key={worker.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {worker.ports}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {worker.machines.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {worker.totalEarnings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {Math.round(worker.totalEarnings / worker.ports).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {workerEarnings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada data workers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
