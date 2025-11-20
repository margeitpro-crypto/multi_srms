import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAppContext } from '../context/AppContext';
import Button from './Button';
import InputField from './InputField';
import Table from './Table';
import ConfirmModal from './ConfirmModal';
import dataService from '../services/dataService';

interface AcademicYear {
  id: number;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const YearSetup = () => {
  const { academicYears, setAcademicYears } = useData();
  const { addToast } = useAppContext();
  const [newYear, setNewYear] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editYearValue, setEditYearValue] = useState('');

  // Columns for the academic years table
  const columns = [
    { header: 'Year', accessor: 'year' },
    { 
      header: 'Status', 
      accessor: (year: AcademicYear) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          year.is_active 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
        }`}>
          {year.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (year: AcademicYear) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              setEditingYear(year);
              setEditYearValue(year.year.toString());
            }}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={() => {
              setYearToDelete(year);
              setIsModalOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Handle adding a new academic year
  const handleAddYear = async () => {
    if (!newYear) {
      addToast('Please enter a year', 'warning');
      return;
    }

    const year = parseInt(newYear);
    if (isNaN(year)) {
      addToast('Please enter a valid year', 'warning');
      return;
    }

    try {
      // Check if year already exists
      const existingYear = academicYears.find(y => y.year === year);
      if (existingYear) {
        addToast(`Academic year ${year} already exists`, 'warning');
        return;
      }

      const response = await dataService.academicYears.create({ year, is_active: true });
      setAcademicYears(prev => [...prev, response]);
      setNewYear('');
      addToast(`Academic year ${year} added successfully`, 'success');
    } catch (error: any) {
      console.error('Error adding academic year:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add academic year';
      addToast(`Error: ${errorMessage}`, 'error');
    }
  };

  // Handle updating an academic year
  const handleUpdateYear = async () => {
    if (!editingYear || !editYearValue) return;

    const year = parseInt(editYearValue);
    if (isNaN(year)) {
      addToast('Please enter a valid year', 'warning');
      return;
    }

    try {
      // Check if year already exists (excluding current record)
      const existingYear = academicYears.find(y => y.year === year && y.id !== editingYear.id);
      if (existingYear) {
        addToast(`Academic year ${year} already exists`, 'warning');
        return;
      }

      const response = await dataService.academicYears.update(editingYear.id, { 
        year, 
        is_active: editingYear.is_active 
      });
      
      setAcademicYears(prev => prev.map(y => y.id === editingYear.id ? response : y));
      setEditingYear(null);
      setEditYearValue('');
      addToast(`Academic year updated successfully`, 'success');
    } catch (error: any) {
      console.error('Error updating academic year:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update academic year';
      addToast(`Error: ${errorMessage}`, 'error');
    }
  };

  // Handle deleting an academic year
  const handleDeleteYear = async () => {
    if (!yearToDelete) return;

    try {
      await dataService.academicYears.delete(yearToDelete.id);
      setAcademicYears(prev => prev.filter(y => y.id !== yearToDelete.id));
      addToast(`Academic year ${yearToDelete.year} deleted successfully`, 'success');
      setIsModalOpen(false);
      setYearToDelete(null);
    } catch (error: any) {
      console.error('Error deleting academic year:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete academic year';
      addToast(`Error: ${errorMessage}`, 'error');
    }
  };

  // Handle toggling active status
  const handleToggleStatus = async (year: AcademicYear) => {
    try {
      const response = await dataService.academicYears.toggleActive(year.id, !year.is_active);
      setAcademicYears(prev => prev.map(y => y.id === year.id ? response : y));
      addToast(`Academic year ${year.year} status updated successfully`, 'success');
    } catch (error: any) {
      console.error('Error updating academic year status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update academic year status';
      addToast(`Error: ${errorMessage}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Academic Year</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField 
              id="newYear" 
              label="Year" 
              type="number" 
              value={newYear} 
              onChange={(e) => setNewYear(e.target.value)} 
              placeholder="Enter year (e.g., 2082)"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddYear}>Add Year</Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Academic Years</h3>
        {academicYears.length > 0 ? (
          <Table 
            columns={columns} 
            data={academicYears} 
            isLoading={false}
            renderActions={(year: AcademicYear) => (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(year)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    year.is_active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
                  }`}
                >
                  {year.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No academic years found. Add a new year to get started.
          </div>
        )}
      </div>

      {/* Edit Year Modal */}
      {editingYear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Edit Academic Year</h3>
              <InputField 
                id="editYear" 
                label="Year" 
                type="number" 
                value={editYearValue} 
                onChange={(e) => setEditYearValue(e.target.value)} 
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => {
                  setEditingYear(null);
                  setEditYearValue('');
                }}>Cancel</Button>
                <Button onClick={handleUpdateYear}>Update</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setYearToDelete(null);
        }}
        onConfirm={handleDeleteYear}
        title="Delete Academic Year"
        message={`Are you sure you want to delete the academic year ${yearToDelete?.year}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default YearSetup;