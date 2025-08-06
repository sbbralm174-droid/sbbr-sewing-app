// src/app/supervisor/report/daily/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ISewingLine {
  _id: string;
  name: string;
}

interface IOperator {
  _id: string;
  name: string;
  operatorId: string;
}

interface IMachine {
  _id: string;
  name: string;
}

interface IProcess {
  _id: string;
  name: string;
}

interface IHourlyProduction {
  hour: number;
  count: number;
  timestamp: string;
}

interface IProductionRecord {
  _id: string;
  operator: IOperator;
  machine: IMachine;
  process: IProcess;
  sewingLine: string;
  hourlyProduction: IHourlyProduction[];
  totalProduction: number;
}

export default function DailyProductionReportPage() {
  const [sewingLines, setSewingLines] = useState<ISewingLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionData, setProductionData] = useState<IProductionRecord[] | null>(null);
  const [loadingLines, setLoadingLines] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all sewing lines on page load
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch('/api/sewing-lines');
        const data = await res.json();
        if (res.ok) {
          setSewingLines(data);
          if (data.length > 0) {
            setSelectedLineId(data[0]._id);
          }
        }
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
  }, []);

  // Fetch report data when line or date changes
  useEffect(() => {
    if (selectedLineId && selectedDate) {
      fetchReportData();
    }
  }, [selectedLineId, selectedDate]);

  const fetchReportData = async () => {
    setLoadingReport(true);
    setMessage('');
    try {
      const res = await fetch(`/api/daily-production?date=${selectedDate}&sewingLineId=${selectedLineId}`);
      const data = await res.json();
      if (res.ok) {
        setProductionData(data);
      } else {
        setProductionData(null);
        setMessage(data.message || 'No data found for the selected date and line.');
      }
    } catch (err) {
      console.error('Error fetching production report:', err);
      setMessage('An error occurred while fetching the report.');
    } finally {
      setLoadingReport(false);
    }
  };

  const getHourlyCount = (hourlyData: IHourlyProduction[], hour: number) => {
    const record = hourlyData.find(h => h.hour === hour);
    return record ? record.count : 0;
  };

  if (loadingLines) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8 AM to 5 PM

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Daily Production Report</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center justify-center">
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
      </div>

      {loadingReport ? (
        <div className="text-center mt-8">Loading report...</div>
      ) : message ? (
        <div className="text-center mt-8 text-red-600">{message}</div>
      ) : productionData && productionData.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold px-6 py-4 border-b">
            Report for {sewingLines.find(l => l._id === selectedLineId)?.name} on {new Date(selectedDate).toLocaleDateString()}
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator Name (ID)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine
                </th>
                {hours.map(hour => (
                  <th key={hour} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {hour}:00
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productionData.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.operator.name} ({record.operator.operatorId})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.process.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.machine.name}
                  </td>
                  {hours.map(hour => (
                    <td key={hour} className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {getHourlyCount(record.hourlyProduction, hour)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-900">
                    {record.totalProduction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center mt-8 text-gray-600">
          Please select a valid date and line to view the report.
        </div>
      )}
    </div>
  );
}