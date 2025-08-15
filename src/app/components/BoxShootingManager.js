"use client";

import { useState } from 'react';
import { FiTarget, FiCalendar, FiBox, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

export default function BoxShootingManager({ 
  simCards, 
  onUpdateCards, 
  onClose 
}) {
  const [selectedBox, setSelectedBox] = useState('');
  const [newActiveDate, setNewActiveDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get boxes that need shooting
  const getBoxesNeedShooting = () => {
    const today = new Date();
    const cardsNeedShooting = simCards.filter(card => {
      if (card.status === 'inactive') return true;
      if (!card.masaAktif) return true;
      
      const activeDate = new Date(card.masaAktif);
      const daysUntilExpiry = Math.ceil((activeDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30;
    });
    
    // Group by boxes and sort by urgency
    const boxGroups = cardsNeedShooting.reduce((boxes, card) => {
      const boxId = card.boxKecilId || 'unknown';
      const boxName = card.boxKecilName || 'Unknown Box';
      if (!boxes[boxId]) {
        boxes[boxId] = { 
          id: boxId, 
          name: boxName, 
          count: 0, 
          cards: [],
          urgentCount: 0,
          minDaysLeft: 999
        };
      }
      boxes[boxId].count++;
      boxes[boxId].cards.push(card);
      
      // Calculate urgency
      if (card.masaAktif) {
        const daysLeft = Math.ceil((new Date(card.masaAktif) - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) boxes[boxId].urgentCount++;
        if (daysLeft < boxes[boxId].minDaysLeft) boxes[boxId].minDaysLeft = daysLeft;
      } else {
        boxes[boxId].urgentCount++;
        boxes[boxId].minDaysLeft = 0;
      }
      
      return boxes;
    }, {});
    
    return Object.values(boxGroups).sort((a, b) => a.minDaysLeft - b.minDaysLeft);
  };

  const handleBoxShooting = async () => {
    if (!selectedBox || !newActiveDate) {
      alert('Please select a box and set the new active date');
      return;
    }

    setIsProcessing(true);
    
    try {
      const boxData = getBoxesNeedShooting().find(box => box.id === selectedBox);
      if (!boxData) {
        throw new Error('Box not found');
      }

      // Update all cards in the selected box
      const updatedCards = simCards.map(card => {
        if (card.boxKecilId === selectedBox) {
          return {
            ...card,
            masaAktif: newActiveDate,
            status: 'active',
            tanggalTembak: new Date().toISOString().split('T')[0]
          };
        }
        return card;
      });

      await onUpdateCards(updatedCards);
      
      alert(`Successfully updated ${boxData.count} cards in box "${boxData.name}"`);
      onClose();
      
    } catch (error) {
      console.error('Error updating box:', error);
      alert('Error updating box: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const boxesNeedShooting = getBoxesNeedShooting();
  const selectedBoxData = boxesNeedShooting.find(box => box.id === selectedBox);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FiTarget className="w-6 h-6 mr-2 text-red-600" />
            Update Box Telah Di Tembak
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <FiAlertTriangle className="inline w-4 h-4 mr-1" />
            <strong>Box Shooting Update:</strong> Select a box and set the new active date to update all SIM cards in that box.
            This will mark them as "telah ditembak" and update their masa aktif.
          </p>
        </div>

        {/* Box Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Box yang Telah Di Tembak:
          </label>
          <select
            value={selectedBox}
            onChange={(e) => setSelectedBox(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Box --</option>
            {boxesNeedShooting.map((box) => (
              <option key={box.id} value={box.id}>
                {box.name} ({box.count} kartu - {box.urgentCount} mendesak - {box.minDaysLeft <= 0 ? 'Expired' : `${box.minDaysLeft} hari lagi`})
              </option>
            ))}
          </select>
        </div>

        {/* New Active Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Masa Aktif Baru:
          </label>
          <input
            type="date"
            value={newActiveDate}
            onChange={(e) => setNewActiveDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Preview Selected Box */}
        {selectedBoxData && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FiBox className="w-4 h-4 mr-2" />
              Preview Box: {selectedBoxData.name}
            </h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-lg font-bold text-blue-600">{selectedBoxData.count}</div>
                <div className="text-xs text-gray-600">Total Kartu</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-lg font-bold text-red-600">{selectedBoxData.urgentCount}</div>
                <div className="text-xs text-gray-600">Mendesak</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-lg font-bold text-yellow-600">
                  {selectedBoxData.minDaysLeft <= 0 ? 'Expired' : `${selectedBoxData.minDaysLeft}d`}
                </div>
                <div className="text-xs text-gray-600">Sisa Terpendek</div>
              </div>
            </div>
            
            {/* Show sample cards */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Sample cards (showing first 5):
              </div>
              {selectedBoxData.cards.slice(0, 5).map((card, index) => {
                const today = new Date();
                const daysLeft = card.masaAktif ? Math.ceil((new Date(card.masaAktif) - today) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <div key={card.id || index} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                    <div className="flex-1">
                      <span className="font-mono">{card.nomor}</span>
                      <span className="ml-2 text-gray-500">({card.jenisKartu})</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full ${
                      daysLeft <= 0 ? 'bg-red-100 text-red-800' :
                      daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })}
              {selectedBoxData.cards.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{selectedBoxData.cards.length - 5} more cards
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBoxShooting}
            disabled={!selectedBox || !newActiveDate || isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4 mr-2" />
                Update Box ({selectedBoxData?.count || 0} cards)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
