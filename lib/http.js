function execute (method, url, data) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {

        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open(method, url);

        //Send the proper header information along with the request
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        req.onload = function() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            }
            else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(req.statusText);
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject("Network Error");
        };

        // Make the request
        req.send(data);
    });
}


class Http {

    /**
    * @constructor
    */
    constructor() {
    }

    get(url) {
        return execute('GET', url);
    }

    post(url, data) {
        return execute('POST', url, JSON.stringify(data));
    }

    head () {

    }

    put () {

    }

    delete () {

    }
}

let httpInstance = new Http();
export default httpInstance;
