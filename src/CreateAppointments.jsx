import React, { useState, useEffect } from "react";
import { fetchPatients } from "../services/fetchPatients";
import { errorHandler } from "../services/errorHandler";
import { postAppointments } from "../services/postAppointments";
import { Loader, PlusCircle, Trash2 } from "lucide-react";

const CreateAppointments = () => {
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState('');
    const [appointments, setAppointments] = useState({
        weeklyAppointments: [],
        fortnightAppointments: [],
        monthlyAppointments: []
    });

    useEffect(() => {
        setLoadingPatients(true);
        fetchPatients()
            .then((data) => {
                setPatients(Array.isArray(data.responseObject) ? data.responseObject : []);
                setLoadingPatients(false);
            })
            .catch(() => {
                setErrors(["Failed to fetch residents."]);
                setTimeout(() => setErrors([]), 5000);
                setLoadingPatients(false);
            });
    }, []);

    const handleAddAppointment = (type) => {
        setAppointments((prev) => ({
            ...prev,
            [type]: [...prev[type], { date: "", details: "", physician: "" }]
        }));
    };

    const handleRemoveAppointment = (type, index) => {
        setAppointments((prev) => {
            const updated = [...prev[type]];
            updated.splice(index, 1);
            return { ...prev, [type]: updated };
        });
    };

    const handleChange = (type, index, field, value) => {
        setAppointments((prev) => {
            const updated = [...prev[type]];
            updated[index][field] = value;
            return { ...prev, [type]: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            patient: selectedPatient,
            ...appointments
        };
        console.log("Appointments: ", payload)
        try {
            const response = await postAppointments(payload);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            }else{
                setMessage(["Appointments posted successfully."]);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (error) {
            setErrors(["Failed to create appointment."]);
            setTimeout(() => setErrors([]), 5000);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Create Appointment</h2>
            {message && <p className="text-green-600">{message}</p>}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-800 rounded">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm text-white">{error}</p>
                    ))}
                </div>
            )}

            <div className="mb-4">
                {loadingPatients ? (
                    <div className="flex items-center space-x-2">
                        <Loader className="animate-spin text-gray-500" size={20} />
                        <p className="text-gray-500">Loading residents...</p>
                    </div>
                ) : (
                    <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="border p-2 rounded w-full bg-gray-700 text-white"
                        required
                    >
                        <option value="">Select a Resident</option>
                        {patients.map((patient) => (
                            <option key={patient.patientId} value={patient.patientId}>
                                {patient.firstName} {patient.lastName}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {["weeklyAppointments", "fortnightAppointments", "monthlyAppointments"].map((type) => (
                <div key={type} className="mb-4">
                    <h3 className="text-lg text-blue-300 font-semibold capitalize">{type.replace("Appointments", " Appointments")}</h3>
                    {appointments[type].map((appointment, index) => (
                        <div key={index} className="flex flex-col space-y-2 bg-gray-800 p-4 rounded-lg mb-2">
                            <input
                                type="date"
                                value={appointment.date}
                                onChange={(e) => handleChange(type, index, "date", e.target.value)}
                                className="p-2 bg-gray-700 border rounded w-full"
                            />
                            <textarea
                                value={appointment.details}
                                onChange={(e) => handleChange(type, index, "details", e.target.value)}
                                className="p-2 bg-gray-700 border rounded w-full"
                                placeholder="Appointment details"
                            />
                            <input
                                type="text"
                                value={appointment.physician}
                                onChange={(e) => handleChange(type, index, "physician", e.target.value)}
                                className="p-2 bg-gray-700 border rounded w-full"
                                placeholder="Physician"
                            />
                            <button
                                onClick={() => handleRemoveAppointment(type, index)}
                                className="flex items-center text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16} className="mr-1" /> Remove
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => handleAddAppointment(type)}
                        className="flex items-center text-blue-400 hover:text-blue-600"
                    >
                        <PlusCircle size={16} className="mr-1" /> Add Appointment
                    </button>
                </div>
            ))}
            
            <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
            >
                {loading? "Submitting...": "Submit"}
            </button>
        </div>
    );
};

export default CreateAppointments;
