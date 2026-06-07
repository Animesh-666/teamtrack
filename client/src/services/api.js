// Register.jsx (or Login.jsx)
import { useState } from "react";
import something from "../api/api"; // MAKE SURE THIS PATH IS CORRECT

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Team Member",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Because 'api' is an instance with baseURL set to ".../api",
      // this automatically resolves to: .../api/auth/register
      const response = await api.post("/auth/register", formData);
      
      console.log("Registration successful:", response.data);
      alert("Account created successfully!");
    } catch (error) {
      // This will now correctly log the error from the backend
      console.error("Registration failed:", error.response?.data || error.message);
      alert("Registration failed. Please check the console.");
    }
  };

  // ... rest of your JSX
};