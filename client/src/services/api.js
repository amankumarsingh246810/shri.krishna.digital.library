import axios from "axios";

import {
  auth
} from "./firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json"
  },

  timeout: 15000
});

/*
 * Request interceptor
 *
 * Automatically attaches:
 *
 * 1. Admin JWT for admin requests
 * 2. Fresh Firebase ID token for student requests
 */
api.interceptors.request.use(
  async (config) => {
    /*
     * ------------------------------------------------
     * STUDENT AUTHENTICATION
     * ------------------------------------------------
     *
     * If a Firebase student is logged in,
     * getIdToken() automatically returns a valid
     * token and refreshes it when necessary.
     */
    const firebaseUser = auth.currentUser;

    if (
      firebaseUser &&
      !config.headers.Authorization
    ) {
      try {
        const firebaseIdToken =
          await firebaseUser.getIdToken();

        config.headers.Authorization =
          `Bearer ${firebaseIdToken}`;
      } catch (error) {
        console.error(
          "Failed to get Firebase ID token:",
          error
        );
      }
    }

    /*
     * ------------------------------------------------
     * ADMIN AUTHENTICATION
     * ------------------------------------------------
     *
     * Only use the admin token when there isn't
     * already a Firebase Authorization header.
     */
    if (
      !config.headers.Authorization
    ) {
      const adminToken =
        localStorage.getItem(
          "adminToken"
        );

      if (adminToken) {
        config.headers.Authorization =
          `Bearer ${adminToken}`;
      }
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/*
 * Response interceptor
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status =
      error.response?.status;

    const originalRequest =
      error.config;

    /*
     * ------------------------------------------------
     * FIREBASE TOKEN EXPIRED
     * ------------------------------------------------
     *
     * If backend rejects the Firebase token,
     * force-refresh the token and retry the request
     * once.
     */
    if (
      status === 401 &&
      !originalRequest?._firebaseRetry &&
      auth.currentUser
    ) {
      originalRequest._firebaseRetry = true;

      try {
        const freshToken =
          await auth.currentUser.getIdToken(
            true
          );

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${freshToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Firebase token refresh failed:",
          refreshError
        );

        /*
         * Firebase could not refresh the session.
         * Sign the student out.
         */
        try {
          await auth.signOut();
        } catch {
          // Ignore sign-out errors.
        }

        window.location.href =
          "/student/login";

        return Promise.reject(
          refreshError
        );
      }
    }

    /*
     * ------------------------------------------------
     * ADMIN TOKEN EXPIRED
     * ------------------------------------------------
     */
    const adminToken =
      localStorage.getItem(
        "adminToken"
      );

    if (
      status === 401 &&
      adminToken &&
      !auth.currentUser
    ) {
      localStorage.removeItem(
        "adminToken"
      );

      localStorage.removeItem(
        "admin"
      );

      if (
        window.location.pathname !==
        "/admin/login"
      ) {
        window.location.href =
          "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;