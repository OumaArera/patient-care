import React, {useEffect, useState} from "react";
import { getAppointments } from "../services/getAppointments";
import { fetchPatients } from "../services/fetchPatients";
import { Loader } from "lucide-react";

const Appointments = () =>{
  const [residents, setResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    setLoadingResidents(true);
    fetchPatients()
        .then((data) => {
          setResidents(Array.isArray(data.responseObject) ? data.responseObject : []);
          setLoadingResidents(false);
        })
        .catch(() => {
          setLoadingResidents(false);
        });
  }, []);

  

  const fetchAppointments = (patientId) =>{
    if (!patientId) return;
    setLoading(true);
    getAppointments(patientId)
      .then((data)=>{
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false))
  }

  const handleResidentChange = (event) => {
    const patientId = event.target.value;
    setSelectedResident(patientId);
    fetchAppointments(patientId);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Resident Appointments</h2>
      <div className="mb-4 flex space-x-4">
        {loadingResidents ? (
          <div className="flex justify-center items-center">
            <Loader className="animate-spin text-blue-400" size={24} />
            <p className="text-gray-400">Loading residents...</p>
          </div>
        ) : (
          <select
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            onChange={handleResidentChange}
            value={selectedResident || ""}
          >
            <option value="">Select a Resident</option>
            {residents.map((resident) => (
              <option key={resident.patientId} value={resident.patientId}>
                {`${resident.firstName} ${resident.lastName}`}
              </option>
            ))}
          </select>
        )}
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader className="animate-spin text-blue-400" size={24} />
            <p className="text-gray-400">Loading approintments...</p>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-700 text-white">
            <thead>
                <tr className="bg-gray-800 text-blue-400">
                    <th className="border border-gray-700 p-2">Resident Name</th>
                    <th className="border border-gray-700 p-2">Date Taken</th>
                    <th className="border border-gray-700 p-2">Type</th>
                    <th className="border border-gray-700 p-2">Other Datails</th>
                    <th className="border border-gray-700 p-2">Next Appointment Date</th>
                </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) =>{
                <tr key={index} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="border border-gray-700 p-2 text-center">{appointment.patientName}</td>
                  <td className="border border-gray-700 p-2">{appointment.dateTaken}</td>
                  <td className="border border-gray-700 p-2">{appointment.type}</td>
                  <td className="border border-gray-700 p-2">{appointment.details? appointment.details : ""}</td>
                  <td className="border border-gray-700 p-2">{appointment.nextAppointmentDate}</td>

                </tr>
              })

              }
            </tbody>
        </table>
      )}

      </div>
    </div>
  )

}

export default Appointments;