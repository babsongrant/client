import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SeasonManager.css';

function SeasonManager() {
  const [sportSeasons, setSportSeasons] = useState([]);
  const [baseSeasons, setBaseSeasons] = useState([]);
  const [newSeason, setNewSeason] = useState({
    season: '',
    season_specific: '',
    season_date_start: '',
    season_date_end: ''
  });
  const [editingSeason, setEditingSeason] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSeasons();
    fetchBaseSeasons();
  }, []);

  const fetchBaseSeasons = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/base-seasons');
      setBaseSeasons(response.data);
    } catch (error) {
      console.error('Error fetching base seasons:', error);
      setError('Failed to fetch base seasons');
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sport-seasons');
      console.log('Fetched sport seasons:', response.data);
      
      const formattedSeasons = response.data.map(season => ({
        ...season,
        season_date_start: new Date(season.season_date_start).toISOString().split('T')[0],
        season_date_end: new Date(season.season_date_end).toISOString().split('T')[0]
      }));
      
      setSportSeasons(formattedSeasons);
    } catch (error) {
      console.error('Error fetching sport seasons:', error);
      setError('Failed to fetch sport seasons');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSeason({ ...newSeason, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/sport-seasons', newSeason);
      
      if (response.data.success) {
        setSuccess('Season added successfully!');
        setNewSeason({
          season: '',
          season_specific: '',
          season_date_start: '',
          season_date_end: ''
        });
        await fetchSeasons();
      } else {
        setError('Failed to add season: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error adding season:', error);
      setError(error.response?.data?.error || 'Failed to add season');
    }
  };

  const handleEdit = async (season) => {
    setEditingSeason(season);
    setNewSeason({
      season: season.season,
      season_specific: season.season_specific,
      season_date_start: season.season_date_start,
      season_date_end: season.season_date_end
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.put(
        `http://localhost:3001/api/sport-seasons/${editingSeason.season_id}`, 
        newSeason
      );
      
      if (response.data.success) {
        setSuccess('Season updated successfully!');
        setEditingSeason(null);
        setNewSeason({
          season: '',
          season_specific: '',
          season_date_start: '',
          season_date_end: ''
        });
        await fetchSeasons();
      } else {
        setError('Failed to update season: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating season:', error);
      setError(error.response?.data?.error || 'Failed to update season');
    }
  };

  const handleDelete = async (seasonId) => {
    if (!window.confirm('Are you sure you want to delete this season?')) {
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      const response = await axios.delete(`http://localhost:3001/api/sport-seasons/${seasonId}`);
      
      if (response.data.success) {
        setSuccess('Season deleted successfully!');
        await fetchSeasons();
      } else {
        setError('Failed to delete season: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting season:', error);
      setError(error.response?.data?.error || 'Failed to delete season');
    }
  };

  return (
    <div className="season-manager">
      <h2>Manage Sport Seasons</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form className="season-form" onSubmit={editingSeason ? handleUpdate : handleSubmit}>
        <div>
          <label htmlFor="season">Base Season</label>
          <select
            id="season"
            name="season"
            value={newSeason.season}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Season</option>
            {baseSeasons.map(season => (
              <option key={season.season} value={season.season}>
                {season.season}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="season_specific">Season Name</label>
          <input
            id="season_specific"
            type="text"
            name="season_specific"
            value={newSeason.season_specific}
            onChange={handleInputChange}
            placeholder="e.g., Fall 2024"
            required
          />
        </div>

        <div>
          <label htmlFor="season_date_start">Start Date</label>
          <input
            id="season_date_start"
            type="date"
            name="season_date_start"
            value={newSeason.season_date_start}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="season_date_end">End Date</label>
          <input
            id="season_date_end"
            type="date"
            name="season_date_end"
            value={newSeason.season_date_end}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit">
            {editingSeason ? 'Update Season' : 'Add Season'}
          </button>
          {editingSeason && (
            <button type="button" onClick={() => {
              setEditingSeason(null);
              setNewSeason({
                season: '',
                season_specific: '',
                season_date_start: '',
                season_date_end: ''
              });
            }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>Existing Sport Seasons</h3>
      <table className="seasons-table">
        <thead>
          <tr>
            <th>Base Season</th>
            <th>Season Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sportSeasons.map((season) => (
            <tr key={season.season_id}>
              <td>{season.season}</td>
              <td>{season.season_specific}</td>
              <td>{new Date(season.season_date_start).toLocaleDateString()}</td>
              <td>{new Date(season.season_date_end).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(season)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(season.season_id)} className="delete-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SeasonManager;