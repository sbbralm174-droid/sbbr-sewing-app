// components/OperatorsTable.tsx
'use client';

import { useEffect, useState } from 'react';

interface Process {
  _id: string;
  processName: string;
}

interface Operator {
  _id: string;
  operatorId: string;
  name: string;
  contactNumber: string;
  skills: {
    processes: Process[];
    machines: any[];
  };
}

export default function OperatorsTable() {
  const [operators, setOperators] = useState<Operator[]>([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch('/api/operators');
        const data = await res.json();
        setOperators(data);
      } catch (err) {
        console.error('Failed to load operators:', err);
      }
    };

    fetchOperators();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Operators</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Operator ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Contact</th>
            <th className="p-2 border">Skilled Processes</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>
        <tbody>
          {operators.map((operator) => (
            <tr key={operator._id}>
              <td className="p-2 border">{operator.operatorId}</td>
              <td className="p-2 border">{operator.name}</td>
              <td className="p-2 border">{operator.contactNumber}</td>
              <td className="p-2 border">
                {operator.skills?.processes?.length > 0
                  ? operator.skills.processes.map((p) => p.processName).join(', ')
                  : 'No Skills'}
              </td>
              <td className="p-2 border">
                <a href={`/operators/${operator._id}`} className="text-blue-600 underline">
                  View Details
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
