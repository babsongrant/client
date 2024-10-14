import React, { useState } from 'react';

function EventForm({ event, onSubmit }) {
  const [formData, setFormData] = useState(event);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        name="cal_event_date"
        value={formData.cal_event_date}
        onChange={handleChange}
      />
      <input
        type="time"
        name="cal_event_time"
        value={formData.cal_event_time}
        onChange={handleChange}
      />
      <input
        type="text"
        name="cal_event_title"
        value={formData.cal_event_title}
        onChange={handleChange}
        placeholder="Event Title"
      />
      <input
        type="text"
        name="home_team_name"
        value={formData.home_team_name}
        onChange={handleChange}
        placeholder="Home Team"
      />
      <input
        type="text"
        name="away_team_name"
        value={formData.away_team_name}
        onChange={handleChange}
        placeholder="Away Team"
      />
      <input
        type="number"
        name="event_type"
        value={formData.event_type}
        onChange={handleChange}
        placeholder="Event Type"
      />
      <label>
        Production:
        <input
          type="checkbox"
          name="production"
          checked={formData.production === 1}
          onChange={handleChange}
        />
      </label>
      <input
        type="text"
        name="production_team_name"
        value={formData.production_team_name}
        onChange={handleChange}
        placeholder="Production Team"
      />
      <input
        type="text"
        name="venue_name"
        value={formData.venue_name}
        onChange={handleChange}
        placeholder="Venue"
      />
      <input
        type="text"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        placeholder="Gender"
      />
      <input
        type="text"
        name="sport_id"
        value={formData.sport_id}
        onChange={handleChange}
        placeholder="Sport ID"
      />
      <input
        type="text"
        name="stream_key"
        value={formData.stream_key}
        onChange={handleChange}
        placeholder="Stream Key"
      />
      <input
        type="text"
        name="cal_status"
        value={formData.cal_status}
        onChange={handleChange}
        placeholder="Status"
      />
      <input
        type="text"
        name="boxcast_"
        value={formData.boxcast_}
        onChange={handleChange}
        placeholder="Boxcast"
      />
      <button type="submit">Update Event</button>
    </form>
  );
}

export default EventForm;
