import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './CrewRateOverride.css';

function CrewRateOverride({ crew, onClose, onUpdate }) {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRateId, setEditingRateId] = useState(null);
  const [tempRate, setTempRate] = useState('');
  const inputRef = useRef(null);

  const fetchOverrides = useCallback(async () => {
    if (!crew) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3001/api/crew-rate-overrides/${crew.crew_id}`);
      console.log('Fetched overrides:', response.data);
      setOverrides(response.data);
    } catch (err) {
      console.error('Error fetching rate overrides:', err);
      setError('Failed to load rate overrides');
    } finally {
      setLoading(false);
    }
  }, [crew]);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  const handleRateClick = (override, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Rate clicked:', override);
    const rateId = `${override.role_id}-${override.rate_id}`;
    setEditingRateId(rateId);
    setTempRate(override.override_rate || override.standard_rate);
  };

  const handleRateChange = (e) => {
    setTempRate(e.target.value);
  };

  const handleRateSubmit = async (override) => {
    try {
      await axios.post('http://localhost:3001/api/crew-rate-overrides', {
        crew_id: crew.crew_id,
        crew_roles_id: override.role_id,
        rate_id: override.rate_id,
        crew_custom_rate: tempRate
      });
      
      await fetchOverrides();
      setEditingRateId(null);
      setTempRate('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error saving rate override:', err);
      setError('Failed to save rate override');
    }
  };

  const handleKeyDown = (e, override) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRateSubmit(override);
    } else if (e.key === 'Escape') {
      setEditingRateId(null);
      setTempRate('');
    }
  };

  if (loading) return <div className="modal-overlay"><div className="rate-override-modal">Loading...</div></div>;
  if (error) return <div className="modal-overlay"><div className="rate-override-modal" className="error-message">{error}</div></div>;

  return (
    <div className="modal-overlay">
      <div className="rate-override-modal">
        <h3>Rate Management for {crew.crew_name_first} {crew.crew_name_last}</h3>
        
        <div className="current-rates">
          <h4>Current Rates by Role</h4>
          <p className="help-text">Click on any rate to edit it. Press Enter to save or Escape to cancel.</p>
          <table className="rates-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Season</th>
                <th>Sport</th>
                <th>Company</th>
                <th>Rate</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((override, index) => {
                const rateId = `${override.role_id}-${override.rate_id}`;
                
                return (
                  <tr key={index} className={override.has_override === 'Yes' ? 'has-override' : ''}>
                    <td>{override.role_name}</td>
                    <td>{override.season_specific || override.season}</td>
                    <td>{override.sport_name}</td>
                    <td>{override.company_name}</td>
                    <td 
                      className="rate-cell"
                      onClick={(e) => handleRateClick(override, e)}
                    >
                      {editingRateId === rateId ? (
                        <div className="rate-input-container">
                          <input
                            ref={inputRef}
                            type="number"
                            step="0.01"
                            value={tempRate}
                            onChange={handleRateChange}
                            onKeyDown={(e) => handleKeyDown(e, override)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="rate-display">
                          ${override.override_rate || override.standard_rate}
                          {override.has_override === 'Yes' && <span className="override-indicator">*</span>}
                        </div>
                      )}
                    </td>
                    <td>{new Date(override.rate_date_start).toLocaleDateString()}</td>
                    <td>{new Date(override.rate_date_end).toLocaleDateString()}</td>
                    <td>{override.rate_note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

export default CrewRateOverride; 