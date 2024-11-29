import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './OrganizationManager.css';

function OrganizationManager() {
  const [organizations, setOrganizations] = useState([]);
  const [editingOrg, setEditingOrg] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newOrg, setNewOrg] = useState({
    org_name: '',
    org_address: '',
    org_city: '',
    org_state: '',
    org_zip: '',
    org_type: '',
    org_logo: '',
    org_mascot: '',
    org_teams: '',
    org_level: '',
    org_color1: '#000000',
    org_color2: '#FFFFFF',
    org_MPA_Region: '',
    org_size: '',
    org_NFHS_logo: ''
  });
  const [parentOrgs, setParentOrgs] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/organizations');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to load organizations');
    }
  };

  const fetchParentOrgs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/organizations');
      const filteredOrgs = editingOrg 
        ? response.data.filter(org => org.org_id !== editingOrg.org_id)
        : response.data;
      setParentOrgs(filteredOrgs);
    } catch (error) {
      console.error('Error fetching parent organizations:', error);
      setError('Failed to load parent organizations');
    }
  }, [editingOrg]);

  useEffect(() => {
    fetchOrganizations();
    fetchParentOrgs();
  }, [fetchParentOrgs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingOrg) {
      setEditingOrg({ ...editingOrg, [name]: value });
    } else {
      setNewOrg({ ...newOrg, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submissionData = {
        ...newOrg,
        org_id_parent: newOrg.org_id_parent ? parseInt(newOrg.org_id_parent) : null
      };

      const response = await axios.post('http://localhost:3001/api/organizations', submissionData);
      
      if (response.data.success) {
        setSuccess('Organization added successfully!');
        setNewOrg({
          org_name: '',
          org_address: '',
          org_city: '',
          org_state: '',
          org_zip: '',
          org_type: '',
          org_logo: '',
          org_mascot: '',
          org_teams: '',
          org_level: '',
          org_color1: '#000000',
          org_color2: '#FFFFFF',
          org_MPA_Region: '',
          org_size: '',
          org_NFHS_logo: '',
          org_id_parent: ''
        });
        await fetchOrganizations();
      }
    } catch (error) {
      console.error('Error adding organization:', error);
      setError(error.response?.data?.error || 'Failed to add organization');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updateData = {
        ...editingOrg,
        org_id_parent: editingOrg.org_id_parent ? parseInt(editingOrg.org_id_parent) : null
      };

      const response = await axios.put(
        `http://localhost:3001/api/organizations/${editingOrg.org_id}`, 
        updateData
      );
      
      if (response.data.success) {
        setSuccess('Organization updated successfully!');
        setEditingOrg(null);
        await fetchOrganizations();
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setError(error.response?.data?.error || 'Failed to update organization');
    }
  };

  const handleDelete = async (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        const response = await axios.delete(`http://localhost:3001/api/organizations/${orgId}`);
        if (response.data.success) {
          setSuccess('Organization deleted successfully!');
          await fetchOrganizations();
        }
      } catch (error) {
        console.error('Error deleting organization:', error);
        setError('Failed to delete organization');
      }
    }
  };

  const handleSaveAsNew = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const newOrgData = { ...editingOrg };
      const originalOrgId = newOrgData.org_id;
      delete newOrgData.org_id;
      
      if (!newOrgData.org_id_parent) {
        newOrgData.org_id_parent = originalOrgId;
      }
      
      const response = await axios.post('http://localhost:3001/api/organizations', newOrgData);
      
      if (response.data.success) {
        setSuccess('Organization saved as new record successfully!');
        setEditingOrg(null);
        setExpandedRow(null);
        await fetchOrganizations();
      }
    } catch (error) {
      console.error('Error saving organization as new:', error);
      setError(error.response?.data?.error || 'Failed to save organization as new');
    }
  };

  const handleRowClick = (orgId) => {
    if (expandedRow === orgId) {
      setExpandedRow(null);
      setEditingOrg(null);
    } else {
      setExpandedRow(orgId);
      const org = organizations.find(o => o.org_id === orgId);
      setEditingOrg(org);
    }
  };

  return (
    <div className="organization-manager">
      <h2>Manage Organizations</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button 
        onClick={() => setShowNewForm(!showNewForm)} 
        className="btn-primary new-org-button"
      >
        {showNewForm ? 'Cancel New Organization' : 'Add New Organization'}
      </button>

      {showNewForm && (
        <form onSubmit={handleSubmit} className="organization-form">
          <h3>Add New Organization</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Organization Name:</label>
              <input
                type="text"
                name="org_name"
                value={editingOrg ? editingOrg.org_name : newOrg.org_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                name="org_address"
                value={editingOrg ? editingOrg.org_address : newOrg.org_address}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="org_city"
                value={editingOrg ? editingOrg.org_city : newOrg.org_city}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="org_state"
                value={editingOrg ? editingOrg.org_state : newOrg.org_state}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>ZIP:</label>
              <input
                type="text"
                name="org_zip"
                value={editingOrg ? editingOrg.org_zip : newOrg.org_zip}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Type:</label>
              <input
                type="text"
                name="org_type"
                value={editingOrg ? editingOrg.org_type : newOrg.org_type}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Logo:</label>
              <input
                type="text"
                name="org_logo"
                value={editingOrg ? editingOrg.org_logo : newOrg.org_logo}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Mascot:</label>
              <input
                type="text"
                name="org_mascot"
                value={editingOrg ? editingOrg.org_mascot : newOrg.org_mascot}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Teams:</label>
              <input
                type="text"
                name="org_teams"
                value={editingOrg ? editingOrg.org_teams : newOrg.org_teams}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Level:</label>
              <input
                type="text"
                name="org_level"
                value={editingOrg ? editingOrg.org_level : newOrg.org_level}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Primary Color:</label>
              <input
                type="color"
                name="org_color1"
                value={editingOrg ? editingOrg.org_color1 : newOrg.org_color1}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Secondary Color:</label>
              <input
                type="color"
                name="org_color2"
                value={editingOrg ? editingOrg.org_color2 : newOrg.org_color2}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>MPA Region:</label>
              <input
                type="text"
                name="org_MPA_Region"
                value={editingOrg ? editingOrg.org_MPA_Region : newOrg.org_MPA_Region}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Size:</label>
              <input
                type="text"
                name="org_size"
                value={editingOrg ? editingOrg.org_size : newOrg.org_size}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>NFHS Logo:</label>
              <input
                type="text"
                name="org_NFHS_logo"
                value={editingOrg ? editingOrg.org_NFHS_logo : newOrg.org_NFHS_logo}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="org_id_parent">Parent Organization:</label>
              <select
                id="org_id_parent"
                name="org_id_parent"
                value={editingOrg ? editingOrg.org_id_parent || '' : newOrg.org_id_parent || ''}
                onChange={handleInputChange}
              >
                <option value="">No Parent Organization</option>
                {parentOrgs.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.org_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Add Organization
            </button>
          </div>
        </form>
      )}

      <div className="organizations-list">
        <h3>Organizations</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>State</th>
              <th>Type</th>
              <th>Level</th>
              <th>Parent Organization</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <React.Fragment key={org.org_id}>
                <tr 
                  onClick={() => handleRowClick(org.org_id)}
                  className={`org-row ${expandedRow === org.org_id ? 'expanded' : ''}`}
                >
                  <td>{org.org_name}</td>
                  <td>{org.org_city}</td>
                  <td>{org.org_state}</td>
                  <td>{org.org_type}</td>
                  <td>{org.org_level}</td>
                  <td>
                    {org.org_id_parent ? 
                      organizations.find(parent => parent.org_id === org.org_id_parent)?.org_name 
                      : ''}
                  </td>
                </tr>
                {expandedRow === org.org_id && (
                  <tr className="edit-form-row">
                    <td colSpan="6">
                      <form onSubmit={handleUpdate} className="organization-form">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Organization Name:</label>
                            <input
                              type="text"
                              name="org_name"
                              value={editingOrg ? editingOrg.org_name : newOrg.org_name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Address:</label>
                            <input
                              type="text"
                              name="org_address"
                              value={editingOrg ? editingOrg.org_address : newOrg.org_address}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>City:</label>
                            <input
                              type="text"
                              name="org_city"
                              value={editingOrg ? editingOrg.org_city : newOrg.org_city}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>State:</label>
                            <input
                              type="text"
                              name="org_state"
                              value={editingOrg ? editingOrg.org_state : newOrg.org_state}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>ZIP:</label>
                            <input
                              type="text"
                              name="org_zip"
                              value={editingOrg ? editingOrg.org_zip : newOrg.org_zip}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Type:</label>
                            <input
                              type="text"
                              name="org_type"
                              value={editingOrg ? editingOrg.org_type : newOrg.org_type}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Logo:</label>
                            <input
                              type="text"
                              name="org_logo"
                              value={editingOrg ? editingOrg.org_logo : newOrg.org_logo}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Mascot:</label>
                            <input
                              type="text"
                              name="org_mascot"
                              value={editingOrg ? editingOrg.org_mascot : newOrg.org_mascot}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Teams:</label>
                            <input
                              type="text"
                              name="org_teams"
                              value={editingOrg ? editingOrg.org_teams : newOrg.org_teams}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Level:</label>
                            <input
                              type="text"
                              name="org_level"
                              value={editingOrg ? editingOrg.org_level : newOrg.org_level}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Primary Color:</label>
                            <input
                              type="color"
                              name="org_color1"
                              value={editingOrg ? editingOrg.org_color1 : newOrg.org_color1}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Secondary Color:</label>
                            <input
                              type="color"
                              name="org_color2"
                              value={editingOrg ? editingOrg.org_color2 : newOrg.org_color2}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>MPA Region:</label>
                            <input
                              type="text"
                              name="org_MPA_Region"
                              value={editingOrg ? editingOrg.org_MPA_Region : newOrg.org_MPA_Region}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Size:</label>
                            <input
                              type="text"
                              name="org_size"
                              value={editingOrg ? editingOrg.org_size : newOrg.org_size}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>NFHS Logo:</label>
                            <input
                              type="text"
                              name="org_NFHS_logo"
                              value={editingOrg ? editingOrg.org_NFHS_logo : newOrg.org_NFHS_logo}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="org_id_parent">Parent Organization:</label>
                            <select
                              id="org_id_parent"
                              name="org_id_parent"
                              value={editingOrg ? editingOrg.org_id_parent || '' : newOrg.org_id_parent || ''}
                              onChange={handleInputChange}
                            >
                              <option value="">No Parent Organization</option>
                              {parentOrgs.map((org) => (
                                <option key={org.org_id} value={org.org_id}>
                                  {org.org_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn-primary">
                            Update Organization
                          </button>
                          <button 
                            type="button" 
                            onClick={handleSaveAsNew} 
                            className="btn-success"
                          >
                            Save as New
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(org.org_id)} 
                            className="btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrganizationManager; 