import { useState, useEffect } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";
import { postVitals } from "../services/postVitals";
import { errorHandler } from "../services/errorHandler";

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
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return
        setLoading(true);
        const payload = {
            bloodPressure: formData.bloodPressure,
            temperature: parseFloat(formData.temperature),
            pulse: parseInt(formData.pulse, 10),
            oxygenSaturation: parseInt(formData.oxygenSaturation, 10),
            pain: formData.pain || "N/A",
            patient: formData.patientId,
            dateTaken: new Date().toISOString(),
        };
        try {
            const response = await postVitals(payload);
            if (response?.error) {
            setErrors(errorHandler(response.error));
            setTimeout(() => setErrors([]), 5000);
            } else {
                setFormData({
                    bloodPressure: "",
                    temperature: "",
                    pulse: "",
                    oxygenSaturation: "",
                    pain: "",
                    patientId: null,
                })
            setMessage("Vitals Updated successfully")
            setTimeout(() => setMessage(""), 10000);
            setTimeout(() => setShowForm(false), 10000);
            }
        } catch (error) {
            setErrors([`Errors: ${error}`]);
            setTimeout(() => setErrors([]), 5000);
        } finally {
            setLoading(false);
        }
    };

    const closeVitalsModal = () => {
        setShowForm(false);
      };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-center">Chart Vitals</h2>
            {loadingPatients ? (
                <div className="flex justify-center items-center h-64">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {patientManagers.map(({ patient }) => (
                        <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left">
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
                <div
                    className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
                    onClick={closeVitalsModal}
                >
                    <div
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    >
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
                            {message && <p className="text-green-600">{message}</p>}
                            {errors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-800 rounded">
                                {errors.map((error, index) => (
                                    <p key={index} className="text-sm text-white">{error}</p>
                                ))}
                                </div>
                            )}
                            <div className="flex justify-between">
                                <button type="button" className="px-4 py-2 bg-red-600 rounded" onClick={() => closeAppointmentModal(false)}>✖</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 rounded">{loading ? "Submitting" : "Submit" }</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartVitals;
