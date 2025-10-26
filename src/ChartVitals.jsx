import { useState, useEffect } from "react";
import { fetchPatients } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";
import { postVitals } from "../services/postVitals";
import { errorHandler } from "../services/errorHandler";
import { getData } from "../services/updatedata";
import { Loader } from "lucide-react";
import PendingVitals from "./PendingVitals";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const URL = `${BASE_URL}/late-submissions`;

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
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isTimeAllowed, setIsTimeAllowed] = useState(true);
    const [patients, setPatients] = useState([]);
    const [blink, setBlink] = useState(true);
    const [patientId, setPatientId] = useState(null);
    const [showVitals, setShowVitals] = useState(false);
    const [lateSubmission, setLateSubmission] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reasonFilledLate, setReasonFilledLate] = useState("");
    const [loadingLate, setLoadingLate] = useState(false);

    useEffect(() => {
        const careGiver = localStorage.getItem("userId");
        const type = "vital";
    
        if (!patientId || !careGiver) return;
        setLoadingLate(true);
    
        const queryParams = new URLSearchParams({
          patient: patientId,
          careGiver,
          type,
        }).toString();
    
        getData(`${URL}?${queryParams}`)
          .then((data) => {
              setLateSubmission(data.responseObject || []);
          })
          .catch(() => {})
          .finally(() => setLoadingLate(false))
      }, [patientId]);

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        
        // Check if current time is between 8:00 AM - 9:59 AM
        let isValid = hour >= 8 && hour < 10;
    
        // Check if any late submission period is valid
        if (!isValid && lateSubmission.length) {
            isValid = lateSubmission.some((entry) => {
                const startTime = new Date(entry.start);
                const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                return now >= startTime && now <= endTime;
            });
        }
    
        setIsTimeAllowed(isValid);
    }, [lateSubmission]);
    

    useEffect(() => {
        const branch = localStorage.getItem("branch");
        if (!branch) return;
        setLoadingPatients(true);
        fetchPatients(branch)
            .then((data) => {
                setPatients(data?.responseObject || []);
            })
            .catch(() => {})
            .finally(() => setLoadingPatients(false));
    }, []);

    const handleUpdateClick = (patientId) => {
        setPatientId(patientId);
        setFormData((prev) => ({ ...prev, patientId }));
        setShowForm(true);
        setShowVitals(false);
    };

    const handleReviewVitals = (patientId) =>{
        setPatientId(patientId);
        setShowVitals(true);
        setShowForm(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getFormattedDate = (selectedDate) => {
        if (!selectedDate) {
            return new Date().toISOString();
        }
        
        const date = new Date(selectedDate);
        date.setHours(8, 0, 0, 0); 
        return date.toISOString();
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
            dateTaken: getFormattedDate(selectedDate),
            reasonFilledLate
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

    const closeVitalsReviewModal = () => {
        setShowVitals(false);
    };

    useEffect(() => {
        const interval = setInterval(() => {
          setBlink((prev) => !prev);
        }, 1000); 
    
        return () => clearInterval(interval);
      }, []);

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-center">Chart Vitals</h2>
            {loadingLate && (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin" size={32} />
                    <p>Loading...</p>
                </div>
            )}
            {loadingPatients ? (
                <>
                    <Loader className="animate-spin text-blue-400" size={24} />
                    <div className="flex justify-center items-center h-64">Loading Residents...</div>
                </>
               
            ) : (
                <div className="grid md:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                        <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left">
                            <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
                            <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
                            <p className="text-sm font-bold text-gray-400">
                                DOB: {new Date(patient.dateOfBirth + "T00:00:00").toLocaleDateString("en-US")}</p>
                            <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
                            <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    className="px-4 py-2 border border-green-500 text-green-600 rounded-md hover:bg-green-100"
                                    onClick={() => handleUpdateClick(patient.patientId)}
                                >
                                    New Vitals
                                </button>
                                <button
                                    className="px-4 py-2 border border-green-500 text-green-600 rounded-md hover:bg-green-100"
                                    onClick={() => handleReviewVitals(patient.patientId)}
                                >
                                    Pending Vitals
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && !showVitals && (
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
                        {lateSubmission.length > 0 && isTimeAllowed && (
                            <>
                                <div className="mb-4">
                                    {lateSubmission
                                    .filter((entry) => {
                                        const now = new Date();
                                        const startTime = new Date(entry.start);
                                        const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                                        return now >= startTime && now <= endTime; 
                                    })
                                    .map((entry) => {
                                        const startTime = new Date(entry.start);
                                        const endTime = new Date(startTime.getTime() + entry.duration * 60000);
                                        return (
                                        <div key={entry.start} className="mb-2">
                                            <p className="text-red-600">{entry.reasonForLateSubmission}</p>
                                            <label className="text-red-600">
                                            Submission starts at {startTime.toLocaleString()} and will end by {endTime.toLocaleString()}
                                            </label>
                                        </div>
                                        );
                                    })}
                                    <br />
                                    <label className="block text-sm font-medium text-white mb-2">
                                    Select Date & Time (from 8.00 AM - 9:59AM) for Late Submission:
                                    </label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) => setSelectedDate(date)}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="yyyy-MM-dd HH:mm:ss"
                                        minTime={dayjs().set("hour", 8).set("minute", 0).toDate()}
                                        maxTime={dayjs().set("hour", 9).set("minute", 59).toDate()}
                                        // filterDate={isValidDate}
                                        className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Reason for Late Submission (Required):
                                </label>
                                <textarea
                                    value={reasonFilledLate}
                                    onChange={(e) => setReasonFilledLate(e.target.value)}
                                    placeholder="Enter reason here..."
                                    className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                                    required
                                />
                            </div>
                            </>
                            )}

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
                            {!isTimeAllowed && (
                                <p className={`mb-2 text-red-500 ${blink ? "opacity-100" : "opacity-0"}`}>
                                
                                </p>
                            )}
                            {!isTimeAllowed && (
                                <div className="mt-2 mb-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-md">
                                <p className={`text-xl md:text-2xl font-bold text-red-600 ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-500 flex items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    CHART ENTRY RESTRICTED
                                </p>
                                <p className="text-lg md:text-xl text-red-800 mt-2 font-medium">
                                    Vitals entries should be done from <span className="underline font-bold">8:00 AM</span> to <span className="underline font-bold">9:59 AM</span>.
                                </p>
                                </div>
                            )}
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-600 rounded"
                                    onClick={closeVitalsModal}
                                >
                                    ✖ Close
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded ${isTimeAllowed ? "bg-blue-600" : "bg-gray-500 cursor-not-allowed"}`}
                                    disabled={!isTimeAllowed || loading}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showVitals && patientId && !showForm &&(
            <div
                className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
                onClick={closeVitalsReviewModal}
            >
                <div
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                >
                <PendingVitals patient={patientId} />
                <button
                    className="absolute top-2 right-2 text-white hover:text-gray-400"
                    onClick={closeVitalsReviewModal}
                >
                    ✖
                </button>
                </div>
            </div>
            )}
        </div>
    );
};

export default ChartVitals;
