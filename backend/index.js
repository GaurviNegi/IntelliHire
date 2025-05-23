const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const questionRoutes = require('./routes/question');
const codeRoutes = require('./routes/code');
const userRoutes = require('./routes/userRoutes'); 
const testRoutes = require("./routes/testRoute");
const adminRoutes = require("./routes/adminRoutes");
const cookieParser = require("cookie-parser");



dotenv.config();
const app = express();
app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true, 
    })
  );
app.use(express.json());
app.use(cookieParser()); 




//! Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));





app.use('/api/questions', questionRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/test',  testRoutes); 
// Admin routes
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
