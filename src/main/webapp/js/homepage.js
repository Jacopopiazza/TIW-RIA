{
    /**
     * This method checks if the user is logged in.
     */
    if (localStorage.getItem("user") === null) {
        logout();
    }

    let menu, search, cart, order, pageOrchestrator = new PageOrchestrator();

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
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.refresh();
                return ;
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
                            localStorage.removeItem(self.key);
                            pageOrchestrator.hide();
                            pageOrchestrator.refresh();
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            });


        }

        this.elaborateCart = function (response) {
            const self = this;
            let cartInfo;

            try{
                cartInfo = JSON.parse(response.responseText);
            }catch(e){
                alert("Error parsing JSON: " + e);
                return;
            }

            console.log(cartInfo);

            let ul = document.createElement('ul');
            ul.classList.add('listview');
            this.container.appendChild(ul);

            cartInfo.forEach( (supplier) => {
                let li = document.createElement('li');
                li.classList.add('listview-row');
                ul.appendChild(li);

                let divHeading = document.createElement('div');
                divHeading.classList.add('order-heading');
                li.appendChild(divHeading);

                let h3 = document.createElement('h3');
                h3.textContent = supplier.nome;
                divHeading.appendChild(h3);

                let btnOrdina = document.createElement('button');
                btnOrdina.textContent = "Ordina!";
                btnOrdina.setAttribute('data-codicefornitore', supplier.codice);
                btnOrdina.onclick = function (e) {
                    self.sendOrder(e.target.getAttribute('data-codicefornitore'))
                }
                divHeading.appendChild(btnOrdina);

                li.appendChild(document.createElement('br'));

                let table = document.createElement('table');
                let thead = document.createElement('thead');
                let tbody = document.createElement('tbody');
                li.appendChild(table);
                table.appendChild(thead);
                table.appendChild(tbody);
                table.classList.add('order-table');

                let headingRow = document.createElement('tr');
                thead.appendChild(headingRow);

                let thNome = document.createElement('th');
                thNome.textContent = "Nome";
                thead.appendChild(thNome);

                let thImg = document.createElement('th');
                thImg.textContent = "Immagine";
                thead.appendChild(thImg);

                let thQuantita = document.createElement('th');
                thQuantita.textContent = "Quantita";
                thead.appendChild(thQuantita);

                let thPrezzo = document.createElement('th');
                thPrezzo.textContent = "Prezzo";
                thead.appendChild(thPrezzo);

                supplier.products.forEach( (product) => {
                    let row = document.createElement('tr');
                    tbody.appendChild(row);

                    let tdNome = document.createElement('td');
                    row.appendChild(tdNome);
                    tdNome.textContent = product.nome;

                    let tdImg = document.createElement('td');
                    row.appendChild(tdImg);
                    let img = document.createElement('img');
                    img.src = "image?codiceProdotto=" + product.codice;
                    tdImg.appendChild(img);

                    let tdQuantita = document.createElement('td');
                    row.appendChild(tdQuantita);
                    tdQuantita.textContent = product.quantita;

                    let tdPrezzo = document.createElement('td');
                    row.appendChild(tdPrezzo);
                    tdPrezzo.textContent = (product.prezzo / 100).toFixed(2) + " €";

                })


            })

        }

        this.getCartForSupplier = function (cf) {
            if (isNaN(cf)){
                alert("Internal error");
                return ;
            }

            let codiceFornitore = parseInt(cf);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.refresh();
                return ;
            }

            if(cart == null){
                cart = [];
            }

            let fornitore = cart.filter(o => o.codiceFornitore == codiceFornitore);

            if(fornitore.length == 0){
                return undefined;
            }
            else return fornitore.slice()[0];
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
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.refresh();
                return ;
            }

            if(cart === null){
                cart = [];
            }

            let fornitore= cart.filter( o => o.codiceFornitore === codiceFornitore)[0]

            if (fornitore === undefined){
                let newVoice = {
                    "codiceFornitore" : codiceFornitore,
                    "prodotti" : [
                        {
                            "codiceProdotto" : codiceProdotto,
                            "quantita" : quantita
                        }
                    ]
                }
                
                cart.push(newVoice);

            }
            else{
                if(fornitore.prodotti.length == 0){
                    let newVoice = {
                                "codiceProdotto" : codiceProdotto,
                                "quantita" : quantita
                    }

                    fornitore.prodotti.push(newVoice);
                }
                else{
                    let prodotto = fornitore.prodotti.filter(o => o.codiceProdotto === codiceProdotto)[0];

                    if(prodotto === undefined){
                        let newVoice = {
                            "codiceProdotto" : codiceProdotto,
                            "quantita" : quantita
                        }

                        fornitore.prodotti.push(newVoice);

                    }
                    else{
                        prodotto.quantita += quantita;
                    }
                }

            }

            localStorage.setItem(this.key, JSON.stringify(cart));
        }

        this.sendOrder = function (cf) {

            if(isNaN(cf)) {
                alert("Internal error");
                return;
            }

            let codiceFornitore = parseInt(cf);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.refresh();
                return ;
            }

            let fornitore = cart.filter(o => o.codiceFornitore === codiceFornitore)[0];

            if(fornitore === undefined){
                alert("codiceFornitore non valido");
                return;
            }
            if( isObjectEmpty(fornitore.prodotti) || fornitore.prodotti.length === 0 ){
                alert("codiceFornitore non valido");
                delete ( fornitore );
                localStorage.setItem(JSON.stringify(cart));
                return;
            }

            postJsonData("orders",fornitore,function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            pageOrchestrator.hide();
                            pageOrchestrator.refresh();
                            pageOrchestrator.showOrders();
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            pageOrchestrator.hide();
                            pageOrchestrator.refresh();
                            pageOrchestrator.showCart();
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            })

        }
    }

    function OrderManager(container) {
        this.container = container;

        this.show = function (){

            const self = this;

            makeCall("GET", "orders", null, function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.elaborateOrders(response);
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            pageOrchestrator.hide();
                            pageOrchestrator.refresh();
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            })
        }

        this.elaborateOrders = function (response) {
            const self = this;
            let orders;

            try{
                orders = JSON.parse(response.responseText);
            }catch (e){
                alert("Internal error. please retry later");
                pageOrchestrator.hide();
                pageOrchestrator.refresh();
                return;
            }

            if(orders.length == 0){
                let p = document.createElement('p');
                p.textContent = "Non hai ancora effettuato alcun ordine.";
                this.container.appendChild(p);
                return;
            }

            let h2 = document.createElement('h2');
            h2.textContent = "Storico ordini";
            this.container.appendChild(h2);

            let divRisultati = document.createElement('div');
            divRisultati.classList.add("risultati");
            this.container.appendChild(divRisultati);

            let listview = document.createElement('ul');
            listview.classList.add("listview");
            divRisultati.appendChild(listview);

            orders.forEach( (order) => {
                let li = document.createElement('li');
                listview.appendChild(li);
                li.classList.add('listview-row');

                let h3 = document.createElement('h3');
                li.appendChild(h3);
                h3.textContent = "Codice ordine: " + order.codice;

                let pFornitore = document.createElement('p');
                li.appendChild(pFornitore);
                pFornitore.textContent = "Fornitore: " + order.supplier.nome;

                let pDataSpedizione = document.createElement('p');
                li.appendChild(pDataSpedizione);
                pDataSpedizione.textContent = order.dataSpedizione === undefined ? "Ordine non ancora spedito." : "Data di spedizione: " + order.dataSpedizione;

                let pIndirizzo = document.createElement('p');
                li.appendChild(pIndirizzo);
                pIndirizzo.textContent = 'Indirizzo di spedizione: ' + order.via + ' ' + order.civico + ', ' + order.citta + ' (' + order.provincia + '), ' + order.CAP + ', ' + order.stato;

                let pTotale = document.createElement('p');
                li.appendChild(pTotale);
                pTotale.textContent = 'Totale ordine: ' + (order.totaleOrdine / 100).toFixed(2) + ' €';

                let pSpeseSpedizione = document.createElement('p');
                li.appendChild(pSpeseSpedizione);
                pSpeseSpedizione.textContent = 'Spese di spedizione: ' + (order.speseSpedizione / 100).toFixed(2) + ' €';

                let titoloProdotti = document.createElement('h3');
                titoloProdotti.textContent = "Prodotti";
                li.appendChild(titoloProdotti);

                let table = document.createElement('table');
                li.appendChild(table);
                let thead = document.createElement('thead');
                table.appendChild(thead);
                let tbody = document.createElement('tbody');
                table.appendChild(tbody);

                let rowHeading = document.createElement('tr');
                thead.appendChild(rowHeading);

                let thCodice = document.createElement('th');
                thCodice.textContent = "Codice Prodotto";
                rowHeading.appendChild(thCodice);

                let thNome = document.createElement('th');
                thNome.textContent = "Nome Prodotto";
                rowHeading.appendChild(thNome);

                let thPrezzo = document.createElement('th');
                thPrezzo.textContent = "Prezzo Unitario";
                rowHeading.appendChild(thPrezzo);

                let thQuantita = document.createElement('th');
                thQuantita.textContent = "Quantita Ordinata";
                rowHeading.appendChild(thQuantita);

                order.orderDetails.forEach( (product) => {
                    let rowProduct = document.createElement('tr');
                    tbody.appendChild(rowProduct);

                    let tdCodice = document.createElement('td');
                    tdCodice.textContent = product.product.codice;
                    rowProduct.appendChild(tdCodice);

                    let tdNome = document.createElement('td');
                    tdNome.textContent = product.product.nome;
                    rowProduct.appendChild(tdNome);

                    let tdPrezzo = document.createElement('td');
                    tdPrezzo.textContent = (product.prezzoUnitario / 100).toFixed(2) + " €";
                    rowProduct.appendChild(tdPrezzo);

                    let tdQuantita = document.createElement('td');
                    tdQuantita.textContent = product.quantita;
                    rowProduct.appendChild(tdQuantita);
                })

            })

        }
    }

    function PageOrchestrator(){

        this.container = document.getElementById('container');

        this.start = function () {
            const self = this;
            menu = new Menu(document.getElementById("navbar"));
            search = new Search(this.container);
            cart = new Cart(this.container);
            order = new OrderManager(this.container);

            document.getElementById('aCarrello').onclick= function (e)  {
                self.hide();
                self.refresh();
                self.showCart();
            };

            document.getElementById('aOrdini').onclick= function (e)  {
                self.hide();
                self.refresh();
                self.showOrders();
            };

            document.getElementById('aHome').onclick = function (e) {
                self.hide();
                self.refresh();
            };
        }

        this.refresh = function (){
            menu.update();
        }

        this.showCart = function() {
            this.hide();
            cart.show();
        }

        this.hide = function (){
            this.container.innerHTML = "";
            document.querySelector('#formRisultati input').value = "";
        }

        this.showOrders = function () {
            this.hide();
            order.show();
        }
    }
}