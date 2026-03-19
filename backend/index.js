import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import configurePassport from './src/utils/passportSetup.js';
import authRouter from './src/routes/passportAuth.js';
import domainRouter from './src/routes/domainRoutes.js';
import customDomainRouter from './src/routes/customDomainRoutes.js';
import onlineUsersRouter from './src/routes/onlineUsers.js';
import quizSessionRouter from './src/routes/quizSessionRoutes.js';
import domainProgressRouter from './src/routes/domainProgressRoutes.js';
import certificateRouter from './src/routes/certificateRoutes.js';
import assignmentRouter from './src/routes/assignmentRoutes.js';
import session from 'express-session';
import cors from 'cors'
import connectDB from './src/config/db.js';

dotenv.config();
connectDB();
const app = express();

// CORS must be applied FIRST to handle OPTIONS preflight requests
// Allow broader access during development to enable LAN testing (Vite/dev server on other machines)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// 2. Passport Setup (strategy + serialize/deserialize configured in util)
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 9000;

// mount auth routes
app.use('/api/auth', authRouter);

// mount domain routes
app.use('/api/domains', domainRouter);

// mount custom domain routes
app.use('/api/custom-domains', customDomainRouter);

// mount online users routes
app.use('/api/online-users', onlineUsersRouter);

// mount quiz session routes
app.use('/api/quiz-sessions', quizSessionRouter);

// mount domain progress routes
app.use('/api/domain-progress', domainProgressRouter);

// mount certificate routes
app.use('/api/certificates', certificateRouter);

// mount assignment storage routes
app.use('/api/assignments', assignmentRouter);

// Bind to 0.0.0.0 so the server is reachable on the LAN/IP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at port : ${PORT} (bound to 0.0.0.0)`);
});
