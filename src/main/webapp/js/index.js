{
    /**
     * This method checks if the user is logged in.
     */
    if (localStorage.getItem("user") === null) {
        logout();
    }

    /**
     * This starts the page if the user is logged in.
     */
    window.addEventListener('load', function () {
        if (localStorage.getItem("user") === null) {
            logout()
        } else {
            start();
        }
    }, false);

    /**
     * This loads the data if the user is logged in.
     */

    function start() {
        document.getElementById("userName").textContent = JSON.parse(localStorage.getItem("user"));
        document.getElementById("Logout").addEventListener("click", function () {
            document.getElementById("Logout").disable = true;
            logout();
        });
    }

    /**
     * This method logs out the user and goes to the login page.
     */
    function logout() {
        let loggedOut = false;
        makeCall("POST", 'logout', function (response) {
            if (response.readyState === XMLHttpRequest.DONE) {
                switch (response.status) {
                    case 200:
                        loggedOut = true;
                        localStorage.clear();
                        window.location.href = "index.html";
                        break;
                    default :
                        alert("Unknown Error");
                        break;
                }
            }
        });
        if (!loggedOut) {
            localStorage.clear();
            window.location.href = "index.html";
        }
    }
}