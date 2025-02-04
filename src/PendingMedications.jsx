  // PendingMedications.js
  const PendingMedications = () => {
    const meds = [
      { id: 1, name: "Painkiller", status: "Pending Approval" },
    ];
    return (
      <div>
        <h2 className="text-xl font-bold">Pending Medications</h2>
        <ul>
          {meds.map((med) => (
            <li key={med.id} className="p-2 border-b">{med.name} - {med.status}</li>
          ))}
        </ul>
      </div>
    );
  };
  export default PendingMedications;