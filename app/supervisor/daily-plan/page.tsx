// src/app/supervisor/daily-plan/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface IAssignmentFormState {
  operatorId: string; // The _id of the operator
  status: 'Present' | 'Absent' | 'Leave';
  machineId: string; // The _id of the selected machine
  processId: string; // The _id of the selected process
  targetProduction: number;
}

export default function DailyPlanPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [sewingLines, setSewingLines] = useState<ISewingLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState('');
  const [allOperators, setAllOperators] = useState<IOperator[]>([]);
  const [availableMachines, setAvailableMachines] = useState<IMachine[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<IProcess[]>([]);
  const [assignments, setAssignments] = useState<IAssignmentFormState[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);

  // 1. Fetch all necessary master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [linesRes, operatorsRes, machinesRes, processesRes] = await Promise.all([
          fetch('/api/sewing-lines'),
          fetch('/api/operators'),
          fetch('/api/machines'),
          fetch('/api/processes'),
        ]);

        const linesData = await linesRes.json();
        const operatorsData = await operatorsRes.json();
        const machinesData = await machinesRes.json();
        const processesData = await processesRes.json();

        if (linesRes.ok) setSewingLines(linesData);
        else console.error('Failed to fetch sewing lines:', linesData.message);

        if (operatorsRes.ok) setAllOperators(operatorsData);
        else console.error('Failed to fetch operators:', operatorsData.message);

        if (machinesRes.ok) setAvailableMachines(machinesData);
        else console.error('Failed to fetch machines:', machinesData.message);

        if (processesRes.ok) setAvailableProcesses(processesData);
        else console.error('Failed to fetch processes:', processesData.message);

      } catch (error) {
        console.error('Error fetching master data:', error);
        setMessage('Error loading essential data. Please refresh.');
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchMasterData();
  }, []);

  // 2. Fetch existing daily assignments when date or line changes
  const fetchDailyAssignments = useCallback(async () => {
    if (!selectedLineId || !selectedDate) {
      setAssignments([]); // Clear assignments if no line/date selected
      return;
    }

    setIsFetchingAssignments(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`/api/daily-assignments?date=${selectedDate}&sewingLineId=${selectedLineId}`);
      const data = await response.json();

      if (response.ok) {
        // Map fetched assignments to our form state format
        const loadedAssignments: IAssignmentFormState[] = data.assignments.map((assign: any) => ({
          operatorId: assign.operator._id, // populated operator _id
          status: assign.status,
          machineId: assign.machine ? assign.machine._id : '', // populated machine _id or empty
          processId: assign.process ? assign.process._id : '', // populated process _id or empty
          targetProduction: assign.targetProduction || 0,
        }));
        setAssignments(loadedAssignments);
        setMessage('Existing plan loaded successfully.');
        setIsSuccess(true);
      } else if (response.status === 404) {
        // If no assignment found, initialize new assignments for all operators
        const initialAssignments = allOperators.map(op => ({
          operatorId: op._id,
          status: 'Absent' as 'Absent', // Default to Absent
          machineId: '',
          processId: '',
          targetProduction: 0,
        }));
        setAssignments(initialAssignments);
        setMessage('No existing plan found for this date and line. Initializing new plan.');
        setIsSuccess(false); // Not an error, but not a success of loading either
      } else {
        setMessage(data.message || 'Failed to load existing plan.');
        setIsSuccess(false);
        setAssignments([]); // Clear if error
      }
    } catch (error) {
      console.error('Error fetching daily assignments:', error);
      setMessage('An error occurred while fetching assignments.');
      setIsSuccess(false);
      setAssignments([]); // Clear if error
    } finally {
      setIsFetchingAssignments(false);
    }
  }, [selectedDate, selectedLineId, allOperators]); // Depend on allOperators too

  useEffect(() => {
    if (!isFetchingInitialData) { // Only fetch assignments after master data is loaded
      fetchDailyAssignments();
    }
  }, [selectedDate, selectedLineId, isFetchingInitialData, fetchDailyAssignments]);


  const handleAssignmentChange = (
    operatorIndex: number,
    field: keyof IAssignmentFormState,
    value: any
  ) => {
    setAssignments(prevAssignments => {
      const newAssignments = [...prevAssignments];
      const currentAssignment = { ...newAssignments[operatorIndex] };

      // Specific logic for status change
      if (field === 'status') {
        currentAssignment.status = value;
        // If operator is absent or on leave, clear machine/process/target
        if (value === 'Absent' || value === 'Leave') {
          currentAssignment.machineId = '';
          currentAssignment.processId = '';
          currentAssignment.targetProduction = 0;
        }
      } else if (field === 'targetProduction') {
        currentAssignment.targetProduction = Number(value);
      }
      else {
        (currentAssignment as any)[field] = value;
      }
      
      newAssignments[operatorIndex] = currentAssignment;
      return newAssignments;
    });
  };

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

    // Filter out assignments for absent/leave operators that might have stray machine/process values
    const assignmentsToSend = assignments.map(assign => {
      if (assign.status === 'Absent' || assign.status === 'Leave') {
        return {
          operatorId: assign.operatorId,
          status: assign.status,
          machineId: null, // Explicitly null for absent/leave
          processId: null, // Explicitly null for absent/leave
          targetProduction: 0, // Explicitly 0 for absent/leave
        };
      }
      return {
        operatorId: assign.operatorId,
        status: assign.status,
        machineId: assign.machineId,
        processId: assign.processId,
        targetProduction: assign.targetProduction,
      };
    });


    try {
      const response = await fetch('/api/daily-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Re-fetch assignments to ensure displayed data matches saved data (especially if IDs get populated)
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

  if (isFetchingInitialData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading essential data (lines, operators, machines, processes)...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Supervisor's Daily Planning</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="selectedDate" className="block text-gray-700 text-sm font-bold mb-2">
              Select Date:
            </label>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

      {(selectedLineId && allOperators.length > 0) ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          {isFetchingAssignments ? (
            <p className="text-center py-4">Loading assignments for this date and line...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 border-b border-gray-200">Operator ID & Name</th>
                    <th className="py-3 px-6 border-b border-gray-200">Status</th>
                    <th className="py-3 px-6 border-b border-gray-200">Machine</th>
                    <th className="py-3 px-6 border-b border-gray-200">Process</th>
                    <th className="py-3 px-6 border-b border-gray-200">Target</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {allOperators.map((operator, index) => {
                    // Find the current assignment for this operator in the state
                    const currentAssignment = assignments.find(
                      (assign) => assign.operatorId === operator._id
                    );
                    const isPresent = currentAssignment?.status === 'Present';

                    // Filter machines and processes based on operator's skills
                    const operatorSkilledMachines = availableMachines.filter(machine =>
                      operator.skills.machines.some((opSkillMachine: IMachine) => opSkillMachine._id === machine._id)
                    );
                    const operatorSkilledProcesses = availableProcesses.filter(process =>
                      operator.skills.processes.some((opSkillProcess: IProcess) => opSkillProcess._id === process._id)
                    );

                    return (
                      <tr key={operator._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 whitespace-nowrap">
                          {operator.operatorId} - {operator.name}
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={currentAssignment?.status || 'Absent'}
                            onChange={(e) => handleAssignmentChange(index, 'status', e.target.value as 'Present' | 'Absent' | 'Leave')}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={currentAssignment?.machineId || ''}
                            onChange={(e) => handleAssignmentChange(index, 'machineId', e.target.value)}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={!isPresent}
                          >
                            <option value="">-- Select Machine --</option>
                            {operatorSkilledMachines.map((machine) => (
                              <option key={machine._id} value={machine._id}>
                                {machine.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={currentAssignment?.processId || ''}
                            onChange={(e) => handleAssignmentChange(index, 'processId', e.target.value)}
                            className="shadow border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={!isPresent}
                          >
                            <option value="">-- Select Process --</option>
                            {operatorSkilledProcesses.map((process) => (
                              <option key={process._id} value={process._id}>
                                {process.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="number"
                            min="0"
                            value={currentAssignment?.targetProduction || 0}
                            onChange={(e) => handleAssignmentChange(index, 'targetProduction', e.target.value)}
                            className="shadow appearance-none border rounded w-24 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={!isPresent}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isLoading || isFetchingAssignments ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || isFetchingAssignments}
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
      ) : (
        <p className="text-center text-gray-600 mt-8">
          Please select a date and a sewing line to begin planning.
          {allOperators.length === 0 && <span className="block mt-2 text-red-500">No operators found. Please add operators first.</span>}
        </p>
      )}
    </div>
  );
}