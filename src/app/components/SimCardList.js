"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiTrash2, FiSave, FiX, FiList, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { SkeletonTable } from './SkeletonLoader';

export default function SimCardList({ 
  cards, 
  setCards, 
  onUpdate, 
  onDelete, 
  loading = false,
  boxKecil = [],
  boxBesar = [], 
  racks = [],
  machines = []
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterBox, setFilterBox] = useState('');

  // Helper function to get rack location from hierarchy
  const getRackLocation = (card) => {
    if (!card.boxKecilId) return card.lokasiRak || 'Tidak ada lokasi';
    
    // Find Box Kecil
    const boxKecilItem = boxKecil.find(bk => bk.id === card.boxKecilId);
    if (!boxKecilItem) return card.lokasiRak || 'Tidak ada lokasi';
    
    // Find Box Besar
    const boxBesarItem = boxBesar.find(bb => bb.id === boxKecilItem.boxBesarId);
    if (!boxBesarItem) return card.lokasiRak || 'Tidak ada lokasi';
    
    // Find Rak
    const rackItem = racks.find(r => r.id === boxKecilItem.rakId || r.id === boxBesarItem.rakId);
    if (!rackItem) return card.lokasiRak || 'Tidak ada lokasi';
    
    return `${rackItem.namaRak || rackItem.namaKartu} - ${rackItem.lokasi}`;
  };

  // Helper function to get the box path
  const getBoxPath = (card) => {
    if (!card.boxKecilId) return { boxBesar: card.box || 'Tidak ada', boxKecil: card.kotak || 'Tidak ada' };
    
    // Find Box Kecil
    const boxKecilItem = boxKecil.find(bk => bk.id === card.boxKecilId);
    if (!boxKecilItem) return { boxBesar: card.box || 'Tidak ada', boxKecil: card.kotak || 'Tidak ada' };
    
    // Find Box Besar
    const boxBesarItem = boxBesar.find(bb => bb.id === boxKecilItem.boxBesarId);
    
    return {
      boxBesar: boxBesarItem ? boxBesarItem.namaBox : (card.box || 'Tidak ada'),
      boxKecil: boxKecilItem.namaBoxKecil || (card.kotak || 'Tidak ada')
    };
  };

  // Helper function to determine status based on machine usage
  const getCardStatus = (card) => {
    // Check if this phone number is being used in any machine
    const isUsedInMachine = machines.some(machine => 
      machine.simCards && machine.simCards.some(sim => sim.nomorHp === card.nomorHp)
    );
    
    if (isUsedInMachine) {
      return 'used'; // sedang digunakan
    }
    
    // If not in machine, check the original status or default to active
    return card.status === 'inactive' ? 'inactive' : 'active'; // dapat digunakan
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort cards based on current sort configuration
  const sortedCards = [...cards].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle special sorting cases
    if (sortConfig.key === 'status') {
      aValue = getCardStatus(a);
      bValue = getCardStatus(b);
    } else if (sortConfig.key === 'masaAktif' || sortConfig.key === 'tanggalDigunakan') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    } else if (sortConfig.key === 'daysUntilExpiry') {
      const today = new Date();
      aValue = a.masaAktif ? Math.ceil((new Date(a.masaAktif) - today) / (1000 * 60 * 60 * 24)) : -999;
      bValue = b.masaAktif ? Math.ceil((new Date(b.masaAktif) - today) / (1000 * 60 * 60 * 24)) : -999;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter cards based on box filter
  const filteredCards = sortedCards.filter(card => {
    if (!filterBox) return true;
    const boxName = card.boxKecilName || '';
    return boxName.toLowerCase().includes(filterBox.toLowerCase());
  });

  const deleteCard = async (id) => {
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        setCards(cards.filter(card => card.id !== id));
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Error deleting card: ' + error.message);
    }
  };

  const startEdit = (card) => {
    setEditingCard(card.id);
    setEditFormData(card);
  };

  const saveEdit = async () => {
    try {
      if (onUpdate) {
        await onUpdate(editingCard, editFormData);
      } else {
        setCards(cards.map(card => 
          card.id === editingCard ? editFormData : card
        ));
      }
      setEditingCard(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Error updating card: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      used: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      active: 'Dapat Digunakan',
      inactive: 'Tidak Aktif',
      used: 'Sedang Digunakan'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const generateQRCode = (nomor) => {
    // Simple QR code placeholder - in real app, use QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(nomor)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiList className="w-5 h-5 mr-2" />
            Daftar Kartu SIM
          </h2>
          
          {/* Filter by Box */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter Box:</label>
              <input
                type="text"
                placeholder="Cari nama box..."
                value={filterBox}
                onChange={(e) => setFilterBox(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredCards.length} dari {cards.length} kartu
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nomor')}
              >
                <div className="flex items-center">
                  Nomor
                  {sortConfig.key === 'nomor' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('jenisKartu')}
              >
                <div className="flex items-center">
                  Jenis Kartu
                  {sortConfig.key === 'jenisKartu' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('masaAktif')}
              >
                <div className="flex items-center">
                  Masa Aktif
                  {sortConfig.key === 'masaAktif' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tanggalDigunakan')}
              >
                <div className="flex items-center">
                  Tanggal Digunakan
                  {sortConfig.key === 'tanggalDigunakan' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Kembali
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('daysUntilExpiry')}
              >
                <div className="flex items-center">
                  Sisa Hari
                  {sortConfig.key === 'daysUntilExpiry' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('boxKecilName')}
              >
                <div className="flex items-center">
                  Box Lokasi
                  {sortConfig.key === 'boxKecilName' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === 'status' && (
                    sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1 w-3 h-3" /> : <FiArrowDown className="ml-1 w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIK
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor KK
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCards.map((card) => {
              const currentStatus = getCardStatus(card);
              const today = new Date();
              const daysUntilExpiry = card.masaAktif ? Math.ceil((new Date(card.masaAktif) - today) / (1000 * 60 * 60 * 24)) : null;
              
              return (
              <tr key={card.id} className={daysUntilExpiry !== null && daysUntilExpiry <= 7 ? 'bg-red-50' : ''}>
                {editingCard === card.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="nomor"
                        value={editFormData.nomor}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        name="jenisKartu"
                        value={editFormData.jenisKartu}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="Telkomsel">Telkomsel</option>
                        <option value="Indosat">Indosat</option>
                        <option value="XL">XL</option>
                        <option value="3">3</option>
                        <option value="Smartfren">Smartfren</option>
                        <option value="Axis">Axis</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        name="masaAktif"
                        value={editFormData.masaAktif}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        name="tanggalDigunakan"
                        value={editFormData.tanggalDigunakan || ''}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        name="tanggalDigunakanKembali"
                        value={editFormData.tanggalDigunakanKembali || ''}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        Sisa hari otomatis dihitung
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        Rak: {getRackLocation(cards.find(c => c.id === editingCard))}<br/>
                        Box: {getBoxPath(cards.find(c => c.id === editingCard)).boxBesar}<br/>
                        Kotak: {getBoxPath(cards.find(c => c.id === editingCard)).boxKecil}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        (Lokasi otomatis dari hierarchy)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {getStatusBadge(getCardStatus(cards.find(c => c.id === editingCard)))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        (Status otomatis berdasarkan penggunaan mesin)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="nik"
                        value={editFormData.nik || ''}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="16 digit NIK"
                        maxLength="16"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="nomorKK"
                        value={editFormData.nomorKK || ''}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="16 digit nomor KK"
                        maxLength="16"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Image
                        src={generateQRCode(editFormData.nomor)}
                        alt="QR Code"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-900 mr-2 flex items-center"
                      >
                        <FiSave className="w-4 h-4 mr-1" />
                        Simpan
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <FiX className="w-4 h-4 mr-1" />
                        Batal
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {card.nomor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.jenisKartu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.masaAktif}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.tanggalDigunakan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.tanggalDigunakanKembali || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daysUntilExpiry !== null ? (
                        <span className={daysUntilExpiry <= 7 ? 'text-red-600 font-bold' : daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'}>
                          {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} hari`}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">{card.boxKecilName || 'No Box'}</div>
                      <div className="text-xs text-gray-400">{getRackLocation(card)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(currentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.nik || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.nomorKK || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Image
                        src={generateQRCode(card.nomor)}
                        alt="QR Code"
                        width={48}
                        height={48}
                        className="rounded"
                        title={`QR Code untuk ${card.nomor}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(card)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 flex items-center"
                      >
                        <FiEdit2 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </button>
                    </td>
                  </>
                )}
              </tr>
              );
            })}
          </tbody>
          {cards.length === 0 && (
            <tbody>
              <tr>
                <td colSpan="11" className="text-center py-8">
                  <p className="text-gray-500">Belum ada kartu SIM yang ditambahkan</p>
                </td>
              </tr>
            </tbody>
          )}
        </table>
        </div>
      )}
    </div>
  );
}
