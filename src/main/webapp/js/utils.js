/**
 * AJAX call management
 */

function makeCall(method, url, formElement, cback, reset = true) {
    var req = new XMLHttpRequest(); // visible by closure

    req.setRequestHeader("Content-Type", "charset=utf-8");

    req.onreadystatechange = function() {
        cback(req)
    }; // closure
    req.open(method, url);
    if (formElement == null) {
        req.send();
    } else {
        req.send(new FormData(formElement));
    }
    if (formElement !== null && reset === true) {
        formElement.reset();
    }
}

function sendFormData(method, url, callBack, formData) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        callBack(request);
    };
    request.open(method, url);
    if (formData != null) {
        request.send(formData);
    } else {
        request.send();
    }
}

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function postJsonData( url, obj, cback, toBeStringified = true) {
    var req = new XMLHttpRequest(); // visible by closure
    req.onreadystatechange = function() {
        cback(req)
    }; // closure
    req.open("POST", url);

    let json = JSON.stringify(obj);

    if(!toBeStringified){
        json = obj;
    }

    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.send(json);

}

