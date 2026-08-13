import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/register",
        {
          email: form.email,
          password: form.password,
          phoneNumber: form.phone, // ✅ FIXED
          role: "ADMIN",
        }
      );

      alert("Registered ✅");

      // ✅ go back to login
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register Failed ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Admin Register</h2>

        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} />

        <button onClick={handleRegister}>Register</button>

        <p>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;