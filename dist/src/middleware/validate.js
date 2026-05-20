import mongoose from 'mongoose';
export const validateId = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    next();
};
export const validateBody = (requiredFields) => (req, res, next) => {
    const missing = requiredFields.filter((f) => {
        const val = req.body[f];
        return val === undefined || val === null || val === '';
    });
    if (missing.length) {
        res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
        return;
    }
    next();
};
