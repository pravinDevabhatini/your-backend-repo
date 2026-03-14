const { IST } = require('../utils/helpers');
exports.notFound    = (req, res, next) => { res.status(404); next(new Error(`Not found: ${req.originalUrl}`)); };
exports.errorHandler = (err, req, res, next) => res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ error: err.message, ts: IST() });
