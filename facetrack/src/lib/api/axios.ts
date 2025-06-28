import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete axios.defaults.headers.common["Authorization"]
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
