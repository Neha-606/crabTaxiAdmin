import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {

    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {

        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            return alert("Please enter all fields.");
        }

        if (newPassword !== confirmPassword) {
            return alert("Passwords do not match.");
        }

        try {

            setLoading(true);

            const response = await axios.post(

                `http://localhost:8000/api/v1/auth/reset-password/${token}`,

                {
                    newPassword
                }

            );

            alert(response.data.message);

            navigate("/login");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="reset-container">

            <div className="reset-card">

                <h2>Reset Password</h2>

                <form onSubmit={handleResetPassword}>

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : "Reset Password"}
                    </button>

                </form>

            </div>

        </div>

    );

};

export default ResetPassword;