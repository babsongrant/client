import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    production_team_id: '',
    sport_id: '',
    venue_id: '',
    gender: '',
    event_type: '',
    company: '1',
    cal_status: 'Scheduled',
    season: '',
    level: '',
    competition_type: ''
  });

  const [error, setError] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [productionTeams, setProductionTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [levels, setLevels] = useState([]);
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [selectedCameraOperator, setSelectedCameraOperator] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState({});

  // Fetch all the data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          teamsRes,
          eventTypesRes,
          productionTeamsRes,
          sportsRes,
          venuesRes,
          seasonsRes,
          levelsRes,
          competitionTypesRes,
          companiesRes,
          rolesRes
        ] = await Promise.all([
          axios.get('http://localhost:3001/api/team_names'),
          axios.get('http://localhost:3001/api/event-types'),
          axios.get('http://localhost:3001/api/production_team'),
          axios.get('http://localhost:3001/api/sports'),
          axios.get('http://localhost:3001/api/venues'),
          axios.get('http://localhost:3001/api/sport-seasons'),
          axios.get('http://localhost:3001/api/levels'),
          axios.get('http://localhost:3001/api/competition-types'),
          axios.get('http://localhost:3001/api/companies'),
          axios.get('http://localhost:3001/api/roles')
        ]);

        setTeams(teamsRes.data);
        setEventTypes(eventTypesRes.data);
        setProductionTeams(productionTeamsRes.data);
        setSports(sportsRes.data);
        setVenues(venuesRes.data);
        setSeasons(seasonsRes.data);
        setLevels(levelsRes.data);
        setCompetitionTypes(competitionTypesRes.data);
        setCompanies(companiesRes.data);
        setRoles(rolesRes.data);
        
        console.log('Fetched data:', {
          teams: teamsRes.data,
          eventTypes: eventTypesRes.data,
          productionTeams: productionTeamsRes.data,
          sports: sportsRes.data,
          venues: venuesRes.data,
          seasons: seasonsRes.data,
          levels: levelsRes.data,
          competitionTypes: competitionTypesRes.data,
          companies: companiesRes.data,
          roles: rolesRes.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch form data');
      }
    };

    fetchData();
  }, []);

  // Group competition types by comp_general
  const groupedCompetitionTypes = useMemo(() => {
    const grouped = competitionTypes.reduce((acc, type) => {
      if (!acc[type.comp_general]) {
        acc[type.comp_general] = [];
      }
      acc[type.comp_general].push(type);
      return acc;
    }, {});
    return grouped;
  }, [competitionTypes]);

  // Get relevant seasons function
  const getRelevantSeasons = useCallback((eventDate) => {
    if (!eventDate) {
      console.log('No event date provided');
      return [];
    }
    
    const selectedDate = new Date(eventDate);
    console.log('Selected date:', selectedDate);
    
    const filteredSeasons = seasons.filter(season => {
      const startDate = new Date(season.season_date_start);
      const endDate = new Date(season.season_date_end);
      
      console.log('Checking season:', {
        season: `${season.season} - ${season.season_specific}`,
        startDate,
        endDate,
        selectedDate,
        isWithinRange: selectedDate >= startDate && selectedDate <= endDate
      });
      
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    console.log('Filtered seasons:', filteredSeasons);
    return filteredSeasons;
  }, [seasons]);

  // Calculate relevant seasons based on current event date
  const relevantSeasons = getRelevantSeasons(formData.cal_event_date);

  // Title generation effect
  useEffect(() => {
    const homeTeam = teams.find(team => team.org_id?.toString() === formData.home_team_id?.toString());
    const awayTeam = teams.find(team => team.org_id?.toString() === formData.away_team_id?.toString());
    const sport = sports.find(sport => sport.sport_id?.toString() === formData.sport_id?.toString());
    const gender = formData.gender ? 
      formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase() : '';
    
    if (homeTeam && awayTeam && sport) {
      const formattedDate = formData.cal_event_date ? 
        new Date(formData.cal_event_date).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        }) : '';

      const newTitle = `${awayTeam.org_name} at ${homeTeam.org_name} ${gender} ${formData.level} ${sport.sport_name} ${formattedDate}`;
      setFormData(prev => ({
        ...prev,
        cal_event_title: newTitle
      }));
    }
  }, [
    formData.home_team_id, 
    formData.away_team_id, 
    formData.sport_id, 
    formData.gender, 
    formData.level,
    formData.cal_event_date, 
    teams, 
    sports
  ]);

  // Simple handleChange
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
    // Add home team handling
    else if (name === 'home_team_id') {
      console.log('Home team selected, value:', value);
      console.log('Available teams:', teams);
      const selectedOrg = teams.find(org => org.org_id.toString() === value);
      console.log('Selected organization:', selectedOrg);
      
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value,
          venue_id: selectedOrg?.venueID ? selectedOrg.venueID.toString() : ''
        };
        console.log('Updated form data:', newData);
        return newData;
      });
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Add effect to handle role selection based on production status
  useEffect(() => {
    if (formData.production) {
      // For produced events, pre-select standard roles
      const defaultRoles = roles.filter(role => 
        ['Production', 'Camera', 'Play-by-Play', 'Color'].includes(role.role_name)
      ).map(role => role.role_id);
      setSelectedRoles(defaultRoles);
    } else {
      // For non-produced events, only select Camera
      const cameraRole = roles.find(role => role.role_name === 'Camera');
      setSelectedRoles(cameraRole ? [cameraRole.role_id] : []);
    }
  }, [formData.production, roles]);

  // Add role selection handler
  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Fetch camera operators
  useEffect(() => {
    const fetchCameraOperators = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/crew-with-roles');
        console.log('Crew with roles response:', response.data);
        
        // Filter for crew members who have camera role (role_id 3)
        const cameraOperators = response.data.filter(crew => {
          if (!crew.role_ids) return false;
          const roleIds = crew.role_ids.split(',').map(id => id.trim());
          return roleIds.includes('3'); // Camera role ID
        });

        console.log('Available camera operators:', cameraOperators);
        setCrewMembers(cameraOperators);
      } catch (error) {
        console.error('Error fetching camera operators:', error);
      }
    };

    fetchCameraOperators();
  }, []); // Empty dependency array means this runs once when component mounts

  // Update handleSubmit function
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
    }
    
    try {
      if (onSubmit) {
        await onSubmit(formData);  // Only submit once through the prop
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Failed to submit event');
    }
  };

  // Update the form layout order
  return (
    <form 
      onSubmit={(e) => e.preventDefault()} 
      className="add-event-form"
    >
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cal_event_date">Event Date:</label>
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
          <label htmlFor="cal_event_time">Event Time:</label>
          <input
            type="time"
            id="cal_event_time"
            name="cal_event_time"
            value={formData.cal_event_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sport_id">Sport:</label>
          <select
            id="sport_id"
            name="sport_id"
            value={formData.sport_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Sport</option>
            {sports.map(sport => (
              <option key={sport.sport_id} value={sport.sport_id}>
                {sport.sport_name}
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
            required
          >
            <option value="">Select Gender</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="level">Level:</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="">Select Level</option>
            {levels.map(level => (
              <option key={level.level_name} value={level.level_name}>
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
            value={formData.competition_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Competition Type</option>
            {Object.entries(groupedCompetitionTypes).map(([general, types]) => (
              <optgroup key={general} label={general}>
                {types.map(type => (
                  <option key={type.comp_id} value={type.comp_id}>
                    {type.comp_specific}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Home Team:</label>
          <select
            name="home_team_id"
            value={formData.home_team_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Home Team</option>
            {teams.map(team => (
              <option key={team.org_id} value={team.org_id}>
                {team.org_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Away Team:</label>
          <select
            name="away_team_id"
            value={formData.away_team_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Away Team</option>
            {teams.map(team => (
              <option key={team.org_id} value={team.org_id}>
                {team.org_name}
              </option>
            ))}
          </select>
        </div>
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

      <div className="form-row">
        <div className="form-group">
          <label>Venue:</label>
          <select
            name="venue_id"
            value={formData.venue_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">
              {formData.home_team_id 
                ? "No associated venue - select one" 
                : "Select a venue"}
            </option>
            {venues.map(venue => (
              <option key={venue.venueID} value={venue.venueID}>
                {venue.venue_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="season">Season:</label>
          <select
            id="season"
            name="season"
            value={formData.season}
            onChange={(e) => {
              console.log('Season selected:', e.target.value); // Log the selected value
              handleChange(e);
            }}
            required
          >
            <option value="">Select Season</option>
            {relevantSeasons.map(season => {
              console.log('Season option:', season); // Log each season option
              return (
                <option key={season.season_id} value={season.season_id}>
                  {`${season.season} - ${season.season_specific}`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="form-row">
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
          <label htmlFor="company">Company:</label>
          <select
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
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

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="production"
              checked={formData.production}
              onChange={e => setFormData(prev => ({
                ...prev,
                production: e.target.checked
              }))}
            />
            Production
          </label>
        </div>
      </div>

      {formData.production && (
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
        <label>Event Roles:</label>
        <div className="roles-container">
          {formData.production ? (
            // Show all roles for produced events
            roles.map(role => (
              <label key={role.role_id} className="role-checkbox">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.role_id)}
                  onChange={() => handleRoleToggle(role.role_id)}
                />
                {role.role_name}
              </label>
            ))
          ) : (
            // Show only camera role for non-produced events
            <div className="role-info">
              Camera role will be automatically assigned
            </div>
          )}
        </div>
      </div>

      {!formData.production && (
        <div className="form-group">
          <label>Camera Operator:</label>
          <select
            value={selectedCameraOperator}
            onChange={(e) => setSelectedCameraOperator(e.target.value)}
            required
          >
            <option value="">Select Camera Operator</option>
            {crewMembers.map(crew => (
              <option 
                key={crew.crew_id} 
                value={crew.crew_id}
              >
                {`${crew.crew_name_first} ${crew.crew_name_last}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="button" 
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button 
          type="button" 
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddEventForm;
