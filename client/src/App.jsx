import React, { useState } from 'react';
import './App.css';

function App() {
  const [qrCode, setQrCode] = useState(null); // state to receive the qr code
  const [isQrCodeVisible, setIsQrCodeVisible] = useState(false); // state to set if the qr code is visible or not

  // function to fetch qr code from backend
  const fetchQrCode = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-qr-code'); // qr code is received from the response
      if (response.ok) { // if qr code is present in response
        const data = await response.json(); 
        setQrCode(data.qrCode); //changing the state of qrcode from null to the qr code received
      } else { // in case of not receiving any qr code
        console.error('Failed to fetch QR code');
      }
    } catch (error) { // in case of error
      console.error('Error fetching QR code:', error); 
    }
  };

  // function for response if the button is pressed
  const handleScanButtonClick = () => {
    setIsQrCodeVisible(true); // setting the state to true for qr code is visible
    fetchQrCode(); // calling the fetchQrCode function to receive the QR Code from the backend
  };

  return (
    <div className="container">
      <h1>WhatsApp Chatbot</h1>
      <button onClick={handleScanButtonClick}>Scan QR Code</button> // Button for fetching the QR Code
      {isQrCodeVisible && qrCode && (
        <div id="qrCode">
          <img src={qrCode} alt="QR Code" /> // displaying the QR Code
        </div>
      )}
    </div>
  );
}

export default App;
