import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImportValidation.css';

function ImportValidation({ onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchValidation = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/import-calendar/validation');
        console.log('Fetched records:', response.data); // Debug log
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching validation:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchValidation();
  }, []);

  // Group records by validation status
  const validRecords = records.filter(r => r.validation_status === 'VALID');
  const pendingRecords = records.filter(r => r.validation_status === 'PENDING');
  const errorRecords = records.filter(r => r.validation_status === 'ERROR');

  if (loading) return <div>Loading validation data...</div>;
  if (error) return <div>Error loading validation: {error}</div>;
  if (!records.length) return <div>No records found for validation</div>;

  return (
    <div className="import-validation">
      <h2>Import Validation</h2>
      
      {renderValidationTable(pendingRecords, 'Pending Validation')}
      {renderValidationTable(errorRecords, 'Validation Errors')}
      {renderValidationTable(validRecords, 'Valid Records')}

      <div className="validation-actions">
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Helper function to render validation tables
const renderValidationTable = (records, title) => {
  if (!records.length) return null;

  return (
    <div className="validation-group">
      <h3>{title} ({records.length})</h3>
      <table className="validation-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Title</th>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Venue</th>
            <th>Production Team</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.upload_id}>
              <td>{new Date(record.cal_event_date).toLocaleDateString()}</td>
              <td>{record.cal_event_time}</td>
              <td>{record.cal_event_title}</td>
              <td className={record.home_team_error ? 'error' : 'valid'}>
                {record.cal_team_home}
                {record.validated_home_team_name && 
                  <div className="validated-value">→ {record.validated_home_team_name}</div>
                }
              </td>
              <td className={record.away_team_error ? 'error' : 'valid'}>
                {record.cal_team_away}
                {record.validated_away_team_name && 
                  <div className="validated-value">→ {record.validated_away_team_name}</div>
                }
              </td>
              <td className={record.venue_error ? 'error' : 'valid'}>
                {record.venue}
                {record.validated_venue_name && 
                  <div className="validated-value">→ {record.validated_venue_name}</div>
                }
              </td>
              <td className={record.production_team_error ? 'error' : 'valid'}>
                {record.production_team}
                {record.validated_production_team_name && 
                  <div className="validated-value">→ {record.validated_production_team_name}</div>
                }
              </td>
              <td className="validation-messages">
                {[
                  record.home_team_error,
                  record.away_team_error,
                  record.venue_error,
                  record.production_team_error
                ].filter(Boolean).join('; ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportValidation; 