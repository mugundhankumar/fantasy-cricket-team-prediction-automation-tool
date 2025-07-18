// File: D:\mugundhan\GLgenia\GL_Genie_Complete_Updated\frontend\src\components\TeamUploader.jsx

import React, { useState } from 'react';
// Correct path for BASE_URL. config.js is in 'src', this component is in 'src/components'.
// So, relative path is '../config'.
import { BASE_URL } from '../config'; 
// PapaParse is needed for CSV parsing, ensure you have it installed: npm install papaparse
import Papa from 'papaparse'; 

const TeamUploader = () => {
  // IMPORTANT: Ensure this line is exactly as written and is at the top of the component
  const [file, setFile] = useState(null); 

  const [csvPreview, setCsvPreview] = useState([]); // For displaying CSV content preview
  const [matchIdsToPredict, setMatchIdsToPredict] = useState([]); // Stores extracted match_ids (if using for auto-predict batch)
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]); // Array to store multiple prediction results (if batch)

  console.log('DEBUG: BASE_URL in TeamUploader is:', BASE_URL, 'Type:', typeof BASE_URL);

  const handleFileChange = (e) => {
    setMessage('');
    setError('');
    setCsvPreview([]); 
    setMatchIdsToPredict([]);
    setPredictions([]); // Clear previous predictions

    const selectedFile = e.target.files[0]; // Changed 'file' to 'selectedFile' to avoid confusion with state variable 'file'
    if (!selectedFile) { // Check if a file was actually selected
      setFile(null); // Clear the state if no file
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      setFile(null); // Clear the state
      return;
    }

    setFile(selectedFile); // Set the state variable 'file'

    // Use PapaParse to parse the CSV file
    Papa.parse(selectedFile, { // Use selectedFile here
      header: true, // Assuming the first row contains headers
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          return;
        }

        setCsvPreview(results.data.slice(0, 5)); // Display a preview of the CSV data

        const extractedIds = results.data
            .map(row => row.match_id || row[Object.keys(row)[0]]) 
            .filter(id => id && !isNaN(Number(id))); 

        if (extractedIds.length > 0) {
            setMatchIdsToPredict(extractedIds);
        } else {
            setMessage('CSV parsed. Ready to upload player data.');
        }
      },
      error: (err) => {
        setError('Failed to parse CSV file: ' + err.message);
      }
    });
  };

  const handleUpload = async () => {
    // This function will now focus on uploading the CSV file for backend processing
    // (e.g., to add player data to a database).
    if (!file) { // 'file' state is from useState(null)
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file); // Use the state variable 'file' here

    try {
      const response = await fetch(`${BASE_URL}/api/upload-teams`, { 
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(result.message || 'File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
      // Reset file input display
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      setFile(null); // Clear selected file from state
    }
  };

  const handleDownloadTemplate = () => {
    setMessage('Downloading template...');
    setError('');

    const csvContent = "PlayerName,Team,Role,Credits,Points\n" +
                       "Virat Kohli,India,Batsman,10.0,100\n" +
                       "Jasprit Bumrah,India,Bowler,9.0,80";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'player_data_template.csv'; 
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage('Player data template downloaded.');
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md font-sans border-t-4 border-green-500">
      <div className="mb-4">
        <label htmlFor="file-upload-input" className="block text-gray-700 text-sm font-bold mb-2">Select CSV File:</label>
        <input 
          type="file" 
          id="file-upload-input" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleUpload}
          disabled={loading || !file} // This `file` refers to the state variable, which is correctly declared.
          className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
            loading || !file ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Data'}
        </button>

        <button
          onClick={handleDownloadTemplate}
          disabled={loading}
          className={`flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
            loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'
          }`}
        >
          Download Template
        </button>
      </div>

      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {/* Display CSV Preview */}
      {csvPreview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">CSV Data Preview (First {csvPreview.length} Rows):</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {csvPreview[0] && Object.keys(csvPreview[0]).map((header, idx) => (
                    <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvPreview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((cell, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamUploader;