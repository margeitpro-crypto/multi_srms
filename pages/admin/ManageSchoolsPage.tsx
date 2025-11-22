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
import { BuildingOfficeIcon } from '../../components/icons/BuildingOfficeIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { useData } from '../../context/DataContext';
import { schoolsApi, usersApi } from '../../services/dataService';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { DropdownMenu, DropdownMenuItem } from '../../components/DropdownMenu';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          id="iemisCode" 
          label="IEMIS No." 
          onChange={handleChange} 
          value={formData.iemisCode} 
          required 
        />
        <InputField 
          id="name" 
          label="School's Name" 
          onChange={handleChange} 
          value={formData.name} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          id="municipality" 
          label="Municipality" 
          onChange={handleChange} 
          value={formData.municipality} 
          required 
        />
        <InputField 
          id="estd" 
          label="Estd" 
          onChange={handleChange} 
          value={formData.estd} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <InputField 
          id="logoUrl" 
          label="School Logo URL" 
          onChange={handleChange} 
          value={formData.logoUrl} 
        />
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            id="preparedBy" 
            label="Prepared By" 
            onChange={handleChange} 
            value={formData.preparedBy} 
            required 
          />
          <InputField 
            id="checkedBy" 
            label="Checked By" 
            onChange={handleChange} 
            value={formData.checkedBy} 
            required 
          />
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Person</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            id="headTeacherName" 
            label="Head Teacher Name" 
            onChange={handleChange} 
            value={formData.headTeacherName} 
            required 
          />
          <InputField 
            id="headTeacherContact" 
            label="Head Teacher's Contact No." 
            onChange={handleChange} 
            value={formData.headTeacherContact} 
            required 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField 
            id="email" 
            label="Email (optional)" 
            type="email" 
            onChange={handleChange} 
            value={formData.email} 
          />
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscription & Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select  
            id="subscriptionPlan" 
            label="Subscription Plan" 
            onChange={handleChange} 
            value={formData.subscriptionPlan}
          >
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </Select>
          <Select 
            id="status" 
            label="Status" 
            onChange={handleChange} 
            value={formData.status}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button 
          type="submit"
          leftIcon={school?.id ? undefined : <UserPlusIcon className="h-4 w-4" />}
        >
          {school?.id ? 'Update School' : 'Add School'}
        </Button>
      </div>
    </form>
  );
};

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm text-gray-800 dark:text-white break-words font-medium">{value}</p>
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
    { 
      header: 'ID', 
      accessor: 'id' as const,
      className: 'whitespace-nowrap text-gray-500 dark:text-gray-400'
    },
    { 
      header: 'Logo', 
      accessor: (school: School) => <img src={school.logoUrl} alt="logo" className="h-10 w-10 rounded-full object-cover" />,
      className: 'whitespace-nowrap'
    },
    { 
      header: 'IEMIS No', 
      accessor: 'iemisCode' as const,
      className: 'font-medium text-gray-900 dark:text-white'
    },
    { 
      header: 'School Name', 
      accessor: 'name' as const,
      className: 'font-medium text-gray-900 dark:text-white'
    },
    { 
      header: 'Plan', 
      accessor: (school: School) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            school.subscriptionPlan === 'Basic' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' 
            : school.subscriptionPlan === 'Pro' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
        }`}>
            {school.subscriptionPlan}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
    { 
      header: 'Estd', 
      accessor: 'estd' as const,
      className: 'text-gray-500 dark:text-gray-400'
    },
    { 
      header: 'Status', 
      accessor: (school: School) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            school.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
            {school.status}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
  ];

  const searchByOptions = {
    name: 'School Name',
    iemisCode: 'IEMIS Code',
    municipality: 'Municipality',
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header with title and stats */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
              Manage Schools
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add, edit, and manage school records
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                {schools?.length || 0} schools
              </span>
            </div>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-48">
              <Select
                id="searchBy"
                label=""
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as 'name' | 'iemisCode' | 'municipality')}
              >
                <option value="name">School Name</option>
                <option value="iemisCode">IEMIS Code</option>
                <option value="municipality">Municipality</option>
              </Select>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <InputField
                id="searchQuery"
                label=""
                placeholder={`Search by ${searchByOptions[searchBy]}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAdd}
            leftIcon={<UserPlusIcon className="h-4 w-4" />}
          >
            Add School
          </Button>
        </div>
      </div>

      {/* Schools Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm mb-6">
        <Table<School>
          columns={columns}
          data={paginatedSchools}
          isLoading={isDataLoading}
          renderActions={(school) => (
            <DropdownMenu
              trigger={
                <IconButton 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </IconButton>
              }
            >
              <DropdownMenuItem onClick={() => handleView(school)}>
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                  <span>View Details</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(school)}>
                <div className="flex items-center">
                  <PencilIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                  <span>Edit</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(school)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <div className="flex items-center">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  <span>Delete</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        />
      </div>
      
      <div className="flex justify-center">
        <Pagination currentPage={currentPage} totalPages={totalPages > 0 ? totalPages : 1} onPageChange={setCurrentPage} />
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSchool?.id ? 'Edit School' : 'Add New School'}
        size="lg"
      >
        <SchoolForm school={selectedSchool} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!viewingSchool}
        onClose={() => setViewingSchool(null)}
        title="School Details"
        size="lg"
      >
        {viewingSchool && (
          <div className="space-y-6">
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
                <DetailItem label="Email" value={viewingSchool.email || 'N/A'} />
                
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