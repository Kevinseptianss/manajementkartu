"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiArchive, FiPlus, FiTrash2, FiPackage, FiBox, FiSearch, FiX, FiEdit2, FiMapPin } from 'react-icons/fi';
import { useRacks, useBoxBesar, useBoxKecil } from '../../hooks/useFirebase';

export default function RackManagement({ simCards }) {
  const [activeSection, setActiveSection] = useState('rakKartu');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Management modal for relationships
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageType, setManageType] = useState(''); // 'manageBoxBesar', 'manageBoxKecil'
  const [manageItem, setManageItem] = useState(null);
  
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
    boxBesarId: ''
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

  const openModal = (type, item = null) => {
    setModalType(type);
    setShowModal(true);
    if (item) {
      setEditMode(true);
      setEditingItem(item);
      // Pre-fill forms for editing
      if (type === 'rakKartu') {
        setFormData({
          namaRak: item.namaRak || '',
          deskripsi: item.deskripsi || '',
          lokasi: item.lokasi || ''
        });
      } else if (type === 'boxBesar') {
        setBoxBesarForm({
          namaBox: item.namaBox || '',
          deskripsi: item.deskripsi || '',
          rakId: item.rakId || ''
        });
      } else if (type === 'boxKecil') {
        setBoxKecilForm({
          namaBoxKecil: item.namaBoxKecil || '',
          deskripsi: item.deskripsi || '',
          boxBesarId: item.boxBesarId || ''
        });
      }
    } else {
      setEditMode(false);
      setEditingItem(null);
    }
  };

  const openManageModal = (type, item) => {
    setManageType(type);
    setManageItem(item);
    setShowManageModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'rakKartu') {
        if (editMode && editingItem) {
          await updateRack(editingItem.id, {
            namaRak: formData.namaRak,
            deskripsi: formData.deskripsi,
            lokasi: formData.lokasi
          });
        } else {
          await addRack({
            namaRak: formData.namaRak,
            deskripsi: formData.deskripsi,
            lokasi: formData.lokasi
          });
        }
        setFormData({ namaRak: '', deskripsi: '', lokasi: '' });
        
      } else if (modalType === 'boxBesar') {
        if (editMode && editingItem) {
          await updateBoxBesar(editingItem.id, {
            namaBox: boxBesarForm.namaBox,
            deskripsi: boxBesarForm.deskripsi,
            rakId: boxBesarForm.rakId
          });
        } else {
          await addBoxBesar({
            namaBox: boxBesarForm.namaBox,
            deskripsi: boxBesarForm.deskripsi,
            rakId: boxBesarForm.rakId
          });
        }
        setBoxBesarForm({ namaBox: '', deskripsi: '', rakId: '' });
        
      } else if (modalType === 'boxKecil') {
        // Find the selected Box Besar to get its rakId
        const selectedBoxBesar = boxBesar.find(bb => bb.id === boxKecilForm.boxBesarId);
        const derivedRakId = selectedBoxBesar ? selectedBoxBesar.rakId : null;
        
        if (editMode && editingItem) {
          await updateBoxKecil(editingItem.id, {
            namaBoxKecil: boxKecilForm.namaBoxKecil,
            deskripsi: boxKecilForm.deskripsi,
            boxBesarId: boxKecilForm.boxBesarId,
            rakId: derivedRakId
          });
        } else {
          await addBoxKecil({
            namaBoxKecil: boxKecilForm.namaBoxKecil,
            deskripsi: boxKecilForm.deskripsi,
            boxBesarId: boxKecilForm.boxBesarId,
            rakId: derivedRakId
          });
        }
        setBoxKecilForm({ namaBoxKecil: '', deskripsi: '', boxBesarId: '' });
      }
      
      setShowModal(false);
      setEditMode(false);
      setEditingItem(null);
      
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

  const handleRelationshipUpdate = async (itemId, entityType, fieldName, newValue) => {
    try {
      if (entityType === 'boxBesar' && fieldName === 'rakId') {
        await updateBoxBesar(itemId, { rakId: newValue });
      } else if (entityType === 'boxKecil' && fieldName === 'boxBesarId') {
        // When updating boxBesarId, also update rakId to match the selected Box Besar's rakId
        const selectedBoxBesar = boxBesar.find(bb => bb.id === newValue);
        const rakId = selectedBoxBesar ? selectedBoxBesar.rakId : null;
        await updateBoxKecil(itemId, { 
          boxBesarId: newValue, 
          rakId: rakId 
        });
      } else if (entityType === 'boxKecil' && fieldName === 'rakId') {
        await updateBoxKecil(itemId, { rakId: newValue });
      }
    } catch (error) {
      alert(`Error updating relationship: ${error.message}`);
    }
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openManageModal('manageBoxBesar', rack)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Manage Box Besar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('rakKartu', rack)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Rak"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRack(rack.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Rak"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><FiMapPin className="inline w-4 h-4 mr-1" />{rack.lokasi}</p>
                        <p><strong>Deskripsi:</strong> {rack.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Box Besar:</strong> {rakBoxBesar.length}</p>
                        <p><strong>Box Kecil:</strong> {totalBoxKecil}</p>
                      </div>

                      {/* Show Box Besar in this Rak */}
                      {rakBoxBesar.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-800 mb-2">Box Besar di Rak ini:</h5>
                          <div className="space-y-2">
                            {rakBoxBesar.map((bb) => (
                              <div key={bb.id} className="bg-green-50 p-2 rounded text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{bb.namaBox}</span>
                                  <span className="text-gray-500">
                                    {getBoxKecilForBoxBesar(bb.id).length} Box Kecil
                                  </span>
                                </div>
                              </div>
                            ))}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openManageModal('manageBoxKecil', box)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Manage Box Kecil"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('boxBesar', box)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Box Besar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBoxBesar(box.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Box Besar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Rak:</strong> {associatedRak?.namaRak || 'Tidak ada rak'}</p>
                        <p><strong>Deskripsi:</strong> {box.deskripsi || 'Tidak ada deskripsi'}</p>
                        <p><strong>Box Kecil:</strong> {boxKecilList.length}</p>
                      </div>

                      {/* Show Box Kecil in this Box Besar */}
                      {boxKecilList.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-800 mb-2">Box Kecil di Box Besar ini:</h5>
                          <div className="space-y-2">
                            {boxKecilList.map((bk) => (
                              <div key={bk.id} className="bg-yellow-50 p-2 rounded text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{bk.namaBoxKecil}</span>
                                  <span className="text-gray-500">
                                    {getSimCardsInBox(bk.id).length} SIM Cards
                                  </span>
                                </div>
                              </div>
                            ))}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('boxKecil', box)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Box Kecil"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBoxKecil(box.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Box Kecil"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {renderContent()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'rakKartu' && 'Tambah Rak Kartu'}
                {modalType === 'boxBesar' && 'Tambah Box Besar'}
                {modalType === 'boxKecil' && 'Tambah Box Kecil'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => handleChange(e)}
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
                      onChange={(e) => handleChange(e)}
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
                      onChange={(e) => handleChange(e)}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Rak
                    </label>
                    <select
                      name="rakId"
                      value={boxBesarForm.rakId}
                      onChange={(e) => handleChange(e, 'boxBesar')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Rak (Opsional)</option>
                      {racks.map(rack => (
                        <option key={rack.id} value={rack.id}>
                          {rack.namaRak} - {rack.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={boxBesarForm.deskripsi}
                      onChange={(e) => handleChange(e, 'boxBesar')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Box Besar
                    </label>
                    <select
                      name="boxBesarId"
                      value={boxKecilForm.boxBesarId}
                      onChange={(e) => handleChange(e, 'boxKecil')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Box Besar (Opsional)</option>
                      {boxBesar.map(box => {
                        const associatedRak = racks.find(r => r.id === box.rakId);
                        return (
                          <option key={box.id} value={box.id}>
                            {box.namaBox} {associatedRak && `(${associatedRak.namaRak})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {/* Show which Rak this will be associated with */}
                  {boxKecilForm.boxBesarId && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Info:</span> Box Kecil ini akan ditempatkan di{' '}
                        {(() => {
                          const selectedBoxBesar = boxBesar.find(bb => bb.id === boxKecilForm.boxBesarId);
                          const associatedRak = selectedBoxBesar ? racks.find(r => r.id === selectedBoxBesar.rakId) : null;
                          return associatedRak ? `Rak "${associatedRak.namaRak}"` : 'Box Besar yang belum memiliki Rak';
                        })()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={boxKecilForm.deskripsi}
                      onChange={(e) => handleChange(e, 'boxKecil')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Management Modal for Relationships */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {manageType === 'manageBoxBesar' 
                ? `Manage Box Besar in ${manageItem?.namaRak}` 
                : `Manage Box Kecil in ${manageItem?.namaBox}`}
            </h3>
            
            {manageType === 'manageBoxBesar' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Select Box Besar to assign/reassign to this Rak Kartu:
                </p>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {boxBesar.map((box) => {
                    const isAssigned = box.rakId === manageItem?.id;
                    return (
                      <div key={box.id} className={`p-3 border rounded-lg cursor-pointer ${
                        isAssigned 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{box.namaBox}</p>
                            <p className="text-sm text-gray-500">{box.deskripsi}</p>
                          </div>
                          <div className="flex space-x-2">
                            {isAssigned ? (
                              <button
                                onClick={() => handleRelationshipUpdate(box.id, 'boxBesar', 'rakId', null)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRelationshipUpdate(box.id, 'boxBesar', 'rakId', manageItem.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Assign
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {manageType === 'manageBoxKecil' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Select Box Kecil to assign/reassign to this Box Besar:
                </p>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {boxKecil.map((box) => {
                    const isAssigned = box.boxBesarId === manageItem?.id;
                    return (
                      <div key={box.id} className={`p-3 border rounded-lg cursor-pointer ${
                        isAssigned 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{box.namaBoxKecil}</p>
                            <p className="text-sm text-gray-500">{box.deskripsi}</p>
                          </div>
                          <div className="flex space-x-2">
                            {isAssigned ? (
                              <button
                                onClick={() => handleRelationshipUpdate(box.id, 'boxKecil', 'boxBesarId', null)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRelationshipUpdate(box.id, 'boxKecil', 'boxBesarId', manageItem.id)}
                                className="text-yellow-600 hover:text-yellow-800 text-sm"
                              >
                                Assign
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
