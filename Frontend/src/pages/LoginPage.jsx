import TextForm from "../components/TextForm";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login.css";

/**
 * LoginPage component renders a login and registration form.
 * It allows users to either log in or create a new account.
 * The form dynamically switches between login and registration modes.
 *
 * State is managed for user input fields (username, password, email, and confirm password),
 * and appropriate form fields are displayed based on the current mode.
 *
 * Login and registration requests are sent to respective endpoints, and appropriate
 * error messages are displayed if the input is invalid or an error occurs.
 *
 * Navigation to the chat page occurs after a successful login, and the user is alerted
 * upon successful account creation.
 *
 * The component handles switching between the login and registration forms,
 * clearing input fields and adjusting error handling as needed.
 *
 * @returns {JSX.Element} The LoginPage component with dynamic forms for login and registration.
 */

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpass, setConfirm] = useState("");

  const loginEndpoint = "http://localhost:8000/auth/login";
  const registerEndpoint = "http://localhost:8000/auth/register";

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
    },
  ];

  const errorLoginFields = loginFields.map((field) =>
    field.name === "password"
      ? {
          ...field,
          helperText: "Invalid credentials - please try again",
        }
      : field
  );

  // Form fields for register
  const registerFields = [
    {
      name: "account username",
      fieldType: "text",
      changeHandler: usernameUpdateHandler,
      exampleText: "Username",
    },
    {
      name: "email",
      fieldType: "email",
      changeHandler: emailUpdateHandler,
      exampleText: "name@example.com",
    },
    {
      name: "set password",
      fieldType: "password",
      changeHandler: passUpdateHandler,
      exampleText: "Password",
    },
    {
      name: "confirm password",
      fieldType: "password",
      changeHandler: confirmpassUpdateHandler,
      exampleText: "Confirm Password",
    },
  ];

  const errorUserRegisterFields = registerFields.map((field) =>
    field.name === "account username"
      ? {
          ...field,
          helperText: "This username already has an associated account",
        }
      : field
  );

  const errorEmailRegisterFields = registerFields.map((field) =>
    field.name === "email"
      ? { ...field, helperText: "This email already has an associated account" }
      : field
  );

  const errorPassRegisterFields = registerFields.map((field) =>
    field.name === "confirm password"
      ? { ...field, helperText: "Passwords do not match - please try again" }
      : field
  );

  const [formFields, setformFields] = useState(loginFields);

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      //send data to backend
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
        //successful login
        console.log(data.message);
        navigate("/home");
      } else {
        //unsuccessful login
        setformFields(errorLoginFields);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const registerHandler = async (e) => {
    e.preventDefault();
    if (pass !== confirmpass) {
      //password not matching with confirm password field
      setformFields(errorPassRegisterFields);
      return;
    }

    try {
      //send data to backend
      const response = await fetch(registerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: pass }),
      });

      const data = await response.json();
      if (response.ok) {
        //successful registration
        console.log(data.message);
        alert("Account created!");
        setIsLogin(true);
        setformFields(loginFields);
      } else {
        //unsuccessful registration
        if (data.error === "Email already exists") {
          setformFields(errorEmailRegisterFields);
        } else {
          setformFields(errorUserRegisterFields);
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const switchHandler = () => {
    //handles switch between pages
    setEmail("");
    setPass("");
    setUsername("");
    if (isLogin) {
      setIsLogin(false);
      setformFields(registerFields);
    } else {
      setIsLogin(true);
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
