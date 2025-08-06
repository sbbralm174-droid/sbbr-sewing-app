// src/app/supervisor/production/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ISewingLine {
  _id: string;
  name: string;
}

interface IOperatorAssignment {
  _id: string;
  operator: { _id: string; name: string };
  machine: { _id: string; name: string };
  process: { _id: string; name: string };
  status: 'Present' | 'Absent' | 'Leave';
}

interface IDailyAssignment {
  _id: string;
  date: string; // ISO date string
  sewingLine: ISewingLine;
  assignments: IOperatorAssignment[];
}

export default function ProductionEntryPage() {
  const router = useRouter();
  const [sewingLines, setSewingLines] = useState<ISewingLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAssignment, setDailyAssignment] = useState<IDailyAssignment | null>(null);
  const [hourlyCounts, setHourlyCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [fetchingAssignments, setFetchingAssignments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all sewing lines
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch('/api/sewing-lines');
        const data = await res.json();
        if (res.ok) {
          setSewingLines(data);
          if (data.length > 0) {
            setSelectedLineId(data[0]._id); // Select the first line by default
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLines();
  }, []);

  // Fetch daily assignments when line or date changes
  useEffect(() => {
    if (selectedLineId && selectedDate) {
      const fetchAssignments = async () => {
        setFetchingAssignments(true);
        try {
          const res = await fetch(`/api/daily-assignments?date=${selectedDate}&sewingLineId=${selectedLineId}`);
          const data = await res.json();
          if (res.ok && data) {
            setDailyAssignment(data);
            setMessage('');
            // Initialize hourly counts based on the current hour
            const currentHour = new Date().getHours();
            const initialCounts: { [key: string]: number } = {};
            data.assignments.filter((a: any) => a.status === 'Present').forEach((assignment: any) => {
              initialCounts[assignment.operator._id] = 0;
            });
            setHourlyCounts(initialCounts);
          } else {
            setDailyAssignment(null);
            setMessage('No daily plan found for this date and line. Please create one first.');
          }
        } finally {
          setFetchingAssignments(false);
        }
      };
      fetchAssignments();
    }
  }, [selectedLineId, selectedDate]);

  const handleCountChange = (operatorId: string, count: number) => {
    setHourlyCounts(prev => ({
      ...prev,
      [operatorId]: count,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    if (!dailyAssignment) {
      setMessage('Cannot submit. No daily assignment selected.');
      setSubmitting(false);
      return;
    }

    // Get the current hour to save the production data
    const currentHour = new Date().getHours();

    const productionPromises = dailyAssignment.assignments
      .filter(a => a.status === 'Present')
      .map(assignment => {
        const count = hourlyCounts[assignment.operator._id] || 0;
        const payload = {
          dailyAssignmentId: dailyAssignment._id,
          operatorId: assignment.operator._id,
          sewingLineId: dailyAssignment.sewingLine._id,
          machineId: assignment.machine._id,
          processId: assignment.process._id,
          hour: currentHour, // Save production for the current hour
          count: count,
        };
        return fetch('/api/production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      });

    try {
      const responses = await Promise.all(productionPromises);
      const allSuccess = responses.every(res => res.ok);

      if (allSuccess) {
        setMessage('Production data saved successfully!');
        // You might want to clear counts or refresh the page here
      } else {
        const errorData = await Promise.all(responses.map(res => res.json()));
        console.error('Submission errors:', errorData);
        setMessage('Failed to save some production data. Check console for details.');
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setMessage('An error occurred while submitting production data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Production Data Entry</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sewingLine" className="block text-gray-700 text-sm font-bold mb-2">
              Select Sewing Line:
            </label>
            <select
              id="sewingLine"
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {sewingLines.map((line) => (
                <option key={line._id} value={line._id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      </div>
      
      {fetchingAssignments ? (
        <div className="text-center mt-8">Loading daily plan...</div>
      ) : dailyAssignment ? (
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Production for {dailyAssignment.sewingLine.name} on {new Date(dailyAssignment.date).toLocaleDateString()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyAssignment.assignments
                .filter(a => a.status === 'Present')
                .map((assignment) => (
                  <div key={assignment._id} className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg">{assignment.operator.name}</h3>
                    <p className="text-sm text-gray-600">Process: {assignment.process.name}</p>
                    <p className="text-sm text-gray-600">Machine: {assignment.machine.name}</p>
                    <div className="mt-2">
                      <label htmlFor={`count-${assignment._id}`} className="block text-sm font-medium text-gray-700">
                        Hourly Count:
                      </label>
                      <input
                        type="number"
                        id={`count-${assignment._id}`}
                        value={hourlyCounts[assignment.operator._id] || ''}
                        onChange={(e) => handleCountChange(assignment.operator._id, parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
            </div>
            {dailyAssignment.assignments.filter(a => a.status === 'Present').length === 0 && (
              <p className="text-center text-gray-600 mt-4">No present operators assigned for this day.</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={submitting || !dailyAssignment || dailyAssignment.assignments.filter(a => a.status === 'Present').length === 0}
          >
            {submitting ? 'Submitting...' : `Save Production for ${new Date().getHours()}:00 - ${new Date().getHours() + 1}:00`}
          </button>
          {message && (
            <p className={`mt-4 text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      ) : (
        <div className="text-center mt-8 text-gray-600">
          No daily plan found for this date and line. Please select a valid date and line.
        </div>
      )}
    </div>
  );
}