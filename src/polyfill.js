if (!Object.prototype.forEach) {
    Object.defineProperty(Object.prototype, 'forEach', {
        value: function (callback) {
            for (var [key, value] of Object.entries(this)) {
                callback(key, value);
            }
        }
    });
}