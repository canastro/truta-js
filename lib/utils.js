function recursivlyGetData(data, keys) {

    var key = keys[0];

    if (!keys.length) {
        return data;
    }

    keys.splice(0, 1);

    return recursivlyGetData(data[key], keys);
}

export function getDataByKey(data, key) {
    var keys = key.split('.');
    keys.splice(0, 1);

    if (keys.length) {
        data = recursivlyGetData(data, keys);
    }

    return data;
}

export function find(data, terms) {

  var keys = Object.keys(terms);
  var result;

  data.some(function (item) {
    var foundIncoerence = false;

    foundIncoerence = keys.some(function(key) {
      if (item[key] !== terms[key]) {
        return true;
      }
    });

    if (!foundIncoerence) {
      result = item;
    }

    return !foundIncoerence;
  });

  return result;
}

export function generateGUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function curry(fn) {

    var parameters = Array.prototype.slice.call(arguments);
    var args = parameters.splice(1, parameters.length);

    return function curryed() {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};
