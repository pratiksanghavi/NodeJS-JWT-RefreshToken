const jwt = require('jsonwebtoken');
const config = require('config');
const key = config.get('jwtRefreshKey');
const refreshTokenExpiry = '1d';

const cookieConfig = {
    httpOnly: true,
    sameSite: 'Strict',
    secure: !BASE_URL.includes('localhost')
};

const generateRefreshToken = (_id, password, res) => {
    // Generate Refresh Token  
    const refreshToken = jwt.sign(
        { _id },
        `${key}${password}`,
        { expiresIn: refreshTokenExpiry }
    );
    // Remove already set x-auth-token because another token will be sent in response body of current request
    res.removeHeader('x-auth-token');

    // Remove already set cookie because another cookie is going to be set after this
    res.removeHeader('Set-Cookie');

    // Set cookie
    res.cookie(
        'x-refresh-token',
        refreshToken,
        {
            ...cookieConfig,
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
    );
    res.cookie()
};

module.exports = {
    generateRefreshToken,
    cookieConfig
};