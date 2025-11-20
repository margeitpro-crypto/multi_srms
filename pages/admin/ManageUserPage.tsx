import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import Select from '../../components/Select';
import { User } from '../../types';
import { useAppContext } from '../../context/AppContext';
import IconButton from '../../components/IconButton';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import api from '../../services/api';

const ManageUserPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Manage Users');
  }, [setPageTitle]);

  const { addToast } = useAppContext();
  
  const [users, setUsers] = useState<User[]>([]);
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

  useEffect(() => {
    fetchUsers();
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
          addToast('School ID is required for school users', 'error');
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

  const filteredUsers = users.filter(user =>
    user.iemis_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      header: 'ID', 
      accessor: (item: User) => item.id,
      className: 'whitespace-nowrap'
    },
    { 
      header: 'IEMIS Code', 
      accessor: (item: User) => item.iemis_code,
      className: 'whitespace-nowrap'
    },
    { 
      header: 'Email', 
      accessor: (item: User) => item.email || 'N/A',
      className: 'whitespace-nowrap'
    },
    { 
      header: 'Role', 
      accessor: (item: User) => item.role,
      className: 'whitespace-nowrap'
    },
    { 
      header: 'School ID', 
      accessor: (item: User) => item.school_id || 'N/A',
      className: 'whitespace-nowrap'
    },
    {
      header: 'Actions',
      accessor: (item: User) => (
        <div className="flex space-x-2">
          <IconButton onClick={() => handleEdit(item)} aria-label="Edit user">
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={() => handleDelete(item)} aria-label="Delete user" variant="danger">
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        

        <div className="flex justify-between items-center mb-6">
          <InputField
            id="search"
            label="Search Users"
            placeholder="Search by IEMIS code, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex justify-between items-center mb-6">
          <Button onClick={handleAdd}>
            Add New User
          </Button>
        </div>
        </div>


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

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <InputField
              id="school_id"
              label="School ID"
              type="number"
              required
              value={formData.school_id || ''}
              onChange={handleChange}
              placeholder="Enter school ID"
            />
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.iemis_code}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
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