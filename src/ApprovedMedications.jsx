const ApprovedMedications = () => {
  const meds = [
    { id: 1, name: "Antibiotics", status: "Approved" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold">Approved Medications</h2>
      <ul>
        {meds.map((med) => (
          <li key={med.id} className="p-2 border-b">{med.name} - {med.status}</li>
        ))}
      </ul>
    </div>
  );
};
export default ApprovedMedications;