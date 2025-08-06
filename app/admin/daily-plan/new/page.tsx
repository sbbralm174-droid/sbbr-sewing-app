'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

// Define interfaces for fetched data for better type safety
interface IMachine {
  _id: string;
  name: string;
}

interface IProcess {
  _id: string;
  name: string;
}

interface IOperator {
  _id: string;
  operatorId: string;
  name: string;
  skills: {
    machines: IMachine[]; // Populated data
    processes: IProcess[]; // Populated data
  };
}

interface ISewingLine {
  _id: string;
  name: string;
}

// New interface for unique machines from /api/unique-machines
interface IUniqueMachine {
  _id: string;
  machineType: {
    _id: string;
    name: string;
  };
  uniqueId: string;
  floor: string;
  line: string; // This field likely holds the name of the sewing line
  isUsed: boolean;
}

interface IAssignmentFormState {
  operatorId: string; // The _id of the operator
  status: 'Present' | 'Absent' | 'Leave';
  machineId: string; // The _id of the selected general machine type
  processId: string; // The _id of the selected process
  uniqueMachineId: string; // The _id of the specific unique machine instance
  targetProduction: number;
}

export default function DailyPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sewingLines, setSewingLines] = useState<ISewingLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState('');
  const [availableMachines, setAvailableMachines] = useState<IMachine[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<IProcess[]>([]);
  const [uniqueMachines, setUniqueMachines] = useState<IUniqueMachine[]>([]); // New state for unique machines

  const [assignments, setAssignments] = useState<IAssignmentFormState[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IOperator[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch all necessary master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [linesRes, machinesRes, processesRes, uniqueMachinesRes] = await Promise.all([
          fetch('/api/sewing-lines'),
          fetch('/api/machines'),
          fetch('/api/processes'),
          fetch('/api/unique-machines'), // Fetch unique machines
        ]);

        const linesData = await linesRes.json();
        const machinesData = await machinesRes.json();
        const processesData = await processesRes.json();
        const uniqueMachinesData = await uniqueMachinesRes.json(); // Get unique machines data

        if (linesRes.ok) setSewingLines(linesData);
        if (machinesRes.ok) setAvailableMachines(machinesData);
        if (processesRes.ok) setAvailableProcesses(processesData);
        if (uniqueMachinesRes.ok) setUniqueMachines(uniqueMachinesData); // Set unique machines data

      } catch (error) {
        console.error('Error fetching master data:', error);
        setMessage('Error loading essential data. Please refresh.');
      }
    };
    fetchMasterData();
  }, []);

  // 2. Fetch existing daily assignments when date or line changes
  const fetchDailyAssignments = useCallback(async () => {
    if (!selectedLineId || !selectedDate) {
      setAssignments([]);
      return;
    }

    setIsFetchingAssignments(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`/api/daily-assignments?date=${selectedDate}&sewingLineId=${selectedLineId}`);
      const data = await response.json();

      if (response.ok) {
        const loadedAssignments: IAssignmentFormState[] = data.assignments.map((assign: any) => ({
          operatorId: assign.operator._id,
          status: assign.status,
          machineId: assign.machine ? assign.machine._id : '',
          processId: assign.process ? assign.process._id : '',
          uniqueMachineId: assign.uniqueMachine ? assign.uniqueMachine._id : '', // Map uniqueMachineId
          targetProduction: assign.targetProduction || 0,
        }));
        setAssignments(loadedAssignments);
        setMessage('Existing plan loaded successfully.');
        setIsSuccess(true);
      } else if (response.status === 404) {
        setAssignments([]);
        setMessage('No existing plan found for this date and line. You can create a new one.');
        setIsSuccess(false);
      } else {
        setMessage(data.message || 'Failed to load existing plan.');
        setIsSuccess(false);
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching daily assignments:', error);
      setMessage('An error occurred while fetching assignments.');
      setIsSuccess(false);
      setAssignments([]);
    } finally {
      setIsFetchingAssignments(false);
    }
  }, [selectedDate, selectedLineId]);

  useEffect(() => {
    fetchDailyAssignments();
  }, [selectedDate, selectedLineId, fetchDailyAssignments]);

  // Handle searching for operators
  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/operators?search=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        setSearchResults([]);
        setMessage('Failed to search operators.');
      }
    } catch (error) {
      console.error('Error searching for operators:', error);
      setMessage('An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  // Add a searched operator to the current assignments
  const addOperatorToPlan = (operator: IOperator) => {
    const isAlreadyAssigned = assignments.some(assign => assign.operatorId === operator._id);
    if (isAlreadyAssigned) {
      setMessage(`Operator ${operator.name} is already in the plan.`);
      return;
    }

    const newAssignment: IAssignmentFormState = {
      operatorId: operator._id,
      status: 'Present', // Default status for new additions
      machineId: '',
      processId: '',
      uniqueMachineId: '', // Initialize new field
      targetProduction: 0,
    };
    setAssignments(prev => [...prev, newAssignment]);
    setMessage(`Operator ${operator.name} added to the plan.`);
  };

  const handleAssignmentChange = useCallback(
    (
      operatorId: string,
      field: keyof IAssignmentFormState,
      value: any
    ) => {
      setAssignments(prevAssignments => {
        const newAssignments = [...prevAssignments];
        const operatorIndex = newAssignments.findIndex(assign => assign.operatorId === operatorId);
        if (operatorIndex === -1) return prevAssignments;

        const currentAssignment = { ...newAssignments[operatorIndex] };

        if (field === 'status') {
          currentAssignment.status = value;
          if (value === 'Absent' || value === 'Leave') {
            currentAssignment.machineId = '';
            currentAssignment.processId = '';
            currentAssignment.uniqueMachineId = ''; // Clear uniqueMachineId
            currentAssignment.targetProduction = 0;
          }
        } else if (field === 'targetProduction') {
          currentAssignment.targetProduction = Number(value);
        } else if (field === 'machineId') {
          currentAssignment.machineId = value;
          // When machineId changes, reset uniqueMachineId to avoid invalid combinations
          currentAssignment.uniqueMachineId = '';
        }
        else {
          (currentAssignment as any)[field] = value;
        }

        newAssignments[operatorIndex] = currentAssignment;
        return newAssignments;
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    if (!selectedDate || !selectedLineId || assignments.length === 0) {
      setMessage('Please select a date, a sewing line, and ensure assignments are loaded.');
      setIsLoading(false);
      return;
    }

    const assignmentsToSend = assignments.map(assign => {
      if (assign.status === 'Absent' || assign.status === 'Leave') {
        return {
          operatorId: assign.operatorId,
          status: assign.status,
          machineId: null,
          processId: null,
          uniqueMachineId: null, // Send null for uniqueMachineId
          targetProduction: 0,
        };
      }
      return {
        operatorId: assign.operatorId,
        status: assign.status,
        machineId: assign.machineId,
        processId: assign.processId,
        uniqueMachineId: assign.uniqueMachineId, // Include uniqueMachineId
        targetProduction: assign.targetProduction,
      };
    });

    try {
      const response = await fetch('/api/daily-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          sewingLineId: selectedLineId,
          assignments: assignmentsToSend,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Daily plan saved successfully!');
        fetchDailyAssignments();
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to save daily plan. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please check your connection.');
      console.error('Error saving daily plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOperatorDetails = useCallback((operatorId: string) => {
    const foundOperator = searchResults.find(op => op._id === operatorId) || null;
    return foundOperator;
  }, [searchResults]);

  if (sewingLines.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-red-600">No sewing lines found. Please add a sewing line first.</p>
        <Link href="/supervisor/sewing-lines/new" className="text-blue-500 hover:underline mt-2 inline-block">
          Add Sewing Line
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Supervisor's Daily Planning</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="selectedDate" className="block text-gray-700 text-sm font-bold mb-2">
              Select Date:
            </label>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            />
          </div>
          <div>
            <label htmlFor="selectedLine" className="block text-gray-700 text-sm font-bold mb-2">
              Select Sewing Line:
            </label>
            <select
              id="selectedLine"
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            >
              <option value="">-- Select a Line --</option>
              {sewingLines.map((line) => (
                <option key={line._id} value={line._id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Search & Add Operators</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search operator by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Search Results:</h3>
            <ul className="space-y-2">
              {searchResults.map((op) => (
                <li key={op._id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                  <div>
                    <span className="font-bold">{op.name}</span> ({op.operatorId})
                  </div>
                  <button
                    type="button"
                    onClick={() => addOperatorToPlan(op)}
                    className="bg-green-500 hover:bg-green-700 text-white p-2 rounded-full"
                    title="Add to plan"
                  >
                    <FaPlus />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Assign Operators</h2>

        {(selectedLineId) ? (
          isFetchingAssignments ? (
            <p className="text-center py-4">Loading assignments for this date and line...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 border-b border-gray-200">Operator ID & Name</th>
                    <th className="py-3 px-6 border-b border-gray-200">Status</th>
                    <th className="py-3 px-6 border-b border-gray-200">Machine Type</th> {/* New Header */}
                    <th className="py-3 px-6 border-b border-gray-200">Unique ID</th>     {/* New Header */}
                    <th className="py-3 px-6 border-b border-gray-200">Process</th>
                    <th className="py-3 px-6 border-b border-gray-200">Target</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {assignments.length > 0 ? assignments.map((assignment, index) => {
                    const operator = getOperatorDetails(assignment.operatorId); // Fetch operator details from search results or other source
                    const isPresent = assignment.status === 'Present';

                    if (!operator) {
                      return null; // Don't render if operator details are not found
                    }

                    const operatorSkilledMachines = availableMachines.filter(machine =>
                      operator.skills.machines.some((opSkillMachine: IMachine) => opSkillMachine._id === machine._id)
                    );
                    const operatorSkilledProcesses = availableProcesses.filter(process =>
                      operator.skills.processes.some((opSkillProcess: IProcess) => opSkillProcess._id === process._id)
                    );

                    // Find the name of the currently selected sewing line
                    const currentSelectedLine = sewingLines.find(line => line._id === selectedLineId);

                    // Filter unique machines based on the selected machine type AND the name of the selected line
                    const filteredUniqueMachines = uniqueMachines.filter(
                      (um) => um.machineType._id === assignment.machineId && currentSelectedLine && um.line === currentSelectedLine.name
                    );

                    return (
                      <tr key={operator._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 whitespace-nowrap">
                          {operator.operatorId} - {operator.name}
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={assignment.status}
                            onChange={(e) => handleAssignmentChange(assignment.operatorId, 'status', e.target.value as 'Present' | 'Absent' | 'Leave')}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight text-sm"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={assignment.machineId || ''}
                            onChange={(e) => handleAssignmentChange(assignment.operatorId, 'machineId', e.target.value)}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight text-sm"
                            disabled={!isPresent}
                          >
                            <option value="">-- Select Machine Type --</option>
                            {operatorSkilledMachines.map((machine) => (
                              <option key={machine._id} value={machine._id}>{machine.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={assignment.uniqueMachineId || ''}
                            onChange={(e) => handleAssignmentChange(assignment.operatorId, 'uniqueMachineId', e.target.value)}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight text-sm"
                            disabled={!isPresent || !assignment.machineId} // Disable if not present or no machine type selected
                          >
                            <option value="">-- Select Unique ID --</option>
                            {filteredUniqueMachines.map((um) => (
                              <option key={um._id} value={um._id}>
                                {um.uniqueId} ({um.floor} - {um.line})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={assignment.processId || ''}
                            onChange={(e) => handleAssignmentChange(assignment.operatorId, 'processId', e.target.value)}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight text-sm"
                            disabled={!isPresent}
                          >
                            <option value="">-- Select Process --</option>
                            {operatorSkilledProcesses.map((process) => (
                              <option key={process._id} value={process._id}>{process.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="number"
                            min="0"
                            value={assignment.targetProduction}
                            onChange={(e) => handleAssignmentChange(assignment.operatorId, 'targetProduction', e.target.value)}
                            className="shadow appearance-none border rounded w-24 py-1 px-2 text-gray-700 leading-tight text-sm"
                            disabled={!isPresent}
                          />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">
                        No operators assigned to this line yet. Use the search bar above to add them.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p className="text-center text-gray-600 mt-8">
            Please select a date and a sewing line to view or create assignments.
          </p>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isLoading || isFetchingAssignments || !selectedLineId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || isFetchingAssignments || !selectedLineId}
          >
            {isLoading ? 'Saving Plan...' : 'Save Daily Plan'}
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
