import session from "express-session";
import "dotenv/config";

export default session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
});