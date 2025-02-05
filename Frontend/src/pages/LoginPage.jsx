import TextForm from "../components/TextForm";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login.css";

/**
 * LoginPage Component
 *
 * This component renders a login and registration page. It provides functionality
 * for users to log in or create a new account, with validation feedback for common errors.
 * The form dynamically switches between login and registration modes, updating the fields accordingly.
 *
 * State Variables:
 * - `isLogin` (boolean): Indicates whether the form is in login mode (true) or registration mode (false).
 * - `emailError` (boolean): Tracks if there is an error related to email (e.g., email already in use).
 * - `credentialError` (boolean): Tracks if there are invalid credentials or mismatched passwords.
 * - `username` (string): Stores the user's entered username.
 * - `pass` (string): Stores the user's entered password.
 * - `email` (string): Stores the user's entered email.
 * - `formFields` (array): Contains the form field configuration for the current form mode (login or register).
 *
 * Endpoints:
 * - `loginEndpoint`: API endpoint for logging in.
 * - `registerEndpoint`: API endpoint for user registration.
 *
 * Functions:
 * - `emailUpdateHandler(e)`: Updates the `email` state when the email input changes.
 * - `usernameUpdateHandler(e)`: Updates the `username` state when the username input changes.
 * - `passUpdateHandler(e)`: Updates the `pass` state when the password input changes.
 * - `loginHandler(e)`: Handles login form submission by sending credentials to the login API.
 * - `registerHandler(e)`: Handles registration form submission by sending user data to the registration API.
 * - `switchHandler()`: Toggles between login and registration modes, resetting form fields and state.
 *
 * Form Field Configurations:
 * - `loginFields`: Defines input fields for the login form, including username and password.
 * - `registerFields`: Defines input fields for the registration form, including username, email, password, and confirm password.
 *
 * Component Behavior:
 * - The form dynamically switches between login and registration modes.
 * - Provides real-time feedback for invalid credentials or existing accounts during form submission.
 * - Integrates with a backend server for login and registration functionality.
 * - Resets form fields and error states upon mode switch.
 *
 * Returns:
 * - JSX that renders a form for login or registration, and a button to toggle between modes.
 */

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [credentialError, setcredentialError] = useState(false);
  const [userError, setUserError] = useState(false);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpass, setConfirm] = useState("");

  const loginEndpoint = "http://localhost:5000/login";
  const registerEndpoint = "http://localhost:5000/register";

  const navigate = useNavigate();

  const emailUpdateHandler = (e) => {
    setEmail(e.target.value);
  };

  const usernameUpdateHandler = (e) => {
    setUsername(e.target.value);
  };

  const passUpdateHandler = (e) => {
    setPass(e.target.value);
  };

  const confirmpassUpdateHandler = (e) => {
    setConfirm(e.target.value);
  };

  //Form fields for login
  const loginFields = [
    {
      name: "username",
      fieldType: "text",
      changeHandler: usernameUpdateHandler,
      exampleText: "Username",
    },
    {
      name: "password",
      fieldType: "password",
      changeHandler: passUpdateHandler,
      exampleText: "Password",
      helperText: credentialError
        ? "Invalid credentials - please try again"
        : "",
    },
  ];

  // Form fields for register
  const registerFields = [
    {
      name: "username",
      fieldType: "text",
      changeHandler: usernameUpdateHandler,
      exampleText: "Username",
      helperText: userError
        ? "This username already has an associated account"
        : "",
    },
    {
      name: "email",
      fieldType: "email",
      changeHandler: emailUpdateHandler,
      exampleText: "name@example.com",
      helperText: emailError
        ? "This email already has an associated account"
        : "",
    },
    {
      name: "password",
      fieldType: "password",
      changeHandler: passUpdateHandler,
      exampleText: "Password",
    },
    {
      name: "confirm password",
      fieldType: "password",
      changeHandler: confirmpassUpdateHandler,
      exampleText: "Confirm Password",
      helperText: credentialError
        ? "Passwords do not match - please try again"
        : "",
    },
  ];

  const [formFields, setformFields] = useState(loginFields);

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: pass }),
        credentials: "include", // This sends cookies with the request
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        setEmailError(false);
        setcredentialError(false);
        navigate("/chat");
      } else {
        if (data.error === "Invalid credentials") {
          setcredentialError(true);
          setformFields(loginFields);
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const registerHandler = async (e) => {
    e.preventDefault();
    if (pass !== confirmpass) {
      setcredentialError(true);
      setformFields(registerFields);
    }

    try {
      const response = await fetch(registerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: pass }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        setIsLogin(true);
        setEmailError(false);
        setcredentialError(false);
        setUserError(false);
        setformFields(loginFields);
      } else {
        if (data.error === "Email already exists") {
          setEmailError(true);
        } else if (data.error === "Username already exists") {
          setUserError(true);
        }
        setformFields(registerFields);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const switchHandler = () => {
    setEmail("");
    setPass("");
    setUsername("");
    setcredentialError(false);
    if (isLogin) {
      setIsLogin(false);
      setformFields(registerFields);
    } else {
      setIsLogin(true);
      setEmailError(false);
      setUserError(false);
      setformFields(loginFields);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>{isLogin ? "Login" : "Create Account"}</h1>
        <TextForm
          formArray={formFields}
          buttonText={isLogin ? "Login" : "Register"}
          clickHandler={isLogin ? loginHandler : registerHandler}
        ></TextForm>
        <button className="btn btn-link" onClick={switchHandler}>
          {isLogin ? "Don't have an account" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
