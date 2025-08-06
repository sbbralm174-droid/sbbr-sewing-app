// src/app/admin/operators/new/page.tsx
'use client';

import { useState, useEffect } from 'react';

// Define interfaces for fetched data for better type safety
interface IMachine {
  _id: string;
  name: string;
}

interface IProcess {
  _id: string;
  name: string;
}

export default function AddOperatorPage() {
  const [operatorId, setOperatorId] = useState('');
  const [name, setName] = useState('');
  const [operatorDesigation, setOperatorDesigation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [availableMachines, setAvailableMachines] = useState<IMachine[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<IProcess[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Fetch available machines and processes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, processesRes] = await Promise.all([
          fetch('/api/machines'),
          fetch('/api/processes'),
        ]);

        const machinesData = await machinesRes.json();
        const processesData = await processesRes.json();

        if (machinesRes.ok) {
          setAvailableMachines(machinesData);
        } else {
          console.error('Failed to fetch machines:', machinesData.message);
          setMessage('Failed to load machines. Please refresh.');
        }

        if (processesRes.ok) {
          setAvailableProcesses(processesData);
        } else {
          console.error('Failed to fetch processes:', processesData.message);
          setMessage('Failed to load processes. Please refresh.');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setMessage('An error occurred while loading data.');
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleMachineSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(option => option.selected).map(option => option.value);
    setSelectedMachineIds(selected);
  };

  const handleProcessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(option => option.selected).map(option => option.value);
    setSelectedProcessIds(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    if (!operatorId.trim() || !name.trim() || !operatorDesigation.trim() || selectedMachineIds.length === 0 || selectedProcessIds.length === 0) {
      setMessage('Please fill all required fields and select at least one machine and process.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/operators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorId,
          name,
          operatorDesigation,
          contactNumber: contactNumber || undefined, // Send undefined if empty
          selectedMachineIds,
          selectedProcessIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Operator added successfully!');
        // Clear form fields
        setOperatorId('');
        setName('');
        setOperatorDesigation
        setContactNumber('');
        setSelectedMachineIds([]);
        setSelectedProcessIds([]);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to add operator. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please check your connection.');
      console.error('Error adding operator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading machines and processes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Operator</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="operatorId" className="block text-gray-700 text-sm font-bold mb-2">
              Operator ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="operatorId"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., OP001"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Operator Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Rahim Khan"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Operator Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="designation"
              value={operatorDesigation}
              onChange={(e) => setOperatorDesigation(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Operator"
              required
            />
          </div>

        </div>

        <div className="mb-4">
          <label htmlFor="contactNumber" className="block text-gray-700 text-sm font-bold mb-2">
            Contact Number (Optional)
          </label>
          <input
            type="text"
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., +88017XXXXXXXX"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="machines" className="block text-gray-700 text-sm font-bold mb-2">
              Can Operate Which Machines? <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              id="machines"
              value={selectedMachineIds}
              onChange={handleMachineSelect}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
              required
            >
              {availableMachines.map((machine) => (
                <option key={machine._id} value={machine._id}>
                  {machine.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </div>

          <div>
            <label htmlFor="processes" className="block text-gray-700 text-sm font-bold mb-2">
              Can Perform Which Processes? <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              id="processes"
              value={selectedProcessIds}
              onChange={handleProcessSelect}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
              required
            >
              {availableProcesses.map((process) => (
                <option key={process._id} value={process._id}>
                  {process.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding Operator...' : 'Add Operator'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}