import { useState, useEffect } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";

const ChartVitals = () => {
    const [formData, setFormData] = useState({
        bloodPressure: "",
        temperature: "",
        pulse: "",
        oxygenSaturation: "",
        pain: "",
        patientId: null,
    });
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [patientManagers, setPatientManagers] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        setLoadingPatients(true);
        getpatientManagers(userId)
            .then((data) => {
                setPatientManagers(data?.responseObject || []);
            })
            .catch(() => {})
            .finally(() => setLoadingPatients(false));
    }, []);

    const handleUpdateClick = (patientId) => {
        setFormData((prev) => ({ ...prev, patientId }));
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            bloodPressure: formData.bloodPressure,
            temperature: parseFloat(formData.temperature),
            pulse: parseInt(formData.pulse, 10),
            oxygenSaturation: parseInt(formData.oxygenSaturation, 10),
            pain: formData.pain || "N/A",
            patientId: formData.patientId,
        };
        console.log("Submitted Payload:", payload);
        setShowForm(false);
    };

    return (
        <div className="max-w-lg mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Chart Vitals</h2>
            {loadingPatients ? (
                <div className="flex justify-center items-center h-64">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {patientManagers.map(({ patient }) => (
                        <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left relative">
                            <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
                            <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
                            <p className="text-sm font-bold text-gray-400">DOB: {patient.dateOfBirth}</p>
                            <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
                            <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>
                            <div className="flex justify-center mt-4">
                                <button
                                    className="px-4 py-2 border border-green-500 text-green-600 rounded-md hover:bg-green-100"
                                    onClick={() => handleUpdateClick(patient.patientId)}
                                >
                                    Vitals
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Enter Vitals</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="hidden" name="patientId" value={formData.patientId} />
                            <div>
                                <label className="block text-gray-300">Blood Pressure (e.g. 120/80)</label>
                                <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="120/80" />
                            </div>
                            <div>
                                <label className="block text-gray-300">Temperature (°F)</label>
                                <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="98" />
                            </div>
                            <div>
                                <label className="block text-gray-300">Pulse (bpm)</label>
                                <input type="number" name="pulse" value={formData.pulse} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="75" />
                            </div>
                            <div>
                                <label className="block text-gray-300">Oxygen Saturation (%)</label>
                                <input type="number" name="oxygenSaturation" value={formData.oxygenSaturation} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="98" />
                            </div>
                            <div>
                                <label className="block text-gray-300">Pain (Optional)</label>
                                <textarea name="pain" value={formData.pain} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Describe pain level..." />
                            </div>
                            <div className="flex justify-between">
                                <button type="button" className="px-4 py-2 bg-red-600 rounded" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartVitals;
