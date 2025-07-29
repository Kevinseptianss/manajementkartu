"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiArchive, FiPlus, FiTrash2, FiPackage, FiBox, FiSearch, FiX, FiEdit2 } from 'react-icons/fi';

export default function RackManagement({ racks, onAddRack, setRacks, simCards }) {
  const [activeSection, setActiveSection] = useState('rakKartu');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'rakKartu', 'boxBesar', 'boxKecil'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [formData, setFormData] = useState({
    namaRak: '',
    deskripsi: '',
    lokasi: '',
    selectedBoxBesar: []
  });

  const [boxBesarForm, setBoxBesarForm] = useState({
    namaBox: '',
    deskripsi: '',
    selectedBoxKecil: []
  });

  const [boxKecilForm, setBoxKecilForm] = useState({
    namaBoxKecil: '',
    kapasitas: '',
    deskripsi: ''
  });

  const sections = [
    { id: 'rakKartu', label: 'Rak Kartu', icon: FiArchive },
    { id: 'boxBesar', label: 'Box Besar', icon: FiPackage },
    { id: 'boxKecil', label: 'Box Kecil', icon: FiBox }
  ];

  // Get all Box Kecil across all racks
  const getAllBoxKecil = () => {
    const allBoxKecil = [];
    racks.forEach(rak => {
      rak.boxBesar?.forEach(boxBesar => {
        boxBesar.boxKecil?.forEach(boxKecil => {
          allBoxKecil.push({
            ...boxKecil,
            id: boxKecil.id || `${rak.id}-${boxBesar.id}-${boxKecil.namaBoxKecil}`,
            rakName: rak.namaRak,
            boxBesarName: boxBesar.namaBox,
            path: `${rak.namaRak} > ${boxBesar.namaBox}`
          });
        });
      });
    });
    return allBoxKecil;
  };

  // Get unassigned Box Kecil (not in any Box Besar)
  const getUnassignedBoxKecil = () => {
    const allBoxKecil = getAllBoxKecil();
    const assignedIds = new Set();
    
    racks.forEach(rak => {
      rak.boxBesar?.forEach(boxBesar => {
        boxBesar.boxKecil?.forEach(boxKecil => {
          assignedIds.add(boxKecil.id || boxKecil.namaBoxKecil);
        });
      });
    });

    return allBoxKecil.filter(box => !assignedIds.has(box.id));
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setSearchTerm('');
    setSelectedItems([]);
  };

  const handleSubmit = () => {
    if (modalType === 'rakKartu') {
      onAddRack({
        id: Date.now(),
        namaRak: formData.namaRak,
        deskripsi: formData.deskripsi,
        lokasi: formData.lokasi,
        boxBesar: formData.selectedBoxBesar,
        createdAt: new Date().toISOString()
      });
      setFormData({ namaRak: '', deskripsi: '', lokasi: '', selectedBoxBesar: [] });
    } else if (modalType === 'boxBesar') {
      // Add to standalone Box Besar or update existing racks
      const newBoxBesar = {
        id: Date.now(),
        namaBox: boxBesarForm.namaBox,
        deskripsi: boxBesarForm.deskripsi,
        boxKecil: boxBesarForm.selectedBoxKecil,
        createdAt: new Date().toISOString()
      };
      // This would need to be handled by parent component
      console.log('New Box Besar:', newBoxBesar);
      setBoxBesarForm({ namaBox: '', deskripsi: '', selectedBoxKecil: [] });
    } else if (modalType === 'boxKecil') {
      const newBoxKecil = {
        id: Date.now(),
        namaBoxKecil: boxKecilForm.namaBoxKecil,
        kapasitas: parseInt(boxKecilForm.kapasitas) || 0,
        deskripsi: boxKecilForm.deskripsi,
        usedSlots: 0,
        createdAt: new Date().toISOString()
      };
      // This would need to be handled by parent component
      console.log('New Box Kecil:', newBoxKecil);
      setBoxKecilForm({ namaBoxKecil: '', kapasitas: '', deskripsi: '' });
    }
    
    setShowModal(false);
  };
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addBoxBesar = () => {
    if (boxForm.namaBox) {
      // Check if box name already exists in SIM cards
      const existingBoxes = simCards.map(card => card.box.toLowerCase());
      if (existingBoxes.includes(boxForm.namaBox.toLowerCase())) {
        alert('Nama box sudah digunakan di kartu SIM. Pilih nama yang berbeda.');
        return;
      }
      
      setFormData({
        ...formData,
        boxBesar: [...formData.boxBesar, { ...boxForm, id: Date.now() }]
      });
      setBoxForm({ namaBox: '', boxKecil: [] });
    }
  };

  const addBoxKecil = () => {
    if (boxKecilForm.namaBoxKecil) {
      setBoxForm({
        ...boxForm,
        boxKecil: [...boxForm.boxKecil, { ...boxKecilForm, id: Date.now() }]
      });
      setBoxKecilForm({ namaBoxKecil: '', perdana: [] });
    }
  };

  const addPerdana = () => {
    const nomor = prompt('Masukkan nomor perdana:');
    if (nomor) {
      setBoxKecilForm({
        ...boxKecilForm,
        perdana: [...boxKecilForm.perdana, { nomor, id: Date.now() }]
      });
    }
  };

  const deleteRack = (id) => {
    setRacks(racks.filter(rack => rack.id !== id));
  };

  const generateQRCode = (phoneNumbers, boxInfo = null) => {
    // Create structured data for QR code that includes phone numbers and box information
    let qrData;
    
    if (typeof phoneNumbers === 'string') {
      // If it's already a string, use it directly
      qrData = phoneNumbers;
    } else {
      // If it's an array or other format, create structured JSON data
      qrData = JSON.stringify({
        type: "sim_card_rack",
        box: boxInfo?.name || "Unknown Box",
        count: Array.isArray(phoneNumbers) ? phoneNumbers.length : 1,
        numbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers],
        timestamp: new Date().toISOString()
      });
    }
    
    // QR code can handle much longer data than barcodes, perfect for multiple phone numbers
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiArchive className="w-6 h-6 mr-2" />
          Manajemen Rak Kartu
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {showForm ? 'Tutup Form' : 'Tambah Rak Baru'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Rak Baru</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kartu
                </label>
                <input
                  type="text"
                  name="namaKartu"
                  value={formData.namaKartu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Kartu
                </label>
                <input
                  type="number"
                  name="jumlahKartu"
                  value={formData.jumlahKartu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
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
            </div>

            {/* Box Besar Management */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Manajemen Box Besar</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nama Box Besar"
                  value={boxForm.namaBox}
                  onChange={(e) => setBoxForm({...boxForm, namaBox: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addBoxBesar}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                >
                  Tambah Box Besar
                </button>
              </div>

              {/* Box Kecil Management */}
              {boxForm.namaBox && (
                <div className="ml-4 border-l-2 border-blue-200 pl-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Box Kecil untuk {boxForm.namaBox}</h5>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nama Box Kecil"
                      value={boxKecilForm.namaBoxKecil}
                      onChange={(e) => setBoxKecilForm({...boxKecilForm, namaBoxKecil: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addBoxKecil}
                      className="bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700"
                    >
                      Tambah Box Kecil
                    </button>
                  </div>

                  {/* Perdana Management */}
                  {boxKecilForm.namaBoxKecil && (
                    <div className="ml-4 border-l-2 border-green-200 pl-4">
                      <h6 className="text-sm font-medium text-gray-800 mb-2">Perdana untuk {boxKecilForm.namaBoxKecil}</h6>
                      <button
                        type="button"
                        onClick={addPerdana}
                        className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 mb-2"
                      >
                        Tambah Perdana
                      </button>
                      
                      {boxKecilForm.perdana.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {boxKecilForm.perdana.map((perdana) => (
                            <div key={perdana.id} className="text-xs bg-gray-100 p-2 rounded">
                              {perdana.nomor}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {boxForm.boxKecil.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Box Kecil yang sudah ditambahkan:</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {boxForm.boxKecil.map((box) => (
                          <div key={box.id} className="text-sm bg-yellow-100 p-2 rounded">
                            {box.namaBoxKecil} ({box.perdana.length} perdana)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.boxBesar.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Box Besar yang sudah ditambahkan:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {formData.boxBesar.map((box) => (
                      <div key={box.id} className="text-sm bg-green-100 p-3 rounded">
                        <strong>{box.namaBox}</strong> ({box.boxKecil.length} box kecil)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Simpan Rak
            </button>
          </form>
        </div>
      )}

      {/* Racks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {racks.map((rack) => (
          <div key={rack.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{rack.namaKartu}</h3>
                <button
                  onClick={() => deleteRack(rack.id)}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Jumlah Kartu:</strong> {rack.jumlahKartu}</p>
              <p><strong>Lokasi:</strong> {rack.lokasi}</p>
              <p><strong>Box Besar:</strong> {rack.boxBesar.length}</p>
            </div>

            {rack.boxBesar.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Box Besar:</h4>
                <div className="space-y-2">
                  {rack.boxBesar.map((boxBesar) => (
                    <div key={boxBesar.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-sm">{boxBesar.namaBox}</p>
                      <p className="text-xs text-gray-600">{boxBesar.boxKecil.length} box kecil</p>
                      
                      {boxBesar.boxKecil.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {boxBesar.boxKecil.map((boxKecil) => (
                            <div key={boxKecil.id} className="bg-white p-2 rounded text-xs">
                              <div className="flex justify-between items-center">
                                <span>{boxKecil.namaBoxKecil}</span>
                                <span className="text-gray-500">{boxKecil.perdana.length} perdana</span>
                              </div>
                              
                              {boxKecil.perdana.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-1">
                                    QR Code untuk {boxKecil.perdana.length} nomor:
                                  </div>
                                  <div className="relative group">
                                    <Image
                                      src={generateQRCode(
                                        boxKecil.perdana.map(p => p.nomor), 
                                        { name: boxKecil.namaBoxKecil }
                                      )}
                                      alt="QR Code"
                                      width={120}
                                      height={120}
                                      className="w-30 h-30 object-contain border border-gray-200 rounded hover:border-blue-400 transition-colors"
                                      title={`QR Code berisi: ${boxKecil.perdana.map(p => p.nomor).join(', ')}`}
                                    />
                                    
                                    {/* Tooltip showing QR content on hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                      <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 max-w-xs">
                                        <div className="font-medium mb-1">QR Code berisi:</div>
                                        <div className="space-y-1">
                                          {boxKecil.perdana.slice(0, 5).map((p, idx) => (
                                            <div key={idx}>• {p.nomor}</div>
                                          ))}
                                          {boxKecil.perdana.length > 5 && (
                                            <div className="text-gray-300">
                                              ... dan {boxKecil.perdana.length - 5} nomor lainnya
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-gray-400 mt-1 pt-1 border-t border-gray-700">
                                          Box: {boxKecil.namaBoxKecil}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Scan untuk melihat semua nomor • Hover untuk preview
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {racks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada rak yang ditambahkan</p>
        </div>
      )}
    </div>
  );