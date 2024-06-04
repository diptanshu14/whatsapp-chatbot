const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

let qrCodeData = null;

// Use CORS middleware
app.use(cors());

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

client.on('qr', async qr => {
    try {
        qrCodeData = await qrcode.toDataURL(qr);
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    console.log(`Message from ${message.from}: ${message.body}`);

    try {
        const model = genAI.getGenerativeModel({ model: process.env.GPT_MODEL });
        const prompt = message.body;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`Reply from ChatGPT: ${text}`);
        client.sendMessage(message.from, text);
    } catch (error) {
        console.error('Error with ChatGPT API:', error.response ? error.response.data : error.message);
        client.sendMessage(message.from, 'Sorry, I encountered an error while processing your message.');
    }
});

client.initialize();

app.get('/get-qr-code', (req, res) => {
    if (qrCodeData) {
        res.json({ qrCode: qrCodeData });
    } else {
        res.status(404).send('QR code not available');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
