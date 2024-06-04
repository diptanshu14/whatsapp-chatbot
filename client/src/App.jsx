import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [qrCode, setQrCode] = useState(null);
  const [isQrCodeVisible, setIsQrCodeVisible] = useState(false);

  const fetchQrCode = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-qr-code');
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
      } else {
        console.error('Failed to fetch QR code');
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const handleScanButtonClick = () => {
    setIsQrCodeVisible(true);
    fetchQrCode();
  };

  return (
    <div className="container">
      <h1>WhatsApp Chatbot</h1>
      <button onClick={handleScanButtonClick}>Scan QR Code</button>
      {isQrCodeVisible && qrCode && (
        <div id="qrCode">
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
}

export default App;
