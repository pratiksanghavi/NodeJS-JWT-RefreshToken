const express = require('express');
const auth = require('../../middleware/auth');
const { successMessage } = require('../../utils/successMessage');
const { User } = require('../../models/user');
const router = express.Router();

// Refresh auth token
router.get(
    '/',
    auth,
    async (req, res) => {
        // No need to refresh token if auth middleware has already done it
        if (!res.get('x-auth-token')) {
            const user = await User.findById(req.user._id);
            const newToken = user.generateAuthToken(null, req.user, res);
            res.set('x-auth-token', newToken);
        }
        res.send(successMessage(true, 'Token refreshed.'));
    }
);

module.exports = router;