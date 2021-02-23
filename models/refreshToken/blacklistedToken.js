const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    refreshToken: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        expires: 0
    }
});

tokenSchema.index({ expirationDate: 1 }, { expires: 0 });

// Compound unique index for userRef + refreshToken
tokenSchema.index({ userRef: 1, refreshToken: 1 }, { unique: true });

const BlacklistedToken = mongoose.model('BlacklistedToken', tokenSchema);

module.exports = {
    BlacklistedToken
};