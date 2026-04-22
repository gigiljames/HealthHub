import axios from "axios";
import { persistor, store } from "../state/store";
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
    const tokenData = store.getState().token;
    if (
      err.response?.status === 403 &&
      err.response?.data.message === "force logout"
    ) {
      const role = tokenData.role;
      store.dispatch({ type: "auth/logout" });
      persistor.purge();
      let redirectUrl = "/login";
      switch (role) {
        case roles.ADMIN:
          redirectUrl = "/admin";
          break;
        case roles.DOCTOR:
          redirectUrl = "/doctor/login";
          break;
        default:
          break;
      }
      window.location.href = redirectUrl;
    }
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      tokenData.token &&
      originalRequest.url !== "/refresh"
    ) {
      originalRequest._retry = true;
      const role = tokenData.role;
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
        store.dispatch({ type: "auth/logout" });
        persistor.purge();
        let redirectUrl = "/login";
        switch (role) {
          case roles.ADMIN:
            redirectUrl = "/admin";
            break;
          case roles.DOCTOR:
            redirectUrl = "/doctor/login";
            break;
          default:
            break;
        }
        window.location.href = redirectUrl;
      }
    }
    return Promise.reject(err);
  },
);

export default instance;
