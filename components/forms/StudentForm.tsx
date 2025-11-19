
import React, { useState } from 'react';
import { Student } from '../../types';
import InputField from '../InputField';
import Select from '../Select';
import Button from '../Button';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField id="name" label="Full Name" onChange={handleChange} value={formData.name || ''} required />
        <InputField id="registration_id" label="Registration ID" onChange={handleChange} value={formData.registration_id || ''} required />
        <InputField id="symbol_no" label="Symbol No." onChange={handleChange} value={formData.symbol_no || ''} required />
        <InputField id="alph" label="Alph" onChange={handleChange} value={formData.alph || ''} />
        <InputField id="roll_no" label="Roll No." onChange={handleChange} value={formData.roll_no || ''} required />
         <Select id="gender" label="Gender" onChange={handleChange} value={formData.gender || 'Male'}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Select>
        <InputField id="dob_bs" label="Date of Birth (BS)" onChange={handleChange} value={formData.dob_bs || ''} required />
        <InputField id="dob" label="Date of Birth (AD)" type="date" onChange={handleChange} value={formData.dob || ''} required />
        <InputField id="father_name" label="Father's Name" onChange={handleChange} value={formData.father_name || ''} required />
        <InputField id="mother_name" label="Mother's Name" onChange={handleChange} value={formData.mother_name || ''} required />
        <InputField id="mobile_no" label="Mobile No" onChange={handleChange} value={formData.mobile_no || ''} />
        <InputField id="year" label="Year" type="number" onChange={handleChange} value={String(formData.year || 2082)} required />
        <InputField id="photo" label="Student Photo" type="file" containerClassName="md:col-span-3"/>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{student?.id ? 'Update Student' : 'Add Student'}</Button>
      </div>
    </form>
  );
};

export default StudentForm;
