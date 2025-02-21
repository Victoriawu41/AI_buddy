import React, { useEffect, useState } from "react";
import { Route, Navigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./Calendar/Navbar";

/**
 * PrivateRoute is a higher-order component that checks whether the user is authenticated before rendering the specified route.
 *
 * It performs an API request to the backend (via Axios) to verify if the user has a valid session.
 * If the user is authenticated, it renders the provided component and includes a navigation bar.
 * If not authenticated, it redirects the user to the login page.
 *
 * While the authentication status is being checked, a loading message is displayed.
 *
 * @param {Object} props - The props passed to the PrivateRoute component.
 * @param {React.Component} props.element - The component to render if the user is authenticated.
 * @param {Object} props.rest - Any additional props to pass to the component.
 *
 * @returns {JSX.Element} - A JSX element that either renders the protected component or redirects to the login page.
 */

const PrivateRoute = ({ element: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Make an API call to check if the user is authenticated.
    axios
      .get("http://localhost:5001/verify", { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(true);
      })
      .catch((error) => {
        setIsAuthenticated(false);
      });
  }, []);

  // While still verifying, show a loading message
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <div>
      <NavBar />
      <Component {...rest} />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
