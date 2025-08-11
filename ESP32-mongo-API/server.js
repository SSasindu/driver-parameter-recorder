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

// Upload configuration
app.post('/config', async (req, res) => {
  try {
    const configData = req.body;

    // Validate input
    if (!configData || typeof configData !== 'object') {
      return res.status(400).json({ error: 'Configuration data must be a JSON object' });
    }

    await client.connect();
    const collection = client.db("vehicleDB").collection("Users");
    // Check if deviceId already exists
    const existingConfig = await collection.findOne({ deviceId: configData.deviceId });
    if (existingConfig) {
      return res.status(400).json({ error: 'Device ID already exists' });
    }

    const result = await collection.insertOne(configData);
    console.log(`Inserted configuration document with ID: ${result.insertedId}`);
    res.status(200).json({ message: 'Configuration saved successfully', id: result.insertedId });
  
  } catch (err) {
    console.error("MongoDB Config Insert Error:", err.message);
    res.status(500).json({ error: 'Configuration insert failed' });
  } finally {
    await client.close();
  }
});

app.get('/config/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    await client.connect();
    const collection = client.db("vehicleDB").collection("Users");
    const configData = await collection.findOne({ deviceId: parseInt(deviceId) });

    res.status(200).json(configData);
  } catch (err) {
    console.error("MongoDB Config Fetch Error:", err.message);
    res.status(500).json({ error: 'Configuration fetch failed' });
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
