// client/src/components/NonSportEventForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NonSportEventForm.css';  // Make sure this line is present

function NonSportEventForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    event_type: '',
    cal_event_title: '',
    cal_event_date: '',
    cal_event_time: '',
    venueID: '',
    venue_name: '',
    production: 0,
    production_team_id: '',
    production_team_name: '',
    cal_status: '',
  });

  const [venues, setVenues] = useState([]);
  const [productionTeams, setProductionTeams] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  // Fetch venues, production teams, and event types when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venuesResponse, productionTeamsResponse, eventTypesResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/venues'),
          axios.get('http://localhost:3001/api/production_teams'),
          axios.get('http://localhost:3001/api/event-types'),
        ]);

        setVenues(venuesResponse.data);
        setProductionTeams(productionTeamsResponse.data);
        setEventTypes(eventTypesResponse.data);
        
        console.log('Fetched event types:', eventTypesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'venueID') {
      const selectedVenue = venues.find(venue => venue.venueID.toString() === value);
      setFormData(prevData => ({
        ...prevData,
        venueID: value,
        venue_name: selectedVenue ? selectedVenue.venue_name : ''
      }));
    } else if (name === 'production') {
      setFormData(prevData => ({
        ...prevData,
        production: checked ? 1 : 0,
        production_team_id: checked ? prevData.production_team_id : '',
        production_team_name: checked ? prevData.production_team_name : ''
      }));
    } else if (name === 'production_team_id') {
      const selectedTeam = productionTeams.find(team => team.team_id.toString() === value);
      setFormData(prevData => ({
        ...prevData,
        production_team_id: value,
        production_team_name: selectedTeam ? selectedTeam.team_name : ''
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a copy of the form data
      const submissionData = {
        ...formData,
        // If production is 0 (unchecked), set production team to Camera Only
        production_team_id: formData.production === 0 ? '' : formData.production_team_id,
        production_team_name: formData.production === 0 ? 'Camera Only' : formData.production_team_name
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <h2>Add Non-Sport Event</h2>
      {console.log('Event types in render:', eventTypes)} {/* Add this line */}
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
            {eventTypes.map(type => (
              <option key={type.type_id} value={type.type_id}>
                {type.event_type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="venueID">Venue:</label>
          <select
            id="venueID"
            name="venueID"
            value={formData.venueID}
            onChange={handleChange}
            required
          >
            <option value="">Select Venue</option>
            {venues.map(venue => (
              <option key={venue.venueID} value={venue.venueID}>
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
              checked={formData.production === 1}
              onChange={handleChange}
            />
            <label htmlFor="production">Yes</label>
          </div>
        </div>
        {formData.production === 1 && (
          <div className="form-group">
            <label htmlFor="production_team_id">Production Team:</label>
            <select
              id="production_team_id"
              name="production_team_id"
              value={formData.production_team_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Production Team</option>
              {productionTeams.map(team => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="cal_status">Status:</label>
          <input
            type="text"
            id="cal_status"
            name="cal_status"
            value={formData.cal_status}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Submit</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export default NonSportEventForm;
