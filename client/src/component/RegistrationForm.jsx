
/* eslint-disable react/prop-types */
// src/components/RegistrationForm/RegistrationForm.jsx
import { useState } from "react";
import { registerUser } from "../service/api";
import { useRecoilState } from "recoil";
import { emailAtomState } from "../stores/user/userAtom.js";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission
  const [verifiedEmail, setVerifiedEmail] = useRecoilState(emailAtomState);
  const navigate = useNavigate();

  const validateInput = () => {
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userNameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!userName || !userNameRegex.test(userName))
      errors.userName =
        "Username must be 3-15 characters long and contain only letters, numbers, or underscores";
    if (!verifiedEmail || !emailRegex.test(verifiedEmail))
      errors.email = "Valid email is required";
    if (!password || !passwordRegex.test(password))
      errors.password =
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateInput()) {
      setIsSubmitting(true); // Set submitting state to true
      try {
        await registerUser({
          firstName,
          lastName,
          userName,
          email: verifiedEmail,
          password,
          confirmPassword,
        });

        setVerifiedEmail("")
        navigate("/login");
        setError("");
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
      } finally {
        setIsSubmitting(false); // Reset submitting state
      }
    }
  };

  return (
    <div className="max-w-md min-w-[300px] mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className=" text-3xl text-center pb-5 font-bold text-blue-500">
        Registration
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-full">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting} // Disable input while submitting
          />
          {formErrors.firstName && (
            <p className="text-red-500 text-sm">{formErrors.firstName}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting} // Disable input while submitting
          />
          {formErrors.lastName && (
            <p className="text-red-500 text-sm">{formErrors.lastName}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting} // Disable input while submitting
          />
          {formErrors.userName && (
            <p className="text-red-500 text-sm">{formErrors.userName}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            value={verifiedEmail}
            disabled
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting} // Disable input while submitting
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm">{formErrors.password}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting} // Disable input while submitting
          />
          {formErrors.confirmPassword && (
            <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
          )}
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white p-2 rounded-lg ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
