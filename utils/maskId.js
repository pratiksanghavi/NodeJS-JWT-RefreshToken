const maskId = id => {
    const midpoint = Math.floor(id.length / 2);
    const mask = 'x'.repeat(id.length - midpoint);
    return `${id.slice(0, midpoint)}${mask}`;
};

module.exports = maskId;