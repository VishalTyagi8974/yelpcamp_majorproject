function wrapAsync(fn) {
    return function (res, req, next) {
        fn(res, req, next).catch(e => next(e))
    }
}

module.exports = wrapAsync;