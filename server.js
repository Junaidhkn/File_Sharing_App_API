const express = require('express');
const path = require('path');

const connectDb = require('./config/db');

const app = express();
app.use(express.json({ extended: true }));

connectDb();

// Routes
app.use('/api/files', require('./routes/uploadFiles'));
app.use('/files', require('./routes/showFiles'));
app.use('/files/download', require('./routes/download'));

app.listen(3000);
