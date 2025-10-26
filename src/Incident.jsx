import React, { useState } from "react";
import IncidentList from "./incident/IncidentList";
import IncidentForm from "./incident/IncidentReportForm";
import IncidentDetail from "./incident/IncidentDetail";

const Incident = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const navigateToView = (view, id = null) => {
    setCurrentView(view);
    if (id !== null) {
      setSelectedIncidentId(id);
    }
  };

  return (
    <div className="w-full min-h-screen px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Incident Management</h2>
        
        {/* Navigation breadcrumb */}
        <div className="mt-2 text-sm text-gray-400">
          {currentView === "list" && "All Incidents"}
          {currentView === "new" && "Create New Incident"}
          {currentView === "detail" && `Incident #${selectedIncidentId}`}
        </div>
      </div>
      
      {/* Render the appropriate component based on currentView */}
      {currentView === "list" && (
        <IncidentList 
          onViewIncident={(id) => navigateToView("detail", id)}
          onCreateIncident={() => navigateToView("new")}
        />
      )}
      
      {currentView === "new" && (
        <div>
          <button 
            className="mb-4 bg-gray-700 px-4 py-2 rounded flex items-center text-gray-300 hover:text-white transition-colors"
            onClick={() => navigateToView("list")}
          >
            ← Back to List
          </button>
          <IncidentForm 
            onSuccess={() => navigateToView("list")}
            onCancel={() => navigateToView("list")}
          />
        </div>
      )}
      
      {currentView === "detail" && (
        <div>
          <button 
            className="mb-4 bg-gray-700 px-4 py-2 rounded flex items-center text-gray-300 hover:text-white transition-colors"
            onClick={() => navigateToView("list")}
          >
            ← Back to List
          </button>
          <IncidentDetail 
            incidentId={selectedIncidentId}
            onBack={() => navigateToView("list")}
          />
        </div>
      )}
    </div>
  );
};

export default Incident;