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
        
        // Validate school selection for school users
        if (formData.role === 'school' && !formData.school_id) {
          addToast('School is required for school users', 'error');
          return;
        }
        
        const response = await api.post('/users', {
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
      accessor: (item: User) => getSchoolName(item.school_id),
      className: 'text-gray-500 dark:text-gray-400'
    },
    { 
      header: 'Actions', 
      accessor: (item: User) => (
        <div className="flex space-x-2">
          <IconButton 
            onClick={() => handleEdit(item)}
            aria-label="Edit user"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <PencilIcon className="h-5 w-5" />
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(item)}
            aria-label="Delete user"
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="h-5 w-5" />
          </IconButton>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Users</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage user accounts
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  User Accounts
                </h2>
                <div className="mt-4 md:mt-0 w-full md:w-auto">
                  <InputField
                    id="search"
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <Table
                  data={filteredUsers}
                  columns={columns}
                  isLoading={false}
                />
              )}
            </div>
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
                id="email"
                label="Email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                type="email"
              />
              
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="school">School User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              {formData.role === 'school' && (
                <div>
                  <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    School
                  </label>
                  <select
                    id="school_id"
                    value={formData.school_id || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.role === 'school'}
                  >
                    <option value="">Select a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleCloseModal}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
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
          title="Delete User"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            
            {selectedUser && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUser.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getRoleDisplayName(selectedUser.role)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleCloseDeleteModal}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                variant="danger"
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageUserPage;