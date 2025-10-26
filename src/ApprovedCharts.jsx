const ApprovedCharts = () => {
  const charts = [
    { id: 1, patient: "Alice Brown", status: "Approved" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold">Approved Charts</h2>
      <ul>
        {charts.map((chart) => (
          <li key={chart.id} className="p-2 border-b">{chart.patient} - {chart.status}</li>
        ))}
      </ul>
    </div>
  );
};
export default ApprovedCharts;