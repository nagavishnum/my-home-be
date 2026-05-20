export const errorHandler = (err, _req, res, _next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
};
