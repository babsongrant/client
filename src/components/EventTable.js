import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EventTable.css';
import EventForm from './EventForm'; // We'll create this component next
import AddEventForm from './AddEventForm';
import NonSportEventForm from './NonSportEventForm'; // Add this import

function EventTable() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showPreviousEvents, setShowPreviousEvents] = useState(false);
  const [previousEventsCount, setPreviousEventsCount] = useState(0);
  const [showAddEventForm, setShowAddEventForm] = useState(false); // New state
  const [showNonSportForm, setShowNonSportForm] = useState(false); // Add this state
  const [loadingEventId, setLoadingEventId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [eventTypes, setEventTypes] = useState([]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/calendar');
      console.log('Fetched events:', response.data);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const sortedEvents = response.data.sort((a, b) => new Date(a.cal_event_date) - new Date(b.cal_event_date));
      
      const filteredEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.cal_event_date);
        return showPreviousEvents || eventDate >= yesterday;
      });

      const previousCount = sortedEvents.filter(event => new Date(event.cal_event_date) < yesterday).length;
      setPreviousEventsCount(previousCount);

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [showPreviousEvents]);

  const fetchEventTypes = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/event-types');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchEventTypes();
  }, [fetchEvents, fetchEventTypes]);

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
      const eventTypeId = parseInt(updatedEvent.event_type, 10) || null;
      const isAthleticEvent = eventTypeId === 1;
      
      const dataToUpdate = {
        event_id: updatedEvent.event_id,
        cal_event_date: updatedEvent.cal_event_date,
        cal_event_time: updatedEvent.cal_event_time,
        cal_event_title: updatedEvent.cal_event_title,
        venue: updatedEvent.venue,
        production: updatedEvent.production ? 1 : 0,
        production_team: updatedEvent.production_team,
        event_type: eventTypeId,
      };

      if (isAthleticEvent) {
        dataToUpdate.cal_team_home = updatedEvent.cal_team_home;
        dataToUpdate.cal_team_away = updatedEvent.cal_team_away;
        dataToUpdate.sport_id = updatedEvent.sport_id;
        dataToUpdate.gender = updatedEvent.gender;
      } else {
        dataToUpdate.cal_team_home = null;
        dataToUpdate.cal_team_away = null;
        dataToUpdate.sport_id = null;
        dataToUpdate.gender = null;
      }

      console.log('Sending update request with data:', dataToUpdate);

      const response = await axios.put(`http://localhost:3001/api/calendar/${updatedEvent.event_id}`, dataToUpdate);
      
      if (response.data.message === 'Event updated successfully') {
        console.log('Event updated successfully');
        fetchEvents(); // Refresh the events list
        setEditingId(null); // Close the edit form
      } else {
        console.error('Failed to update event:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEventDelete = async (deletedEventId) => {
    setEvents(events.filter(event => event.event_id !== deletedEventId));
    setEditingId(null);
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

  const togglePreviousEvents = () => {
    setShowPreviousEvents(!showPreviousEvents);
  };

  const handleAddEvent = async (newEvent) => {
    try {
      await fetchEvents(); // Refresh the events list
      setShowAddEventForm(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleNonSportEventSubmit = async (formData) => {
    try {
      await axios.post('http://localhost:3001/api/calendar', formData);
      setShowNonSportForm(false);
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error adding non-sport event:', error);
    }
  };

  const handleCreateVimeoStream = async (event) => {
    setLoadingEventId(event.id);
    setFeedbackMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/create-vimeo-stream', {
        eventTitle: event.cal_event_title,
        eventDate: event.cal_event_date,
        eventTime: event.cal_event_time,
        eventId: event.id
      });

      if (response.data.success) {
        setFeedbackMessage('Vimeo stream created successfully!');
        fetchEvents(); // Refresh the events list
      } else {
        setFeedbackMessage('Failed to create Vimeo stream.');
      }
    } catch (error) {
      console.error('Error creating Vimeo stream:', error);
      setFeedbackMessage('Error creating Vimeo stream.');
    } finally {
      setLoadingEventId(null);
    }
  };

  return (
    <div className="event-table-container">
      <h2>Event Table</h2>
      <div className="button-container">
        <button onClick={togglePreviousEvents}>
          {showPreviousEvents 
            ? "Hide Previous Events" 
            : `See Previous ${previousEventsCount} Events`}
        </button>
        <button onClick={() => setShowAddEventForm(true)}>Add New Event</button>
        <button onClick={() => setShowNonSportForm(true)}>Add Non-Sport Event</button>
      </div>
      
      {showAddEventForm && (
        <div className="modal">
          <div className="modal-content">
            <AddEventForm onSubmit={handleAddEvent} onCancel={() => setShowAddEventForm(false)} />
          </div>
        </div>
      )}

      {showNonSportForm && (
        <NonSportEventForm
          onSubmit={handleNonSportEventSubmit}
          onCancel={() => setShowNonSportForm(false)}
        />
      )}

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
            <th>Sport</th>
            <th>Stream Key</th>
            <th>Status</th>
            <th>Boxcast</th>
            <th>Action</th>
            <th>Stream</th>
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
                <td>{eventTypes.find(type => type.type_id === event.event_type)?.event_type || 'N/A'}</td>
                <td><input type="checkbox" checked={event.production === 1} readOnly /></td>
                <td>{event.production_team_name}</td>
                <td>{event.venue_name}</td>
                <td>{event.gender}</td>
                <td>{event.sport_name}</td>
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
                <td>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateVimeoStream(event);
                    }} 
                    disabled={!!event.vimeo_stream_id || loadingEventId === event.id}
                  >
                    {loadingEventId === event.id ? 'Creating...' : 'Create Vimeo Stream'}
                  </button>
                  {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
                </td>
              </tr>
              {editingId === event.event_id && (
                <tr>
                  <td colSpan="16">
                    <EventForm 
                      event={event} 
                      onSubmit={handleEventUpdate} 
                      onDelete={handleEventDelete}
                      eventTypes={eventTypes}
                    />
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
