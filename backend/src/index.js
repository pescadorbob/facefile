require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const tutorialRoutes = require('./routes/tutorial');
const palacesRoutes = require('./routes/palaces');
const contactsRoutes = require('./routes/contacts');
const adminUsersRoutes = require('./routes/adminUsers');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/tutorial', tutorialRoutes);
app.use('/api/palaces', palacesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/admin/users', adminUsersRoutes);

app.listen(PORT, () => {
  console.log(`FaceFile backend running on http://localhost:${PORT}`);
});
