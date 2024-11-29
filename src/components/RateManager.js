import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RateManager.css';

function RateManager() {
  console.log('RateManager component rendered');

  const [rates, setRates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [sports, setSports] = useState([]);
  const [newRate, setNewRate] = useState({
    rate_type: '',
    event_role: '',
    rate_code: '',
    rate_note: '',
    rate_amount: '',
    rate_season: '',
    rate_company: '',
    rate_date_start: '',
    rate_date_end: '',
    rate_sport: ''
  });
  const [editingRate, setEditingRate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    type: '',
    sport: '',
    season: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'rate_date_start',
    direction: 'desc'
  });

  useEffect(() => {
    console.log('useEffect triggered');
    const loadData = async () => {
      try {
        console.log('Starting data fetch');
        await Promise.all([
          fetchRates(),
          fetchRoles(),
          fetchCompanies(),
          fetchSeasons(),
          fetchSports()
        ]);
        console.log('All data fetched successfully');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/crew-rates');
      console.log('Rates response:', response.data);
      setRates(response.data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setError('Failed to fetch rates');
      setRates([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/roles');
      setRoles(response.data);
    } catch (error) {
      setError('Failed to fetch roles');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/companies');
      setCompanies(response.data);
    } catch (error) {
      setError('Failed to fetch companies');
    }
  };

  const fetchSeasons = async () => {
    console.log('Fetching seasons...');
    try {
      const response = await axios.get('http://localhost:3001/api/seasons');
      console.log('Seasons response:', response.data);
      setSeasons(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setError('Failed to fetch seasons');
      return [];
    }
  };

  const fetchSports = async () => {
    console.log('Fetching sports...');
    try {
      const response = await axios.get('http://localhost:3001/api/sports');
      console.log('Sports response:', response.data);
      setSports(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      setError('Failed to fetch sports');
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting rate data:', {
        ...newRate,
        rate_sport: newRate.rate_sport
      });

      let response;
      if (editingRate) {
        console.log('Updating existing rate:', editingRate.rate_id);
        response = await axios.put(`http://localhost:3001/api/crew-rates/${editingRate.rate_id}`, newRate);
      } else {
        console.log('Creating new rate');
        response = await axios.post('http://localhost:3001/api/crew-rates', newRate);
      }

      if (response.data.success) {
        setSuccess(editingRate ? 'Rate updated successfully!' : 'Rate added successfully!');
        await fetchRates();
        setNewRate({
          rate_type: '',
          event_role: '',
          rate_code: '',
          rate_note: '',
          rate_amount: '',
          rate_season: '',
          rate_sport: '',
          rate_company: '',
          rate_date_start: '',
          rate_date_end: ''
        });
        setEditingRate(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(editingRate ? 'Failed to update rate' : 'Failed to add rate');
    }
  };

  const handleEdit = (rate) => {
    console.log('Editing rate:', rate);
    
    // Format dates properly for the input fields
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setEditingRate(rate);
    setNewRate({
      rate_type: rate.rate_type || '',
      event_role: rate.event_role,
      rate_code: rate.rate_code || '',
      rate_note: rate.rate_note,
      rate_amount: rate.rate_amount,
      rate_season: rate.rate_season,
      rate_sport: rate.rate_sport,
      rate_company: rate.rate_company,
      rate_date_start: formatDate(rate.rate_date_start),
      rate_date_end: formatDate(rate.rate_date_end)
    });
  };

  const handleDelete = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/api/crew-rates/${rateId}`);
      if (response.data.success) {
        setSuccess('Rate deleted successfully!');
        await fetchRates();
      }
    } catch (error) {
      setError('Failed to delete rate');
    }
  };

  // Add a new function to handle "Save as New"
  const handleSaveAsNew = async (e) => {
    e.preventDefault();
    try {
      console.log('Saving as new rate:', newRate);
      const response = await axios.post('http://localhost:3001/api/crew-rates', newRate);
      
      if (response.data.success) {
        setSuccess('New rate added successfully!');
        await fetchRates();
        setNewRate({
          rate_type: '',
          event_role: '',
          rate_code: '',
          rate_note: '',
          rate_amount: '',
          rate_season: '',
          rate_sport: '',
          rate_company: '',
          rate_date_start: '',
          rate_date_end: ''
        });
        setEditingRate(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to add new rate');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);
    console.log('Current rates:', rates);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredAndSortedRates = rates
    .filter(rate => {
      return (
        (!filters.role || rate.role_name === filters.role) &&
        (!filters.type || rate.rate_type === filters.type) &&
        (!filters.sport || rate.rate_sport === filters.sport) &&
        (!filters.season || parseInt(rate.rate_season) === parseInt(filters.season))
      );
    })
    .sort((a, b) => {
      if (sortConfig.key === 'rate_amount') {
        return sortConfig.direction === 'asc' 
          ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key])
          : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  console.log('Current state before render:', {
    sports,
    seasons,
    newRate
  });

  return (
    <div className="rate-manager">
      <h2>Manage Crew Rates</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form className="rate-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div>
            <label htmlFor="rate_type">Rate Type</label>
            <select
              id="rate_type"
              name="rate_type"
              value={newRate.rate_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Rate Type</option>
              <option value="flat">Flat</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label htmlFor="rate_note">Rate Note</label>
            <input
              id="rate_note"
              name="rate_note"
              value={newRate.rate_note}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="event_role">Role</label>
            <select
              id="event_role"
              name="event_role"
              value={newRate.event_role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="rate_amount">Rate Amount ($)</label>
            <input
              id="rate_amount"
              name="rate_amount"
              type="number"
              step="0.01"
              value={newRate.rate_amount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="rate_season">Season</label>
            <select
              id="rate_season"
              name="rate_season"
              value={newRate.rate_season}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Season</option>
              {seasons.map(season => (
                <option key={season.season_id} value={season.season_id}>
                  {season.season} - {season.season_specific}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rate_sport">Sport</label>
            <select
              id="rate_sport"
              name="rate_sport"
              value={newRate.rate_sport || ''}
              onChange={(e) => {
                console.log('Sport selected:', e.target.value);
                handleInputChange(e);
              }}
              required
            >
              <option value="">Select Sport</option>
              {sports.map(sport => (
                <option key={sport.sport_id} value={sport.sport_id}>
                  {sport.sport_name} ({sport.sport_season})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="rate_date_start">Start Date</label>
            <input
              id="rate_date_start"
              name="rate_date_start"
              type="date"
              value={newRate.rate_date_start}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="rate_date_end">End Date</label>
            <input
              id="rate_date_end"
              name="rate_date_end"
              type="date"
              value={newRate.rate_date_end}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="rate_company">Company</label>
            <select
              id="rate_company"
              name="rate_company"
              value={newRate.rate_company}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit">
            {editingRate ? 'Update Rate' : 'Add Rate'}
          </button>
          {editingRate && (
            <button 
              type="button" 
              onClick={handleSaveAsNew}
              className="save-as-new-button"
            >
              Save as New
            </button>
          )}
        </div>
      </form>

      <h3>Existing Rates</h3>
      <div className="table-filters">
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="flat">Flat</option>
          <option value="hourly">Hourly</option>
        </select>

        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.role_id} value={role.role_name}>
              {role.role_name}
            </option>
          ))}
        </select>

        <select
          name="sport"
          value={filters.sport}
          onChange={handleFilterChange}
        >
          <option value="">All Sports</option>
          {sports.map(sport => (
            <option key={sport.sport_id} value={sport.sport_id}>
              {sport.sport_name}
            </option>
          ))}
        </select>

        <select
          name="season"
          value={filters.season}
          onChange={handleFilterChange}
        >
          <option value="">All Seasons</option>
          {seasons.map(season => (
            <option key={season.season_id} value={season.season_id}>
              {season.season} - {season.season_specific}
            </option>
          ))}
        </select>
      </div>

      <table className="rate-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('rate_type')}>
              Type {sortConfig.key === 'rate_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('role_name')}>
              Role {sortConfig.key === 'role_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_note')}>
              Note {sortConfig.key === 'rate_note' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_amount')}>
              Amount {sortConfig.key === 'rate_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_season')}>
              Season {sortConfig.key === 'rate_season' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_sport')}>
              Sport {sortConfig.key === 'rate_sport' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_date_start')}>
              Start Date {sortConfig.key === 'rate_date_start' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('rate_date_end')}>
              End Date {sortConfig.key === 'rate_date_end' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedRates.map((rate) => (
            <tr key={rate.rate_id}>
              <td>{rate.rate_type ? rate.rate_type.charAt(0).toUpperCase() + rate.rate_type.slice(1) : 'N/A'}</td>
              <td>{rate.role_name}</td>
              <td>{rate.rate_note}</td>
              <td>${rate.rate_amount}{rate.rate_type === 'hourly' ? '/hr' : ''}</td>
              <td>
                {seasons.find(s => s.season_id === parseInt(rate.rate_season))
                  ? `${seasons.find(s => s.season_id === parseInt(rate.rate_season)).season} - 
                     ${seasons.find(s => s.season_id === parseInt(rate.rate_season)).season_specific}`
                  : 'N/A'}
              </td>
              <td>{sports.find(s => s.sport_id === rate.rate_sport)?.sport_name || 'N/A'}</td>
              <td>{new Date(rate.rate_date_start).toLocaleDateString()}</td>
              <td>{new Date(rate.rate_date_end).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(rate)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(rate.rate_id)} className="delete-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RateManager; 