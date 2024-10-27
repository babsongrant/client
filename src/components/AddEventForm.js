import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddEventForm.css';

function AddEventForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cal_event_date: '',
    cal_event_time: '',
    cal_event_title: '',
    home_team_id: '',
    away_team_id: '',
    production: false,
    production_id: '',
    sport_id: '',
    venue_id: '',
    gender: '',
    event_type: ''
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [productionTeams, setProductionTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventTypesRes, teamsRes, sportsRes, venuesRes, productionTeamsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/event_types'),
          axios.get('http://localhost:3001/api/team_names'),
          axios.get('http://localhost:3001/api/sports'),
          axios.get('http://localhost:3001/api/venues'),
          axios.get('http://localhost:3001/api/production_teams')
        ]);

        setEventTypes(eventTypesRes.data);
        setTeams(teamsRes.data);
        setSports(sportsRes.data);
        setVenues(venuesRes.data);
        setProductionTeams(productionTeamsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <h2>Add New Event</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="event_type">Event Type:</label>
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Event Type</option>
            {eventTypes && eventTypes.map((type) => (
              <option key={type.type_id} value={type.type_id.toString()}>
                {type.event_type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="cal_event_date">Date:</label>
          <input
            type="date"
            id="cal_event_date"
            name="cal_event_date"
            value={formData.cal_event_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cal_event_time">Time:</label>
          <input
            type="time"
            id="cal_event_time"
            name="cal_event_time"
            value={formData.cal_event_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="cal_event_title">Event Title:</label>
          <input
            type="text"
            id="cal_event_title"
            name="cal_event_title"
            value={formData.cal_event_title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="home_team_id">Home Team:</label>
          <select
            id="home_team_id"
            name="home_team_id"
            value={formData.home_team_id}
            onChange={handleChange}
          >
            <option value="">Select Home Team</option>
            {teams && teams.map(team => (
              <option key={team.org_id} value={team.org_id.toString()}>
                {team.org_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="away_team_id">Away Team:</label>
          <select
            id="away_team_id"
            name="away_team_id"
            value={formData.away_team_id}
            onChange={handleChange}
          >
            <option value="">Select Away Team</option>
            {teams && teams.map(team => (
              <option key={team.org_id} value={team.org_id.toString()}>
                {team.org_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="sport_id">Sport:</label>
          <select
            id="sport_id"
            name="sport_id"
            value={formData.sport_id}
            onChange={handleChange}
          >
            <option value="">Select Sport</option>
            {sports && sports.map(sport => (
              <option key={sport.sport_id} value={sport.sport_id.toString()}>
                {sport.sport_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="venue_id">Venue:</label>
          <select
            id="venue_id"
            name="venue_id"
            value={formData.venue_id}
            onChange={handleChange}
          >
            <option value="">Select Venue</option>
            {venues && venues.map(venue => (
              <option key={venue.venueID} value={venue.venueID.toString()}>
                {venue.venue_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="production">Production:</label>
          <div className="checkbox">
            <input
              type="checkbox"
              id="production"
              name="production"
              checked={formData.production}
              onChange={handleChange}
            />
            <label htmlFor="production">Yes</label>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Add Event</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export default AddEventForm;
