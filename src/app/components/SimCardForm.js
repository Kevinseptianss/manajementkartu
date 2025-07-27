"use client";

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function SimCardForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    nomor: '',
    jenisKartu: '',
    masaAktif: '',
    masaTenggang: '',
    lokasiRak: '',
    box: '',
    kotak: '',
    status: 'inactive',
    tanggalDigunakan: '',
    inputType: 'satuan',
    nomorMasal: '',
    jumlahMasal: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.inputType === 'masal') {
      // Generate multiple cards for bulk input
      const jumlah = parseInt(formData.jumlahMasal);
      const baseNumber = formData.nomorMasal;
      
      for (let i = 0; i < jumlah; i++) {
        const cardData = {
          ...formData,
          nomor: `${baseNumber}${String(i + 1).padStart(3, '0')}`, // Add sequential number
          id: Date.now() + i
        };
        delete cardData.inputType;
        delete cardData.nomorMasal;
        delete cardData.jumlahMasal;
        onSubmit(cardData);
      }
    } else {
      // Single card input
      const cardData = { ...formData };
      delete cardData.inputType;
      delete cardData.nomorMasal;
      delete cardData.jumlahMasal;
      onSubmit(cardData);
    }
    
    setFormData({
      nomor: '',
      jenisKartu: '',
      masaAktif: '',
      masaTenggang: '',
      lokasiRak: '',
      box: '',
      kotak: '',
      status: 'inactive',
      tanggalDigunakan: '',
      inputType: 'satuan',
      nomorMasal: '',
      jumlahMasal: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FiPlus className="w-5 h-5 mr-2" />
        Tambah Kartu SIM Baru
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Type Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Input
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="inputType"
                value="satuan"
                checked={formData.inputType === 'satuan'}
                onChange={handleChange}
                className="mr-2"
              />
              Input Satuan
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inputType"
                value="masal"
                checked={formData.inputType === 'masal'}
                onChange={handleChange}
                className="mr-2"
              />
              Input Masal
            </label>
          </div>
        </div>

        {/* Single Card Input */}
        {formData.inputType === 'satuan' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor
            </label>
            <input
              type="text"
              name="nomor"
              value={formData.nomor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Bulk Card Input */}
        {formData.inputType === 'masal' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Dasar (Masal)
              </label>
              <input
                type="text"
                name="nomorMasal"
                value={formData.nomorMasal}
                onChange={handleChange}
                placeholder="08123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nomor akan ditambahkan dengan angka urut (001, 002, dst.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Kartu
              </label>
              <input
                type="number"
                name="jumlahMasal"
                value={formData.jumlahMasal}
                onChange={handleChange}
                min="1"
                max="999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kartu
          </label>
          <select
            name="jenisKartu"
            value={formData.jenisKartu}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih Jenis Kartu</option>
            <option value="Telkomsel">Telkomsel</option>
            <option value="Indosat">Indosat</option>
            <option value="XL">XL</option>
            <option value="3">3</option>
            <option value="Smartfren">Smartfren</option>
            <option value="Axis">Axis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masa Aktif
          </label>
          <input
            type="date"
            name="masaAktif"
            value={formData.masaAktif}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masa Tenggang (Hari)
          </label>
          <input
            type="number"
            name="masaTenggang"
            value={formData.masaTenggang}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Digunakan
          </label>
          <input
            type="date"
            name="tanggalDigunakan"
            value={formData.tanggalDigunakan}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi Rak
          </label>
          <input
            type="text"
            name="lokasiRak"
            value={formData.lokasiRak}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Box
          </label>
          <input
            type="text"
            name="box"
            value={formData.box}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kotak
          </label>
          <input
            type="text"
            name="kotak"
            value={formData.kotak}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Dapat Digunakan</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="used">Sedang Digunakan</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {formData.inputType === 'masal' ? 'Tambah Kartu SIM Masal' : 'Tambah Kartu SIM'}
          </button>
        </div>
      </form>
    </div>
  );
}
