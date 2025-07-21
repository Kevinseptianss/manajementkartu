"use client";

import { useState } from 'react';
import { FiMonitor, FiPlus, FiEdit2, FiTrash2, FiSettings, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function MachineManagement({ machines, onAddMachine, setMachines }) {
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = (e) => {
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

    const newMachine = {
      ...formData,
      ports,
      id: editingMachine || Date.now()
    };

    if (editingMachine) {
      setMachines(machines.map(machine => 
        machine.id === editingMachine ? newMachine : machine
      ));
      setEditingMachine(null);
    } else {
      onAddMachine(newMachine);
    }

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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const deleteMachine = (id) => {
    setMachines(machines.filter(machine => machine.id !== id));
  };

  const editMachine = (machine) => {
    setFormData(machine);
    setEditingMachine(machine.id);
    setShowForm(true);
  };

  const updatePort = (machineId, portId, updates) => {
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

  const getTotalPendapatan = (machine) => {
    return machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0);
  };

  const getTotalWorkers = (machine) => {
    return machine.ports.filter(port => port.worker && port.worker.trim() !== '').length;
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
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {showForm ? 'Tutup Form' : 'Tambah Mesin Baru'}
        </button>
      </div>

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
                  onClick={() => editMachine(machine)}
                  className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                  <FiEdit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => deleteMachine(machine.id)}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Hapus
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
                    className={`p-2 rounded text-xs text-center cursor-pointer ${getPortStatusColor(port.status)}`}
                    onClick={() => {
                      const boxKecil = prompt('Box Kecil:', port.boxKecil || '');
                      const perdanaNomor = prompt('Nomor Perdana:', port.perdanaNomor || '');
                      const worker = prompt('Worker:', port.worker || '');
                      const pendapatan = prompt('Pendapatan:', port.pendapatan || '0');
                      const status = prompt('Status (kosong/terisi/aktif/error):', port.status || 'kosong');
                      
                      if (boxKecil !== null) {
                        updatePort(machine.id, port.id, {
                          boxKecil,
                          perdanaNomor,
                          worker,
                          pendapatan: parseInt(pendapatan) || 0,
                          status
                        });
                      }
                    }}
                    title={`Port ${port.portNumber}\nStatus: ${port.status}\nBox: ${port.boxKecil}\nPerdana: ${port.perdanaNomor}\nWorker: ${port.worker}\nPendapatan: Rp ${port.pendapatan.toLocaleString()}`}
                  >
                    <div className="font-medium">{port.portNumber}</div>
                    <div className="text-xs">{port.status}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Klik pada port untuk mengedit detail
              </div>

              {/* Port Details Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Port</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Box Kecil</th>
                      <th className="px-2 py-1 text-left">Perdana</th>
                      <th className="px-2 py-1 text-left">Worker</th>
                      <th className="px-2 py-1 text-left">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machine.ports.filter(port => port.status !== 'kosong').map((port) => (
                      <tr key={port.id} className="border-t">
                        <td className="px-2 py-1">{port.portNumber}</td>
                        <td className="px-2 py-1">
                          <span className={`px-1 py-0.5 rounded text-xs ${getPortStatusColor(port.status)}`}>
                            {port.status}
                          </span>
                        </td>
                        <td className="px-2 py-1">{port.boxKecil}</td>
                        <td className="px-2 py-1">{port.perdanaNomor}</td>
                        <td className="px-2 py-1">{port.worker}</td>
                        <td className="px-2 py-1">Rp {port.pendapatan.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  );
}
