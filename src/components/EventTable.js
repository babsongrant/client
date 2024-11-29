import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EventTable.css';
import EventForm from './EventForm';
import AddEventForm from './AddEventForm';
import NonSportEventForm from './NonSportEventForm';

function EventTable() {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNonSportForm, setShowNonSportForm] = useState(false);
  const [loadingEventId, setLoadingEventId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showPreviousEvents, setShowPreviousEvents] = useState(false);
  const [previousEventsCount, setPreviousEventsCount] = useState(0);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      console.log('Fetching events...');
      // First, test the connection
      const testResponse = await axios.get('http://localhost:3001/api/test');
      console.log('API Test Response:', testResponse.data);

      // Then fetch the actual data
      const response = await axios.get('http://localhost:3001/api/calendar');
      console.log('Raw Calendar Data:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const sortedEvents = response.data.sort((a, b) => 
        new Date(a.cal_event_date) - new Date(b.cal_event_date)
      );
      
      const filteredEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.cal_event_date);
        return showPreviousEvents || eventDate >= yesterday;
      });

      // Calculate previous events count
      const previousCount = sortedEvents.filter(event => 
        new Date(event.cal_event_date) < yesterday
      ).length;
      
      setPreviousEventsCount(previousCount);

      console.log('Setting events state with:', filteredEvents);
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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

  const handleFormSubmit = async (eventData) => {
    try {
      console.log('EventTable - Received form data:', eventData);

      // Make the update request to the server
      const response = await axios.put(
        `http://localhost:3001/api/calendar/${eventData.event_id}`,
        eventData
      );
      
      if (response.data.success) {
        console.log('Event updated successfully');
        await fetchEvents(); // Refresh the events list
        setEditingId(null); // Close the form
      } else {
        throw new Error(response.data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
    setSelectedEvent(null);
  };

  const handleFormDelete = async () => {
    await fetchEvents();
    setShowEditForm(false);
    setSelectedEvent(null);
  };

  const handleAddFormSubmit = async (newEventData) => {
    await fetchEvents();
    setShowAddForm(false);
  };

  const handleNonSportFormSubmit = async (newEventData) => {
    await fetchEvents();
    setShowNonSportForm(false);
  };

  const handleAddFormCancel = () => {
    setShowAddForm(false);
  };

  const handleNonSportFormCancel = () => {
    setShowNonSportForm(false);
  };

  const handleMakeSlate = async (event) => {
    console.log('handleMakeSlate called with event:', event);
    
    if (event.slate) {
      console.log('Attempting to delete slate');
      try {
        const response = await axios.post('http://localhost:3001/api/delete-slate', {
          eventId: event.event_id
        });
        console.log('Delete slate response:', response.data);
        
        if (response.data.success) {
          await fetchEvents();
        } else {
          console.error('Failed to delete slate:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting slate:', error);
      }
    } else {
      // Check if we need to force update the slate
      const shouldForceUpdate = true; // Always recreate slate with current data
      
      console.log('Attempting to create/update slate with data:', {
        eventId: event.event_id,
        homeTeam: event.home_team_name,
        awayTeam: event.away_team_name,
        eventDate: event.cal_event_date,
        eventTime: event.cal_event_time,
        sportId: event.sport_id,
        forceUpdate: shouldForceUpdate
      });
      
      try {
        const response = await axios.post('http://localhost:3001/api/make-slate', {
          eventId: event.event_id,
          homeTeam: event.home_team_name,
          awayTeam: event.away_team_name,
          eventDate: event.cal_event_date,
          eventTime: event.cal_event_time,
          sportId: event.sport_id,
          forceUpdate: shouldForceUpdate
        });
        console.log('Create slate response:', response.data);
        
        if (response.data.success) {
          await fetchEvents();
        } else {
          console.error('Failed to create slate:', response.data.message);
        }
      } catch (error) {
        console.error('Error creating slate:', error);
      }
    }
  };

  const handleCreateVimeoStream = async (event) => {
    setLoadingEventId(event.event_id);
    setFeedbackMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/create-vimeo-stream', {
        eventTitle: event.cal_event_title,
        eventDate: event.cal_event_date,
        eventTime: event.cal_event_time,
        eventId: event.event_id
      });

      if (response.data.success) {
        setFeedbackMessage('Vimeo stream created successfully!');
        fetchEvents();
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

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getRowStyle = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);

    if (eventDateObj.getTime() === today.getTime()) {
      return { backgroundColor: '#e8f5e9' }; // Light green for today
    } else if (eventDateObj.getTime() === tomorrow.getTime()) {
      return { backgroundColor: '#fff3e0' }; // Light orange for tomorrow
    }
    return {};
  };

  const renderTeamWithLogo = (teamName, logoFilename) => {
    if (!teamName) return null;
    
    const logoPath = logoFilename 
      ? `${process.env.PUBLIC_URL}/images/logos/${logoFilename}`
      : null;

    return (
      <div className="team-logo-container">
        {logoPath && (
          <img 
            src={logoPath} 
            alt={`${teamName} logo`} 
            className="team-logo"
            onError={(e) => {
              console.error(`Failed to load image for ${teamName}: ${logoPath}`);
              e.target.style.display = 'none';
            }}
          />
        )}
        <span>{teamName}</span>
      </div>
    );
  };

  const togglePreviousEvents = () => {
    setShowPreviousEvents(!showPreviousEvents);
  };

  const handleAddEvent = async (formData) => {
    try {
      console.log('Original form data:', formData);
      
      const submitData = {
        ...formData,
        cal_team_home: parseInt(formData.home_team_id, 10),
        cal_team_away: parseInt(formData.away_team_id, 10),
        production_team: formData.production 
          ? parseInt(formData.production_team_id, 10)
          : 3,
        venue: parseInt(formData.venue_id, 10),
        event_type: parseInt(formData.event_type, 10),
        season: parseInt(formData.season, 10),
        competition_type: parseInt(formData.competition_type, 10),
        production: formData.production ? 1 : 0,
        company: parseInt(formData.company, 10)
      };

      console.log('Processed submit data:', submitData);

      // Create the event
      const response = await axios.post('http://localhost:3001/api/calendar', submitData);

      if (response.data.success) {
        // If crew assignments exist, save them
        if (formData.selectedCrewAssignments) {
          const crewAssignments = Object.entries(formData.selectedCrewAssignments).map(([roleId, assignment]) => ({
            event_id: response.data.event_id,
            event_role: roleId,
            crew_id: assignment.crew_id,
            user_id: assignment.user_id || null,
            work_confirmed: 'Pending',
            crew_paid: 'No',
            assign_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }));

          await axios.post(
            `http://localhost:3001/api/events/${response.data.event_id}/crew`,
            { assignments: crewAssignments }
          );
        }

        await fetchEvents();
        setShowAddEventForm(false);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const handleNonSportEventSubmit = async (formData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/calendar', {
        ...formData,
        event_type: 2, // Non-sport event type
        production: formData.production ? 1 : 0,
        cal_team_home: null,
        cal_team_away: null,
        sport_id: null,
        gender: null
      });

      if (response.data.success) {
        console.log('Non-sport event added successfully:', response.data.event);
        await fetchEvents(); // Refresh the events list
        setShowNonSportForm(false); // Close the form
      } else {
        console.error('Failed to add non-sport event:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding non-sport event:', error);
    }
  };

  const handleRowClick = (eventId) => {
    setEditingId(editingId === eventId ? null : eventId); // Toggle the form
  };

  const renderProductionCell = (production) => {
    if (production === 1) {
      return <input type="checkbox" checked readOnly />;
    } else {
      return <span className="camera-only">Camera</span>;
    }
  };

  let content;
  if (showEditForm) {
    content = (
      <EventForm
        event={selectedEvent}
        onSubmit={handleFormSubmit}
        onDelete={handleFormDelete}
        onCancel={handleFormCancel}
        eventTypes={eventTypes}
      />
    );
  } else if (showAddForm) {
    content = (
      <AddEventForm
        onSubmit={handleAddFormSubmit}
        onCancel={handleAddFormCancel}
      />
    );
  } else if (showNonSportForm) {
    content = (
      <NonSportEventForm
        onSubmit={handleNonSportFormSubmit}
        onCancel={handleNonSportFormCancel}
      />
    );
  } else {
    content = (
      <>
        <div className="event-table-container">
          <div className="table-header">
            <h2>WHOU Events Calendar</h2>
            <div className="button-container">
              <button 
                className="btn-primary"
                onClick={togglePreviousEvents}
              >
                {showPreviousEvents 
                  ? "Hide Previous Events" 
                  : `Show Previous ${previousEventsCount} Events`}
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowAddEventForm(true)}
              >
                Add Sport Event
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowNonSportForm(true)}
              >
                Add Non-Sport Event
              </button>
            </div>
          </div>

          {showAddEventForm && (
            <div className="modal">
              <div className="modal-content">
                <AddEventForm 
                  onSubmit={handleAddEvent} 
                  onCancel={() => setShowAddEventForm(false)}
                />
              </div>
            </div>
          )}

          {showNonSportForm && (
            <div className="modal">
              <div className="modal-content">
                <NonSportEventForm
                  onSubmit={handleNonSportEventSubmit}
                  onCancel={() => setShowNonSportForm(false)}
                />
              </div>
            </div>
          )}

          <table className="event-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Event Type</th>
                <th>Production</th>
                <th>Production Team</th>
                <th>Venue</th>
                <th>Gender</th>
                <th>Sport</th>
                <th>Season</th>
                <th>Stream Key</th>
                <th>Status</th>
                <th>BoxCast</th>
                <th>Slate</th>
                <th>Vimeo Stream</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <React.Fragment key={event.event_id}>
                  <tr 
                    onClick={() => {
                      console.log('Row clicked, event data:', {
                        fullEvent: event,
                        season_id: event.season_id,
                        season: event.season,
                        season_name: event.season_name
                      });
                      handleRowClick(event.event_id);
                    }}
                    className={`event-row ${editingId === event.event_id ? 'active' : ''}`}
                    style={getRowStyle(event.cal_event_date)}
                  >
                    <td>{formatDate(event.cal_event_date)}</td>
                    <td>{formatTime(event.cal_event_time)}</td>
                    <td>{renderTeamWithLogo(event.home_team_name, event.logo_home)}</td>
                    <td>{renderTeamWithLogo(event.away_team_name, event.logo_away)}</td>
                    <td>{eventTypes.find(type => type.type_id === event.event_type)?.event_type || 'N/A'}</td>
                    <td>{renderProductionCell(event.production)}</td>
                    <td>{event.production_team_name}</td>
                    <td>{event.venue_name}</td>
                    <td>{event.gender}</td>
                    <td>{event.sport_name}</td>
                    <td>{event.season_name || 'No Season'}</td>
                    <td>{event.stream_key}</td>
                    <td>{event.cal_status}</td>
                    <td>{event.boxcast_}</td>
                    <td>
                      <button 
                        onClick={(e) => {
                          console.log('Slate button clicked');
                          e.stopPropagation();
                          handleMakeSlate(event);
                        }} 
                        className={event.slate ? 'slate-button slate-complete' : 'slate-button'}
                      >
                        {event.slate ? 'Slate Complete' : 'Make Slate'}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateVimeoStream(event);
                        }} 
                        disabled={!!event.vimeo_stream_id || loadingEventId === event.event_id}
                        className="vimeo-button"
                      >
                        {loadingEventId === event.event_id ? 'Creating...' : 'Create Vimeo Stream'}
                      </button>
                      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
                    </td>
                  </tr>
                  {editingId === event.event_id && (
                    <tr className="edit-form-row">
                      <td colSpan="16">
                        <EventForm 
                          event={event} 
                          onSubmit={handleFormSubmit}
                          onDelete={async () => {
                            await fetchEvents();
                            setEditingId(null);
                          }}
                          eventTypes={eventTypes}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return <div className="event-table-container">{content}</div>;
}

export default EventTable;
