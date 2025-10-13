import axios from "axios";
import { store } from "../state/store";
import { roles } from "../constants/roles";

const instance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = store.getState().token.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const role = store.getState().token.role;
      try {
        const response = await instance.get("/refresh");
        if (response.data?.success) {
          store.dispatch({
            type: "token/addToken",
            payload: {
              token: response.data.accessToken,
              role,
            },
          });
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return instance(originalRequest);
        } else {
          throw new Error("Authentication failed");
        }
      } catch {
        store.dispatch({ type: "token/removeToken" });
        let redirectUrl = "/auth";
        switch (role) {
          case roles.ADMIN:
            redirectUrl = "/admin";
            break;
          case roles.HOSPITAL:
            redirectUrl = "/hospital/auth";
            break;
          case roles.DOCTOR:
            redirectUrl = "/doctor/auth";
            break;
          default:
            break;
        }
        window.location.href = redirectUrl;
      }
    }
    return Promise.reject(err);
  }
);

export default instance;
