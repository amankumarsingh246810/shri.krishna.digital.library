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
 * Get a fresh Firebase ID token.
 *
 * This function is ONLY used by student-authenticated
 * requests.
 */
export async function getStudentIdToken(
  forceRefresh = false
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Student is not authenticated"
    );
  }

  return user.getIdToken(
    forceRefresh
  );
}

/*
 * Request interceptor.
 *
 * Admin requests:
 *     → adminToken
 *
 * Student requests:
 *     → Firebase ID token
 */
api.interceptors.request.use(
  async (config) => {
    const requestUrl =
      config.url || "";

    /*
     * ---------------------------------------------
     * STUDENT REQUEST
     * ---------------------------------------------
     *
     * Only routes under /student-auth/
     * should use Firebase authentication.
     */
    const isStudentRequest =
      requestUrl.startsWith(
        "/student-auth/"
      );

    if (isStudentRequest) {
      try {
        const firebaseUser =
          auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            "Student is not authenticated"
          );
        }

        /*
         * Firebase automatically refreshes the ID
         * token when necessary.
         */
        const firebaseIdToken =
          await firebaseUser.getIdToken();

        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${firebaseIdToken}`;
      } catch (error) {
        console.error(
          "Failed to get Firebase ID token:",
          error
        );

        return Promise.reject(error);
      }

      return config;
    }

    /*
     * ---------------------------------------------
     * ADMIN REQUEST
     * ---------------------------------------------
     *
     * All other protected API requests use
     * the admin JWT.
     */
    const adminToken =
      localStorage.getItem(
        "adminToken"
      );

    if (adminToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${adminToken}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/*
 * Response interceptor.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status =
      error.response?.status;

    const originalRequest =
      error.config;

    const requestUrl =
      originalRequest?.url || "";

    const isStudentRequest =
      requestUrl.startsWith(
        "/student-auth/"
      );

    /*
     * ---------------------------------------------
     * STUDENT TOKEN EXPIRED
     * ---------------------------------------------
     *
     * Force Firebase to refresh the token once
     * and retry the request.
     */
    if (
      status === 401 &&
      isStudentRequest &&
      !originalRequest?._firebaseRetry
    ) {
      originalRequest._firebaseRetry =
        true;

      try {
        const freshToken =
          await getStudentIdToken(
            true
          );

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${freshToken}`;

        return api(
          originalRequest
        );
      } catch (refreshError) {
        console.error(
          "Firebase token refresh failed:",
          refreshError
        );

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
     * ---------------------------------------------
     * ADMIN TOKEN EXPIRED / INVALID
     * ---------------------------------------------
     */
    if (
      status === 401 &&
      !isStudentRequest
    ) {
      const adminToken =
        localStorage.getItem(
          "adminToken"
        );

      if (adminToken) {
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
    }

    return Promise.reject(error);
  }
);

export default api;