import api from './api';
import { School, Student, Subject, User } from '../types';

// Schools API
export const schoolsApi = {
  getAll: async (): Promise<School[]> => {
    try {
      const response = await api.get<School[]>('/schools');
      return response.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<School> => {
    try {
      const response = await api.get<School>(`/schools/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (school: Omit<School, 'id'>): Promise<School> => {
    try {
      const response = await api.post<School>('/schools', school);
      return response.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },
  
  update: async (id: number, school: Partial<School>): Promise<School> => {
    try {
      const response = await api.put<School>(`/schools/${id}`, school);
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
      const response = await api.get<Student[]>('/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },
  
  getBySchoolId: async (schoolId: number): Promise<Student[]> => {
    try {
      const response = await api.get<Student[]>(`/students/school/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for school ${schoolId}:`, error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<Student> => {
    try {
      const response = await api.get<Student>(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    try {
      const response = await api.post<Student>('/students', student);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },
  
  update: async (id: number, student: Partial<Student>): Promise<Student> => {
    try {
      const response = await api.put<Student>(`/students/${id}`, student);
      return response.data;
    } catch (error) {
      console.error(`Error updating student with id ${id}:`, error);
      throw error;
    }
  }
};

// Subjects API
export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    try {
      const response = await api.get<Subject[]>('/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },
  
  getByGrade: async (grade: number): Promise<Subject[]> => {
    try {
      const response = await api.get<Subject[]>(`/subjects/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for grade ${grade}:`, error);
      throw error;
    }
  },
  
  create: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
    try {
      const response = await api.post<Subject>('/subjects', subject);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/subjects/${id}`);
    } catch (error) {
      console.error(`Error deleting subject with id ${id}:`, error);
      throw error;
    }
  }
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getBySchoolId: async (schoolId: number): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`/users/school/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for school ${schoolId}:`, error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await api.post<User>('/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  update: async (id: number, user: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<User>(`/users/${id}`, user);
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

// Subject Assignments API
export const subjectAssignmentsApi = {
  getAssignments: async (studentId: string, academicYear: string): Promise<{ subjectIds: number[]; extraCreditSubjectId: number | null }> => {
    try {
      const response = await api.get<{ subjectIds: number[]; extraCreditSubjectId: number | null }>(`/subject-assignments/${studentId}/${academicYear}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subject assignments for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  },
  
  saveAssignments: async (studentId: string, academicYear: string, subjectIds: number[], extraCreditSubjectId: number | null): Promise<void> => {
    try {
      await api.post(`/subject-assignments/${studentId}/${academicYear}`, { subjectIds, extraCreditSubjectId });
    } catch (error) {
      console.error(`Error saving subject assignments for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  },
  
  deleteAssignments: async (studentId: string, academicYear: string): Promise<void> => {
    try {
      await api.delete(`/subject-assignments/${studentId}/${academicYear}`);
    } catch (error) {
      console.error(`Error deleting subject assignments for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  }
};

// Marks API
export const marksApi = {
  getMarks: async (studentId: string, academicYear: string): Promise<any> => {
    try {
      const response = await api.get(`/marks/${studentId}/${academicYear}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching marks for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  },
  
  saveMarks: async (studentId: string, academicYear: string, marks: any): Promise<void> => {
    try {
      await api.post(`/marks/${studentId}/${academicYear}`, marks);
    } catch (error) {
      console.error(`Error saving marks for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  },
  
  deleteMarks: async (studentId: string, academicYear: string): Promise<void> => {
    try {
      await api.delete(`/marks/${studentId}/${academicYear}`);
    } catch (error) {
      console.error(`Error deleting marks for student ${studentId} in year ${academicYear}:`, error);
      throw error;
    }
  }
};

export default {
  schools: schoolsApi,
  students: studentsApi,
  subjects: subjectsApi,
  users: usersApi,
  subjectAssignments: subjectAssignmentsApi,
  marks: marksApi
};