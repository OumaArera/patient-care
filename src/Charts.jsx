import React, { useState, useEffect } from 'react';
import { fetchPatients } from '../services/fetchPatients';
import { getCharts } from '../services/getCharts';
import { updateChartStatus } from '../services/updateCharts';
import { errorHandler } from '../services/errorHandler';
import ChartCard from './ChartCard';

const Charts = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [charts, setCharts] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [showChartCard, setShowChartCard] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState({});
  
  useEffect(() => {
    setLoadingPatients(true);
    fetchPatients().then((data) => {
      setPatients(data?.responseObject || []);
      setLoadingPatients(false);
    }).catch(() => setLoadingPatients(false));
  }, []);
  
  const handleSelectPatient = (e) => {
    const patientId = e.target.value;
    if (!patientId) return;
    setSelectedPatient(patientId);
    fetchCharts(patientId);
  };

  const fetchCharts = (patientId) => {
    setLoadingCharts(true);
    getCharts({ patient: patientId }).then(data => {
      setCharts(data?.responseObject || []);
      setLoadingCharts(false);
    }).catch(() => setLoadingCharts(false));
  };

  const handleChartUpdate = async (chartId) => {
    if (!selectedStatus[chartId]) return;
    setSubmitting(true);
    try {
      const response = await updateChartStatus(chartId, selectedStatus[chartId]);
      if (response?.error) {
        setErrors(errorHandler(response.error));
        setTimeout(() => setErrors(null), 5000);
      } else {
        setMessage("Chart data updated successfully.");
        setTimeout(() => setMessage(null), 5000);
        fetchCharts(selectedPatient);
      }
    } catch (err) {
      setErrors(["Something went wrong. Please try again."]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const last20Days = [...Array(20)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div>
      <h2>Patient Charts</h2>
      {loadingPatients ? <p>Loading patients...</p> : (
        <select onChange={handleSelectPatient} value={selectedPatient || ''}>
          <option value="">Select Patient</option>
          {patients.map(patient => (
            <option key={patient.patientId} value={patient.patientId}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      )}
      {message && <p className="text-green-600">{message}</p>}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-800 rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-white">{error}</p>
          ))}
        </div>
      )}
      
      {selectedPatient && (
        <>
          {loadingCharts ? <p>Loading charts...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Reason Not Filed</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {last20Days.map(date => {
                  const chart = charts.find(c => c.dateTaken.startsWith(date));
                  return (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{chart ? chart.patientName : 'Missing'}</td>
                      <td>{chart ? chart.status : 'Missing'}</td>
                      <td style={{ color: chart?.reasonNotFiled ? 'black' : 'gray' }}>
                        {chart?.reasonNotFiled || '—'}
                      </td>
                      <td>
                        {chart && <button onClick={() => { setShowChartCard(true); setSelectedChart(chart); }}>View</button>}
                      </td>
                      <td>
                        {chart && (
                          <>
                            <button onClick={() => setStatusMenu(chart.chartId)}>⋮</button>
                            {statusMenu === chart.chartId && (
                              <div>
                                <select 
                                  value={selectedStatus[chart.chartId] || ''} 
                                  onChange={(e) => setSelectedStatus({ ...selectedStatus, [chart.chartId]: e.target.value })}
                                >
                                  <option value="">Select</option>
                                  {chart.status !== 'approved' && <option value="approved">Approve</option>}
                                  <option value="declined">Decline</option>
                                </select>
                                <button 
                                  onClick={() => handleChartUpdate(chart.chartId)} 
                                  disabled={submitting || !selectedStatus[chart.chartId]}
                                >
                                  {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button onClick={() => setStatusMenu(null)}>Close</button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
      
      {showChartCard && selectedChart && (
        <ChartCard chart={selectedChart} onClose={() => setShowChartCard(false)} />
      )}
    </div>
  );
};

export default Charts;