import React, {
  useEffect,
  useState
} from "react";

import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth
} from "../services/firebase";

export default function StudentProtectedRoute() {
  const location = useLocation();

  const [
    user,
    setUser
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  useEffect(() => {
    /*
     * Firebase tells us when the authentication
     * state has finished initializing.
     */
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log(
            "Student auth state:",
            currentUser
              ? currentUser.phoneNumber
              : "Not authenticated"
          );

          setUser(currentUser);
          setLoading(false);
        },
        (error) => {
          console.error(
            "Student auth state error:",
            error
          );

          setUser(null);
          setLoading(false);
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /*
   * IMPORTANT:
   * Do not redirect while Firebase is still
   * determining the authentication state.
   */
  if (loading) {
    return (
      <div className="student-auth-loading">
        <div className="student-auth-loading-card">
          <div className="student-auth-spinner" />

          <h2>
            Checking your login...
          </h2>

          <p>
            Please wait while we securely
            verify your session.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Firebase says the student is not logged in.
   */
  if (!user) {
    return (
      <Navigate
        to="/student/login"
        replace
        state={{
          from: location.pathname
        }}
      />
    );
  }

  /*
   * Firebase says the student is authenticated.
   */
  return <Outlet />;
}