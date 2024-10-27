// client/src/components/EventForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventForm.css'; // Make sure to create this CSS file

function EventForm({ event, onSubmit, onDelete, eventTypes }) {
  console.log('EventForm rendered with event:', event);

  const [formData, setFormData] = useState({
    cal_event_date: formatDateForInput(event.cal_event_date) || '',
    cal_event_time: event.cal_event_time || '',
    cal_event_title: event.cal_event_title || '',
    home_team_id: event.home_team_id ? event.home_team_id.toString() : '',
    away_team_id: event.away_team_id ? event.away_team_id.toString() : '',
    production: event.production === 1,
    production_id: event.production_id ? event.production_id.toString() : '',
    sport_id: event.sport_id ? event.sport_id.toString() : '',
    venue_id: event.venue_id ? event.venue_id.toString() : '',
    gender: event.gender || '',
    event_type: event.event_type ? event.event_type.toString() : '',
  });

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [productionTeams, setProductionTeams] = useState([]);

  useEffect(() => {
    // Fetch necessary data
    const fetchData = async () => {
      try {
        const [teamsRes, sportsRes, venuesRes, productionTeamsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/team_names'),
          axios.get('http://localhost:3001/api/sports'),
          axios.get('http://localhost:3001/api/venues'),
          axios.get('http://localhost:3001/api/production_teams')
        ]);

        setTeams(teamsRes.data);
        setSports(sportsRes.data);
        setVenues(venuesRes.data);
        setProductionTeams(productionTeamsRes.data);

        console.log('Fetched data:', {
          teams: teamsRes.data,
          sports: sportsRes.data,
          venues: venuesRes.data,
          productionTeams: productionTeamsRes.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Event prop changed:', event);
    setFormData({
      cal_event_date: formatDateForInput(event.cal_event_date) || '',
      cal_event_time: event.cal_event_time || '',
      cal_event_title: event.cal_event_title || '',
      home_team_id: event.home_team_id ? event.home_team_id.toString() : '',
      away_team_id: event.away_team_id ? event.away_team_id.toString() : '',
      production: event.production === 1,
      production_id: event.production_id ? event.production_id.toString() : '',
      sport_id: event.sport_id ? event.sport_id.toString() : '',
      venue_id: event.venue_id ? event.venue_id.toString() : '',
      gender: event.gender || '',
      event_type: event.event_type ? event.event_type.toString() : '',
    });
  }, [event]);

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Helper function to format date for input field
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...event,
      ...formData,
      production: formData.production ? 1 : 0,
    });
  };

  const isAthleticEvent = parseInt(formData.event_type) === 1;

  console.log('Rendering form with data:', formData);

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cal_event_title">Event Title:</label>
          <input
            type="text"
            id="cal_event_title"
            name="cal_event_title"
            value={formData.cal_event_title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cal_event_date">Date:</label>
          <input
            type="date"
            id="cal_event_date"
            name="cal_event_date"
            value={formData.cal_event_date}
            onChange={handleChange}
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="event_type">Event Type:</label>
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            {eventTypes.map((type) => (
              <option key={type.type_id} value={type.type_id.toString()}>
                {type.event_type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        {isAthleticEvent && (
          <>
            <div className="form-group">
              <label htmlFor="home_team_id">Home Team:</label>
              <select
                id="home_team_id"
                name="home_team_id"
                value={formData.home_team_id}
                onChange={handleChange}
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
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
                {teams.map(team => (
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
                {sports.map(sport => (
                  <option key={sport.sport_id} value={sport.sport_id.toString()}>
                    {sport.sport_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="form-group">
          <label htmlFor="venue_id">Venue:</label>
          <select
            id="venue_id"
            name="venue_id"
            value={formData.venue_id}
            onChange={handleChange}
          >
            <option value="">Select Venue</option>
            {venues.map(venue => (
              <option key={venue.venueID} value={venue.venueID.toString()}>
                {venue.venue_name}
              </option>
            ))}
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
          </div>
        </div>
        {formData.production && (
          <div className="form-group">
            <label htmlFor="production_id">Production Team:</label>
            <select
              id="production_id"
              name="production_id"
              value={formData.production_id}
              onChange={handleChange}
            >
              <option value="">Select Production Team</option>
              {productionTeams.map(team => (
                <option key={team.team_id} value={team.team_id.toString()}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="form-actions">
        <div className="button-group">
          <button type="button" onClick={() => onDelete(event.event_id)} className="btn-danger">Delete Event</button>
          <button type="submit" className="btn-primary">Update Event</button>
        </div>
      </div>
    </form>
  );
}

export default EventForm;
