const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        if (typeof next !== 'function') {
            console.error("next is not a function. Something's wrong!");
        } else {
            console.log("next is a function");
        }
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
