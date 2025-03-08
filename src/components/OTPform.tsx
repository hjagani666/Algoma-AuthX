import React, { useState } from "react";
import axios from "axios";

const OTPForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Send OTP function using Axios
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/otp/send", {
        phoneNumber,
      });

      if (response.data.success) {
        alert("OTP sent successfully!");
        setIsOtpSent(true);
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      alert("Error sending OTP.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function using Axios
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/otp/verify", {
        phoneNumber,
        otp,
      });

      if (response.data.success) {
        alert("OTP verified successfully!");
      } else {
        alert("Invalid OTP.");
      }
    } catch (error) {
      alert("OTP verification failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      {!isOtpSent ? (
        <button onClick={handleSendOtp} disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying OTP..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
};

export default OTPForm;
