import React, { useState } from 'react';

function ImportDataCheck({ onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState('');

  const checkData = async () => {
    try {
      const response = await fetch('/api/import-calendar/check-data');
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      setMessage('Error checking data: ' + error.message);
    }
  };

  const clearData = async () => {
    if (!window.confirm('Are you sure you want to delete all unprocessed records?')) {
      return;
    }

    try {
      const response = await fetch('/api/import-calendar/clear', {
        method: 'DELETE'
      });
      const data = await response.json();
      setMessage(data.message);
      setAnalysis(null);
    } catch (error) {
      setMessage('Error clearing data: ' + error.message);
    }
  };

  return (
    <div className="import-check">
      <h2>Import Data Check</h2>
      
      <div className="actions">
        <button onClick={checkData}>Check Data</button>
        <button onClick={clearData} className="danger">Clear Unprocessed Records</button>
      </div>

      {message && <div className="message">{message}</div>}

      {analysis && (
        <div className="analysis">
          <h3>Analysis Results:</h3>
          <ul>
            <li>Total Records: {analysis.totalRecords}</li>
            <li>Matched Production Teams: {analysis.productionTeamMatches}</li>
            {analysis.unmatchedTeams.length > 0 && (
              <>
                <li>Unmatched Production Teams:</li>
                <ul>
                  {analysis.unmatchedTeams.map(team => (
                    <li key={team}>{team}</li>
                  ))}
                </ul>
              </>
            )}
          </ul>
        </div>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default ImportDataCheck;