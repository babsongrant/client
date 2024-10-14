import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventTable.css';
import EventForm from './EventForm'; // We'll create this component next

function EventTable() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/calendar');
      console.log('Fetched events:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleMakeSlate = async (event) => {
    try {
      const response = await axios.post('http://localhost:3001/api/make-slate', {
        eventId: event.event_id,
        homeTeam: event.home_team_name,
        awayTeam: event.away_team_name,
        eventDate: event.cal_event_date,
        eventTime: event.cal_event_time,
        sportId: event.sport_id
      });
      
      if (response.data.success) {
        console.log('Slate created successfully');
        // Refresh the events data to show updated slate status
        fetchEvents();
      } else {
        console.error('Failed to create slate:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating slate:', error);
    }
  };

  const handleRowClick = (id) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      await axios.put(`http://localhost:3001/api/calendar/${updatedEvent.event_id}`, updatedEvent);
      fetchEvents(); // Refresh the list after update
      setEditingId(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getRowStyle = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);

    if (eventDateObj.getTime() === today.getTime()) {
      return { backgroundColor: 'lightgreen' };
    } else if (eventDateObj.getTime() === tomorrow.getTime()) {
      return { backgroundColor: 'lightyellow' };
    }
    return {};
  };

  const renderTeamWithLogo = (teamName, logoFilename) => {
    const logoPath = `${process.env.PUBLIC_URL}/images/logos/${logoFilename}`;
    console.log(`Attempting to load logo for ${teamName} from: ${logoPath}`);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={logoPath} 
          alt={`${teamName} logo`} 
          style={{ width: '20px', height: '20px', marginRight: '5px' }} 
          onError={(e) => {
            console.error(`Failed to load image for ${teamName}: ${logoPath}`);
            e.target.onerror = null; 
            e.target.style.display = 'none';
          }}
        />
        {teamName}
      </div>
    );
  };

  return (
    <div>
      <h2>Event Table</h2>
      <table>
        <thead>
          <tr>
            <th>Event Date</th>
            <th>Event Time</th>
            <th>Event Title</th>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Event Type</th>
            <th>Production</th>
            <th>Production Team</th>
            <th>Venue</th>
            <th>Gender</th>
            <th>Sport ID</th>
            <th>Stream Key</th>
            <th>Status</th>
            <th>Boxcast</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <React.Fragment key={event.event_id}>
              <tr 
                onClick={() => handleRowClick(event.event_id)}
                style={getRowStyle(event.cal_event_date)}
              >
                <td>{formatDate(event.cal_event_date)}</td>
                <td>{formatTime(event.cal_event_time)}</td>
                <td>{event.cal_event_title}</td>
                <td>{renderTeamWithLogo(event.home_team_name, event.logo_home)}</td>
                <td>{renderTeamWithLogo(event.away_team_name, event.logo_away)}</td>
                <td>{event.event_type}</td>
                <td><input type="checkbox" checked={event.production === 1} readOnly /></td>
                <td>{event.production_team_name}</td>
                <td>{event.venue_name}</td>
                <td>{event.gender}</td>
                <td>{event.sport_id}</td>
                <td>{event.stream_key}</td>
                <td>{event.cal_status}</td>
                <td>{event.boxcast_}</td>
                <td>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMakeSlate(event);
                    }} 
                    disabled={!!event.event_slate}
                  >
                    Make Slate
                  </button>
                </td>
              </tr>
              {editingId === event.event_id && (
                <tr>
                  <td colSpan="15">
                    <EventForm event={event} onSubmit={handleEventUpdate} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;
