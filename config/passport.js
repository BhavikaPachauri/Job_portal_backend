const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { auth } = require('../models');

passport.use(new GoogleStrategy({
  clientID: 'GOOGLE_CLIENT_ID', // replace with your Google client ID
  clientSecret: 'GOOGLE_CLIENT_SECRET', // replace with your Google client secret
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await auth.findOne({ where: { googleId: profile.id } });
    if (!user) {
      user = await auth.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await auth.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 