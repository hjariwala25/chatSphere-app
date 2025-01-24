import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5001/api/v1",
    withCredentials: true,
    maxContentLength: 10 * 1024 * 1024,
  maxBodyLength: 10 * 1024 * 1024,
});
