// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import User from './models/User.js'; // note the `.js` extension is required in ES modules


const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to talk to backend

const mongoURI = 'mongodb+srv://AHM:12345678ahm@se-cluster.pxpganr.mongodb.net/?retryWrites=true&w=majority&appName=SE-Cluster';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log(err));

// Example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const newUser = new User({ name, email });
  await newUser.save();
  res.json({ message: 'User saved successfully' });
});
