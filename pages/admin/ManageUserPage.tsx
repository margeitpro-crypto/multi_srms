import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import Select from '../../components/Select';
import { User, School } from '../../types';
import { useAppContext } from '../../context/AppContext';
import IconButton from '../../components/IconButton';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import api from '../../services/api';
import { schoolsApi } from '../../services/dataService';
import { DropdownMenu, DropdownMenuItem } from '../../components/DropdownMenu';

const ManageUserPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Manage Users');
  }, [setPageTitle]);

  const { addToast } = useAppContext();
  
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    iemis_code: '',
    email: '',
    password: '',
    role: 'school' as 'admin' | 'school',
    school_id: null as number | null
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all schools
  const fetchSchools = async () => {
    try {
      const schoolData = await schoolsApi.getAll();
      setSchools(schoolData);
    } catch (error) {
      console.error('Error fetching schools:', error);
      addToast('Failed to fetch schools', 'error');
    }
  };

  // Get school name by ID
  const getSchoolName = (schoolId: number | null) => {
    if (!schoolId) return 'N/A';
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : `ID: ${schoolId}`;
  };

  // Get role badge style
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'school':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Check if schools are still loading
  const areSchoolsLoading = schools.length === 0 && loading;

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setFormData({
      iemis_code: '',
      email: '',
      password: '',
      role: 'school',
      school_id: null
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      iemis_code: user.iemis_code,
      email: user.email || '',
      password: '',
      role: user.role,
      school_id: user.school_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Reset form when modal is closed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      iemis_code: '',
      email: '',
      password: '',
      role: 'school',
      school_id: null
    });
  };

  // Reset delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!isModalOpen && !selectedUser) {
      setFormData({
        iemis_code: '',
        email: '',
        password: '',
        role: 'school',
        school_id: null
      });
    }
  }, [isModalOpen, selectedUser]);

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await api.delete(`/users/${selectedUser.id}`);
      addToast('User deleted successfully', 'success');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast('Failed to delete user', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        // Update existing user
        const response = await api.put(`/users/${selectedUser.id}`, {
          iemis_code: formData.iemis_code,
          email: formData.email,
          role: formData.role,
          school_id: formData.school_id
          // Note: Password is not updated here for security reasons
        });
        
        setUsers(users.map(user => 
          user.id === selectedUser.id ? response.data : user
        ));
        addToast('User updated successfully', 'success');
      } else {
        // Create new user
        if (!formData.password) {
          addToast('Password is required for new users', 'error');
          return;
        }
        
        // Validate school_id is required for school role
        if (formData.role === 'school' && !formData.school_id) {
          addToast('School is required for school users', 'error');
          return;
        }
        
        const response = await api.post('/users', {
          iemis_code: formData.iemis_code,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          school_id: formData.school_id
        });
        
        setUsers([...users, response.data]);
        addToast('User created successfully', 'success');
      }
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      let errorMessage = 'Failed to save user';
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict - duplicate user
          errorMessage = error.response.data.error || 'User already exists';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      addToast(errorMessage, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'school_id' ? (value ? parseInt(value, 10) : null) : 
               id === 'role' ? value as 'admin' | 'school' :
               value
    }));
  };

  // Reset school_id when role changes to admin
  useEffect(() => {
    if (formData.role === 'admin') {
      setFormData(prev => ({
        ...prev,
        school_id: null
      }));
    }
  }, [formData.role, setFormData]);

  const filteredUsers = users.filter(user =>
    user.iemis_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      header: 'ID', 
      accessor: (item: User) => item.id,
      className: 'whitespace-nowrap text-gray-500 dark:text-gray-400'
    },
    { 
      header: 'IEMIS Code', 
      accessor: (item: User) => item.iemis_code,
      className: 'font-medium text-gray-900 dark:text-white'
    },
    { 
      header: 'Email', 
      accessor: (item: User) => item.email || <span className="text-gray-400">N/A</span>,
      className: 'text-gray-500 dark:text-gray-400'
    },
    { 
      header: 'Role', 
      accessor: (item: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(item.role)}`}>
          {getRoleDisplayName(item.role)}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
    { 
      header: 'School', 
      accessor: (item: User) => {
        if (!item.school_id) return <span className="text-gray-400">N/A</span>;
        const school = schools.find(s => s.id === item.school_id);
        return school ? (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{school.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{school.iemisCode}</div>
          </div>
        ) : (
          <span className="text-gray-400">ID: {item.school_id}</span>
        );
      },
      className: 'whitespace-nowrap'
    },
    {
      header: 'Actions',
      accessor: (item: User) => (
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
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            <div className="flex items-center">
              <PencilIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span>Edit</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(item)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <div className="flex items-center">
              <TrashIcon className="w-4 h-4 mr-2" />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenu>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        {/* Header with title and stats */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
                Manage Users
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add, edit, and manage user accounts
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  {users.length} users
                </span>
              </div>
            </div>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <InputField
                id="search"
                label=""
                placeholder="Search by IEMIS code, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            
            <Button 
              onClick={handleAdd}
              leftIcon={<UserPlusIcon className="h-4 w-4" />}
            >
              Add New User
            </Button>
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Table<User>
              data={filteredUsers}
              columns={columns}
              isLoading={false}
            />
          )}
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="iemis_code"
              label="IEMIS Code"
              required
              value={formData.iemis_code}
              onChange={handleChange}
              placeholder="Enter IEMIS code"
            />
            
            <InputField
              id="email"
              label="Email (optional)"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
            />
          </div>
          
          {!selectedUser && (
            <InputField
              id="password"
              label="Password"
              type="password"
              required={!selectedUser}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="school">School</option>
            </Select>
            
            {formData.role === 'school' && (
              <Select
                id="school_id"
                label="School"
                required
                value={formData.school_id || ''}
                onChange={handleChange}
              >
                <option value="">-- Select a School --</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.iemisCode} - {school.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              leftIcon={selectedUser ? undefined : <UserPlusIcon className="h-4 w-4" />}
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete User</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.iemis_code}</span>? 
                This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              leftIcon={<TrashIcon className="h-4 w-4" />}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUserPage;