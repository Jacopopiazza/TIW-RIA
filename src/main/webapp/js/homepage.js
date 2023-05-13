{
    /**
     * This method checks if the user is logged in.
     */
    if (localStorage.getItem("user") === null) {
        logout();
    }

    let menu, search, cart, pageOrchestrator = new PageOrchestrator();

    /**
     * This starts the page if the user is logged in.
     */
    window.addEventListener('load', function () {
        pageOrchestrator.start();
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
        document.getElementById("btnLogout").addEventListener("click", function (e) {
            e.target.disable = true;
            logout();
        });

        pageOrchestrator.refresh();
    }

    /**
     * This method logs out the user and goes to the login page.
     */
    function logout() {
        let loggedOut = false;
        makeCall("POST", 'logout',null, function (response) {
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

    function Menu(container) {
        this.container = container;

        this.updateMenu = function (response){
            let products
            try{
                products = JSON.parse(response.responseText);
            }catch(e){
                alert("Error parsing JSON: " + e);
                return;
            }

            if(products.length == 0){
                var a = document.createElement('a');
                var text = document.createTextNode("No products to show.");
                a.appendChild(text);
                this.container.appendChild(a);
            }
            else{
                let info = document.createElement('a');
                let infoText = document.createTextNode("Hai visto: ");
                info.appendChild(infoText);
                info.classList.add("no-hover");
                this.container.appendChild(info);
                for(let i = 0;i<products.length;i++){
                    var a = document.createElement('a');
                    var text = document.createTextNode(products[i].codice + ". " + products[i].nome);
                    a.classList.add("no-hover");
                    a.appendChild(text);
                    this.container.appendChild(a);
                }
            }

        }

        this.update = function (){
            let self = this;

            var parent = document.getElementById('navbar');
            var noHoverElements = parent.querySelectorAll('.no-hover');

            noHoverElements.forEach(function(element) {
                parent.removeChild(element);
            });

            makeCall("GET","menu",null,function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.updateMenu(response);
                            break;
                        case 401:
                        case 403:
                            console.log("Not logged in");
                            alert("You are not logged in");
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            })
        }

    }

    function Search(container) {
        this.containter = container;

        const form = document.getElementById("formRisultati");
        const self = this;
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            self.containter.innerHTML = "";

            if (form.checkValidity()) {
                //make a request to the server to create the document.

                let url = 'results?' + new URLSearchParams(new FormData(form)).toString()

                makeCall("GET",url, null, function (response) {
                    if (response.readyState === XMLHttpRequest.DONE) {
                        let text = response.responseText;
                        switch (response.status) {
                            case 200:
                                self.showResults(response);
                                break;
                            case 401:
                            case 403:
                                alert("You are not logged in.")
                                logout();
                                break;
                            case 400:
                            case 500:
                                alert(text);
                                break;
                            default:
                                alert("Unknown error");
                        }
                    }
                },true )

            } else form.reportValidity();
        }, false);

        this.showResults = function (response) {
            let results;
            try{
                results = JSON.parse(response.responseText);
            }catch(e){
                alert("Error parsing JSON: " + e);
                return;
            }

            this.containter.innerHTML = "";
            if(results.length === 0){
                let p = document.createElement('p');
                p.textContent = "Nessun risultato per le parole chiavi inserite...";
                this.containter.appendChild(p);
                return;
            }

            let ul = document.createElement('ul');
            ul.classList.add('listview');

            for(let i = 0;i<results.length;i++){
                let li = document.createElement('li');
                li.classList.add('listview-row');

                let a = document.createElement('a');
                let price = (results[i].price / 100.00).toFixed(2);
                let title = document.createTextNode(results[i].product.codice + " - " + results[i].product.nome + ": " + price + " €")
                a.appendChild(title);
                a.classList.add("listview-row-title");

                li.appendChild(a);
                a.setAttribute("data-codiceprodotto", results[i].product.codice);

                a.onclick = function (e) {

                    if(e.target.getAttribute("data-opened") === null || e.target.getAttribute("data-opened") === "false"){
                        e.target.setAttribute("data-opened", true);
                        let url = "view?codiceProdotto=" + e.target.getAttribute("data-codiceprodotto");
                        makeCall("GET", url,null,function(response){
                            if (response.readyState === XMLHttpRequest.DONE) {
                                let text = response.responseText;
                                switch (response.status) {
                                    case 200:
                                        self.openDetails(e.target.parentNode, response);
                                        pageOrchestrator.refresh();
                                        break;
                                    case 401:
                                    case 403:
                                        alert("You are not logged in.")
                                        logout();
                                        break;
                                    case 400:
                                    case 500:
                                        alert(text);
                                        break;
                                    default:
                                        alert("Unknown error");
                                }
                            }
                        },false);
                    }
                    else{
                        e.target.setAttribute("data-opened", false);
                        self.closeDetails(e.target.parentNode);
                    }

                }

                ul.appendChild(li);
            }
            this.containter.appendChild(ul);
            //this.containter.append(response.responseText);
        }

        this.openDetails = function (li,response){
            let details;
            try{
                details = JSON.parse(response.responseText);
            }catch (e){
                alert("Error while parsing JSON: " + e);
                return;
            }

            let div = document.createElement('div');
            li.appendChild(div);

            let img = document.createElement('img');
            img.src = "image?codiceProdotto=" + details.product.codice;
            div.appendChild(img);

            let p1 = document.createElement('p');
            let p2 = document.createElement('p');
            let p3 = document.createElement('p');

            p1.textContent = details.product.nome;
            p2.textContent = details.product.descrizione;
            p3.textContent = details.product.categoria;

            div.appendChild(p1);
            div.appendChild(p2);
            div.appendChild(p3);

            let table = document.createElement('table');
            div.appendChild(table);
            let tableHead = document.createElement('thead');
            table.appendChild(tableHead);
            let tableHeaderRow = document.createElement('tr');
            tableHead.appendChild(tableHeaderRow);

            let columnNames = ['Nome','Valutazione','Prezzo Unitario','Spese Spedizione','Spesa minima spedizione gratuita','Già nel carrello','']
            for(let i = 0;i<columnNames.length;i++){
                let th = document.createElement('th');
                th.textContent = columnNames[i];
                tableHeaderRow.appendChild(th);
            }

            let tableBody = document.createElement('tbody');
            table.appendChild(tableBody);

            for(let i = 0; i < details.suppliersWithPrice.length; i++){
                let supplier = details.suppliersWithPrice[i];
                let supplierRow = document.createElement('tr');
                tableBody.appendChild(supplierRow);

                let tdNome = document.createElement('td');
                supplierRow.appendChild(tdNome);
                tdNome.textContent = supplier.supplier.nome;

                let tdValutazione = document.createElement('td');
                supplierRow.appendChild(tdValutazione);
                tdValutazione.textContent = supplier.supplier.valutazione + " / 5.0";

                let tdPrezzoUnitario = document.createElement('td');
                supplierRow.appendChild(tdPrezzoUnitario);
                tdPrezzoUnitario.textContent = (supplier.price / 100.00).toFixed(2) + ' €';

                let tdSpeseSpedizione = document.createElement('td');
                supplierRow.appendChild(tdSpeseSpedizione);

                let ul = document.createElement('ul');
                tdSpeseSpedizione.appendChild(ul);
                supplier.supplier.fasceSpedizione.forEach( el => {
                    let li = document.createElement('li');
                    let text = el.numeroMassimoArticoli == undefined ? "Da " + el.numeroMinimoArticoli + " articoli " + (el.prezzoSpedizione / 100).toFixed(2) + " €" :
                        "Da " + el.numeroMinimoArticoli + " a " + el.numeroMassimoArticoli + " articoli " + (el.prezzoSpedizione / 100).toFixed(2) + " €";
                    li.textContent = text;
                    ul.appendChild(li);
                })

                let tdSogliaSpedizione = document.createElement('td');
                supplierRow.appendChild(tdSogliaSpedizione);
                tdSogliaSpedizione.textContent = supplier.supplier.sogliaSpedizioneGratuita === undefined ? "Nessuna soglia di spesa per la spedizione gratuita" : (supplier.supplier.sogliaSpedizioneGratuita / 100).toFixed(2) + " €";

                let tdNelCarrello = document.createElement('td');
                supplierRow.appendChild(tdNelCarrello);
                tdNelCarrello.textContent = "Altri nel carrello...";

                let tdAggiungiAlCarrello = document.createElement('td');
                supplierRow.appendChild(tdAggiungiAlCarrello);

                let inputQuantita = document.createElement('input');
                inputQuantita.type = 'number';
                inputQuantita.min = 0;
                inputQuantita.value = 0;

                tdAggiungiAlCarrello.appendChild(inputQuantita);

                let btnAggiungi = document.createElement('button');
                btnAggiungi.setAttribute('data-codicefornitore', supplier.supplier.codice);
                btnAggiungi.setAttribute('data-codiceprodotto', details.product.codice);
                btnAggiungi.textContent = "Metti nel carrello!";

                btnAggiungi.onclick = function (e)
                {
                    let parent = e.target.parentNode;
                    let inputQuantita = parent.querySelector('input');

                    if(isNaN(inputQuantita.value) || inputQuantita.value <= 0) return;

                    let quantita = inputQuantita.value;
                    let codiceProdotto = e.target.getAttribute('data-codiceprodotto');
                    let codiceFornitore = e.target.getAttribute('data-codicefornitore');

                    if(isNaN(codiceProdotto) || isNaN(codiceFornitore)){
                        alert("Internal error");
                        return;
                    }

                    cart.addProduct(codiceProdotto,codiceFornitore,quantita);

                    pageOrchestrator.hide();
                    pageOrchestrator.showCart();

                }

                tdAggiungiAlCarrello.appendChild(btnAggiungi);
            }


        }

        this.closeDetails = function (li){
            let divDetails = li.querySelector("div");
            li.removeChild(divDetails);
        }
    }

    function Cart(container){
        this.container = container;

        this.key = "cart";

        this.show = function (){
            const self = this;

            let h2 = document.createElement('h2');
            h2.textContent = "Carrello";
            this.container.appendChild(h2);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                cart = {};
            }

            if(cart === null || isObjectEmpty(cart)){
                let p = document.createElement('p');
                p.textContent = "Nessun prodotto nel carrello";
                this.container.appendChild(p);
                return;
            }


            postJsonData("cartInfo",cart, function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.elaborateCart(response);
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            });


        }

        this.elaborateCart = function (response) {
            let cartInfo;

            try{
                cartInfo = JSON.parse(response.responseText);
            }catch(e){
                alert("Error parsing JSON: " + e);
                return;
            }




        }

        this.addProduct = function (cp, cf, q) {

            if(isNaN(cp) || isNaN(cf) || isNaN(q)){
                alert("Internal error");
                return;
            }

            let codiceProdotto = parseInt(cp);
            let codiceFornitore = parseInt(cf);
            let quantita = parseInt(q);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                cart = {};
            }

            if(cart === null){
                cart = {};
            }

            if(cart[codiceFornitore] === undefined){
                let prod = {}
                prod[codiceProdotto] = quantita;
                cart[codiceFornitore] = prod;
            }
            else{
                let prev = 0;
                if(cart[codiceFornitore][codiceProdotto] !== undefined){
                    prev = cart[codiceFornitore][codiceProdotto];
                }
                cart[codiceFornitore][codiceProdotto] = prev + quantita;
            }

            localStorage.setItem(this.key, JSON.stringify(cart));
        }

        this.sendOrder = function (codiceFornitore) {

            if(isNaN(codiceFornitore)) {
                alert("Internal error");
                return;
            }

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                cart = {};
            }

            if(cart[codiceFornitore] === undefined){
                alert("codiceFornitore non valido");
                return;
            }
            if( isObjectEmpty(cart[codiceFornitore]) ){
                alert("codiceFornitore non valido");
                delete ( cart[codiceFornitore] );
                localStorage.setItem(JSON.stringify(cart));
                return;
            }

            alert("Posso ordinare");
        }
    }

    function PageOrchestrator(){

        this.container = document.getElementById('container');

        this.start = function () {
            menu = new Menu(document.getElementById("navbar"));
            search = new Search(this.container);
            cart = new Cart(this.container);
        }

        this.refresh = function (){
            menu.update();
        }

        this.showCart = function() {
            cart.show();
        }

        this.hide = function (){
            this.container.innerHTML = "";
            document.querySelector('#formRisultati input').value = "";
        }
    }
}