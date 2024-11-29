import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CrewManager.css';
import RoleModal from './RoleModal';
import CrewRateOverride from './CrewRateOverride';

function CrewManager() {
  const [crews, setCrews] = useState([]);
  const [roles, setRoles] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newCrew, setNewCrew] = useState({
    crew_name_first: '',
    crew_name_last: '',
    crew_address1: '',
    crew_address2: '',
    crew_city: '',
    crew_state: '',
    crew_zip: '',
    crew_phone: '',
    crew_email: '',
    crew_pay_method: '',
    crew_method_acct: ''
  });
  const [editingCrew, setEditingCrew] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedCrewForRoles, setSelectedCrewForRoles] = useState(null);
  const [showRateOverride, setShowRateOverride] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);

  useEffect(() => {
    fetchCrews();
    fetchRoles();
    fetchPaymentMethods();
  }, []);

  const fetchCrews = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/crews');
      setCrews(response.data);
    } catch (error) {
      console.error('Error fetching crews:', error);
      setError('Failed to fetch crews');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to fetch payment methods');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrew(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/crews', newCrew);
      
      if (response.data.success) {
        setSuccess('Crew member added successfully!');
        setNewCrew({
          crew_name_first: '',
          crew_name_last: '',
          crew_address1: '',
          crew_address2: '',
          crew_city: '',
          crew_state: '',
          crew_zip: '',
          crew_phone: '',
          crew_email: '',
          crew_pay_method: '',
          crew_method_acct: ''
        });
        await fetchCrews();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add crew member');
    }
  };

  const handleManageRoles = (crew) => {
    setSelectedCrewForRoles(crew);
    setShowRoleModal(true);
  };

  const handleSaveRoles = async (crewId, roles) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/crews/${crewId}/roles`, { roles });
      
      if (response.data.success) {
        setSuccess('Roles updated successfully!');
        await fetchCrews();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update roles');
    }
  };

  const handleEdit = (crew) => {
    setEditingCrew(crew);
    setNewCrew({
      crew_name_first: crew.crew_name_first,
      crew_name_last: crew.crew_name_last,
      crew_address1: crew.crew_address1,
      crew_address2: crew.crew_address2,
      crew_city: crew.crew_city,
      crew_state: crew.crew_state,
      crew_zip: crew.crew_zip,
      crew_phone: crew.crew_phone,
      crew_email: crew.crew_email || '',
      crew_pay_method: crew.crew_pay_method,
      crew_method_acct: crew.crew_method_acct || ''
    });
  };

  const handleDelete = async (crewId) => {
    if (!window.confirm('Are you sure you want to delete this crew member?')) {
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      const response = await axios.delete(`http://localhost:3001/api/crews/${crewId}`);
      
      if (response.data.success) {
        setSuccess('Crew member deleted successfully!');
        await fetchCrews();
      } else {
        setError('Failed to delete crew member: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting crew member:', error);
      setError(error.response?.data?.error || 'Failed to delete crew member');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.put(
        `http://localhost:3001/api/crews/${editingCrew.crew_id}`, 
        newCrew
      );
      
      if (response.data.success) {
        setSuccess('Crew member updated successfully!');
        setEditingCrew(null);
        setNewCrew({
          crew_name_first: '',
          crew_name_last: '',
          crew_address1: '',
          crew_address2: '',
          crew_city: '',
          crew_state: '',
          crew_zip: '',
          crew_phone: '',
          crew_email: '',
          crew_pay_method: '',
          crew_method_acct: ''
        });
        await fetchCrews();
      } else {
        setError('Failed to update crew member: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating crew member:', error);
      setError(error.response?.data?.error || 'Failed to update crew member');
    }
  };

  const handleManageRates = (crew) => {
    setSelectedCrew(crew);
    setShowRateOverride(true);
  };

  return (
    <div className="crew-manager">
      <h2>Manage Crew</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form className="crew-form" onSubmit={editingCrew ? handleUpdate : handleSubmit}>
        <div className="form-row">
          <div>
            <label htmlFor="crew_name_first">First Name *</label>
            <input
              id="crew_name_first"
              name="crew_name_first"
              value={newCrew.crew_name_first}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="crew_name_last">Last Name *</label>
            <input
              id="crew_name_last"
              name="crew_name_last"
              value={newCrew.crew_name_last}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="crew_address1">Address 1</label>
          <input
            id="crew_address1"
            name="crew_address1"
            value={newCrew.crew_address1}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="crew_address2">Address 2</label>
          <input
            id="crew_address2"
            name="crew_address2"
            value={newCrew.crew_address2}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="crew_city">City</label>
            <input
              id="crew_city"
              name="crew_city"
              value={newCrew.crew_city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="crew_state">State</label>
            <input
              id="crew_state"
              name="crew_state"
              value={newCrew.crew_state}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="crew_zip">ZIP</label>
            <input
              id="crew_zip"
              name="crew_zip"
              value={newCrew.crew_zip}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="crew_phone">Phone</label>
            <input
              id="crew_phone"
              name="crew_phone"
              value={newCrew.crew_phone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="crew_email">Email</label>
            <input
              id="crew_email"
              name="crew_email"
              type="email"
              value={newCrew.crew_email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="crew_pay_method">Payment Method</label>
            <select
              id="crew_pay_method"
              name="crew_pay_method"
              value={newCrew.crew_pay_method}
              onChange={handleInputChange}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method.method_id} value={method.method_id}>
                  {method.method_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="crew_method_acct">Payment Account</label>
            <input
              id="crew_method_acct"
              name="crew_method_acct"
              value={newCrew.crew_method_acct}
              onChange={handleInputChange}
              placeholder="Payment account (optional)"
            />
          </div>
        </div>

        <button type="submit">
          {editingCrew ? 'Update Crew Member' : 'Add Crew Member'}
        </button>
        {editingCrew && (
          <button 
            type="button" 
            onClick={() => {
              setEditingCrew(null);
              setNewCrew({
                crew_name_first: '',
                crew_name_last: '',
                crew_address1: '',
                crew_address2: '',
                crew_city: '',
                crew_state: '',
                crew_zip: '',
                crew_phone: '',
                crew_email: '',
                crew_pay_method: '',
                crew_method_acct: ''
              });
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3>Existing Crew Members</h3>
      <table className="crew-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>State</th>
            <th>Payment Method</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {crews.map((crew) => (
            <tr key={crew.crew_id}>
              <td>{`${crew.crew_name_first} ${crew.crew_name_last}`}</td>
              <td>{crew.crew_phone}</td>
              <td>{crew.crew_email}</td>
              <td>{crew.crew_city}</td>
              <td>{crew.crew_state}</td>
              <td>{crew.payment_method_name}</td>
              <td>{crew.roles ? crew.roles.map(role => role.role_name).join(', ') : ''}</td>
              <td>
                <button onClick={() => handleEdit(crew)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(crew.crew_id)} className="delete-button">Delete</button>
                <button onClick={() => handleManageRoles(crew)} className="roles-button">Manage Roles</button>
                <button onClick={() => handleManageRates(crew)} className="rates-button">Manage Rates</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showRoleModal && selectedCrewForRoles && (
        <RoleModal
          crew={selectedCrewForRoles}
          roles={roles}
          onClose={() => setShowRoleModal(false)}
          onSave={handleSaveRoles}
        />
      )}
      {showRateOverride && selectedCrew && (
        <CrewRateOverride
          crew={selectedCrew}
          onClose={() => {
            setShowRateOverride(false);
            setSelectedCrew(null);
          }}
          onUpdate={() => {
            // Refresh crew data if needed
            fetchCrews();
          }}
        />
      )}
    </div>
  );
}

export default CrewManager; 