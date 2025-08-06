const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB URI and client
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Upload endpoint
app.post('/upload', async (req, res) => {
  try {
    const data = req.body;

    // Validate input
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array of JSON objects' });
    }

    await client.connect();
    const collection = client.db("vehicleDB").collection("sensorData");
    const result = await collection.insertMany(data);

    console.log(`Inserted ${result.insertedCount} documents`);
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error("MongoDB Insert Error:", err.message);
    res.status(500).json({ error: 'Database insert failed' });
  } finally {
    await client.close();
  }
});

// Health check
app.get('/', (req, res) => {
  res.send("ESP32 MongoDB API is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
