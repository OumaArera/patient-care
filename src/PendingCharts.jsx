// PendingCharts.js
const PendingCharts = () => {
    const charts = [
      { id: 1, patient: "John Doe", status: "Pending Review" },
      { id: 2, patient: "Jane Smith", status: "Pending Approval" },
    ];
    return (
      <div>
        <h2 className="text-xl font-bold">Pending Charts</h2>
        <ul>
          {charts.map((chart) => (
            <li key={chart.id} className="p-2 border-b">{chart.patient} - {chart.status}</li>
          ))}
        </ul>
      </div>
    );
  };
  export default PendingCharts;
  


  