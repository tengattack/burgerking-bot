function generator(obj, opts) {
    for (var f in obj) {
        if (obj[f] instanceof Function) {
            if (opts && opts.wrapResult && opts.wrapResult.indexOf(f) >= 0) {
                this[f] = generator.wrapResult(f, obj[f], obj, opts);
            } else {
                this[f] = generator.create(f, obj[f], obj);
            }
        } else {
            this[f] = obj[f];
        }
    }
}

generator.create = function (fname, func, obj) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return function (callback) {
            args.push(callback);
            return func.apply(obj, args);
        };
    };
};

generator.wrapResult = function (fname, func, obj, opts) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        var result = func.apply(obj, args);
        return new generator(result, opts);
    };
};

module.exports = generator;
