'use client';

import React, { useState, useEffect } from 'react';

// Define interface for Sewing Line data
interface SewingLine {
  _id: string;
  name: string;
  floor: string;
  createdAt: string;
  updatedAt: string;
}

// Define interface for Operator data
interface Operator {
  _id: string;
  operatorId: string;
  name: string;
  operatorDesigation: string; // Added recently
  // Other properties if needed
}

// Define interface for Process data
interface Process {
  _id: string;
  name: string;
  // Other properties if needed
}

// Define interface for Unique Machine data
interface UniqueMachine {
  _id: string;
  machineType: {
    _id: string;
    name: string;
  };
  uniqueId: string;
  floor: string;
  line: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

const SewingLineForm: React.FC = () => {
  // State to store Sewing Line data fetched from API
  const [sewingLines, setSewingLines] = useState<SewingLine[]>([]);
  // State to store Operator data fetched from API
  const [operators, setOperators] = useState<Operator[]>([]);
  // State to store Process data fetched from API
  const [processes, setProcesses] = useState<Process[]>([]);
  // State to store Unique Machine data fetched from API
  const [uniqueMachines, setUniqueMachines] = useState<UniqueMachine[]>([]);

  // State to store selected line number and floor
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  // State to store selected operator
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  // State to store selected process
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  // State to store selected machine brand and unique ID
  const [selectedMachineBrandId, setSelectedMachineBrandId] = useState<string>('');
  const [selectedUniqueMachineId, setSelectedUniqueMachineId] = useState<string>('');

  // State to store hardcoded "Work as" and "Target" values (New)
  const [selectedWorkAs, setSelectedWorkAs] = useState<string>('');
  const [targetValue, setTargetValue] = useState<number | ''>('');


  // State to store operator search term
  const [operatorSearchTerm, setOperatorSearchTerm] = useState<string>('');


  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect to fetch data from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Sewing Line data
        const sewingLinesResponse = await fetch('/api/sewing-lines'); // Your sewing line API endpoint
        if (!sewingLinesResponse.ok) {
          throw new Error(`Failed to fetch sewing lines: ${sewingLinesResponse.statusText}`);
        }
        const sewingLinesData: SewingLine[] = await sewingLinesResponse.json();
        setSewingLines(sewingLinesData);

        // Fetch Operator data
        const operatorsResponse = await fetch('/api/operators'); // Your operator API endpoint
        if (!operatorsResponse.ok) {
          throw new Error(`Failed to fetch operators: ${operatorsResponse.statusText}`);
        }
        const operatorsData: Operator[] = await operatorsResponse.json();
        setOperators(operatorsData);

        // Fetch Process data
        const processesResponse = await fetch('/api/processes'); // Your process API endpoint
        if (!processesResponse.ok) {
          throw new Error(`Failed to fetch processes: ${processesResponse.statusText}`);
        }
        const processesData: Process[] = await processesResponse.json();
        setProcesses(processesData);

        // Fetch Unique Machine data
        const uniqueMachinesResponse = await fetch('/api/unique-machines'); // Your unique machine API endpoint
        if (!uniqueMachinesResponse.ok) {
          throw new Error(`Failed to fetch unique machines: ${uniqueMachinesResponse.statusText}`);
        }
        const uniqueMachinesData: UniqueMachine[] = await uniqueMachinesResponse.json();
        setUniqueMachines(uniqueMachinesData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Runs only once when the component mounts

  // Handler for line number change
  const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLineId(e.target.value);
  };

  // Handler for floor change
  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFloor(e.target.value);
  };

  // Handler for operator change
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperatorId(e.target.value);
  };

  // Handler for process change
  const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProcessId(e.target.value);
  };

  // Handler for machine brand change
  const handleMachineBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMachineBrandId(e.target.value);
    setSelectedUniqueMachineId(''); // Reset unique ID when brand changes
  };

  // Handler for unique machine ID change
  const handleUniqueMachineIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniqueMachineId(e.target.value);
  };

  // Handler for operator search term change
  const handleOperatorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorSearchTerm(e.target.value);
  };

  // Handler for "Work as" change (New)
  const handleWorkAsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkAs(e.target.value);
  };

  // Handler for "Target" input change (New)
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetValue(value === '' ? '' : Number(value));
  };


  // Extract unique floors from sewing lines
  const uniqueFloors = Array.from(new Set(sewingLines.map(line => line.floor)));

  // Filter operators based on search term
  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(operatorSearchTerm.toLowerCase()) ||
    operator.operatorId.toLowerCase().includes(operatorSearchTerm.toLowerCase()) ||
    operator.operatorDesigation.toLowerCase().includes(operatorSearchTerm.toLowerCase()) // Can search by designation as well
  );

  // Extract unique machine brands (with _id and name)
  const uniqueMachineBrands = Array.from(new Map(uniqueMachines.map(item => [item.machineType._id, item.machineType])).values());

  // Filter unique machine IDs based on selected brand
  const filteredUniqueMachineIds = uniqueMachines.filter(machine =>
    selectedMachineBrandId ? machine.machineType._id === selectedMachineBrandId : true
  );

  // Find the full data of the selected operator
  const selectedOperatorData = operators.find(op => op._id === selectedOperatorId);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-lg text-gray-700">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Sewing Line Information</h2>
        <form className="space-y-4">
          {/* Select Line Number */}
          <div>
            <label htmlFor="lineNo" className="block text-sm font-medium text-gray-900 mb-1">
              Line Number
            </label>
            <select
              id="lineNo"
              name="lineNo"
              value={selectedLineId}
              onChange={handleLineChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select a line</option>
              {sewingLines.map((line) => (
                <option key={line._id} value={line._id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Floor */}
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-900 mb-1">
              Floor
            </label>
            <select
              id="floor"
              name="floor"
              value={selectedFloor}
              onChange={handleFloorChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select a floor</option>
              {uniqueFloors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>

          {/* Operator Search Input */}
          <div>
            <label htmlFor="operatorSearch" className="block text-sm font-medium text-gray-900 mb-1">
              Search Operator (Name, ID, or Designation)
            </label>
            <input
              type="text"
              id="operatorSearch"
              name="operatorSearch"
              value={operatorSearchTerm}
              onChange={handleOperatorSearchChange}
              placeholder="Enter operator name, ID, or designation..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
          </div>

          {/* Select Operator */}
          <div>
            <label htmlFor="operator" className="block text-sm font-medium text-gray-900 mb-1">
              Select Operator
            </label>
            <select
              id="operator"
              name="operator"
              value={selectedOperatorId}
              onChange={handleOperatorChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select an operator</option>
              {filteredOperators.length > 0 ? (
                filteredOperators.map((operator) => (
                  <option key={operator._id} value={operator._id}>
                    {operator.name} ({operator.operatorId}) - {operator.operatorDesigation}
                  </option>
                ))
              ) : (
                <option value="" disabled>No operator found</option>
              )}
            </select>
          </div>

          {/* Select Process */}
          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-900 mb-1">
              Select Process
            </label>
            <select
              id="process"
              name="process"
              value={selectedProcessId}
              onChange={handleProcessChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select a process</option>
              {processes.map((process) => (
                <option key={process._id} value={process._id}>
                  {process.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Machine Brand */}
          <div>
            <label htmlFor="machineBrand" className="block text-sm font-medium text-gray-900 mb-1">
              Machine Brand
            </label>
            <select
              id="machineBrand"
              name="machineBrand"
              value={selectedMachineBrandId}
              onChange={handleMachineBrandChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select a brand</option>
              {uniqueMachineBrands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Machine Unique ID */}
          <div>
            <label htmlFor="uniqueMachineId" className="block text-sm font-medium text-gray-900 mb-1">
              Machine Unique ID
            </label>
            <select
              id="uniqueMachineId"
              name="uniqueMachineId"
              value={selectedUniqueMachineId}
              onChange={handleUniqueMachineIdChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select a unique ID</option>
              {filteredUniqueMachineIds.map((machine) => (
                <option key={machine._id} value={machine.uniqueId}>
                  {machine.uniqueId}
                </option>
              ))}
            </select>
          </div>

          {/* Work as (Hardcoded Select) - New */}
          <div>
            <label htmlFor="workAs" className="block text-sm font-medium text-gray-900 mb-1">
              Work as
            </label>
            <select
              id="workAs"
              name="workAs"
              value={selectedWorkAs}
              onChange={handleWorkAsChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            >
              <option value="">Select role</option>
              <option value="Helper">Helper</option>
              <option value="Operator">Operator</option>
            </select>
          </div>

          {/* Target (Number Input) - New */}
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-gray-900 mb-1">
              Target
            </label>
            <input
              type="number"
              id="target"
              name="target"
              value={targetValue}
              onChange={handleTargetChange}
              placeholder="Enter target value..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
          </div>

          {/* Display Selected Values (Optional) */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
            <p className="text-sm font-medium text-gray-900">Selected Line ID: <span className="font-normal text-gray-900">{selectedLineId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Floor: <span className="font-normal text-gray-900">{selectedFloor || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Operator ID: <span className="font-normal text-gray-900">{selectedOperatorId || 'Nothing selected'}</span></p>
            {selectedOperatorData && ( // To display the designation of the selected operator
              <p className="text-sm font-medium text-gray-900">Selected Operator Designation: <span className="font-normal text-gray-900">{selectedOperatorData.operatorDesigation}</span></p>
            )}
            <p className="text-sm font-medium text-gray-900">Selected Process ID: <span className="font-normal text-gray-900">{selectedProcessId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Machine Brand ID: <span className="font-normal text-gray-900">{selectedMachineBrandId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Machine Unique ID: <span className="font-normal text-gray-900">{selectedUniqueMachineId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Work as: <span className="font-normal text-gray-900">{selectedWorkAs || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Target Value: <span className="font-normal text-gray-900">{targetValue === '' ? 'Nothing entered' : targetValue}</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SewingLineForm;
