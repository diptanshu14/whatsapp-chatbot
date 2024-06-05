// all imoorts
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// initializing express, port no. and genAI
const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

let qrCodeData = null;

// Use CORS middleware
app.use(cors());

// initializing WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

// Logging in the client by generating a QR Code
client.on('qr', async qr => {
    try {
        qrCodeData = await qrcode.toDataURL(qr); // generating the QR Code and converting it to JSON
    } catch (error) {
        console.error('Error generating QR code:', error); // in case of error generating the QR Code
    }
});

// If Client is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// event in case of message received
client.on('message', async message => {
    console.log(`Message from ${message.from}: ${message.body}`);   // message body and sender

    try {
        const model = genAI.getGenerativeModel({ model: process.env.GPT_MODEL });  // initializing the GPT model
        const prompt = message.body;  // sending the message body as prompt
        const result = await model.generateContent(prompt); // getting the response result from the API
        const response = await result.response; // Filtering the response from other parts of the result
        const text = response.text(); // Filtering only the text portion of the response

        console.log(`Reply from ChatGPT: ${text}`);
        client.sendMessage(message.from, text); // Sending the text response back to the sender
    } catch (error) {  // In case of error it will hit the catch block
        console.error('Error with ChatGPT API:', error.response ? error.response.data : error.message);
        client.sendMessage(message.from, 'Sorry, I encountered an error while processing your message.');
    }
});

client.initialize();

// get-qr-code endpoint for the frontend to receive the qr code
app.get('/get-qr-code', (req, res) => {
    if (qrCodeData) { // If QR code is generated then a json with the qr will be sent to the frontend
        res.json({ qrCode: qrCodeData });
    } else { // In case of no qr generated an error with status code 404 will be sent to the frontend
        res.status(404).send('QR code not available');
    }
});

// running the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
