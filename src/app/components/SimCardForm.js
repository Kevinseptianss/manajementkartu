"use client";

import { useState } from 'react';
import { FiPlus, FiSearch, FiX, FiMapPin } from 'react-icons/fi';

export default function SimCardForm({ onSubmit, racks = [] }) {
  const [formData, setFormData] = useState({
    nomor: '',
    jenisKartu: '',
    masaAktif: '',
    masaTenggang: '',
    boxKecilId: '',
    boxKecilName: '',
    rakLocation: '', // Will show the full path: Rak > Box Besar > Box Kecil
    status: 'inactive',
    tanggalDigunakan: '',
    inputType: 'satuan',
    nomorMasal: '',
    jumlahMasal: '',
    nik: '',
    nomorKK: ''
  });

  const [showBoxKecilModal, setShowBoxKecilModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all Box Kecil from all racks
  const getAllBoxKecil = () => {
    const allBoxKecil = [];
    racks.forEach(rak => {
      rak.boxBesar?.forEach(boxBesar => {
        boxBesar.boxKecil?.forEach(boxKecil => {
          allBoxKecil.push({
            id: boxKecil.id || `${rak.id}-${boxBesar.id}-${boxKecil.namaBoxKecil}`,
            name: boxKecil.namaBoxKecil,
            rakName: rak.namaRak || rak.namaKartu,
            boxBesarName: boxBesar.namaBox,
            fullPath: `${rak.namaRak || rak.namaKartu} > ${boxBesar.namaBox} > ${boxKecil.namaBoxKecil}`,
            available: boxKecil.capacity ? (boxKecil.capacity - (boxKecil.usedSlots || 0)) : 'Unlimited'
          });
        });
      });
    });
    return allBoxKecil;
  };

  const filteredBoxKecil = getAllBoxKecil().filter(box =>
    box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.rakName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.boxBesarName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectBoxKecil = (boxKecil) => {
    setFormData({
      ...formData,
      boxKecilId: boxKecil.id,
      boxKecilName: boxKecil.name,
      rakLocation: boxKecil.fullPath
    });
    setShowBoxKecilModal(false);
    setSearchTerm('');
  };

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
      boxKecilId: '',
      boxKecilName: '',
      rakLocation: '',
      status: 'inactive',
      tanggalDigunakan: '',
      inputType: 'satuan',
      nomorMasal: '',
      jumlahMasal: '',
      nik: '',
      nomorKK: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi Penyimpanan
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.rakLocation || 'Belum dipilih'}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              placeholder="Pilih Box Kecil terlebih dahulu"
            />
            <button
              type="button"
              onClick={() => setShowBoxKecilModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiSearch className="w-4 h-4 mr-2" />
              Pilih Box Kecil
            </button>
          </div>
          {formData.boxKecilName && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center text-green-800">
                <FiMapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  <strong>Terpilih:</strong> {formData.boxKecilName}
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formData.rakLocation}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIK (Nomor Induk Kependudukan)
          </label>
          <input
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="16 digit NIK"
            maxLength="16"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor KK (Kartu Keluarga)
          </label>
          <input
            type="text"
            name="nomorKK"
            value={formData.nomorKK}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="16 digit nomor KK"
            maxLength="16"
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
            disabled={!formData.boxKecilId}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {formData.inputType === 'masal' ? 'Tambah Kartu SIM Masal' : 'Tambah Kartu SIM'}
          </button>
          {!formData.boxKecilId && (
            <p className="text-sm text-red-600 mt-1 text-center">
              Pilih Box Kecil terlebih dahulu
            </p>
          )}
        </div>
      </form>

      {/* Box Kecil Selection Modal */}
      {showBoxKecilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pilih Box Kecil</h3>
              <button
                onClick={() => setShowBoxKecilModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Box Kecil, Rak, atau Box Besar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Box Kecil List */}
            <div className="overflow-y-auto max-h-96">
              {filteredBoxKecil.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Tidak ada Box Kecil yang cocok dengan pencarian' : 'Belum ada Box Kecil yang tersedia'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tambahkan Box Kecil di menu Rak Kartu terlebih dahulu
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredBoxKecil.map((boxKecil) => (
                    <div
                      key={boxKecil.id}
                      onClick={() => selectBoxKecil(boxKecil)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{boxKecil.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <FiMapPin className="inline w-4 h-4 mr-1" />
                            {boxKecil.fullPath}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Kapasitas tersedia: {boxKecil.available}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
