require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerDocs = require('./swagger');
const db = require('./models');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const profileRoutes = require('./routes/profile');
const blogRoutes = require('./routes/blog');
const taskRoutes = require('./routes/task');
const jobRoutes = require('./routes/job');
const settingRoutes = require('./routes/setting');
const postJobRoutes = require('./routes/postJob');
const candidateRoutes = require('./routes/candidate');
const recruiterRoutes = require('./routes/recruiter');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
swaggerDocs(app);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/post-jobs', postJobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


(async () => {
  try {    await db.sequelize.authenticate();
    console.log('Database connected...');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();
app.get('/',(req,res)=>{
    res.send("welcome to the job portal backend api")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

