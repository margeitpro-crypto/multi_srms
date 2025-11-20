
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import Pagination from '../../components/Pagination';
import { Subject } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Loader from '../../components/Loader';
import IconButton from '../../components/IconButton';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { useData } from '../../context/DataContext';
import SubjectCSVUploadModal from '../../components/SubjectCSVUploadModal';
import { DocumentArrowUpIcon } from '../../components/icons/DocumentArrowUpIcon';
import Select from '../../components/Select';
import ConfirmModal from '../../components/ConfirmModal';
import { subjectsApi } from '../../services/dataService';

const SubjectForm: React.FC<{ subject: Partial<Subject> | null, onSave: (subjectData: Subject) => void, onClose: () => void }> = ({ subject, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: subject?.name || '',
        grade: subject?.grade || 11,
        theory: {
            subCode: subject?.theory?.subCode || '',
            credit: subject?.theory?.credit || 0,
            fullMarks: subject?.theory?.fullMarks || 0,
            passMarks: subject?.theory?.passMarks || 0,
        },
        internal: {
            subCode: subject?.internal?.subCode || '',
            credit: subject?.internal?.credit || 0,
            fullMarks: subject?.internal?.fullMarks || 0,
            passMarks: subject?.internal?.passMarks || 0,
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const [section, field] = id.split('-');

        if (section === 'theory' || section === 'internal') {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: Subject = {
            id: subject?.id || 0, // ID will be set in parent component for new subjects
            name: formData.name,
            grade: Number(formData.grade) as 11 | 12,
            theory: {
                subCode: formData.theory.subCode,
                credit: parseFloat(String(formData.theory.credit)),
                fullMarks: parseInt(String(formData.theory.fullMarks), 10),
                passMarks: parseInt(String(formData.theory.passMarks), 10),
            },
            internal: {
                subCode: formData.internal.subCode,
                credit: parseFloat(String(formData.internal.credit)),
                fullMarks: parseInt(String(formData.internal.fullMarks), 10),
                passMarks: parseInt(String(formData.internal.passMarks), 10),
            }
        };
        
        // If this is a new subject, create it through the API
        if (!subject?.id) {
            try {
                const createdSubject = await subjectsApi.create(finalData);
                onSave(createdSubject);
            } catch (error) {
                console.error('Error creating subject:', error);
                // Show error message to user
                alert('Failed to create subject. Please try again.');
            }
        } else {
            // For existing subjects, just update the local state
            onSave(finalData);
        }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="name" label="Subject Name" value={formData.name} onChange={handleChange} required />
        <Select id="grade" label="Grade" value={formData.grade} onChange={handleChange}>
            <option value="11">11</option>
            <option value="12">12</option>
        </Select>
       </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
                <h3 className="font-semibold text-base text-gray-800 dark:text-white">Theory Details</h3>
                 <InputField id="theory-subCode" label="Subcode (Theory)" value={formData.theory.subCode} onChange={handleChange} required />
                 <InputField id="theory-credit" label="Credit (Theory)" type="number" step="0.01" value={formData.theory.credit} onChange={handleChange} required />
                 <InputField id="theory-fullMarks" label="Full Marks (Theory)" type="number" value={formData.theory.fullMarks} onChange={handleChange} required />
                 <InputField id="theory-passMarks" label="Pass Marks (Theory)" type="number" value={formData.theory.passMarks} onChange={handleChange} required />
            </div>

            <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
                <h3 className="font-semibold text-base text-gray-800 dark:text-white">Internal Details</h3>
                <InputField id="internal-subCode" label="Subcode (Internal)" value={formData.internal.subCode} onChange={handleChange} required />
                <InputField id="internal-credit" label="Credit (Internal)" type="number" step="0.01" value={formData.internal.credit} onChange={handleChange} required />
                <InputField id="internal-fullMarks" label="Full Marks (Internal)" type="number" value={formData.internal.fullMarks} onChange={handleChange} required />
                <InputField id="internal-passMarks" label="Pass Marks (Internal)" type="number" value={formData.internal.passMarks} onChange={handleChange} required />
            </div>
        </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{subject?.id ? 'Update Subject' : 'Add Subject'}</Button>
      </div>
    </form>
  );
};

const ManageSubjectsPage: React.FC<{ isReadOnly?: boolean }> = ({ isReadOnly = false }) => {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle('Manage Subjects');
  }, [setPageTitle]);

  const [activeTab, setActiveTab] = useState('grade11');
  const { subjects: allSubjects, setSubjects, isDataLoading: isLoading } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedSubject, setSelectedSubject] = useState<Partial<Subject> | null>(null);
  const { addToast } = useAppContext();
  
  const subjectsToDisplay = useMemo(() => {
    if (!allSubjects) return [];
    const grade = activeTab === 'grade11' ? 11 : 12;
    return allSubjects.filter(s => s.grade === grade);
  }, [activeTab, allSubjects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => {
    setSelectedSubject({ grade: activeTab === 'grade11' ? 11 : 12 });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleSave = (subjectData: Subject) => {
    if (subjectData.id) { // Update existing subject
        setSubjects(prev => prev.map(s => s.id === subjectData.id ? subjectData : s));
        addToast(`Subject "${subjectData.name}" updated successfully!`, 'success');
    } else { // Add new subject (already created via API in SubjectForm)
        setSubjects(prev => [...prev, subjectData]);
        addToast(`Subject "${subjectData.name}" added successfully!`, 'success');
    }
    setIsModalOpen(false);
  };
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (subjectToDelete) {
      try {
        // Delete from API
        await subjectsApi.delete(subjectToDelete.id);
        
        // Update local state
        setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
        addToast(`${subjectToDelete.name} deleted successfully.`, 'success');
      } catch (error: any) {
        console.error('Error deleting subject:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to delete subject. Please try again.';
        addToast(`Error deleting subject: ${errorMessage}`, 'error');
      } finally {
        setSubjectToDelete(null);
      }
    }
  };

  const handleUploadSuccess = async (newSubjects: Omit<Subject, 'id'>[]) => {
    try {
      const createdSubjects: Subject[] = [];
      
      // Create each subject through the API
      for (const subject of newSubjects) {
        const createdSubject = await subjectsApi.create(subject);
        createdSubjects.push(createdSubject);
      }
      
      // Update local state with the newly created subjects
      setSubjects(prev => [...prev, ...createdSubjects]);
      addToast(`${newSubjects.length} subjects uploaded and saved successfully!`, 'success');
    } catch (error) {
      console.error('Error uploading subjects:', error);
      addToast('Failed to upload subjects. Please try again.', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
        <div className="flex border-b dark:border-gray-700">
            <button onClick={() => setActiveTab('grade11')} className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${ activeTab === 'grade11' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent'}`}>Grade 11</button>
            <button onClick={() => setActiveTab('grade12')} className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${ activeTab === 'grade12' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent'}`}>Grade 12</button>
        </div>

      {!isReadOnly && (
        <div className="flex justify-between items-center my-6">
            <div className="relative inline-flex rounded-md shadow-sm">
                <Button onClick={handleAdd} className="rounded-r-none">Add Subject</Button>
                <div className="relative -ml-px block">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative inline-flex items-center rounded-r-md bg-primary-600 px-2 py-2 text-white hover:bg-primary-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <span className="sr-only">Open options</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {isDropdownOpen && (
                        <div ref={dropdownRef} className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <button onClick={() => { setIsUploadModalOpen(true); setIsDropdownOpen(false); }} className="text-gray-700 dark:text-gray-200 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span className="flex items-center"><DocumentArrowUpIcon className="w-4 h-4 mr-2" /> Upload CSV</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

       <div className={`overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg ${!isReadOnly ? '' : 'mt-6'}`}>
        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                    <th scope="col" className="px-6 py-3">SN</th>
                    <th scope="col" className="px-6 py-3 w-1/3">Subject Name</th>
                    <th scope="col" className="px-6 py-3">Credit Hour</th>
                    <th scope="col" className="px-6 py-3">Full Marks</th>
                    <th scope="col" className="px-6 py-3">Pass Marks</th>
                    <th scope="col" className="px-6 py-3 text-center">Total Credit</th>
                    <th scope="col" className="px-6 py-3 text-center">Total FM</th>
                    {!isReadOnly && <th scope="col" className="px-6 py-3 text-right">Actions</th>}
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={isReadOnly ? 7 : 8} className="text-center py-8"><Loader /></td></tr>
                ) : !subjectsToDisplay || subjectsToDisplay.length === 0 ? (
                    <tr><td colSpan={isReadOnly ? 7 : 8} className="text-center py-8">No subjects available for this grade.</td></tr>
                ) : (
                    subjectsToDisplay.map((subject, index) => (
                        <React.Fragment key={subject.id}>
                            <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                <td rowSpan={2} className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200 text-center align-middle">{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200"><span className="font-semibold">{subject.theory.subCode}</span> - {subject.name} (TH)</td>
                                <td className="px-6 py-4">{subject.theory.credit.toFixed(2)}</td>
                                <td className="px-6 py-4">{subject.theory.fullMarks}</td>
                                <td className="px-6 py-4">{subject.theory.passMarks}</td>
                                <td rowSpan={2} className="px-6 py-4 font-bold text-center border-l dark:border-gray-700 align-middle">{(subject.theory.credit + subject.internal.credit).toFixed(2)}</td>
                                <td rowSpan={2} className="px-6 py-4 font-bold text-center align-middle">{subject.theory.fullMarks + subject.internal.fullMarks}</td>
                                {!isReadOnly && (
                                  <td rowSpan={2} className="px-6 py-4 text-right align-middle">
                                      <div className="flex justify-end items-center space-x-2">
                                          <IconButton size="sm" onClick={() => handleEdit(subject)} title="Edit Subject" className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"><PencilIcon className="w-5 h-5" /></IconButton>
                                          <IconButton size="sm" onClick={() => handleDelete(subject)} title="Delete Subject" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-5 h-5" /></IconButton>
                                      </div>
                                  </td>
                                )}
                            </tr>
                            <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                 <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200"><span className="font-semibold">{subject.internal.subCode}</span> - {subject.name} (IN)</td>
                                <td className="px-6 py-4">{subject.internal.credit.toFixed(2)}</td>
                                <td className="px-6 py-4">{subject.internal.fullMarks}</td>
                                <td className="px-6 py-4">{subject.internal.passMarks}</td>
                            </tr>
                        </React.Fragment>
                    ))
                )}
            </tbody>
        </table>
      </div>
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSubject?.id ? 'Edit Subject' : 'Add New Subject'}>
        <SubjectForm subject={selectedSubject} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
      <SubjectCSVUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSubjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${subjectToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ManageSubjectsPage;
