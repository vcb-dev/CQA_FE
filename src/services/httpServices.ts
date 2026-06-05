import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    // Attach the token to every request
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  },
);
axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response.data;
  },
  (error) => {
    // Handle errors globally
    if (error.response.status === 401) {
      alert("Unauthorized! Please log in again.");
    } else if (error.response.status === 404) {
      console.error("Resource not found:", error.config.url);
    } else {
      console.error("Something went wrong:", error.message);
    }
    return Promise.reject(error);
  },
);
