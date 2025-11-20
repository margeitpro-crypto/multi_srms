import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import { School } from '../../types';
import { useAppContext } from '../../context/AppContext';
import IconButton from '../../components/IconButton';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { useData } from '../../context/DataContext';
import { schoolsApi, usersApi } from '../../services/dataService';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const SchoolForm: React.FC<{ school: Partial<School> | null, onSave: (school: School) => void, onClose: () => void }> = ({ school, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<School>>({
    logoUrl: school?.logoUrl || `https://picsum.photos/seed/${school?.id || Date.now()}/100`,
    iemisCode: school?.iemisCode || '',
    name: school?.name || '',
    municipality: school?.municipality || 'BELDANDI RURAL MUNICIPALITY - 5, KANCHANPUR',
    estd: school?.estd || '2017 BS',
    preparedBy: school?.preparedBy || 'Man Singh Rana',
    checkedBy: school?.checkedBy || 'Narayan Rana',
    headTeacherName: school?.headTeacherName || 'JANAK BAHADUR THAPA',
    headTeacherContact: school?.headTeacherContact || '9827792360',
    email: school?.email || 'Margeitpro@gmail.com',
    status: school?.status || 'Active',
    subscriptionPlan: school?.subscriptionPlan || 'Basic'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure all required fields are present
    const schoolData: School = {
      id: school?.id || 0,
      iemisCode: formData.iemisCode || '',
      logoUrl: formData.logoUrl || `https://picsum.photos/seed/${school?.id || Date.now()}/100`,
      name: formData.name || '',
      municipality: formData.municipality || 'BELDANDI RURAL MUNICIPALITY - 5, KANCHANPUR',
      estd: formData.estd || '2017 BS',
      preparedBy: formData.preparedBy || 'Man Singh Rana',
      checkedBy: formData.checkedBy || 'Narayan Rana',
      headTeacherName: formData.headTeacherName || 'JANAK BAHADUR THAPA',
      headTeacherContact: formData.headTeacherContact || '9827792360',
      email: formData.email || 'Margeitpro@gmail.com',
      status: (formData.status as 'Active' | 'Inactive') || 'Active',
      subscriptionPlan: (formData.subscriptionPlan as 'Basic' | 'Pro' | 'Enterprise') || 'Basic'
    };
    onSave(schoolData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="logoUrl" label="School Logo URL" onChange={handleChange} defaultValue={formData.logoUrl} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="iemisCode" label="IEMIS No." onChange={handleChange} defaultValue={formData.iemisCode} required />
        <InputField id="name" label="School's Name" onChange={handleChange} defaultValue={formData.name} required />
        <InputField id="municipality" label="Municipality" onChange={handleChange} defaultValue={formData.municipality} required />
        <InputField id="estd" label="Estd" onChange={handleChange} defaultValue={formData.estd} required />
      </div>
      
      <hr className="my-2 border-gray-300 dark:border-gray-600"/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="preparedBy" label="Prepared By" onChange={handleChange} defaultValue={formData.preparedBy} required />
        <InputField id="checkedBy" label="Checked By" onChange={handleChange} defaultValue={formData.checkedBy} required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="headTeacherName" label="Head Teacher Name" onChange={handleChange} defaultValue={formData.headTeacherName} required />
        <InputField id="headTeacherContact" label="Head Teacher's Contact No.*" onChange={handleChange} defaultValue={formData.headTeacherContact} required />
      </div>
      
      <hr className="my-2 border-gray-300 dark:border-gray-600"/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="email" label="Email (optional)" type="email" onChange={handleChange} defaultValue={formData.email} />
        <Select  id="subscriptionPlan" label="Subscription Plan *" onChange={handleChange} defaultValue={formData.subscriptionPlan}>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
        </Select>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
         <Select id="status" label="Status *" onChange={handleChange} defaultValue={formData.status}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{school?.id ? 'Update School' : 'Add School'}</Button>
      </div>
    </form>
  );
};

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 dark:text-white break-words">{value}</p>
    </div>
);

const ManageSchoolsPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle('Manage Schools');
  }, [setPageTitle]);

  const { schools, setSchools, isDataLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<Partial<School> | null>(null);
  const [viewingSchool, setViewingSchool] = useState<School | null>(null);
  const { addToast } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'name' | 'iemisCode' | 'municipality'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    if (!searchQuery) return schools;

    return schools.filter(school =>
      school[searchBy]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schools, searchQuery, searchBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchBy]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSchools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSchools, currentPage]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  const handleAdd = () => {
    setSelectedSchool({});
    setIsModalOpen(true);
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };
  
  const handleSave = async (schoolData: School) => {
    try {
      console.log('Saving school data:', schoolData); // Debug log
      
      if (schoolData.id && schoolData.id > 0) { // Update
        // Update school in database
        const updatedSchool = await schoolsApi.update(schoolData.id, {
          iemisCode: schoolData.iemisCode,
          name: schoolData.name,
          logoUrl: schoolData.logoUrl,
          municipality: schoolData.municipality,
          estd: schoolData.estd,
          preparedBy: schoolData.preparedBy,
          checkedBy: schoolData.checkedBy,
          headTeacherName: schoolData.headTeacherName,
          headTeacherContact: schoolData.headTeacherContact,
          email: schoolData.email,
          status: schoolData.status,
          subscriptionPlan: schoolData.subscriptionPlan
        });
        
        setSchools(schools.map(s => s.id === schoolData.id ? updatedSchool : s));
        addToast(`School "${schoolData.name}" updated successfully!`, 'success');
      } else { // Add
        // Create school in database
        const newSchool = await schoolsApi.create({
          iemisCode: schoolData.iemisCode,
          name: schoolData.name,
          logoUrl: schoolData.logoUrl,
          municipality: schoolData.municipality,
          estd: schoolData.estd,
          preparedBy: schoolData.preparedBy,
          checkedBy: schoolData.checkedBy,
          headTeacherName: schoolData.headTeacherName,
          headTeacherContact: schoolData.headTeacherContact,
          email: schoolData.email,
          status: schoolData.status,
          subscriptionPlan: schoolData.subscriptionPlan
        });
        
        setSchools([...schools, newSchool]);
        addToast(`School "${schoolData.name}" added successfully!`, 'success');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving school:', error);
      let errorMessage = 'Failed to save school';
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict - duplicate school
          errorMessage = error.response.data.error || 'School already exists';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data && error.response.data.details) {
          errorMessage = `Server error: ${error.response.data.details}`;
        }
      }
      
      addToast(errorMessage, 'error');
    }
  };

  const handleView = (school: School) => {
    setViewingSchool(school);
  };

  const handleDelete = async (school: School) => {
    setSchoolToDelete(school);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (schoolToDelete) {
      try {
        await schoolsApi.delete(schoolToDelete.id);
        setSchools(schools.filter(s => s.id !== schoolToDelete.id));
        addToast(`${schoolToDelete.name} deleted successfully.`, 'success');
      } catch (error: any) {
        console.error('Error deleting school:', error);
        let errorMessage = 'Failed to delete school';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        addToast(errorMessage, 'error');
      }
      setSchoolToDelete(null);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Logo', accessor: (school: School) => <img src={school.logoUrl} alt="logo" className="h-10 w-10 rounded-full object-cover" /> },
    { header: 'IEMIS No', accessor: 'iemisCode' as const },
    { header: 'School Name', accessor: 'name' as const },
    { header: 'Plan', accessor: 'subscriptionPlan' as const },
    { header: 'Estd', accessor: 'estd' as const },
    { header: 'Status', accessor: (school: School) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            school.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
            {school.status}
        </span>
    )},
  ];

  const searchByOptions = {
    name: 'School Name',
    iemisCode: 'IEMIS Code',
    municipality: 'Municipality',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleAdd}>Add School</Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="w-full md:w-auto">
          <Select
            id="searchBy"
            label="Search By"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value as 'name' | 'iemisCode' | 'municipality')}
            containerClassName="w-full md:w-48"
          >
            <option value="name">School Name</option>
            <option value="iemisCode">IEMIS Code</option>
            <option value="municipality">Municipality</option>
          </Select>
        </div>
        <InputField
            id="searchQuery"
            label=""
            placeholder={`Search by ${searchByOptions[searchBy]}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="flex-grow"
        />
      </div>

      <Table<School>
        columns={columns}
        data={paginatedSchools}
        isLoading={isDataLoading}
        renderActions={(school) => (
          <>
            <IconButton size="sm" onClick={() => handleView(school)} title="View School">
              <EyeIcon className="w-5 h-5" />
            </IconButton>
            <IconButton size="sm" onClick={() => handleEdit(school)} title="Edit School" className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50">
              <PencilIcon className="w-5 h-5" />
            </IconButton>
            <IconButton size="sm" onClick={() => handleDelete(school)} title="Delete School" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
              <TrashIcon className="w-5 h-5" />
            </IconButton>
          </>
        )}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages > 0 ? totalPages : 1} onPageChange={setCurrentPage} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSchool?.id ? 'Edit School' : 'Add New School'}
      >
        <SchoolForm school={selectedSchool} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!viewingSchool}
        onClose={() => setViewingSchool(null)}
        title="School Details"
      >
        {viewingSchool && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <img src={viewingSchool.logoUrl} alt="logo" className="h-20 w-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-800" />
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{viewingSchool.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{viewingSchool.municipality}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                <DetailItem label="IEMIS Code" value={viewingSchool.iemisCode} />
                <DetailItem label="Established" value={viewingSchool.estd} />
                <DetailItem label="Subscription Plan" value={`${viewingSchool.subscriptionPlan} Plan`} />
                <DetailItem label="Status" value={<span className={`px-2 py-1 text-xs font-medium rounded-full ${viewingSchool.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{viewingSchool.status}</span>} />
                <DetailItem label="Email" value={viewingSchool.email} />
                
                <h4 className="col-span-full font-semibold text-base mt-4 border-b dark:border-gray-600 pb-1 text-primary-600 dark:text-primary-400">Contact Person</h4>
                <DetailItem label="Head Teacher" value={viewingSchool.headTeacherName} />
                <DetailItem label="Contact No." value={viewingSchool.headTeacherContact} />

                <h4 className="col-span-full font-semibold text-base mt-4 border-b dark:border-gray-600 pb-1 text-primary-600 dark:text-primary-400">Report Details</h4>
                <DetailItem label="Prepared By" value={viewingSchool.preparedBy} />
                <DetailItem label="Checked By" value={viewingSchool.checkedBy} />
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-4">
                <Button variant="secondary" onClick={() => setViewingSchool(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSchoolToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${schoolToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ManageSchoolsPage;