import api from './api';
import { School, Student, Subject, User } from '../types';

// Schools API
export const schoolsApi = {
  getAll: async (): Promise<School[]> => {
    try {
      const response = await api.get('/schools');
      return response.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<School> => {
    try {
      const response = await api.get(`/schools/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (school: Omit<School, 'id'>): Promise<School> => {
    try {
      const response = await api.post('/schools', school);
      return response.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },
  
  update: async (id: number, school: Partial<School>): Promise<School> => {
    try {
      const response = await api.put(`/schools/${id}`, school);
      return response.data;
    } catch (error) {
      console.error(`Error updating school with id ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/schools/${id}`);
    } catch (error) {
      console.error(`Error deleting school with id ${id}:`, error);
      throw error;
    }
  }
};

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },
  
  getBySchoolId: async (schoolId: number): Promise<Student[]> => {
    try {
      const response = await api.get(`/students/school/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for school ${schoolId}:`, error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<Student> => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    try {
      const response = await api.post('/students', student);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }
};

// Subjects API
export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    try {
      const response = await api.get('/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },
  
  getByGrade: async (grade: number): Promise<Subject[]> => {
    try {
      const response = await api.get(`/subjects/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for grade ${grade}:`, error);
      throw error;
    }
  }
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getBySchoolId: async (schoolId: number): Promise<User[]> => {
    try {
      const response = await api.get(`/users/school/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for school ${schoolId}:`, error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  update: async (id: number, user: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  }
};

export default {
  schools: schoolsApi,
  students: studentsApi,
  subjects: subjectsApi,
  users: usersApi
};