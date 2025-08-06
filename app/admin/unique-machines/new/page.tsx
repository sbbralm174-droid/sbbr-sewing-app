// src/app/admin/unique-machines/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface for fetching machine types
interface IMachine {
  _id: string;
  name: string;
}

// Interface for fetching sewing lines
interface ISewingLine {
  _id: string;
  name: string;
  floor: string;
}

export default function NewUniqueMachinePage() {
  const router = useRouter();
  const [availableMachineTypes, setAvailableMachineTypes] = useState<IMachine[]>([]);
  const [sewingLines, setSewingLines] = useState<ISewingLine[]>([]);
  
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(''); // Updated state
  const [selectedLine, setSelectedLine] = useState(''); // Updated state
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch machine types and sewing lines on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, linesRes] = await Promise.all([
          fetch('/api/machines'),
          fetch('/api/sewing-lines'),
        ]);

        const machinesData = await machinesRes.json();
        const linesData = await linesRes.json();

        if (machinesRes.ok) {
          setAvailableMachineTypes(machinesData);
          if (machinesData.length > 0) {
            setSelectedMachineType(machinesData[0]._id); // Select first machine type by default
          }
        }
        
        if (linesRes.ok) {
          setSewingLines(linesData);
          if (linesData.length > 0) {
            // Set default floor and line if data exists
            setSelectedFloor(linesData[0].floor);
            setSelectedLine(linesData[0].name);
          }
        }
      } catch (error) {
        setMessage('Failed to fetch required data.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const payload = {
      machineType: selectedMachineType,
      uniqueId,
      floor: selectedFloor,
      line: selectedLine,
    };

    try {
      const res = await fetch('/api/unique-machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Unique machine added successfully!');
        // Clear form
        setUniqueId('');
      } else {
        setMessage(data.message || 'Failed to add unique machine.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get unique floors for the dropdown
  const getUniqueFloors = () => {
    const floors = new Set(sewingLines.map(line => line.floor));
    return Array.from(floors);
  };
  
  // Helper function to get lines for the selected floor
  const getLinesByFloor = (floor: string) => {
    return sewingLines.filter(line => line.floor === floor);
  };
  
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading data...</div>;
  }
  
  if (availableMachineTypes.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center text-red-600">
        <p className="text-xl">Please add machine types (brands) first.</p>
        <Link href="/admin/machines/new" className="text-blue-500 hover:underline mt-2 inline-block">
          Add Machine Type
        </Link>
      </div>
    );
  }
  
  if (sewingLines.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center text-red-600">
        <p className="text-xl">Please add sewing lines first.</p>
        <Link href="/admin/sewing-lines/new" className="text-blue-500 hover:underline mt-2 inline-block">
          Add Sewing Line
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Unique Machine</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="machineType" className="block text-gray-700 font-bold mb-2">
            Select Machine Type (Brand)
          </label>
          <select
            id="machineType"
            value={selectedMachineType}
            onChange={(e) => setSelectedMachineType(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {availableMachineTypes.map((machine) => (
              <option key={machine._id} value={machine._id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="uniqueId" className="block text-gray-700 font-bold mb-2">
            Unique Machine ID
          </label>
          <input
            type="text"
            id="uniqueId"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., M-001"
            required
          />
        </div>
        
        {/* Floor Dropdown */}
        <div className="mb-4">
          <label htmlFor="floor" className="block text-gray-700 font-bold mb-2">
            Floor
          </label>
          <select
            id="floor"
            value={selectedFloor}
            onChange={(e) => {
              setSelectedFloor(e.target.value);
              // When floor changes, update the available lines
              const linesForNewFloor = getLinesByFloor(e.target.value);
              setSelectedLine(linesForNewFloor.length > 0 ? linesForNewFloor[0].name : '');
            }}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {getUniqueFloors().map((floor) => (
              <option key={floor+1} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>
        
        {/* Line Dropdown */}
        <div className="mb-4">
          <label htmlFor="line" className="block text-gray-700 font-bold mb-2">
            Line
          </label>
          <select
            id="line"
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {getLinesByFloor(selectedFloor).map((line) => (
              <option key={line._id} value={line.name}>
                {line.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Unique Machine'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
      <div className="mt-4 text-center">
        <Link href="/admin/machines/new" className="text-blue-500 hover:underline">
          Don't see a machine type? Add one here.
        </Link>
      </div>
    </div>
  );
}