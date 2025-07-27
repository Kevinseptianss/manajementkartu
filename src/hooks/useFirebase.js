"use client";

import { useState, useEffect } from 'react';

// Custom hook for SIM cards
export function useSimCards() {
  const [simCards, setSimCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSimCards = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/simcards?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setSimCards(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSimCard = async (cardData) => {
    try {
      const response = await fetch('/api/simcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSimCards(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSimCard = async (id, updateData) => {
    try {
      const response = await fetch('/api/simcards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updateData }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSimCards(prev => 
          prev.map(card => card.id === id ? result.data : card)
        );
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSimCard = async (id) => {
    try {
      const response = await fetch(`/api/simcards?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSimCards(prev => prev.filter(card => card.id !== id));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSimCards();
  }, []);

  return {
    simCards,
    loading,
    error,
    fetchSimCards,
    addSimCard,
    updateSimCard,
    deleteSimCard,
    setSimCards
  };
}

// Custom hook for machines
export function useMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/machines');
      const result = await response.json();
      
      if (result.success) {
        setMachines(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMachine = async (machineData) => {
    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMachines(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateMachine = async (id, updateData) => {
    try {
      const response = await fetch('/api/machines', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updateData }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMachines(prev => 
          prev.map(machine => machine.id === id ? result.data : machine)
        );
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMachine = async (id) => {
    try {
      const response = await fetch(`/api/machines?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMachines(prev => prev.filter(machine => machine.id !== id));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return {
    machines,
    loading,
    error,
    fetchMachines,
    addMachine,
    updateMachine,
    deleteMachine,
    setMachines
  };
}

// Custom hook for racks
export function useRacks() {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/racks');
      const result = await response.json();
      
      if (result.success) {
        setRacks(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRack = async (rackData) => {
    try {
      const response = await fetch('/api/racks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rackData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRacks(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRack = async (id, updateData) => {
    try {
      const response = await fetch('/api/racks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updateData }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRacks(prev => 
          prev.map(rack => rack.id === id ? result.data : rack)
        );
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRack = async (id) => {
    try {
      const response = await fetch(`/api/racks?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRacks(prev => prev.filter(rack => rack.id !== id));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchRacks();
  }, []);

  return {
    racks,
    loading,
    error,
    fetchRacks,
    addRack,
    updateRack,
    deleteRack,
    setRacks
  };
}
