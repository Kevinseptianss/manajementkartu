"use client";

import { useState } from 'react';
import { FiPlus, FiSearch, FiX, FiMapPin, FiUpload, FiEdit, FiTrash2, FiDownload, FiAlertTriangle, FiLoader } from 'react-icons/fi';

export default function SimCardForm({ onSubmit, racks = [], racksLoading = false }) {
  // Debug log at component level
  console.log('🚀 SimCardForm props:', { onSubmit: !!onSubmit, racks, racksLoading });
  console.log('🚀 SimCardForm racks length:', racks?.length);
  
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
    tanggalDigunakanKembali: '', // New field
    inputType: 'satuan',
    nomorMasal: '',
    jumlahMasal: '',
    nik: '',
    nomorKK: ''
  });

  const [showBoxKecilModal, setShowBoxKecilModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // CSV upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRow, setEditingRow] = useState({});
  const [boxMappingModal, setBoxMappingModal] = useState(false);
  const [csvBoxIds, setCsvBoxIds] = useState([]);
  const [boxMapping, setBoxMapping] = useState({});

  // Get all Box Kecil from all racks - Enhanced version with better error handling
  const getAllBoxKecil = () => {
    console.log('🔍 Debug getAllBoxKecil - racks prop:', racks);
    console.log('🔍 Debug getAllBoxKecil - racks length:', racks?.length);
    console.log('🔍 Debug getAllBoxKecil - racks structure:', JSON.stringify(racks, null, 2));
    
    const allBoxKecil = [];
    
    if (!racks || racks.length === 0) {
      console.log('❌ No racks available');
      return allBoxKecil;
    }
    
    racks.forEach((rak, rakIndex) => {
      console.log(`🔍 Processing rak ${rakIndex}:`, rak);
      console.log(`🔍 Rak has boxBesar:`, rak.boxBesar);
      
      // Handle different possible structures
      let boxBesarArray = [];
      
      if (Array.isArray(rak.boxBesar)) {
        boxBesarArray = rak.boxBesar;
      } else if (rak.boxes && Array.isArray(rak.boxes)) {
        boxBesarArray = rak.boxes;
      } else if (rak.boxBesar && typeof rak.boxBesar === 'object') {
        // If boxBesar is an object, convert to array
        boxBesarArray = Object.values(rak.boxBesar);
      }
      
      console.log(`🔍 BoxBesarArray for rak ${rakIndex}:`, boxBesarArray);
      
      if (boxBesarArray.length === 0) {
        console.log(`❌ Rak ${rakIndex} has no boxBesar array`);
        return;
      }
      
      boxBesarArray.forEach((boxBesar, boxBesarIndex) => {
        console.log(`🔍 Processing boxBesar ${boxBesarIndex}:`, boxBesar);
        console.log(`🔍 BoxBesar has boxKecil:`, boxBesar.boxKecil);
        
        // Handle different possible structures for boxKecil
        let boxKecilArray = [];
        
        if (Array.isArray(boxBesar.boxKecil)) {
          boxKecilArray = boxBesar.boxKecil;
        } else if (boxBesar.boxes && Array.isArray(boxBesar.boxes)) {
          boxKecilArray = boxBesar.boxes;
        } else if (boxBesar.boxKecil && typeof boxBesar.boxKecil === 'object') {
          boxKecilArray = Object.values(boxBesar.boxKecil);
        }
        
        console.log(`🔍 BoxKecilArray for boxBesar ${boxBesarIndex}:`, boxKecilArray);
        
        if (boxKecilArray.length === 0) {
          console.log(`❌ BoxBesar ${boxBesarIndex} has no boxKecil array`);
          return;
        }
        
        boxKecilArray.forEach((boxKecil, boxKecilIndex) => {
          console.log(`🔍 Processing boxKecil ${boxKecilIndex}:`, boxKecil);
          
          const boxKecilData = {
            id: boxKecil.id || `${rak.id}-${boxBesar.id}-${boxKecil.namaBoxKecil || boxKecil.name}`,
            name: boxKecil.namaBoxKecil || boxKecil.name || `Box Kecil ${boxKecilIndex + 1}`,
            rakName: rak.namaRak || rak.namaKartu || rak.name || `Rak ${rakIndex + 1}`,
            boxBesarName: boxBesar.namaBox || boxBesar.name || `Box Besar ${boxBesarIndex + 1}`,
            fullPath: `${rak.namaRak || rak.namaKartu || rak.name || `Rak ${rakIndex + 1}`} > ${boxBesar.namaBox || boxBesar.name || `Box Besar ${boxBesarIndex + 1}`} > ${boxKecil.namaBoxKecil || boxKecil.name || `Box Kecil ${boxKecilIndex + 1}`}`,
            available: boxKecil.capacity ? (boxKecil.capacity - (boxKecil.usedSlots || 0)) : 'Unlimited'
          };
          
          console.log(`✅ Added boxKecil:`, boxKecilData);
          allBoxKecil.push(boxKecilData);
        });
      });
    });
    
    console.log('🔍 Final allBoxKecil result:', allBoxKecil);
    console.log('🔍 Total Box Kecil found:', allBoxKecil.length);
    
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

  // CSV handling functions
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            return {
              id: index,
              nomor: values[0] || `08123456${String(index + 1).padStart(3, '0')}`, // Use NO column as phone number
              idBox: values[1] || '', // ID BOX from CSV
              jenisKartu: 'Telkomsel', // Default value
              masaAktif: parseDate(values[2]) || '',
              tanggalTembak: parseDate(values[3]) || '',
              masaTenggang: '30', // Default value
              tanggalDigunakan: parseDate(values[4]) || '',
              tanggalDigunakanKembali: parseDate(values[5]) || '',
              jumlahKartu: values[6] || '1',
              count: values[7] || '',
              statusTembak: values[8] || '',
              status: values[8] === 'PERLU DITEMBAK' ? 'inactive' : 'active',
              statusGunakanKembali: values[9] || '',
              nik: generateNIK(),
              nomorKK: generateKK(),
              catatan: values[10] || '',
              boxKecilId: '', // Will be mapped later
              boxKecilName: '', // Will be mapped later
            };
          });
        
        setCsvData(data);
        
        // Extract unique box IDs from CSV
        const uniqueBoxIds = [...new Set(data.map(row => row.idBox).filter(id => id))];
        setCsvBoxIds(uniqueBoxIds);
        
        // Check if we need box mapping
        const availableBoxKecil = getAllBoxKecil();
        const needsMapping = uniqueBoxIds.some(csvBoxId => 
          !availableBoxKecil.find(box => box.id === csvBoxId || box.name === csvBoxId)
        );
        
        if (needsMapping && uniqueBoxIds.length > 0) {
          setBoxMappingModal(true);
        } else {
          // Auto-map if possible
          const autoMapping = {};
          uniqueBoxIds.forEach(csvBoxId => {
            const matchedBox = availableBoxKecil.find(box => 
              box.id === csvBoxId || box.name === csvBoxId
            );
            if (matchedBox) {
              autoMapping[csvBoxId] = matchedBox.id;
            }
          });
          setBoxMapping(autoMapping);
          setTimeout(() => setShowCsvPreview(true), 500);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    // Parse date from "13/Mar/2025" format to "2025-03-13"
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]] || '01';
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const generateNIK = () => {
    return Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
  };

  const generateKK = () => {
    return Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
  };

  const downloadSampleCsv = () => {
    const sampleData = `NO,ID BOX,TANGGAL MASA AKTIF,TANGGAL TEMBAK,TANGGAL DIGUNAKAN,TANGGAL DIGUNAKAN KEMBALI,JUMLAH KARTU,COUNT,STATUS TEMBAK,STATUS GUNAKAN KEMBALI,CATATAN
08123456001,1A,13/Mar/2025,22/Apr/2025,22/Jan/2025,22/Apr/2025,100,(137 hari),PERLU DITEMBAK,SIAP GUNAKAN,
08123456002,1B,10/Mar/2025,19/Apr/2025,21/Jan/2025,21/Apr/2025,100,(140 hari),PERLU DITEMBAK,SIAP GUNAKAN,
08123456003,1C,12/Mar/2025,21/Apr/2025,19/Jan/2025,19/Apr/2025,100,(138 hari),PERLU DITEMBAK,SIAP GUNAKAN,`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contoh_format.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyBoxMapping = () => {
    const updatedData = csvData.map(row => {
      const mappedBoxId = boxMapping[row.idBox];
      const boxKecil = getAllBoxKecil().find(box => box.id === mappedBoxId);
      
      return {
        ...row,
        boxKecilId: mappedBoxId || '',
        boxKecilName: boxKecil?.name || '',
        rakLocation: boxKecil?.fullPath || ''
      };
    });
    
    setCsvData(updatedData);
    setBoxMappingModal(false);
    setShowCsvPreview(true);
  };

  const setAllSameBox = (boxKecilId) => {
    const selectedBox = getAllBoxKecil().find(box => box.id === boxKecilId);
    if (selectedBox) {
      const newMapping = {};
      csvBoxIds.forEach(csvBoxId => {
        newMapping[csvBoxId] = boxKecilId;
      });
      setBoxMapping(newMapping);
    }
  };

  const editCsvRow = (index) => {
    setEditingRowIndex(index);
    setEditingRow({ ...csvData[index] });
  };

  const saveCsvRowEdit = () => {
    const updatedData = [...csvData];
    updatedData[editingRowIndex] = editingRow;
    setCsvData(updatedData);
    setEditingRowIndex(null);
    setEditingRow({});
  };

  const deleteCsvRow = (index) => {
    const updatedData = csvData.filter((_, i) => i !== index);
    setCsvData(updatedData);
  };

  const uploadCsvData = () => {
    // Check if all rows have box mapping
    const unmappedRows = csvData.filter(row => !row.boxKecilId);
    if (unmappedRows.length > 0) {
      alert(`${unmappedRows.length} rows don't have Box Kecil mapping. Please map all boxes first.`);
      return;
    }

    csvData.forEach((row, index) => {
      const cardData = {
        nomor: row.nomor,
        jenisKartu: row.jenisKartu,
        masaAktif: row.masaAktif,
        masaTenggang: row.masaTenggang,
        tanggalDigunakan: row.tanggalDigunakan,
        status: row.status,
        nik: row.nik,
        nomorKK: row.nomorKK,
        boxKecilId: row.boxKecilId,
        boxKecilName: row.boxKecilName,
        rakLocation: row.rakLocation,
        id: Date.now() + index
      };
      onSubmit(cardData);
    });

    // Reset form
    setCsvFile(null);
    setCsvData([]);
    setShowCsvPreview(false);
    setBoxMapping({});
    setCsvBoxIds([]);
    alert(`Successfully uploaded ${csvData.length} SIM cards!`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.inputType === 'masal') {
      // For CSV upload, the data is handled by uploadCsvData function
      if (csvData.length > 0) {
        uploadCsvData();
        return;
      }
      
      // Fallback to old bulk input if no CSV data
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
      tanggalDigunakanKembali: '',
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

        {/* Bulk Card Input - CSV Upload */}
        {formData.inputType === 'masal' && (
          <div className="md:col-span-2">
            {/* Check if racks are available */}
            {!racksLoading && racks.length === 0 && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center">
                  <FiAlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-800">No Racks Available</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      You need to create racks and boxes first before uploading SIM cards. 
                      Go to "Rak Kartu" tab to create your storage structure.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {racksLoading && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <FiLoader className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-sm text-blue-800">Loading racks data...</span>
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload CSV File
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      atau drag and drop file CSV di sini
                    </span>
                  </label>
                  <input
                    id="csv-upload"
                    name="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('csv-upload').click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiUpload className="w-4 h-4 mr-2" />
                    Pilih File CSV
                  </button>
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download Contoh Format
                  </button>
                </div>
                {csvFile && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      File selected: <strong>{csvFile.name}</strong>
                    </p>
                    <div className="text-xs text-green-600 space-y-1">
                      <div>📊 {csvData.length} rows detected</div>
                      {csvBoxIds.length > 0 && (
                        <div>📦 Box IDs found: {csvBoxIds.join(', ')}</div>
                      )}
                      {csvData.length > 0 && (
                        <div className="mt-2 p-2 bg-white border rounded">
                          <div className="font-medium text-gray-700 mb-1">Sample Data Preview:</div>
                          {csvData.slice(0, 3).map((row, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              Row {idx + 1}: {row.nomor} → Box {row.idBox} → Status: {row.status}
                            </div>
                          ))}
                          {csvData.length > 3 && (
                            <div className="text-xs text-gray-500">... and {csvData.length - 3} more rows</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
            Tanggal Digunakan Kembali
          </label>
          <input
            type="date"
            name="tanggalDigunakanKembali"
            value={formData.tanggalDigunakanKembali}
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
            disabled={
              (formData.inputType === 'satuan' && !formData.boxKecilId) || 
              (formData.inputType === 'masal' && csvData.length === 0)
            }
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {formData.inputType === 'masal' 
              ? (csvData.length > 0 ? `Upload ${csvData.length} Kartu SIM` : 'Upload CSV File') 
              : 'Tambah Kartu SIM'
            }
          </button>
          {formData.inputType === 'satuan' && !formData.boxKecilId && (
            <p className="text-sm text-red-600 mt-1 text-center">
              Pilih Box Kecil terlebih dahulu
            </p>
          )}
          {formData.inputType === 'masal' && csvData.length === 0 && (
            <p className="text-sm text-orange-600 mt-1 text-center">
              Upload file CSV terlebih dahulu
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

      {/* Box Mapping Modal */}
      {boxMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Map CSV Box IDs to Box Kecil
              </h3>
              <button
                onClick={() => setBoxMappingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Box ID Mapping Required:</strong> The CSV contains Box IDs that don't match your existing Box Kecil. 
                Please map each CSV Box ID to the correct Box Kecil where you want to store the SIM cards.
              </p>
            </div>

            {/* Quick Action: Select Same Box for All */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Action:</h4>
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => e.target.value && setAllSameBox(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Box Kecil for all...</option>
                  {(() => {
                    const availableBoxes = getAllBoxKecil();
                    console.log('Available boxes in quick action:', availableBoxes); // Debug log
                    return availableBoxes.length > 0 ? (
                      availableBoxes.map((box) => (
                        <option key={box.id} value={box.id}>
                          {box.fullPath} (Available: {box.available})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No Box Kecil available - Please create in Rack Management</option>
                    );
                  })()}
                </select>
                <span className="text-sm text-blue-600">Set same Box Kecil for all CSV entries</span>
              </div>
              
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-100 rounded">
                <div><strong>Debug Info:</strong></div>
                <div>Found {getAllBoxKecil().length} available Box Kecil from {racks.length} racks</div>
                <div>Racks loading: {racksLoading ? 'Yes' : 'No'}</div>
                {racks.length > 0 ? (
                  <div>Racks structure: {racks.map((r, i) => `Rak ${i+1}: ${r.namaRak || r.namaKartu || 'No name'} (${r.boxBesar?.length || 0} boxes)`).join(', ')}</div>
                ) : (
                  <div className="text-red-600">⚠️ No racks data available - Please check Rack Management</div>
                )}
                {racks.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-blue-600">Show full racks data</summary>
                    <pre className="text-xs mt-1 bg-white p-1 rounded overflow-auto max-h-32">
                      {JSON.stringify(racks, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            {/* Individual Mapping */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {csvBoxIds.map((csvBoxId) => {
                const relatedRows = csvData.filter(row => row.idBox === csvBoxId);
                const availableBoxes = getAllBoxKecil();
                
                return (
                  <div key={csvBoxId} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-lg">CSV Box ID: {csvBoxId}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Found in {relatedRows.length} rows
                        </div>
                        
                        {/* Show phone numbers for this Box ID */}
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="text-xs font-medium text-gray-700 mb-1">Phone Numbers:</div>
                          <div className="flex flex-wrap gap-1">
                            {relatedRows.slice(0, 8).map((row, idx) => (
                              <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono">
                                {row.nomor}
                              </span>
                            ))}
                            {relatedRows.length > 8 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{relatedRows.length - 8} more
                              </span>
                            )}
                          </div>
                          {relatedRows.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              Status: {relatedRows[0].status}, Jenis: {relatedRows[0].jenisKartu}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 ml-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Map to Box Kecil:
                        </label>
                        <select
                          value={boxMapping[csvBoxId] || ''}
                          onChange={(e) => setBoxMapping({
                            ...boxMapping,
                            [csvBoxId]: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Box Kecil...</option>
                          {availableBoxes.length > 0 ? (
                            availableBoxes.map((box) => (
                              <option key={box.id} value={box.id}>
                                {box.fullPath} (Available: {box.available})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No Box Kecil available</option>
                          )}
                        </select>
                        
                        {availableBoxes.length === 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                            <strong>No Box Kecil available!</strong> Please create Box Kecil in Rack Management first.
                          </div>
                        )}
                        
                        {boxMapping[csvBoxId] && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600">
                            ✓ Mapped to: {availableBoxes.find(box => box.id === boxMapping[csvBoxId])?.fullPath}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setBoxMappingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyBoxMapping}
                disabled={csvBoxIds.some(id => !boxMapping[id])}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Apply Mapping & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview Modal */}
      {showCsvPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview Data CSV - {csvData.length} Records
              </h3>
              <button
                onClick={() => setShowCsvPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Review your data before uploading.</strong> You can edit individual rows or delete incorrect entries.
                Make sure to select a Box Kecil for storage location.
              </p>
            </div>

            {/* Data Table */}
            <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Box (CSV)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Box Kecil</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis Kartu</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Masa Aktif</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-3 py-2 text-sm">
                        {editingRowIndex === index ? (
                          <input
                            type="text"
                            value={editingRow.nomor || ''}
                            onChange={(e) => setEditingRow({...editingRow, nomor: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-900 font-mono">{row.nomor}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span className="text-blue-600 font-medium">{row.idBox}</span>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {row.boxKecilName ? (
                          <div>
                            <span className="text-green-600 font-medium">{row.boxKecilName}</span>
                            <div className="text-xs text-gray-500">{row.rakLocation}</div>
                          </div>
                        ) : (
                          <span className="text-red-500 text-xs">Not mapped</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editingRowIndex === index ? (
                          <select
                            value={editingRow.jenisKartu || ''}
                            onChange={(e) => setEditingRow({...editingRow, jenisKartu: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Telkomsel">Telkomsel</option>
                            <option value="Indosat">Indosat</option>
                            <option value="XL">XL</option>
                            <option value="3">3</option>
                            <option value="Smartfren">Smartfren</option>
                            <option value="Axis">Axis</option>
                          </select>
                        ) : (
                          <span className="text-gray-900">{row.jenisKartu}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editingRowIndex === index ? (
                          <input
                            type="date"
                            value={editingRow.masaAktif || ''}
                            onChange={(e) => setEditingRow({...editingRow, masaAktif: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{row.masaAktif}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editingRowIndex === index ? (
                          <select
                            value={editingRow.status || ''}
                            onChange={(e) => setEditingRow({...editingRow, status: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="active">Dapat Digunakan</option>
                            <option value="inactive">Tidak Aktif</option>
                            <option value="used">Sedang Digunakan</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            row.status === 'active' ? 'bg-green-100 text-green-800' :
                            row.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status === 'active' ? 'Aktif' : 
                             row.status === 'inactive' ? 'Tidak Aktif' : 'Digunakan'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <div className="flex space-x-1">
                          {editingRowIndex === index ? (
                            <>
                              <button
                                onClick={saveCsvRowEdit}
                                className="text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingRowIndex(null)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Cancel"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => editCsvRow(index)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCsvRow(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Total: {csvData.length} records ready to upload
                {csvData.filter(row => !row.boxKecilId).length > 0 && (
                  <span className="text-red-600 ml-2">
                    ({csvData.filter(row => !row.boxKecilId).length} unmapped)
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCsvPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {csvData.filter(row => !row.boxKecilId).length > 0 && (
                  <button
                    onClick={() => {
                      setShowCsvPreview(false);
                      setBoxMappingModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center"
                  >
                    <FiMapPin className="w-4 h-4 mr-2" />
                    Map Box IDs
                  </button>
                )}
                <button
                  onClick={() => {
                    uploadCsvData();
                    setShowCsvPreview(false);
                  }}
                  disabled={csvData.filter(row => !row.boxKecilId).length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload {csvData.filter(row => row.boxKecilId).length} Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
