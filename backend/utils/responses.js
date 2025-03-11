const responseMiddleware = (req, res, next) => {
    res.apiResponse = ({ data = null, message = "Success", status = 200, error = null }) => {
        res.status(status).json({ status, message, data, error });
    };
    next();
};

module.exports = responseMiddleware;
