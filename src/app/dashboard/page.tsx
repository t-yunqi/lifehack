'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Patient {
  id: string; // IC number
  name: string;
  dob: string;
  allergies: string[] | null;
  medication: string[] | null;
  diagnoses: string[] | null;
  last_updated: string;
  updated_by: number | null;
}

// Array Editor Component
interface ArrayEditorProps {
  label: string;
  items: string[] | null | undefined;
  onChange: (items: string[]) => void;
  placeholder: string;
  bgColor: string;
}

function ArrayEditor({ label, items, onChange, placeholder, bgColor }: ArrayEditorProps) {
  const [currentItems, setCurrentItems] = useState<string[]>(items || []);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...currentItems, newItem.trim()];
      setCurrentItems(updatedItems);
      onChange(updatedItems);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setCurrentItems(updatedItems);
    onChange(updatedItems);
  };

  const updateItem = (index: number, value: string) => {
    const updatedItems = [...currentItems];
    updatedItems[index] = value;
    setCurrentItems(updatedItems);
    onChange(updatedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>
      
      {/* Existing Items */}
      <div className="space-y-2 mb-3">
        {currentItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim()}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-300"
        >
          Add
        </button>
      </div>

      {/* Preview */}
      {currentItems.length > 0 && (
        <div className={`mt-2 p-2 ${bgColor} rounded-md`}>
          <p className="text-xs text-gray-600 mb-1">Preview:</p>
          <p className="text-sm text-gray-900">{currentItems.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [icNumber, setIcNumber] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchReason, setSearchReason] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);
  const [updateReason, setUpdateReason] = useState('');

  // Initialize doctor mapping on component mount
  useEffect(() => {
    const initializeDoctor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/login';
          return;
        }

        setUserEmail(user.email || '');

        // Check if doctor mapping exists
        const { data: existingDoctor, error: checkError } = await supabase
          .from('doctors')
          .select('id, name')
          .eq('auth_user_id', user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // No mapping exists, create one
          console.log('Creating doctor mapping for:', user.email);
          
          const doctorName = `Dr. ${user.email?.split('@')[0] || 'Doctor'}`;
          
          const { data: newDoctor, error: createError } = await supabase
            .from('doctors')
            .insert({
              auth_user_id: user.id,
              name: doctorName,
              email: user.email,
              department: 'General Medicine'
            })
            .select('id, name')
            .single();

          if (createError) {
            console.error('Failed to create doctor mapping:', createError);
            setError('Failed to initialize doctor profile');
          } else {
            console.log('Doctor mapping created:', newDoctor);
            setDoctorId(newDoctor.id);
          }
        } else if (existingDoctor) {
          // Mapping exists
          console.log('Doctor mapping found:', existingDoctor);
          setDoctorId(existingDoctor.id);
        } else {
          console.error('Error checking doctor mapping:', checkError);
          setError('Error accessing doctor profile');
        }

      } catch (err) {
        console.error('Error initializing doctor:', err);
        setError('Failed to initialize dashboard');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDoctor();
  }, []);

  const logAccess = async (action: string, reason: string, patientId: string) => {
    if (!doctorId) return;

    try {
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          action: action,
          reason: reason,
          time: new Date().toISOString()
        });

      if (logError) {
        console.warn('Failed to log access:', logError);
      } else {
        console.log('Access logged successfully:', action);
      }
    } catch (logError) {
      console.warn('Failed to log access:', logError);
    }
  };

  const handleSearch = async () => {
    if (!icNumber.trim()) {
      setError('Please enter an IC number');
      return;
    }

    if (!searchReason.trim()) {
      setError('Please provide a reason for accessing patient data');
      return;
    }

    if (!doctorId) {
      setError('Doctor profile not properly initialized');
      return;
    }

    setLoading(true);
    setError('');
    setPatient(null);
    setIsEditing(false);

    try {
      // Search for patient by IC number (id field)
      const { data, error: searchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', icNumber.trim().toUpperCase())
        .single();

      if (searchError) {
        if (searchError.code === 'PGRST116') {
          setError('No patient found with this IC number');
        } else {
          setError('Error searching for patient: ' + searchError.message);
        }
        setLoading(false);
        return;
      }

      setPatient(data);
      
      // Log the access
      await logAccess('read', searchReason, data.id);

    } catch (err) {
      console.error('Search error:', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleStartEdit = () => {
    if (patient) {
      setEditedPatient({ ...patient });
      setIsEditing(true);
      setUpdateReason('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPatient(null);
    setUpdateReason('');
  };

  const handleSaveUpdate = async () => {
    if (!editedPatient || !doctorId) return;

    if (!updateReason.trim()) {
      setError('Please provide a reason for updating the record');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('patients')
        .update({
          name: editedPatient.name,
          dob: editedPatient.dob,
          allergies: editedPatient.allergies && editedPatient.allergies.length > 0 ? editedPatient.allergies : null,
          medication: editedPatient.medication && editedPatient.medication.length > 0 ? editedPatient.medication : null,
          diagnoses: editedPatient.diagnoses && editedPatient.diagnoses.length > 0 ? editedPatient.diagnoses : null,
          updated_by: doctorId,
          last_updated: new Date().toISOString()
        })
        .eq('id', editedPatient.id)
        .select()
        .single();

      if (updateError) {
        setError('Failed to update patient record: ' + updateError.message);
        setLoading(false);
        return;
      }

      // Update local state
      setPatient(data);
      setIsEditing(false);
      setEditedPatient(null);
      
      // Log the update
      await logAccess('update', updateReason, data.id);
      
      // Show success message briefly
      setError('');
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md z-50';
      successDiv.textContent = 'Patient record updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

    } catch (err) {
      console.error('Update error:', err);
      setError('An unexpected error occurred while updating');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return 'None recorded';
    return arr.join(', ');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Medical Records System</h1>
            </div>
            <div className="flex items-center space-x-4">
              {userEmail && (
                <span className="text-sm text-gray-600">
                  Dr. {userEmail.split('@')[0]} (ID: {doctorId})
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="ic-number" className="block text-sm font-medium text-gray-700 mb-2">
                IC Number
              </label>
              <input
                type="text"
                id="ic-number"
                value={icNumber}
                onChange={(e) => setIcNumber(e.target.value.toUpperCase())}
                placeholder="e.g., T05123456E"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || isEditing}
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Access Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reason"
                value={searchReason}
                onChange={(e) => setSearchReason(e.target.value)}
                placeholder="e.g., Regular checkup, Emergency treatment"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || isEditing}
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !icNumber.trim() || !searchReason.trim() || !doctorId || isEditing}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search Patient'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Patient Details Section */}
        {patient && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Record Found
                </span>
                {isEditing && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Editing Mode
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Personal Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient?.name || ''}
                      onChange={(e) => setEditedPatient(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 font-medium">{patient.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">IC Number</label>
                  <p className="text-sm text-gray-900 font-mono">{patient.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedPatient?.dob || ''}
                        onChange={(e) => setEditedPatient(prev => prev ? {...prev, dob: e.target.value} : null)}
                        className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formatDate(patient.dob)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Age</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {calculateAge(isEditing ? editedPatient?.dob || patient.dob : patient.dob)} years
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-xs text-gray-600">{formatDate(patient.last_updated)}</p>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Medical Information</h3>
                
                {isEditing ? (
                  <>
                    <ArrayEditor
                      label="Diagnoses"
                      items={editedPatient?.diagnoses}
                      onChange={(items) => setEditedPatient(prev => prev ? {...prev, diagnoses: items} : null)}
                      placeholder="Enter a diagnosis (e.g., type_1_diabetes)"
                      bgColor="bg-blue-50"
                    />

                    <ArrayEditor
                      label="Current Medications"
                      items={editedPatient?.medication}
                      onChange={(items) => setEditedPatient(prev => prev ? {...prev, medication: items} : null)}
                      placeholder="Enter a medication (e.g., insulin)"
                      bgColor="bg-green-50"
                    />

                    <ArrayEditor
                      label="Allergies"
                      items={editedPatient?.allergies}
                      onChange={(items) => setEditedPatient(prev => prev ? {...prev, allergies: items} : null)}
                      placeholder="Enter an allergy (e.g., shellfish)"
                      bgColor="bg-red-50"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Diagnoses</label>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-gray-900">{formatArray(patient.diagnoses)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Current Medications</label>
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm text-gray-900">{formatArray(patient.medication)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Allergies</label>
                      <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <p className="text-sm text-gray-900 font-medium">{formatArray(patient.allergies)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Update Reason Field (when editing) */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Update <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="e.g., Updated medication after consultation"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t flex gap-3">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleStartEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Update Record
                  </button>
                  <button 
                    onClick={() => {
                      setPatient(null);
                      setIcNumber('');
                      setSearchReason('');
                      setError('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
                  >
                    New Search
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSaveUpdate}
                    disabled={loading || !updateReason.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* No Patient State */}
        {!patient && !loading && !error && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a Patient</h3>
            <p className="text-gray-500">Enter a patient's IC number to view their medical records</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Sample IC: T05123456E</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}