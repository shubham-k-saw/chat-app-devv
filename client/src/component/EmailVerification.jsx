

/* eslint-disable react/prop-types */
// src/components/EmailVerification/EmailVerification.jsx
import { useState } from "react";
import { sendVerificationEmail, verifyEmailOtp } from "../service/api";
import { useSetRecoilState } from "recoil";
import { emailAtomState } from "../stores/user/userAtom";
// import { useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // New state to track verification process
  const [error, setError] = useState("");
  const setVerifiedEmail = useSetRecoilState(emailAtomState);
  // const navigate = useNavigate()
  
  const handleEmailSend = async () => {
    try {
      setIsVerifying(true); // Start verification process
      setOtp("");
      await sendVerificationEmail(email);
      setIsEmailSent(true);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send verification email");
    } finally {
      setIsVerifying(false); // End verification process
    }
  };

  const handleOtpVerify = async () => {
    try {
      setIsVerifying(true); // Start verification process
      await verifyEmailOtp(email, otp);
      setError("");
      setVerifiedEmail(email);
      alert("Email Verified Successfully");
    } catch (error) {
      setError("Invalid OTP or email");
    } finally {
      setIsVerifying(false); // End verification process
    }
  };

  return (
    <div className="max-w-md min-w-[300px] mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className=" text-3xl text-center pb-5 font-bold text-blue-500">
        Registration
      </h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Email Verification
      </h2>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isVerifying} // Disable input while verifying
        />
        {!isEmailSent ? (
          <button
            onClick={handleEmailSend}
            className={`w-full bg-blue-500 text-white p-2 rounded-lg ${
              isVerifying ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
            disabled={isVerifying} // Disable button while verifying
          >
            {isVerifying ? "Sending..." : "Verification Email"}
          </button>
        ) : (
          <button
            onClick={handleEmailSend}
            className={`w-full bg-blue-500 text-white p-2 rounded-lg ${
              isVerifying ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
            disabled={isVerifying} // Disable button while verifying
          >
            {isVerifying ? "Sending..." : "Reverification Email"}
          </button>
        )}

        {isEmailSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isVerifying} // Disable input while verifying
            />
            <button
              onClick={handleOtpVerify}
              className={`w-full bg-green-500 text-white p-2 rounded-lg ${
                isVerifying ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
              disabled={isVerifying} // Disable button while verifying
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default EmailVerification;
