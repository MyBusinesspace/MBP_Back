import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateUser } from '../db';
import { GoogleProfile } from '../types';

// No more type declarations here!

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
    throw new Error(
        'Google OAuth configuration missing. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL'
    );
}

passport.use(
    new GoogleStrategy(
        {
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: googleCallbackUrl,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleProfile: GoogleProfile = {
                    id: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    name: profile.displayName,
                    picture: profile.photos?.[0]?.value,
                };

                const user = await findOrCreateUser(googleProfile);
                done(null, user);
            } catch (error) {
                done(error as Error);
            }
        }
    )
);

export default passport;
