import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post("http://localhost:5001/logout", {}, { withCredentials: true });
        navigate("/login"); // Redirect to login page
      } catch (error) {
        console.error("Logout failed", error);
      }
    };

    performLogout();
  }, [navigate]);

  return <div>Logging out...</div>; // Show message briefly before redirecting
};

export default Logout;