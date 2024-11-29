// client/src/components/EventForm.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './EventForm.css'; // Make sure to create this CSS file

function EventForm({ event, onSubmit, onDelete, eventTypes = [], onCancel }) {
  console.log('EventForm initialization:', {
    event,
    season_id: event?.season_id,
    season_name: event?.season_name
  });

  const [formData, setFormData] = useState({
    event_id: event?.event_id || '',
    cal_event_date: event?.cal_event_date?.split('T')[0] || '',
    cal_event_time: event?.cal_event_time || '',
    cal_event_title: event?.cal_event_title || '',
    cal_team_home: String(event?.home_team_id || ''),
    cal_team_away: String(event?.away_team_id || ''),
    event_type: String(event?.event_type || ''),
    production: event?.production === 1,
    production_team: String(event?.production_id || ''),
    sport_id: String(event?.sport_id || ''),
    venue: String(event?.venue_id || ''),
    gender: event?.gender || '',
    cal_status: event?.cal_status || 'Scheduled',
    company: String(event?.company || '1'),
    season: String(event?.season_id || ''),
    level: event?.level || '',
    competition_type: String(event?.competition_type || '')
  });

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [productionTeams, setProductionTeams] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [levels, setLevels] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showSlateModal, setShowSlateModal] = useState(false);
  const [crewMembers, setCrewMembers] = useState([]);
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState({});
  const [crewByRole, setCrewByRole] = useState({});

  const relevantSeasons = useMemo(() => {
    console.log('Calculating relevant seasons:', {
      allSeasons: seasons,
      currentSportId: formData.sport_id,
      eventDate: formData.cal_event_date
    });
    
    if (!formData.cal_event_date) {
      return seasons;
    }

    const eventDate = new Date(formData.cal_event_date);
    
    const filtered = seasons.filter(season => {
      if (season.season_deleted) return false;
      const seasonStart = new Date(season.season_date_start);
      const seasonEnd = new Date(season.season_date_end);
      return eventDate >= seasonStart && eventDate <= seasonEnd;
    });
    
    return filtered;
  }, [seasons, formData.cal_event_date, formData.sport_id]);

  const groupedCompetitionTypes = useMemo(() => {
    return competitionTypes.reduce((acc, type) => {
      if (!acc[type.comp_general]) {
        acc[type.comp_general] = [];
      }
      acc[type.comp_general].push(type);
      return acc;
    }, {});
  }, [competitionTypes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        const responses = await Promise.all([
          axios.get('http://localhost:3001/api/team_names'),
          axios.get('http://localhost:3001/api/sports'),
          axios.get('http://localhost:3001/api/venues'),
          axios.get('http://localhost:3001/api/production_team'),
          axios.get('http://localhost:3001/api/companies'),
          axios.get('http://localhost:3001/api/sport-seasons'),
          axios.get('http://localhost:3001/api/levels'),
          axios.get('http://localhost:3001/api/competition-types'),
          axios.get('http://localhost:3001/api/roles')
        ]);

        const [
          teamsRes, 
          sportsRes, 
          venuesRes, 
          productionTeamRes, 
          companiesRes,
          seasonsRes,
          levelsRes,
          competitionTypesRes,
          rolesRes
        ] = responses;

        console.log('Seasons response:', seasonsRes.data);

        setTeams(teamsRes.data || []);
        setSports(sportsRes.data || []);
        setVenues(venuesRes.data || []);
        setProductionTeams(productionTeamRes.data || []);
        setCompanies(companiesRes.data || []);
        setSeasons(seasonsRes.data || []);
        setLevels(levelsRes.data || []);
        setCompetitionTypes(competitionTypesRes.data || []);
        setRoles(rolesRes.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (event) {
      console.log('Updating form data from event:', {
        event_season_id: event.season_id,
        event_season_name: event.season_name
      });
      
      setFormData(prevData => ({
        ...prevData,
        season: String(event.season_id || ''),
      }));
    }
  }, [event]);

  useEffect(() => {
    console.log('Current state:', {
      formData,
      teams,
      venues,
      productionTeams,
      event
    });
  }, [formData, teams, venues, productionTeams, event]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('Event data:', event);
    console.log('Form data:', formData);
    console.log('Teams:', teams);
    console.log('Venues:', venues);
    console.log('Production Teams:', productionTeams);
  }, [event, formData, teams, venues, productionTeams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'production') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        production_team: checked ? prev.production_team : '3'
      }));
      
      if (!checked) {
        setSelectedRoles([3]);
      } else {
        setSelectedRoles([]);
      }
    } 
    else if (name === 'cal_team_home') {
      console.log('Home team selected, value:', value);
      console.log('Available teams:', teams);
      
      const selectedTeam = teams.find(team => {
        if (!team || !team.org_id) return false;
        return team.org_id.toString() === value.toString();
      });
      
      console.log('Selected team:', selectedTeam);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        venue: selectedTeam?.venueID ? selectedTeam.venueID.toString() : prev.venue
      }));
    }
    else if (name === 'sport_id') {
      console.log('Sport selected, value:', value);
      setFormData(prev => ({
        ...prev,
        sport_id: value || ''
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First save the event updates
      const eventData = {
        event_id: event.event_id,
        cal_event_date: formData.cal_event_date,
        cal_event_time: formData.cal_event_time,
        cal_event_title: formData.cal_event_title,
        cal_team_home: parseInt(formData.cal_team_home, 10),
        cal_team_away: parseInt(formData.cal_team_away, 10),
        event_type: parseInt(formData.event_type, 10),
        production: formData.production ? 1 : 0,
        production_team: formData.production ? parseInt(formData.production_team, 10) : 3,
        sport_id: formData.sport_id,
        venue: parseInt(formData.venue, 10),
        gender: formData.gender,
        cal_status: formData.cal_status,
        company: parseInt(formData.company, 10),
        season: parseInt(formData.season, 10),
        level: formData.level,
        competition_type: parseInt(formData.competition_type, 10)
      };

      // Save event updates
      await onSubmit(eventData);

      // Then handle crew assignments
      const crewAssignments = [];
      
      if (formData.production) {
        // For production events, use all selected roles
        selectedRoles.forEach(roleId => {
          const assignment = selectedCrewAssignments[roleId];
          if (assignment && assignment.crew_id) {
            crewAssignments.push({
              event_id: event.event_id,
              event_role: roleId,
              crew_id: assignment.crew_id,
              user_id: assignment.user_id || null
            });
          }
        });
      } else {
        // For non-production events, only include camera role (3)
        const cameraAssignment = selectedCrewAssignments['3'];
        if (cameraAssignment && cameraAssignment.crew_id) {
          crewAssignments.push({
            event_id: event.event_id,
            event_role: '3',
            crew_id: cameraAssignment.crew_id,
            user_id: cameraAssignment.user_id || null
          });
        }
      }

      console.log('Updating crew assignments:', crewAssignments);

      if (crewAssignments.length > 0) {
        const crewResponse = await axios.post(
          `http://localhost:3001/api/events/${event.event_id}/crew`,
          { assignments: crewAssignments }
        );

        if (!crewResponse.data.success) {
          throw new Error('Failed to update crew assignments');
        }
      }

      console.log('Event and crew assignments updated successfully');

    } catch (error) {
      console.error('Error in form submission:', error);
      alert(`Failed to save changes: ${error.message}`);
      throw error;
    }
  };

  const handleSaveAsNew = async (e) => {
    e.preventDefault();
    try {
      // Log initial form data for debugging
      console.log('Original formData:', formData);

      // Prepare event data without the event_id to create a new record
      const eventData = {
        cal_event_date: formData.cal_event_date,
        cal_event_time: formData.cal_event_time,
        cal_event_title: formData.cal_event_title,
        cal_team_home: formData.cal_team_home,         // Already a string from form
        cal_team_away: formData.cal_team_away,         // Already a string from form
        event_type: formData.event_type,               // Already a string from form
        production: formData.production ? 1 : 0,
        production_team: formData.production_team,      // Using production_team from form
        sport_id: formData.sport_id,
        venue: formData.venue,                         // Using venue from form
        gender: formData.gender,
        cal_status: formData.cal_status || 'Scheduled',
        company: formData.company,                     // Already a string from form
        season: formData.season,                       // Already a string from form
        level: formData.level,
        competition_type: formData.competition_type    // Already a string from form
      };

      // Log the prepared event data
      console.log('Prepared eventData for submission:', eventData);

      // Create new event
      const response = await axios.post('http://localhost:3001/api/calendar', eventData);
      
      if (response.data.success) {
        const newEventId = response.data.event_id;
        console.log('New event created with ID:', newEventId);

        // Handle crew assignments
        if (formData.production) {
          // For production events
          const crewAssignments = Object.entries(selectedCrewAssignments).map(([roleId, assignment]) => ({
            event_id: newEventId,
            event_role: roleId,
            crew_id: assignment.crew_id,
            user_id: assignment.user_id || null,
            work_confirmed: 'Pending',
            crew_paid: 'No'
          }));

          if (crewAssignments.length > 0) {
            console.log('Saving production crew assignments:', crewAssignments);
            await axios.post(
              `http://localhost:3001/api/events/${newEventId}/crew`,
              { assignments: crewAssignments }
            );
          }
        } else {
          // For camera-only events
          if (selectedCrewAssignments['3']) {
            console.log('Saving camera operator assignment:', selectedCrewAssignments['3']);
            await axios.post(
              `http://localhost:3001/api/events/${newEventId}/crew`,
              {
                assignments: [{
                  event_id: newEventId,
                  event_role: '3',
                  crew_id: selectedCrewAssignments['3'].crew_id,
                  user_id: selectedCrewAssignments['3'].user_id || null,
                  work_confirmed: 'Pending',
                  crew_paid: 'No'
                }]
              }
            );
          }
        }

        alert('Event saved as new successfully!');
        if (onSubmit) {
          await onSubmit(response.data);
        }
      }
    } catch (error) {
      console.error('Error saving event as new:', error);
      console.error('Form data at time of error:', formData);
      console.error('Selected crew assignments:', selectedCrewAssignments);
      alert('Failed to save event as new: ' + (error.response?.data?.error || error.message));
    }
  };

  const isAthleticEvent = parseInt(formData.event_type) === 1;

  console.log('Rendering form with data:', formData);

  const renderSlatePreview = () => {
    if (event.slate) {
      return (
        <div className="slate-preview">
          <img 
            src={`/images/slates/${event.slate}`} 
            alt="Event Slate Preview" 
            height="50"
            style={{ objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => setShowSlateModal(true)}
          />
          
          {/* Slate Modal */}
          {showSlateModal && (
            <div className="modal-overlay" onClick={() => setShowSlateModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button 
                  className="modal-close" 
                  onClick={() => setShowSlateModal(false)}
                >
                  ×
                </button>
                <img 
                  src={`/images/slates/${event.slate}`} 
                  alt="Event Slate Full Size" 
                  style={{ maxWidth: '100%', maxHeight: '90vh' }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchCrewAndAssignments = async () => {
      try {
        const crewResponse = await axios.get('http://localhost:3001/api/crew-with-roles');
        setCrewMembers(crewResponse.data);

        if (event?.event_id) {
          const assignmentsResponse = await axios.get(`http://localhost:3001/api/events/${event.event_id}/crew`);
          
          const assignments = {};
          const selectedRoleIds = [];
          
          assignmentsResponse.data.forEach(assignment => {
            assignments[assignment.event_role] = {
              crew_id: assignment.crew_id.toString(),
              user_id: assignment.user_id
            };
            selectedRoleIds.push(assignment.event_role.toString());
          });

          setSelectedCrewAssignments(assignments);
          setSelectedRoles(selectedRoleIds);
        }
      } catch (error) {
        console.error('Error fetching crew data:', error);
      }
    };

    fetchCrewAndAssignments();
  }, [event?.event_id]);

  useEffect(() => {
    const fetchCrewWithRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/crew-with-roles');
        const crewMembers = response.data;
        
        const crewMembersByRole = {};
        
        crewMembers.forEach(crew => {
          const roleIds = crew.role_ids ? crew.role_ids.split(',') : [];
          
          roleIds.forEach(roleId => {
            if (!crewMembersByRole[roleId]) {
              crewMembersByRole[roleId] = [];
            }
            crewMembersByRole[roleId].push({
              crew_id: crew.crew_id,
              crew_name: `${crew.crew_name_first} ${crew.crew_name_last}`,
              crew_full_name: crew.crew_full_name,
              user_id: crew.user_id
            });
          });
        });

        setCrewByRole(crewMembersByRole);
        
        if (event?.event_id) {
          const assignmentsResponse = await axios.get(`http://localhost:3001/api/events/${event.event_id}/crew`);
          const existingAssignments = assignmentsResponse.data.reduce((acc, assignment) => ({
            ...acc,
            [assignment.event_role]: {
              crew_id: assignment.crew_id.toString(),
              user_id: assignment.user_id
            }
          }), {});
          
          setSelectedCrewAssignments(existingAssignments);
        }
      } catch (error) {
        console.error('Error fetching crew with roles:', error);
      }
    };

    fetchCrewWithRoles();
  }, [event]);

  const renderRolesSection = () => {
    if (!formData.production) {
      // Non-production event - show only camera role
      const cameraRole = roles.find(role => role.role_id === 3);
      if (!cameraRole) return null;

      // Filter crew members who have camera role
      const cameraCrewMembers = crewByRole['3'] || [];

      return (
        <div className="roles-section">
          <div className="form-group">
            <label>Camera Assignment:</label>
            <div className="role-item">
              <input
                type="checkbox"
                id="camera-role"
                checked={true}
                disabled={true}
              />
              <label htmlFor="camera-role">{cameraRole.role_name}</label>
              
              <select
                value={selectedCrewAssignments['3']?.crew_id || ''}
                onChange={(e) => {
                  const selectedCrewId = e.target.value;
                  const selectedCrew = crewByRole['3']?.find(cm => cm.crew_id.toString() === selectedCrewId);
                  
                  setSelectedCrewAssignments(prev => ({
                    ...prev,
                    '3': {
                      crew_id: selectedCrewId,
                      user_id: selectedCrew?.user_id || null
                    }
                  }));
                }}
              >
                <option value="">Select Camera Operator</option>
                {cameraCrewMembers.map(crew => (
                  <option key={crew.crew_id} value={crew.crew_id.toString()}>
                    {crew.crew_full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    // Production event - show all selected roles with checkboxes
    return (
      <div className="roles-section">
        <h3>Crew Assignments</h3>
        {roles.map(role => {
          const isSelected = selectedRoles.includes(role.role_id.toString());
          const availableCrew = crewByRole[role.role_id] || [];

          return (
            <div key={role.role_id} className="role-item">
              <input
                type="checkbox"
                id={`role-${role.role_id}`}
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRoles([...selectedRoles, role.role_id.toString()]);
                  } else {
                    setSelectedRoles(selectedRoles.filter(id => id !== role.role_id.toString()));
                    // Clear crew assignment when role is unselected
                    setSelectedCrewAssignments(prev => {
                      const updated = { ...prev };
                      delete updated[role.role_id];
                      return updated;
                    });
                  }
                }}
              />
              <label htmlFor={`role-${role.role_id}`}>{role.role_name}</label>
              
              {isSelected && (
                <select
                  value={selectedCrewAssignments[role.role_id]?.crew_id || ''}
                  onChange={(e) => {
                    const selectedCrewId = e.target.value;
                    const selectedCrew = availableCrew.find(cm => cm.crew_id.toString() === selectedCrewId);
                    
                    setSelectedCrewAssignments(prev => ({
                      ...prev,
                      [role.role_id]: {
                        crew_id: selectedCrewId,
                        user_id: selectedCrew?.user_id || null
                      }
                    }));
                  }}
                >
                  <option value="">Select Crew Member</option>
                  {availableCrew.map(crew => (
                    <option key={crew.crew_id} value={crew.crew_id.toString()}>
                      {crew.crew_full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDelete = async () => {
    if (!formData.event_id) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:3001/api/events/${formData.event_id}`);
      if (response.data.success) {
        if (onDelete) {
          await onDelete();
        }
      } else {
        console.error('Failed to delete event:', response.data.message);
        alert('Failed to delete event: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchCrewAssignments = async () => {
      if (!event?.event_id) return;

      try {
        // Fetch existing crew assignments for this event
        const response = await axios.get(`http://localhost:3001/api/events/${event.event_id}/crew`);
        console.log('Fetched crew assignments:', response.data);

        // Convert the assignments into the format we need
        const assignments = {};
        const selectedRoleIds = [];

        response.data.forEach(assignment => {
          assignments[assignment.event_role] = {
            crew_id: assignment.crew_id.toString(),
            user_id: assignment.user_id,
            rate_id: assignment.rate_id
          };
          selectedRoleIds.push(assignment.event_role.toString());
        });

        console.log('Processed assignments:', assignments);
        console.log('Selected roles:', selectedRoleIds);

        // Set the assignments and selected roles
        setSelectedCrewAssignments(assignments);
        
        // If it's not a production event, make sure camera role (3) is selected
        if (!formData.production) {
          setSelectedRoles(['3']);
        } else {
          setSelectedRoles(selectedRoleIds);
        }

      } catch (error) {
        console.error('Error fetching crew assignments:', error);
      }
    };

    fetchCrewAssignments();
  }, [event?.event_id, formData.production]); // Dependencies include event ID and production status

  useEffect(() => {
    if (event) {
      console.log('Initial form data:', formData);
    }
  }, [formData]);

  useEffect(() => {
    console.log('Current form data:', formData);
    console.log('Current event data:', event);
    console.log('Available seasons:', relevantSeasons);
  }, [formData, event, relevantSeasons]);

  useEffect(() => {
    console.log('Form data updated:', {
      formData,
      season: formData.season,
      eventSeason: event?.season_id
    });
  }, [formData, event]);

  useEffect(() => {
    console.log('Relevant seasons updated:', {
      seasons: relevantSeasons,
      currentSeason: formData.season,
      sportId: formData.sport_id
    });
  }, [relevantSeasons, formData.season, formData.sport_id]);

  const renderSeasonSelect = () => {
    return (
      <div className="form-group">
        <label htmlFor="season">Season:</label>
        <select
          id="season"
          name="season"
          value={formData.season || ''}
          onChange={handleChange}
          required
        >
          <option value="">Select Season</option>
          {relevantSeasons.map(season => {
            console.log('Rendering season option:', {
              seasonId: season.season_id,
              seasonDates: `${season.season_date_start} - ${season.season_date_end}`,
              formDataSeason: formData.season,
              match: String(season.season_id) === String(formData.season)
            });
            return (
              <option 
                key={season.season_id} 
                value={String(season.season_id)}
              >
                {`${season.season} - ${season.season_specific}`}
              </option>
            );
          })}
        </select>
      </div>
    );
  };

  const handleCrewAssignment = (roleId, crewId) => {
    const selectedCrew = crewByRole[roleId]?.find(crew => crew.crew_id.toString() === crewId);
    
    setSelectedCrewAssignments(prev => ({
      ...prev,
      [roleId]: {
        crew_id: crewId || null,
        user_id: selectedCrew?.user_id || null
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="edit-event-form">
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
              <label htmlFor="cal_team_home">Home Team:</label>
              <select
                id="cal_team_home"
                name="cal_team_home"
                value={formData.cal_team_home}
                onChange={handleChange}
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.org_id} value={String(team.org_id)}>
                    {team.org_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cal_team_away">Away Team:</label>
              <select
                id="cal_team_away"
                name="cal_team_away"
                value={formData.cal_team_away}
                onChange={handleChange}
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option key={team.org_id} value={String(team.org_id)}>
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
                value={formData.sport_id || ''}
                onChange={handleChange}
              >
                <option value="">Select Sport</option>
                {sports.map(sport => (
                  <option 
                    key={sport.sport_id} 
                    value={sport.sport_id.toString()}
                  >
                    {sport.sport_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="form-group">
          <label htmlFor="venue">Venue:</label>
          <select
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
          >
            <option value="">Select Venue</option>
            {venues.map(venue => (
              <option key={venue.venueID} value={String(venue.venueID)}>
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
            <label htmlFor="production_team">Production Team:</label>
            <select
              id="production_team"
              name="production_team"
              value={formData.production_team}
              onChange={handleChange}
            >
              <option value="">Select Production Team</option>
              {productionTeams.map(team => (
                <option key={team.team_id} value={String(team.team_id)}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="company">Company:</label>
          <select
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          >
            {companies.map(company => (
              <option key={company.company_id} value={company.company_id.toString()}>
                {company.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        {renderSeasonSelect()}

        <div className="form-group">
          <label htmlFor="level">Level:</label>
          <select
            id="level"
            name="level"
            value={formData.level || ''}
            onChange={handleChange}
          >
            <option value="">Select Level</option>
            {levels.map(level => (
              <option 
                key={level.level_name} 
                value={level.level_name}
              >
                {level.level_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="competition_type">Competition Type:</label>
          <select
            id="competition_type"
            name="competition_type"
            value={formData.competition_type || ''}
            onChange={handleChange}
          >
            <option value="">Select Competition Type</option>
            {Object.entries(groupedCompetitionTypes).map(([general, types]) => (
              <optgroup key={general} label={general}>
                {types.map(type => (
                  <option 
                    key={type.comp_id} 
                    value={type.comp_id.toString()}
                  >
                    {type.comp_specific}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {renderRolesSection()}

      <div className="form-actions">
        {renderSlatePreview()}
        <div className="button-group">
          <button type="submit" className="btn-primary">Save Changes</button>
          <button 
            type="button" 
            onClick={handleSaveAsNew} 
            className="btn-success"
          >
            Save as New
          </button>
          <button 
            type="button" 
            onClick={() => {
              console.log('Delete button clicked');
              handleDelete();
            }} 
            className="btn-danger"
          >
            Delete
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </form>
  );
}

export default EventForm;
