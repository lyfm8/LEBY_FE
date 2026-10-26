import axios from 'axios';
import type { User, PaginatedResponse } from './user.type';

// Cần config baseURL trong interceptor hoặc ghi cứng tạm thời
const API_URL = 'http://localhost:8080/api/admin/users';

export const userService = {
  getAllUsers: async (page = 0, size = 10, search = ''): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await axios.get(API_URL, { params });
    return response.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  toggleUserStatus: async (id: number): Promise<void> => {
    await axios.patch(`${API_URL}/${id}/status`);
  }
};
