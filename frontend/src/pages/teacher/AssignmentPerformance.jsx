import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_API } from '../../lib/apiConfig';
import { ArrowLeft, FileSpreadsheet } from "lucide-react";

const AssignmentPerformance = () => {
  const { domainId } = useParams();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_API}/api/quiz-sessions/performance/${domainId}`)
      .then(res => res.json())
      .then(data => setStats(data.data || []));
  }, [domainId]);

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => window.history.back()}><ArrowLeft /></button>
        <h1 className="text-3xl font-bold">Student Performance</h1>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student Email</th>
              <th className="p-4">Score</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-4 font-medium">{s.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${s.payload?.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.payload?.score}%
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(s.attemptedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentPerformance;