import React, { useState } from 'react';
import CsvImport from './CsvImport';
import ImportValidation from './ImportValidation';
import './ImportManager.css';

function ImportManager() {
  const [showValidation, setShowValidation] = useState(false);

  const handleImportComplete = () => {
    setShowValidation(true);
  };

  return (
    <div className="import-manager">
      <h2>Import Events</h2>
      
      {!showValidation ? (
        <>
          <CsvImport onImportComplete={handleImportComplete} />
          <div className="validation-button-container">
            <button 
              className="btn-primary"
              onClick={() => setShowValidation(true)}
            >
              View Pending Records
            </button>
          </div>
        </>
      ) : (
        <ImportValidation onClose={() => setShowValidation(false)} />
      )}
    </div>
  );
}

export default ImportManager; 