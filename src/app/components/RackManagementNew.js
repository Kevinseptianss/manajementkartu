"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiArchive, FiPlus, FiTrash2, FiPackage, FiBox, FiSearch, FiX, FiEdit2, FiMapPin } from 'react-icons/fi';
import { useRacks, useBoxBesar, useBoxKecil } from '../../hooks/useFirebase';

export default function RackManagement({ simCards }) {
  const [activeSection, setActiveSection] = useState('rakKartu');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use separate hooks for each entity
  const { 
    racks, 
    addRack, 
    updateRack, 
    deleteRack, 
    loading: racksLoading 
  } = useRacks();
  
  const { 
    boxBesar, 
    addBoxBesar, 
    updateBoxBesar, 
    deleteBoxBesar, 
    loading: boxBesarLoading 
  } = useBoxBesar();
  
  const { 
    boxKecil, 
    addBoxKecil, 
    updateBoxKecil, 
    deleteBoxKecil, 
    loading: boxKecilLoading 
  } = useBoxKecil();
  
  const [formData, setFormData] = useState({
    namaRak: '',
    deskripsi: '',
    lokasi: ''
  });

  const [boxBesarForm, setBoxBesarForm] = useState({
    namaBox: '',
    deskripsi: '',
    rakId: ''
  });

  const [boxKecilForm, setBoxKecilForm] = useState({
    namaBoxKecil: '',
    deskripsi: '',
    boxBesarId: '',
    rakId: ''
  });

  const sections = [
    { id: 'rakKartu', label: 'Rak Kartu', icon: FiArchive },
    { id: 'boxBesar', label: 'Box Besar', icon: FiPackage },
    { id: 'boxKecil', label: 'Box Kecil', icon: FiBox }
  ];

  const generateQRCode = (phoneNumbers, boxInfo = null) => {
    let qrData;
    
    if (typeof phoneNumbers === 'string') {
      qrData = phoneNumbers;
    } else {
      qrData = JSON.stringify({
        type: "sim_card_rack",
        box: boxInfo?.name || "Unknown Box",
        count: Array.isArray(phoneNumbers) ? phoneNumbers.length : 1,
        numbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers],
        timestamp: new Date().toISOString()
      });
    }
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'rakKartu') {
        await addRack({
          namaRak: formData.namaRak,
          deskripsi: formData.deskripsi,
          lokasi: formData.lokasi
        });
        setFormData({ namaRak: '', deskripsi: '', lokasi: '' });
        
      } else if (modalType === 'boxBesar') {
        await addBoxBesar({
          namaBox: boxBesarForm.namaBox,
          deskripsi: boxBesarForm.deskripsi,
          rakId: boxBesarForm.rakId
        });
        setBoxBesarForm({ namaBox: '', deskripsi: '', rakId: '' });
        
      } else if (modalType === 'boxKecil') {
        await addBoxKecil({
          namaBoxKecil: boxKecilForm.namaBoxKecil,
          deskripsi: boxKecilForm.deskripsi,
          boxBesarId: boxKecilForm.boxBesarId,
          rakId: boxKecilForm.rakId
        });
        setBoxKecilForm({ namaBoxKecil: '', deskripsi: '', boxBesarId: '', rakId: '' });
      }
      
      setShowModal(false);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'boxBesar') {
      setBoxBesarForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'boxKecil') {
      setBoxKecilForm(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getBoxBesarForRak = (rakId) => {
    return boxBesar.filter(box => box.rakId === rakId);
  };

  const getBoxKecilForBoxBesar = (boxBesarId) => {
    return boxKecil.filter(box => box.boxBesarId === boxBesarId);
  };

  const getSimCardsInBox = (boxKecilId) => {
    return simCards.filter(card => card.boxKecilId === boxKecilId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'rakKartu':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Rak Kartu</h3>
              <button
                onClick={() => openModal('rakKartu')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Tambah Rak
              </button>
            </div>
            
            {racksLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {racks.map((rack) => {
                  const rakBoxBesar = getBoxBesarForRak(rack.id);
                  const totalBoxKecil = rakBoxBesar.reduce((total, bb) => 
                    total + getBoxKecilForBoxBesar(bb.id).length, 0
                  );
                  
                  return (
                    <div key={rack.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{rack.namaRak}</h4>
                        <button
                          onClick={() => deleteRack(rack.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><FiMapPin className="inline w-4 h-4 mr-1" />{rack.lokasi}</p>
                        <p><strong>Deskripsi:</strong> {rack.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Box Besar:</strong> {rakBoxBesar.length}</p>
                        <p><strong>Box Kecil:</strong> {totalBoxKecil}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'boxBesar':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Box Besar</h3>
              <button
                onClick={() => openModal('boxBesar')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Tambah Box Besar
              </button>
            </div>
            
            {boxBesarLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxBesar.map((box) => {
                  const associatedRak = racks.find(r => r.id === box.rakId);
                  const boxKecilList = getBoxKecilForBoxBesar(box.id);
                  
                  return (
                    <div key={box.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{box.namaBox}</h4>
                        <button
                          onClick={() => deleteBoxBesar(box.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Rak:</strong> {associatedRak?.namaRak || 'Tidak ada rak'}</p>
                        <p><strong>Deskripsi:</strong> {box.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Box Kecil:</strong> {boxKecilList.length}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'boxKecil':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Box Kecil</h3>
              <button
                onClick={() => openModal('boxKecil')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Tambah Box Kecil
              </button>
            </div>
            
            {boxKecilLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxKecil.map((box) => {
                  const associatedBoxBesar = boxBesar.find(bb => bb.id === box.boxBesarId);
                  const associatedRak = racks.find(r => r.id === box.rakId);
                  const simCardsInBox = getSimCardsInBox(box.id);
                  
                  return (
                    <div key={box.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{box.namaBoxKecil}</h4>
                        <button
                          onClick={() => deleteBoxKecil(box.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Box Besar:</strong> {associatedBoxBesar?.namaBox || 'Tidak ada box besar'}</p>
                        <p><strong>Rak:</strong> {associatedRak?.namaRak || 'Tidak ada rak'}</p>
                        <p><strong>Deskripsi:</strong> {box.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Kartu SIM:</strong> {simCardsInBox.length}</p>
                      </div>

                      {simCardsInBox.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-2">
                            QR Code untuk {simCardsInBox.length} kartu:
                          </div>
                          <div className="relative group">
                            <Image
                              src={generateQRCode(
                                simCardsInBox.map(card => card.nomor), 
                                { name: box.namaBoxKecil }
                              )}
                              alt="QR Code"
                              width={120}
                              height={120}
                              className="w-30 h-30 object-contain border border-gray-200 rounded hover:border-blue-400 transition-colors"
                              title={`QR Code berisi: ${simCardsInBox.map(card => card.nomor).join(', ')}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rak Kartu Section */}
      {activeSection === 'rakKartu' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manajemen Rak Kartu</h2>
            <button
              onClick={() => openModal('rakKartu')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Tambah Rak Kartu
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {racks.map((rak) => {
              const totalBoxBesar = rak.boxBesar?.length || 0;
              const totalBoxKecil = rak.boxBesar?.reduce((total, box) => total + (box.boxKecil?.length || 0), 0) || 0;
              const totalKartu = simCards.filter(card => card.rakLocation?.includes(rak.namaRak)).length;

              return (
                <div key={rak.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{rak.namaRak}</h3>
                    <button
                      onClick={() => deleteRack(rak.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Lokasi:</span>
                      <span className="font-medium">{rak.lokasi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Box Besar:</span>
                      <span className="font-medium">{totalBoxBesar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Box Kecil:</span>
                      <span className="font-medium">{totalBoxKecil}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Kartu:</span>
                      <span className="font-medium text-blue-600">{totalKartu}</span>
                    </div>
                  </div>

                  {rak.deskripsi && (
                    <p className="text-sm text-gray-500 mt-3">{rak.deskripsi}</p>
                  )}
                </div>
              );
            })}
            
            {racks.length === 0 && (
              <div className="col-span-full text-center py-8">
                <FiArchive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada Rak Kartu yang ditambahkan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Box Besar Section */}
      {activeSection === 'boxBesar' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manajemen Box Besar</h2>
            <button
              onClick={() => openModal('boxBesar')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Tambah Box Besar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {racks.map(rak => 
              rak.boxBesar?.map(boxBesar => (
                <div key={`${rak.id}-${boxBesar.id}`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{boxBesar.namaBox}</h3>
                      <p className="text-sm text-gray-500">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        {rak.namaRak}
                      </p>
                    </div>
                    <button className="text-red-600 hover:text-red-800">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Box Kecil:</span>
                      <span className="font-medium">{boxBesar.boxKecil?.length || 0}</span>
                    </div>
                  </div>

                  {boxBesar.deskripsi && (
                    <p className="text-sm text-gray-500 mt-3">{boxBesar.deskripsi}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Box Kecil Section */}
      {activeSection === 'boxKecil' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manajemen Box Kecil</h2>
            <button
              onClick={() => openModal('boxKecil')}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Tambah Box Kecil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {racks.map(rak => 
              rak.boxBesar?.map(boxBesar => 
                boxBesar.boxKecil?.map(boxKecil => {
                  const kartuCount = simCards.filter(card => 
                    card.boxKecilName === boxKecil.namaBoxKecil
                  ).length;

                  return (
                    <div key={`${rak.id}-${boxBesar.id}-${boxKecil.id}`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{boxKecil.namaBoxKecil}</h3>
                          <p className="text-sm text-gray-500">
                            <FiMapPin className="inline w-4 h-4 mr-1" />
                            {rak.namaRak} {'>'} {boxBesar.namaBox}
                          </p>
                        </div>
                        <button className="text-red-600 hover:text-red-800">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Terisi:</span>
                          <span className="font-medium text-blue-600">{kartuCount}</span>
                        </div>
                      </div>

                      {/* QR Code for Box Kecil */}
                      {kartuCount > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-gray-500 mb-2">
                            QR Code untuk {kartuCount} kartu:
                          </div>
                          <div className="relative group">
                            <Image
                              src={generateQRCode(
                                simCards
                                  .filter(card => card.boxKecilName === boxKecil.namaBoxKecil)
                                  .map(card => card.nomor),
                                { name: boxKecil.namaBoxKecil }
                              )}
                              alt="QR Code"
                              width={100}
                              height={100}
                              className="w-24 h-24 object-contain border border-gray-200 rounded hover:border-blue-400 transition-colors"
                            />
                          </div>
                        </div>
                      )}

                      {boxKecil.deskripsi && (
                        <p className="text-sm text-gray-500 mt-3">{boxKecil.deskripsi}</p>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah {modalType === 'rakKartu' ? 'Rak Kartu' : modalType === 'boxBesar' ? 'Box Besar' : 'Box Kecil'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {modalType === 'rakKartu' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Rak
                    </label>
                    <input
                      type="text"
                      name="namaRak"
                      value={formData.namaRak}
                      onChange={(e) => handleChange(e, 'rakKartu')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
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
                      onChange={(e) => handleChange(e, 'rakKartu')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={(e) => handleChange(e, 'rakKartu')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {modalType === 'boxBesar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Box Besar
                    </label>
                    <input
                      type="text"
                      name="namaBox"
                      value={boxBesarForm.namaBox}
                      onChange={(e) => handleChange(e, 'boxBesar')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={boxBesarForm.deskripsi}
                      onChange={(e) => handleChange(e, 'boxBesar')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {modalType === 'boxKecil' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Box Kecil
                    </label>
                    <input
                      type="text"
                      name="namaBoxKecil"
                      value={boxKecilForm.namaBoxKecil}
                      onChange={(e) => handleChange(e, 'boxKecil')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={boxKecilForm.deskripsi}
                      onChange={(e) => handleChange(e, 'boxKecil')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    modalType === 'rakKartu' ? 'bg-blue-600 hover:bg-blue-700' :
                    modalType === 'boxBesar' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
