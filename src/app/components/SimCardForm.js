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
    status: 'inactive'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      nomor: '',
      jenisKartu: '',
      masaAktif: '',
      masaTenggang: '',
      lokasiRak: '',
      box: '',
      kotak: '',
      status: 'inactive'
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
            Tambah Kartu SIM
          </button>
        </div>
      </form>
    </div>
  );
}
