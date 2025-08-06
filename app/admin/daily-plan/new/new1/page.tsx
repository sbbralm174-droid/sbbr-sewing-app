'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  operatorDesigation: string;
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
  // State to store data fetched from APIs
  const [sewingLines, setSewingLines] = useState<SewingLine[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [uniqueMachines, setUniqueMachines] = useState<UniqueMachine[]>([]);

  // State to store selected values for each field
  const [selectedDate, setSelectedDate] = useState<string>(''); // New: State for date
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [selectedMachineBrandId, setSelectedMachineBrandId] = useState<string>('');
  const [selectedUniqueMachineId, setSelectedUniqueMachineId] = useState<string>('');
  const [selectedWorkAs, setSelectedWorkAs] = useState<string>('');
  const [targetValue, setTargetValue] = useState<number | ''>('');

  // States for search terms for each select field
  const [lineSearchTerm, setLineSearchTerm] = useState<string>('');
  const [floorSearchTerm, setFloorSearchTerm] = useState<string>('');
  const [operatorSearchTerm, setOperatorSearchTerm] = useState<string>('');
  const [processSearchTerm, setProcessSearchTerm] = useState<string>('');
  const [machineBrandSearchTerm, setMachineBrandSearchTerm] = useState<string>('');
  const [uniqueMachineIdSearchTerm, setUniqueMachineIdSearchTerm] = useState<string>('');

  // States for dropdown visibility
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState(false);
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);
  const [isOperatorDropdownOpen, setIsOperatorDropdownOpen] = useState(false);
  const [isProcessDropdownOpen, setIsProcessDropdownOpen] = useState(false);
  const [isMachineBrandDropdownOpen, setIsMachineBrandDropdownOpen] = useState(false);
  const [isUniqueMachineIdDropdownOpen, setIsUniqueMachineIdDropdownOpen] = useState(false);
  const [isWorkAsDropdownOpen, setIsWorkAsDropdownOpen] = useState(false);

  // Refs for dropdown containers to handle clicks outside
  const lineRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const machineBrandRef = useRef<HTMLDivElement>(null);
  const uniqueMachineIdRef = useRef<HTMLDivElement>(null);
  const workAsRef = useRef<HTMLDivElement>(null);


  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect to fetch data from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Sewing Line data
        const sewingLinesResponse = await fetch('/api/sewing-lines');
        if (!sewingLinesResponse.ok) {
          throw new Error(`Failed to fetch sewing lines: ${sewingLinesResponse.statusText}`);
        }
        const sewingLinesData: SewingLine[] = await sewingLinesResponse.json();
        setSewingLines(sewingLinesData);

        // Fetch Operator data
        const operatorsResponse = await fetch('/api/operators');
        if (!operatorsResponse.ok) {
          throw new Error(`Failed to fetch operators: ${operatorsResponse.statusText}`);
        }
        const operatorsData: Operator[] = await operatorsResponse.json();
        setOperators(operatorsData);

        // Fetch Process data
        const processesResponse = await fetch('/api/processes');
        if (!processesResponse.ok) {
          throw new Error(`Failed to fetch processes: ${processesResponse.statusText}`);
        }
        const processesData: Process[] = await processesResponse.json();
        setProcesses(processesData);

        // Fetch Unique Machine data
        const uniqueMachinesResponse = await fetch('/api/unique-machines');
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

  // Handler to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lineRef.current && !lineRef.current.contains(event.target as Node)) {
        setIsLineDropdownOpen(false);
      }
      if (floorRef.current && !floorRef.current.contains(event.target as Node)) {
        setIsFloorDropdownOpen(false);
      }
      if (operatorRef.current && !operatorRef.current.contains(event.target as Node)) {
        setIsOperatorDropdownOpen(false);
      }
      if (processRef.current && !processRef.current.contains(event.target as Node)) {
        setIsProcessDropdownOpen(false);
      }
      if (machineBrandRef.current && !machineBrandRef.current.contains(event.target as Node)) {
        setIsMachineBrandDropdownOpen(false);
      }
      if (uniqueMachineIdRef.current && !uniqueMachineIdRef.current.contains(event.target as Node)) {
        setIsUniqueMachineIdDropdownOpen(false);
      }
      if (workAsRef.current && !workAsRef.current.contains(event.target as Node)) {
        setIsWorkAsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler for date change (New)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handlers for select field changes (now called when an option is clicked)
  const handleLineSelect = (id: string, name: string) => {
    setSelectedLineId(id);
    setLineSearchTerm(name); // Set input value to selected name
    setIsLineDropdownOpen(false);
  };

  const handleFloorSelect = (floor: string) => {
    setSelectedFloor(floor);
    setFloorSearchTerm(floor); // Set input value to selected floor
    setIsFloorDropdownOpen(false);
  };

  const handleOperatorSelect = (id: string, name: string, operatorId: string, designation: string) => {
    setSelectedOperatorId(id);
    setOperatorSearchTerm(`${name} (${operatorId}) - ${designation}`); // Set input value to selected operator info
    setIsOperatorDropdownOpen(false);
  };

  const handleProcessSelect = (id: string, name: string) => {
    setSelectedProcessId(id);
    setProcessSearchTerm(name); // Set input value to selected name
    setIsProcessDropdownOpen(false);
  };

  const handleMachineBrandSelect = (id: string, name: string) => {
    setSelectedMachineBrandId(id);
    setMachineBrandSearchTerm(name); // Set input value to selected name
    setSelectedUniqueMachineId(''); // Reset unique ID when brand changes
    setUniqueMachineIdSearchTerm(''); // Reset unique ID search term
    setIsMachineBrandDropdownOpen(false);
  };

  const handleUniqueMachineIdSelect = (id: string) => {
    setSelectedUniqueMachineId(id);
    setUniqueMachineIdSearchTerm(id); // Set input value to selected ID
    setIsUniqueMachineIdDropdownOpen(false);
  };

  const handleWorkAsSelect = (role: string) => {
    setSelectedWorkAs(role);
    setIsWorkAsDropdownOpen(false);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetValue(value === '' ? '' : Number(value));
  };

  // Handlers for search term changes (now also control dropdown visibility)
  const handleLineSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineSearchTerm(e.target.value);
    setIsLineDropdownOpen(true); // Open dropdown when typing
  };

  const handleFloorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFloorSearchTerm(e.target.value);
    setIsFloorDropdownOpen(true);
  };

  const handleOperatorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorSearchTerm(e.target.value);
    setIsOperatorDropdownOpen(true);
  };

  const handleProcessSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessSearchTerm(e.target.value);
    setIsProcessDropdownOpen(true);
  };

  const handleMachineBrandSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMachineBrandSearchTerm(e.target.value);
    setIsMachineBrandDropdownOpen(true);
  };

  const handleUniqueMachineIdSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUniqueMachineIdSearchTerm(e.target.value);
    setIsUniqueMachineIdDropdownOpen(true);
  };

  // Filtered data for select options based on search terms
  const filteredSewingLines = sewingLines.filter(line =>
    line.name.toLowerCase().includes(lineSearchTerm.toLowerCase())
  );

  const uniqueFloors = Array.from(new Set(sewingLines.map(line => line.floor)));
  const filteredFloors = uniqueFloors.filter(floor =>
    floor.toLowerCase().includes(floorSearchTerm.toLowerCase())
  );

  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(operatorSearchTerm.toLowerCase()) ||
    operator.operatorId.toLowerCase().includes(operatorSearchTerm.toLowerCase()) ||
    operator.operatorDesigation.toLowerCase().includes(operatorSearchTerm.toLowerCase())
  );

  const filteredProcesses = processes.filter(process =>
    process.name.toLowerCase().includes(processSearchTerm.toLowerCase())
  );

  const uniqueMachineBrands = Array.from(new Map(uniqueMachines.map(item => [item.machineType._id, item.machineType])).values());
  const filteredMachineBrands = uniqueMachineBrands.filter(brand =>
    brand.name.toLowerCase().includes(machineBrandSearchTerm.toLowerCase())
  );

  const filteredUniqueMachineIds = uniqueMachines.filter(machine =>
    (selectedMachineBrandId ? machine.machineType._id === selectedMachineBrandId : true) &&
    machine.uniqueId.toLowerCase().includes(uniqueMachineIdSearchTerm.toLowerCase())
  );

  // Find the full data of the selected operator for display
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
          {/* Date Field - New */}
          <div>
            <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-900 mb-1">
              Date
            </label>
            <input
              type="date"
              id="selectedDate"
              name="selectedDate"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
          </div>

          {/* Select Operator with Searchable Dropdown */}
          <div className="relative" ref={operatorRef}>
            <label htmlFor="operator" className="block text-sm font-medium text-gray-900 mb-1">
              Select Operator
            </label>
            <input
              type="text"
              id="operator"
              name="operator"
              value={operatorSearchTerm}
              onChange={handleOperatorSearchChange}
              onFocus={() => setIsOperatorDropdownOpen(true)}
              placeholder="Select or search operator (Name, ID, or Designation)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isOperatorDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredOperators.length > 0 ? (
                  filteredOperators.map((operator) => (
                    <div
                      key={operator._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleOperatorSelect(operator._id, operator.name, operator.operatorId, operator.operatorDesigation)}
                    >
                      {operator.name} ({operator.operatorId}) - {operator.operatorDesigation}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No operator found</div>
                )}
              </div>
            )}
          </div>

          {/* Floor with Searchable Dropdown */}
          <div className="relative" ref={floorRef}>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-900 mb-1">
              Floor
            </label>
            <input
              type="text"
              id="floor"
              name="floor"
              value={floorSearchTerm}
              onChange={handleFloorSearchChange}
              onFocus={() => setIsFloorDropdownOpen(true)}
              placeholder="Select or search floor..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isFloorDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredFloors.length > 0 ? (
                  filteredFloors.map((floor) => (
                    <div
                      key={floor}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleFloorSelect(floor)}
                    >
                      {floor}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No floor found</div>
                )}
              </div>
            )}
          </div>

          {/* Line Number with Searchable Dropdown */}
          <div className="relative" ref={lineRef}>
            <label htmlFor="lineNo" className="block text-sm font-medium text-gray-900 mb-1">
              Line Number
            </label>
            <input
              type="text"
              id="lineNo"
              name="lineNo"
              value={lineSearchTerm}
              onChange={handleLineSearchChange}
              onFocus={() => setIsLineDropdownOpen(true)}
              placeholder="Select or search line number..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isLineDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredSewingLines.length > 0 ? (
                  filteredSewingLines.map((line) => (
                    <div
                      key={line._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleLineSelect(line._id, line.name)}
                    >
                      {line.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No line found</div>
                )}
              </div>
            )}
          </div>

          {/* Machine Brand with Searchable Dropdown */}
          <div className="relative" ref={machineBrandRef}>
            <label htmlFor="machineBrand" className="block text-sm font-medium text-gray-900 mb-1">
              Machine Brand
            </label>
            <input
              type="text"
              id="machineBrand"
              name="machineBrand"
              value={machineBrandSearchTerm}
              onChange={handleMachineBrandSearchChange}
              onFocus={() => setIsMachineBrandDropdownOpen(true)}
              placeholder="Select or search machine brand..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isMachineBrandDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredMachineBrands.length > 0 ? (
                  filteredMachineBrands.map((brand) => (
                    <div
                      key={brand._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleMachineBrandSelect(brand._id, brand.name)}
                    >
                      {brand.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No brand found</div>
                )}
              </div>
            )}
          </div>

          {/* Machine Unique ID with Searchable Dropdown */}
          <div className="relative" ref={uniqueMachineIdRef}>
            <label htmlFor="uniqueMachineId" className="block text-sm font-medium text-gray-900 mb-1">
              Machine Unique ID
            </label>
            <input
              type="text"
              id="uniqueMachineId"
              name="uniqueMachineId"
              value={uniqueMachineIdSearchTerm}
              onChange={handleUniqueMachineIdSearchChange}
              onFocus={() => setIsUniqueMachineIdDropdownOpen(true)}
              placeholder="Select or search unique ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isUniqueMachineIdDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredUniqueMachineIds.length > 0 ? (
                  filteredUniqueMachineIds.map((machine) => (
                    <div
                      key={machine._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleUniqueMachineIdSelect(machine.uniqueId)}
                    >
                      {machine.uniqueId}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No unique ID found</div>
                )}
              </div>
            )}
          </div>

          {/* Process with Searchable Dropdown */}
          <div className="relative" ref={processRef}>
            <label htmlFor="process" className="block text-sm font-medium text-gray-900 mb-1">
              Select Process
            </label>
            <input
              type="text"
              id="process"
              name="process"
              value={processSearchTerm}
              onChange={handleProcessSearchChange}
              onFocus={() => setIsProcessDropdownOpen(true)}
              placeholder="Select or search process..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isProcessDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filteredProcesses.length > 0 ? (
                  filteredProcesses.map((process) => (
                    <div
                      key={process._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleProcessSelect(process._id, process.name)}
                    >
                      {process.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No process found</div>
                )}
              </div>
            )}
          </div>

          {/* Work as (Hardcoded Select) with Searchable Dropdown */}
          <div className="relative" ref={workAsRef}>
            <label htmlFor="workAs" className="block text-sm font-medium text-gray-900 mb-1">
              Work as
            </label>
            <input
              type="text"
              id="workAs"
              name="workAs"
              value={selectedWorkAs} // Use selectedWorkAs as input value
              onChange={(e) => {
                setSelectedWorkAs(e.target.value); // Allow typing to filter
                setIsWorkAsDropdownOpen(true);
              }}
              onFocus={() => setIsWorkAsDropdownOpen(true)}
              placeholder="Select or search role..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            />
            {isWorkAsDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {['Helper', 'Operator'].filter(role =>
                  role.toLowerCase().includes(selectedWorkAs.toLowerCase())
                ).length > 0 ? (
                  ['Helper', 'Operator'].filter(role =>
                    role.toLowerCase().includes(selectedWorkAs.toLowerCase())
                  ).map((role) => (
                    <div
                      key={role}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-900"
                      onClick={() => handleWorkAsSelect(role)}
                    >
                      {role}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No role found</div>
                )}
              </div>
            )}
          </div>

          {/* Target (Number Input) */}
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
            <p className="text-sm font-medium text-gray-900">Selected Date: <span className="font-normal text-gray-900">{selectedDate || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Operator ID: <span className="font-normal text-gray-900">{selectedOperatorId || 'Nothing selected'}</span></p>
            {selectedOperatorData && (
              <p className="text-sm font-medium text-gray-900">Selected Operator Designation: <span className="font-normal text-gray-900">{selectedOperatorData.operatorDesigation}</span></p>
            )}
            <p className="text-sm font-medium text-gray-900">Selected Floor: <span className="font-normal text-gray-900">{selectedFloor || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Line ID: <span className="font-normal text-gray-900">{selectedLineId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Machine Brand ID: <span className="font-normal text-gray-900">{selectedMachineBrandId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Machine Unique ID: <span className="font-normal text-gray-900">{selectedUniqueMachineId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Process ID: <span className="font-normal text-gray-900">{selectedProcessId || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Selected Work as: <span className="font-normal text-gray-900">{selectedWorkAs || 'Nothing selected'}</span></p>
            <p className="text-sm font-medium text-gray-900">Target Value: <span className="font-normal text-gray-900">{targetValue === '' ? 'Nothing entered' : targetValue}</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SewingLineForm;
