import React, { useState } from 'react';
import axios from 'axios';
import './CsvImport.css';

function CsvImport({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('File selected:', selectedFile);
    setFile(selectedFile);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    console.log('Starting file upload process');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('csvFile', file);

    setLoading(true);
    try {
      console.log('Sending request to: http://localhost:3001/api/import-calendar');
      const response = await axios.post('http://localhost:3001/api/import-calendar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        setSuccess('File uploaded successfully');
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        setError(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(
        error.response?.data?.error || 
        error.message || 
        'Error importing CSV file'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csv-import">
      <h3>Import Events from CSV</h3>
      <form onSubmit={handleSubmit}>
        <div className="file-input">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={!file || loading}
          className="import-button"
        >
          {loading ? 'Importing...' : 'Import CSV'}
        </button>
      </form>
    </div>
  );
}

export default CsvImport; 