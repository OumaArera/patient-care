import React, { useEffect, useState } from "react";
import { getData, createData } from "../services/updatedata";
import { errorHandler } from "../services/errorHandler";
import { Loader } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PATIENTS_URL = `${BASE_URL}/patients`;
const ASSESSMENT_URL = `${BASE_URL}/assessments`;

const CreateAssessment = () => {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        assessmentStartDate: null,
        assessmentNextDate: null,
        NCPStartDate: null,
        NCPNextDate: null,
        socialWorker: "",
        resident: null,
    });

    useEffect(() => {
        setLoading(true);
        getData(PATIENTS_URL)
        .then((data) => {
            const allPatients = data?.responseObject || [];
            setPatients(allPatients);
            const branchSet = new Set(allPatients.map((p) => p.branchName));
            setBranches([...branchSet]);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    const filteredPatients = patients.filter(
        (p) => p.branchName === selectedBranch
    );

    const handlePatientSelect = (patientId) => {
        setSelectedPatientId(patientId);
        setFormData((prev) => ({ ...prev, resident: patientId }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: value || null,
        }));
    };

    const handleSubmit = async () => {
        if ((formData.assessmentStartDate && !formData.assessmentNextDate) || (!formData.assessmentStartDate && formData.assessmentNextDate)) {
            setErrors(["Both assessment dates must be provided together."]);
            setTimeout(() => setErrors([]), 5000);
            return;
        }

        if ((formData.NCPStartDate && !formData.NCPNextDate) || (!formData.NCPStartDate && formData.NCPNextDate)) {
            setErrors(["Both NCP dates must be provided together."]);
            setTimeout(() => setErrors([]), 5000);
            return;
        }

        if (!formData.resident || !formData.socialWorker) {
            setErrors(["Resident and Social Worker are required."]);
            setTimeout(() => setErrors([]), 5000);
        return;
        }
        setIsSubmitting(true);
        try {
            const response = await createData(ASSESSMENT_URL, formData);
            if (response?.error) {
                setErrors(errorHandler(response.error));
                setTimeout(() => setErrors([]), 5000);
            } else {
                setFormData({
                    assessmentStartDate: null,
                    assessmentNextDate: null,
                    NCPStartDate: null,
                    NCPNextDate: null,
                    socialWorker: "",
                    resident: null,
                });
                setSelectedPatientId(null);
                setMessage(["Assessment set successfully."]);
                setTimeout(() => setMessage(""), 5000);
            }
        } catch (err) {
            setErrors(["Failed to submit assessment."]);
            setTimeout(() => setErrors([]), 5000);
        } finally{
            setIsSubmitting(false)
        }
    };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Create Assessment</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Branch:</label>
        <select
          className="w-full p-2 rounded bg-gray-800 text-white"
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            setSelectedPatientId(null);
            setFormData((prev) => ({ ...prev, resident: null }));
          }}
        >
          <option value="">-- Select Branch --</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : selectedBranch && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.patientId}
              className={`p-4 rounded-lg shadow-lg cursor-pointer ${selectedPatientId === patient.patientId ? "bg-green-800" : "bg-gray-800"}`}
              onClick={() => handlePatientSelect(patient.patientId)}
            >
              <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-center">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-center text-gray-400">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {selectedPatientId && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Assessment Details</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Last Assessment Date:</label>
              <input
                type="date"
                name="assessmentStartDate"
                value={formData.assessmentStartDate || ""}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold">Next Assessment Date:</label>
              <input
                type="date"
                name="assessmentNextDate"
                value={formData.assessmentNextDate || ""}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold">Last NCP Date:</label>
              <input
                type="date"
                name="NCPStartDate"
                value={formData.NCPStartDate || ""}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold">Next NCP Date:</label>
              <input
                type="date"
                name="NCPNextDate"
                value={formData.NCPNextDate || ""}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold">Social Worker:</label>
              <input
                type="text"
                name="socialWorker"
                value={formData.socialWorker}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Enter Social Worker's Name"
              />
            </div>
          </div>
            {message && <p className="text-green-600">{message}</p>}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-800 rounded">
                {errors.map((error, index) => (
                    <p key={index} className="text-sm text-white">{error}</p>
                ))}
              </div>
            )}

          <button
            onClick={handleSubmit}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateAssessment;
