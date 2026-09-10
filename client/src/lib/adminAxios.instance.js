import axios from "axios";

const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

adminAxiosInstance.interceptors.response.use((response) => response.data.data);

export default adminAxiosInstance;
