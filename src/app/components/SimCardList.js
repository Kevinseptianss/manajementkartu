"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiTrash2, FiSave, FiX, FiList } from 'react-icons/fi';

export default function SimCardList({ cards, setCards }) {
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const startEdit = (card) => {
    setEditingCard(card.id);
    setEditFormData(card);
  };

  const saveEdit = () => {
    setCards(cards.map(card => 
      card.id === editingCard ? editFormData : card
    ));
    setEditingCard(null);
    setEditFormData({});
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
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiList className="w-5 h-5 mr-2" />
          Daftar Kartu SIM
        </h2>
      </div>
      
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
                Tenggang
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                        type="number"
                        name="masaTenggang"
                        value={editFormData.masaTenggang}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="lokasiRak"
                        value={editFormData.lokasiRak}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="active">Dapat Digunakan</option>
                        <option value="inactive">Tidak Aktif</option>
                        <option value="used">Sedang Digunakan</option>
                      </select>
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
                      {card.masaTenggang} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rak: {card.lokasiRak}<br/>
                      Box: {card.box}<br/>
                      Kotak: {card.kotak}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(card.status)}
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
        </table>
        
        {cards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada kartu SIM yang ditambahkan</p>
          </div>
        )}
      </div>
    </div>
  );
}
