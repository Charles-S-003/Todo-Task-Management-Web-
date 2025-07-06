const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

console.log('=== Passport Configuration ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('Callback URL: http://localhost:5000/api/auth/google/callback');
console.log('==============================');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('=== OAuth Callback Success ===');
  console.log('Access Token received:', accessToken ? 'Yes' : 'No');
  console.log('Profile ID:', profile.id);
  console.log('Profile Email:', profile.emails?.[0]?.value);
  console.log('Profile Name:', profile.displayName);
  console.log('=============================');
  
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('Existing user found:', user.email);
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Check if user exists with this email (from regular registration)
    user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
    
    if (user) {
      // Link existing account with Google
      user.googleId = profile.id;
      user.authMethod = 'google';
      user.avatar = profile.photos[0]?.value || user.avatar;
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
      console.log('Linked existing account with Google:', user.email);
      return done(null, user);
    }
    
    // Create new user for Google OAuth
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value.toLowerCase(),
      name: profile.displayName,
      avatar: profile.photos[0]?.value || null,
      authMethod: 'google',
      isEmailVerified: true,
      lastLogin: new Date()
      // Note: No password field - it's not required for OAuth users
    });
    
    await user.save();
    console.log('New OAuth user created:', user.email);
    return done(null, user);
    
  } catch (error) {
    console.error('Database error in OAuth callback:', error);
    return done(error, null);
  }
}));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});