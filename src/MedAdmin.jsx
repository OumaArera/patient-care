import React, { useState } from "react";
import dayjs from "dayjs";
import { postMedications } from "../services/postMedications";
import { errorHandler } from "../services/errorHandler";

const MedAdmin = ({ meds, selectedPatient }) => {
    const today = dayjs().format("YYYY-MM-DD");
    const [adminData, setAdminData] = useState({});
    const [selectedDate, setSelectedDate] = useState(today);
    const [lateReasons, setLateReasons] = useState(""); 
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedMedications, setSelectedMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");

    const handleStatusChange = (medicationId, medicationTime, status) => {
        setAdminData((prev) => ({
            ...prev,
            [`${medicationId}-${medicationTime}`]: { medicationId, medicationTime, status },
        }));

        setSelectedTimes((prev) => [...new Set([...prev, medicationTime])]);

        if (!selectedMedications.includes(medicationId)) {
            setSelectedMedications((prev) => [...prev, medicationId]);
        }
    };

    const handleLateReasonChange = (reason) => {
        setLateReasons(reason); // Now directly updating as a string
    };

    const isFutureTime = (time) => {
        return dayjs(`${selectedDate} ${time}`).isAfter(dayjs());
    };

    const isAllPastTimesSelected = (medicationTimes, medicationId) => {
        return medicationTimes
            .filter((time) => !isFutureTime(time))
            .every((time) => adminData[`${medicationId}-${time}`]?.status);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            medication: selectedMedications[0],
            patient: selectedPatient,
            timeAdministered: selectedTimes,
            reasonNotFiled: lateReasons
        }
        console.log("Payload: ", payload);
        try {
            const response = await postMedications(payload);
            if (response?.error) {
                setErrors(errorHandler(response?.error));
                setTimeout(() => setErrors([]), 5000);
            }else{
                setMessage("Appointments posted successfully.");
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
        <div className="grid gap-4 p-4 bg-gray-900 text-white">
            <div>
                <label className="block font-semibold">Select Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 border border-gray-600 p-2 rounded bg-gray-800 text-white w-full"
                />
            </div>

            {dayjs(selectedDate).isBefore(today) && (
                <div>
                    <label className="block font-semibold">Reason for Late Filing:</label>
                    <input
                        type="text"
                        value={lateReasons || ""}
                        onChange={(e) => handleLateReasonChange(e.target.value)}
                        placeholder="Enter reason for late filing"
                        className="mt-1 border border-gray-600 p-2 rounded bg-gray-800 text-white w-full"
                    />
                </div>
            )}

            {meds.map((med) => (
                <div key={med.medicationId} className="border border-gray-700 rounded-lg p-4 shadow-md bg-gray-800">
                    <div className="mb-2">
                        <h2 className="text-lg font-semibold">{med.medicationName} ({med.medicationCode})</h2>
                        <p className="text-sm text-gray-400">Resident: {med.patientFirstName} {med.patientLastName}</p>
                    </div>
                    <div>
                        <p><strong>Instructions:</strong> {med.instructions}</p>
                        <p><strong>Quantity:</strong> {med.quantity}</p>
                        <p><strong>Diagnosis:</strong> {med.diagnosis}</p>
                    </div>

                    <div className="mt-2 space-y-2">
                        {med.medicationTime.map((time) => {
                            const key = `${med.medicationId}-${time}`;
                            return (
                                <div key={time} className="flex items-center gap-4">
                                    <p className="w-20">{time}</p>
                                    <select
                                        className="border border-gray-600 p-2 rounded bg-gray-700 text-white w-40"
                                        value={adminData[key]?.status || ""}
                                        onChange={(e) => handleStatusChange(med.medicationId, time, e.target.value)}
                                        disabled={isFutureTime(time)}
                                    >
                                        <option value="">Select status</option>
                                        <option value="administered">Administered</option>
                                        <option value="not-administered">Not Administered</option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 bg-white rounded">
                            {errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600">{error}</p>
                            ))}
                        </div>
                    )}
                    {message && <p className="text-green-600">{message}</p>}
                    <button
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-500"
                        onClick={() => handleSubmit()}
                        disabled={
                            med.medicationTime.some((time) => isFutureTime(time)) ||
                            !isAllPastTimesSelected(med.medicationTime, med.medicationId)
                        }
                    >
                        {loading? "Submitting..." : "Submit"}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MedAdmin;
