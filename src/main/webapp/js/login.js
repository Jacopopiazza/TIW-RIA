/**
 * Login.js
 */

(function() { // avoid variables ending up in the global scope

    if(localStorage.getItem("user") !== null){
        window.location.href = "HomePage.html";
    }

    var form = document.getElementById("frmLogin");

    form.addEventListener('submit', (e) => {
       e.preventDefault();
        if (form.checkValidity()) {
            makeCall("POST", 'CheckLogin', form,
                function(x) {
                    if (x.readyState == XMLHttpRequest.DONE) {
                        var message = x.responseText;
                        switch (x.status) {
                            case 200:
                                localStorage.setItem('user', message);
                                window.location.href = "HomePage.html";
                                break;
                            case 400: // bad request
                                document.getElementById("errormessage").textContent = message;
                                break;
                            case 401: // unauthorized
                                document.getElementById("errormessage").textContent = message;
                                break;
                            case 500: // server error
                                document.getElementById("errormessage").textContent = message;
                                break;
                        }
                    }
                }
            );
        } else {
            form.reportValidity();
        }
    });

})();