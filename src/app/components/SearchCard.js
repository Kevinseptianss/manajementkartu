"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function SearchCard({ simCards, racks, machines }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    let filteredCards = simCards;

    // Apply filters first
    if (filterType === 'needShooting') {
      filteredCards = simCards.filter(card => 
        card.status === 'inactive' || (card.masaTenggang && parseInt(card.masaTenggang) <= 7)
      );
    } else if (filterType === 'usableAfter90') {
      const today = new Date();
      filteredCards = simCards.filter(card => {
        if (!card.masaAktif) return false;
        const masaAktifDate = new Date(card.masaAktif);
        const diffTime = today - masaAktifDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 90 && card.status === 'active';
      });
    } else if (filterType === 'byBox') {
      // Group cards by box for easy searching
      const cardsByBox = {};
      filteredCards.forEach(card => {
        if (!cardsByBox[card.box]) {
          cardsByBox[card.box] = [];
        }
        cardsByBox[card.box].push(card);
      });
      
      if (!searchTerm.trim()) {
        // Show all boxes
        const boxResults = Object.keys(cardsByBox).map(boxName => ({
          type: 'box',
          data: {
            boxName,
            cards: cardsByBox[boxName],
            totalCards: cardsByBox[boxName].length,
            needShootingCards: cardsByBox[boxName].filter(card => 
              card.status === 'inactive' || (card.masaTenggang && parseInt(card.masaTenggang) <= 7)
            ).length
          },
          matchType: 'Box'
        }));
        setResults(boxResults);
        return;
      }
    }

    if (!searchTerm.trim() && filterType === 'all') {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    let searchResults = [];

    if (searchType === 'all' || searchType === 'simcard') {
      // Search in filtered SIM cards
      const cardResults = filteredCards.filter(card => 
        card.nomor.toLowerCase().includes(term) ||
        card.jenisKartu.toLowerCase().includes(term) ||
        card.lokasiRak.toLowerCase().includes(term) ||
        card.box.toLowerCase().includes(term) ||
        card.kotak.toLowerCase().includes(term)
      ).map(card => ({
        type: 'simcard',
        data: card,
        matchType: 'Kartu SIM'
      }));
      searchResults = [...searchResults, ...cardResults];
    }

    if (searchType === 'all' || searchType === 'rack') {
      // Search in racks
      const rackResults = racks.filter(rack =>
        rack.namaKartu.toLowerCase().includes(term) ||
        rack.lokasi.toLowerCase().includes(term) ||
        rack.boxBesar.some(box => 
          box.namaBox.toLowerCase().includes(term) ||
          box.boxKecil.some(kecil => 
            kecil.namaBoxKecil.toLowerCase().includes(term) ||
            kecil.perdana.some(perdana => perdana.nomor.includes(term))
          )
        )
      ).map(rack => ({
        type: 'rack',
        data: rack,
        matchType: 'Rak'
      }));
      searchResults = [...searchResults, ...rackResults];
    }

    if (searchType === 'all' || searchType === 'machine') {
      // Search in machines
      const machineResults = machines.filter(machine =>
        machine.namaMesin.toLowerCase().includes(term) ||
        machine.lokasi.toLowerCase().includes(term) ||
        machine.gmailAccount.toLowerCase().includes(term) ||
        machine.ports.some(port => 
          port.boxKecil.toLowerCase().includes(term) ||
          port.perdanaNomor.includes(term) ||
          port.worker.toLowerCase().includes(term)
        )
      ).map(machine => ({
        type: 'machine',
        data: machine,
        matchType: 'Mesin'
      }));
      searchResults = [...searchResults, ...machineResults];
    }

    setResults(searchResults);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      used: 'bg-yellow-100 text-yellow-800',
      kosong: 'bg-gray-100 text-gray-800',
      terisi: 'bg-blue-100 text-blue-800',
      aktif: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: 'Dapat Digunakan',
      inactive: 'Tidak Aktif',
      used: 'Sedang Digunakan',
      kosong: 'Kosong',
      terisi: 'Terisi',
      aktif: 'Aktif',
      error: 'Error'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const generateQRCode = (nomor) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(nomor)}`;
  };

  const renderSimCardResult = (card) => (
    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{card.nomor}</h4>
          <p className="text-sm text-gray-600">{card.jenisKartu}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(card.status)}
          <Image
            src={generateQRCode(card.nomor)}
            alt="QR Code"
            width={48}
            height={48}
            className="rounded"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><strong>Masa Aktif:</strong> {card.masaAktif}</p>
          <p><strong>Masa Tenggang:</strong> {card.masaTenggang} hari</p>
        </div>
        <div>
          <p><strong>Lokasi Rak:</strong> {card.lokasiRak}</p>
          <p><strong>Box:</strong> {card.box}</p>
          <p><strong>Kotak:</strong> {card.kotak}</p>
        </div>
      </div>
    </div>
  );

  const renderRackResult = (rack) => (
    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{rack.namaKartu}</h4>
          <p className="text-sm text-gray-600">Rak</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>Jumlah Kartu: {rack.jumlahKartu}</p>
          <p>Box Besar: {rack.boxBesar.length}</p>
        </div>
      </div>
      
      <div className="text-sm">
        <p><strong>Lokasi:</strong> {rack.lokasi}</p>
        
        {rack.boxBesar.length > 0 && (
          <div className="mt-3">
            <p className="font-medium text-gray-800 mb-2">Box Besar:</p>
            <div className="space-y-2">
              {rack.boxBesar.map((box) => (
                <div key={box.id} className="ml-4 p-2 bg-gray-50 rounded">
                  <p className="font-medium">{box.namaBox}</p>
                  <p className="text-xs text-gray-600">{box.boxKecil.length} box kecil</p>
                  {box.boxKecil.map((kecil) => (
                    <div key={kecil.id} className="ml-4 mt-1 text-xs">
                      <p>{kecil.namaBoxKecil} ({kecil.perdana.length} perdana)</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMachineResult = (machine) => {
    const activePorts = machine.ports.filter(p => p.status === 'aktif').length;
    const totalWorkers = machine.ports.filter(p => p.worker && p.worker.trim() !== '').length;
    const totalEarnings = machine.ports.reduce((total, port) => total + (port.pendapatan || 0), 0);

    return (
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{machine.namaMesin}</h4>
            <p className="text-sm text-gray-600">{machine.lokasi}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Port: {activePorts}/{machine.jumlahPort}</p>
            <p>Workers: {totalWorkers}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <p><strong>Gmail:</strong> {machine.gmailAccount}</p>
            <p><strong>Total Pendapatan:</strong> Rp {totalEarnings.toLocaleString()}</p>
          </div>
          <div>
            {machine.keterangan && (
              <p><strong>Keterangan:</strong> {machine.keterangan}</p>
            )}
          </div>
        </div>

        {/* Show matching ports */}
        {searchTerm && (
          <div>
            <p className="font-medium text-gray-800 mb-2">Port yang cocok dengan pencarian:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {machine.ports
                .filter(port => 
                  port.boxKecil.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  port.perdanaNomor.includes(searchTerm) ||
                  port.worker.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((port) => (
                  <div key={port.id} className="text-xs bg-gray-50 p-2 rounded">
                    <p className="font-medium">Port {port.portNumber}</p>
                    <p>{getStatusBadge(port.status)}</p>
                    {port.boxKecil && <p>Box: {port.boxKecil}</p>}
                    {port.perdanaNomor && <p>Perdana: {port.perdanaNomor}</p>}
                    {port.worker && <p>Worker: {port.worker}</p>}
                    {port.pendapatan > 0 && <p>Rp {port.pendapatan.toLocaleString()}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBoxResult = (boxData) => (
    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Box: {boxData.boxName}</h4>
          <p className="text-sm text-gray-600">Total kartu: {boxData.totalCards}</p>
        </div>
        <div className="text-right">
          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">
            {boxData.needShootingCards} perlu di tembak
          </span>
        </div>
      </div>
      
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Kartu yang perlu di tembak:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {boxData.cards.filter(card => 
            card.status === 'inactive' || (card.masaTenggang && parseInt(card.masaTenggang) <= 7)
          ).slice(0, 6).map((card, idx) => (
            <div key={idx} className="text-xs bg-red-50 p-2 rounded">
              <p className="font-medium">{card.nomor}</p>
              <p className="text-gray-600">{card.jenisKartu}</p>
              <p className="text-red-600">Status: {card.status}</p>
              {card.masaTenggang && parseInt(card.masaTenggang) <= 7 && (
                <p className="text-red-600">Tenggang: {card.masaTenggang} hari</p>
              )}
            </div>
          ))}
          {boxData.needShootingCards > 6 && (
            <div className="text-xs text-gray-500 col-span-2">
              ...dan {boxData.needShootingCards - 6} kartu lainnya
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FiSearch className="w-6 h-6 mr-2" />
          Cari Kartu & Data
        </h2>
        
        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Filter Options */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center">
              <FiFilter className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (e.target.value !== 'all') {
                  handleSearch();
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Data</option>
              <option value="needShooting">Kartu Perlu Di Tembak</option>
              <option value="usableAfter90">Kartu Dapat Digunakan (90+ Hari)</option>
              <option value="byBox">Pencarian Per Box</option>
            </select>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={
                  filterType === 'byBox' 
                    ? "Masukkan nama box untuk mencari kartu yang perlu di tembak..."
                    : "Masukkan nomor kartu, nama mesin, lokasi, worker, atau data lainnya..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={filterType === 'byBox'}
            >
              <option value="all">Semua</option>
              <option value="simcard">Kartu SIM</option>
              <option value="rack">Rak</option>
              <option value="machine">Mesin</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <FiSearch className="w-4 h-4 mr-2" />
              Cari
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Tips: Anda dapat mencari berdasarkan nomor kartu, jenis kartu, lokasi, nama box, nama mesin, worker, atau data lainnya.</p>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Hasil Pencarian untuk &quot;{searchTerm}&quot;
            </h3>
            <span className="text-sm text-gray-600">
              {results.length} hasil ditemukan
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">Tidak ada hasil yang ditemukan untuk pencarian &quot;{searchTerm}&quot;</p>
              <p className="text-sm text-gray-400 mt-2">
                Coba gunakan kata kunci yang berbeda atau periksa ejaan Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index}>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {result.matchType}
                    </span>
                  </div>
                  
                  {result.type === 'simcard' && renderSimCardResult(result.data)}
                  {result.type === 'rack' && renderRackResult(result.data)}
                  {result.type === 'machine' && renderMachineResult(result.data)}
                  {result.type === 'box' && renderBoxResult(result.data)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {!searchTerm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Cepat</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{simCards.length}</p>
              <p className="text-sm text-blue-800">Total Kartu SIM</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{racks.length}</p>
              <p className="text-sm text-yellow-800">Total Rak</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{machines.length}</p>
              <p className="text-sm text-purple-800">Total Mesin</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {simCards.filter(card => card.status === 'active').length}
              </p>
              <p className="text-sm text-green-800">Kartu Aktif</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
