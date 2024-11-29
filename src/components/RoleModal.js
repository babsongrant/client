import React, { useState, useEffect } from 'react';
import './RoleModal.css';

function RoleModal({ crew, roles, onClose, onSave }) {
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    // Initialize with crew's existing roles
    if (crew.roles) {
      setSelectedRoles(crew.roles.map(role => role.crew_role));
    }
  }, [crew]);

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async () => {
    await onSave(crew.crew_id, selectedRoles);
    onClose();
  };

  return (
    <div className="role-modal-overlay">
      <div className="role-modal">
        <h3>Manage Roles for {crew.crew_name_first} {crew.crew_name_last}</h3>
        
        <div className="role-list">
          {roles.map(role => (
            <label key={role.role_id} className="role-item">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.role_id)}
                onChange={() => handleRoleToggle(role.role_id)}
              />
              {role.role_name}
            </label>
          ))}
        </div>

        <div className="modal-buttons">
          <button onClick={handleSubmit} className="save-button">Save Roles</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default RoleModal; 