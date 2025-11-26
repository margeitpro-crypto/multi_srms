import React, { useState } from 'react';
import { Student } from '../../types';
import InputField from '../InputField';
import Select from '../Select';
import Button from '../Button';
import { convertBsToAd } from '../../utils/nepaliDateConverter';
import { formatToYYYYMMDD, isValidYYYYMMDD } from '../../utils/dateUtils';

interface StudentFormProps {
  student: Partial<Student> | null;
  onSave: (studentData: Partial<Student>) => void;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      year: 2082,
      gender: 'Male',
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required field validations
    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    
    if (!formData.registration_id?.trim()) {
      newErrors.registration_id = 'Registration ID is required';
    }
    
    if (!formData.symbol_no?.trim()) {
      newErrors.symbol_no = 'Symbol number is required';
    }
    
    if (!formData.roll_no?.trim()) {
      newErrors.roll_no = 'Roll number is required';
    }
    
    if (!formData.father_name?.trim()) {
      newErrors.father_name = 'Father\'s name is required';
    } else if (formData.father_name.length < 2) {
      newErrors.father_name = 'Father\'s name must be at least 2 characters';
    }
    
    if (!formData.mother_name?.trim()) {
      newErrors.mother_name = 'Mother\'s name is required';
    } else if (formData.mother_name.length < 2) {
      newErrors.mother_name = 'Mother\'s name must be at least 2 characters';
    }
    
    if (!formData.dob_bs?.trim()) {
      newErrors.dob_bs = 'Date of birth (BS) is required';
    }
    
    // Mobile number validation (optional but if provided, must be valid)
    if (formData.mobile_no && !/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = 'Mobile number must be 10 digits';
    }
    
    // Year validation
    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Please enter a valid year between 2000 and 2100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    // Automatically convert BS date to AD date when BS date changes
    if (id === 'dob_bs' && value) {
      const adDate = convertBsToAd(value);
      if (adDate) {
        setFormData(prev => ({ ...prev, dob: formatToYYYYMMDD(adDate) }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Validate date format before submitting
    if (formData.dob && !isValidYYYYMMDD(formData.dob)) {
      setErrors(prev => ({ ...prev, dob: 'Please ensure the date of birth is in YYYY-MM-DD format' }));
      return;
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField 
          id="name" 
          label="Full Name" 
          onChange={handleChange} 
          value={formData.name || ''} 
          required 
          error={errors.name}
        />
        <InputField 
          id="registration_id" 
          label="Registration ID" 
          onChange={handleChange} 
          value={formData.registration_id || ''} 
          required 
          error={errors.registration_id}
        />
        <InputField 
          id="symbol_no" 
          label="Symbol No." 
          onChange={handleChange} 
          value={formData.symbol_no || ''} 
          required 
          error={errors.symbol_no}
        />
        <InputField 
          id="alph" 
          label="Alph" 
          onChange={handleChange} 
          value={formData.alph || ''} 
        />
        <InputField 
          id="roll_no" 
          label="Roll No." 
          onChange={handleChange} 
          value={formData.roll_no || ''} 
          required 
          error={errors.roll_no}
        />
         <Select 
          id="gender" 
          label="Gender" 
          onChange={handleChange} 
          value={formData.gender || 'Male'}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Select>
        <InputField 
          id="dob_bs" 
          label="Date of Birth (BS)" 
          onChange={handleChange} 
          value={formData.dob_bs || ''} 
          required 
          error={errors.dob_bs}
        />
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Date of Birth (AD)
          </label>
          {formData.dob_bs && formData.dob ? (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              {formData.dob}
            </div>
          ) : (
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500">
              Enter BS date to see AD date
            </div>
          )}
          <input 
            type="hidden" 
            id="dob" 
            value={formData.dob || ''} 
            onChange={handleChange} 
          />
        </div>
        <InputField 
          id="father_name" 
          label="Father's Name" 
          onChange={handleChange} 
          value={formData.father_name || ''} 
          required 
          error={errors.father_name}
        />
        <InputField 
          id="mother_name" 
          label="Mother's Name" 
          onChange={handleChange} 
          value={formData.mother_name || ''} 
          required 
          error={errors.mother_name}
        />
        <InputField 
          id="mobile_no" 
          label="Mobile No" 
          onChange={handleChange} 
          value={formData.mobile_no || ''} 
          error={errors.mobile_no}
        />
        <InputField 
          id="year" 
          label="Year" 
          type="number" 
          onChange={handleChange} 
          value={String(formData.year || 2082)} 
          required 
          error={errors.year}
        />
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student Photo
          </label>
          <div className="flex items-center space-x-4">
            {formData.photo_url ? (
              <img 
                src={formData.photo_url} 
                alt="Student" 
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs">No Photo</span>
              </div>
            )}
            <div>
              <input 
                type="file" 
                id="photo" 
                accept="image/*"
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-600 file:text-white
                  hover:file:bg-primary-700
                  dark:file:bg-primary-700 dark:hover:file:bg-primary-600"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // In a real app, you would upload the file and get a URL
                    // For now, we'll just show a placeholder
                    setFormData(prev => ({ 
                      ...prev, 
                      photo_url: URL.createObjectURL(file) 
                    }));
                  }
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, or GIF (max 2MB)
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{student?.id ? 'Update Student' : 'Add Student'}</Button>
      </div>
    </form>
  );
};

export default StudentForm;