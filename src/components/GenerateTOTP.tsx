import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';

const GenerateTOTP = () => {
  const { email } = useParams();  // Get email from URL params
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');  // State for OTP input
  const [verificationResult, setVerificationResult] = useState<any>(null);  // Store the verification result

  useEffect(() => {
    if (email) {
      generateTOTP(email);  // Generate TOTP for the given email
    }
  }, [email]);

  const generateTOTP = async (email: any) => {
    try {
      console.log(email);
      const response = await axios.post('http://localhost:5000/api/otp/generate', { email });
      console.log(response);

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error generating TOTP:', error);
    }
  };

  // Function to handle OTP verification
  const handleOtpSubmit = async (e:any) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/otp/verify", {
        email,
        token: otp,
      });

      if (response.data.verified) {
        setVerificationResult("OTP Verified Successfully!");
      } else {
        setVerificationResult("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div>
      <h2>Generate and Verify TOTP</h2>
      {qrCode && (
        <div>
          <h3>Scan this QR code with your authenticator app:</h3>
          <img src={qrCode} alt="TOTP QR Code" />
          <p>Secret: {secret}</p>
        </div>
      )}

      {/* OTP Input Form */}
      <div>
        <h3>Enter OTP to Verify:</h3>
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}  // Update OTP state
          />
          <button type="submit">Verify OTP</button>
        </form>
        
        {verificationResult && <p>{verificationResult}</p>}
      </div>
    </div>
  );
};

export default GenerateTOTP;
