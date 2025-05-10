require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

    if (token == null) {
        // No token provided. 
        // According to TraitTune Onboarding Spec, guests get an anonymous JWT.
        // So, a missing token means the client isn't following the auth flow.
        return res.status(401).json({ message: 'Authentication token required. Please ensure you are signed in, even as a guest.' });
    }

    jwt.verify(token, process.env.SUPABASE_JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please sign in again.' });
            }
            // For other errors (e.g., malformed token, signature mismatch)
            return res.status(403).json({ message: 'Invalid token. Authentication failed.' });
        }

        // Attach user information from the decoded JWT to the request object
        // Standard JWT 'sub' claim is the user ID from Supabase
        // Supabase anonymous JWTs will have 'is_anonymous: true'
        req.user = {
            id: decoded.sub,                  // User ID (UUID)
            role: decoded.role,               // e.g., 'anon', 'authenticated'
            email: decoded.email,             // Email if available (for non-anonymous users)
            is_anonymous: decoded.is_anonymous === true, // Explicitly boolean
            app_metadata: decoded.app_metadata, // Any app-specific metadata
            user_metadata: decoded.user_metadata, // Any user-specific metadata
            // Include all decoded claims for downstream use if necessary
            ...decoded 
        };
        
        // console.log('Authenticated user:', req.user); // For debugging

        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;

