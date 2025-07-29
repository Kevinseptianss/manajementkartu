"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiTrash2, FiSave, FiX, FiList } from 'react-icons/fi';
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
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiList className="w-5 h-5 mr-2" />
          Daftar Kartu SIM
        </h2>
      </div>
      
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Kartu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Masa Aktif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Digunakan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenggang
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
            {cards.map((card) => (
              <tr key={card.id}>
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
                        type="number"
                        name="masaTenggang"
                        value={editFormData.masaTenggang}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
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
                      {card.masaTenggang} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rak: {getRackLocation(card)}<br/>
                      Box: {getBoxPath(card).boxBesar}<br/>
                      Kotak: {getBoxPath(card).boxKecil}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(getCardStatus(card))}
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
            ))}
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
