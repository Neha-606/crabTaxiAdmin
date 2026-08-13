import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/addCustomer.css";

const AddCustomer = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    code: "+1",
    mobile: "",
    email: "",
    password: "",
    status: true,
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImage = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);

    // TODO: API CALL HERE

    alert("Customer Added Successfully");
    navigate("/customers");
  };

  return (
    <div className="add-customer-page">

      <h2>Customers / Add</h2>

      <form className="form" onSubmit={handleSubmit}>

        <div className="row">
          <input
            name="name"
            placeholder="Name*"
            onChange={handleChange}
            required
          />

          <input
            name="code"
            value={form.code}
            onChange={handleChange}
          />

          <input
            name="mobile"
            placeholder="Mobile Number*"
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <input
            name="email"
            placeholder="Email*"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password*"
            onChange={handleChange}
            required
          />
        </div>

        <div className="status">
          <label>Status</label>
          <input
            type="checkbox"
            name="status"
            checked={form.status}
            onChange={handleChange}
          />
          <span>{form.status ? "Active" : "Inactive"}</span>
        </div>

        <div className="image-upload">
          <label>Profile Image</label>
          <input type="file" onChange={handleImage} />
        </div>

        <div className="buttons">
          <button type="submit" className="submit-btn">
            Submit
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/customers")}
          >
            Back
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddCustomer;