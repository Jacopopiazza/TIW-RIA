{
    /**
     * This method checks if the user is logged in.
     */
    if (localStorage.getItem("user") === null) {
        logout();
    }

    let home, search, cart, order, pageOrchestrator = new PageOrchestrator();

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

        pageOrchestrator.showHome();
    }

    /**
     * This method logs out the user and goes to the login page.
     */
    function logout() {
        makeCall("POST", 'logout',null, function (response) {
            if (response.readyState === XMLHttpRequest.DONE) {
                switch (response.status) {
                    case 200:
                        localStorage.clear();
                        window.location.href = "index.html";
                        break;
                    default :
                        alert("Unknown Error.\nNot logged out");
                        pageOrchestrator.hide();
                        pageOrchestrator.showHome();
                        break;
                }
            }
        });

    }

    function Home(container) {
        this.container = container;

        this.showLastViewedProducts = function (response){
            let products
            try{
                products = JSON.parse(response.responseText);
            }catch(e){
                alert("Error parsing JSON: " + e);
                return;
            }

            if(products.length == 0){
                let h2NoProd = document.createElement('h2');
                h2NoProd.textContent="No products to show.";
                this.container.appendChild(h2NoProd);
            }
            else{
                let h2Titolo = document.createElement('h2');
                h2Titolo.textContent = "Hai visto di recente o potrebbe interessarti: ";
                this.container.appendChild(h2Titolo);

                let divContainer = document.createElement('div');
                divContainer.classList.add("card-container");
                this.container.appendChild(divContainer);

                for(let i = 0;i<products.length;i++){
                    let card = document.createElement('div');
                    card.classList.add("card");
                    card.style = "width: 18rem;";
                    divContainer.appendChild(card);

                    let img = document.createElement('img');
                    img.src = 'image?idProduct=' + products[i].codice;
                    img.classList.add('card-img-top');
                    card.appendChild(img);

                    let cardBody = document.createElement('div');
                    cardBody.classList.add("card-body");
                    card.appendChild(cardBody);

                    let pCodice = document.createElement('p');
                    pCodice.textContent = "Codice: " + products[i].codice;
                    cardBody.appendChild(pCodice);

                    let pNome = document.createElement('p');
                    pNome.textContent = "Nome Prodotto: " + products[i].nome;
                    cardBody.appendChild(pNome);

                }
            }

        }

        this.show = function (){
            let self = this;

            let divSearch = document.createElement('div');
            divSearch.classList.add("searchForm");
            this.container.appendChild(divSearch);

            let formSearch = document.createElement('form');
            formSearch.action = "#";
            formSearch.id = "formRisultati";
            divSearch.appendChild(formSearch);

            let inputSearch = document.createElement('input');
            inputSearch.type = "text";
            inputSearch.placeholder = "Cerca...";
            inputSearch.name = "queryString";
            inputSearch.required = true;
            formSearch.appendChild(inputSearch);

            formSearch.addEventListener("submit", search.handleSearch, false);

            makeCall("GET","lastViewedProducts",null,function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.showLastViewedProducts(response);
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.\nYou will be taken to the login page.");
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text + "\nYou will be taken to the homepage.");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                    }
                }
            })
        }

    }

    function Search(container) {
        this.containter = container;

        const self = this;

        this.handleSearch = function (e) {
            e.preventDefault();
            self.containter.innerHTML = "";

            var form = e.target;

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
                                alert("You are not logged in.\nYou will be taken to the login page.")
                                logout();
                                break;
                            case 400:
                            case 500:
                                alert(text + "\nYou will be taken to the homepage.");
                                pageOrchestrator.hide();
                                pageOrchestrator.showHome();
                                break;
                            default:
                                alert("Unknown error");
                                pageOrchestrator.hide();
                                pageOrchestrator.showHome();
                                break;
                        }
                    }
                },true )

            } else form.reportValidity();
        }

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

            let divModalContent = document.createElement('div')
            divModalContent.id = "myModal";
            divModalContent.classList.add('modal-content')
            divModalContent.onmouseleave = function(e) {
                closeModal();
            }
            this.containter.appendChild(divModalContent);

            let content = document.createElement('h2')
            content.textContent = "PROVA"
            divModalContent.appendChild(content);

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
                        let url = "view?idProduct=" + e.target.getAttribute("data-codiceprodotto");
                        makeCall("GET", url,null,function(response){
                            if (response.readyState === XMLHttpRequest.DONE) {
                                let text = response.responseText;
                                switch (response.status) {
                                    case 200:
                                        self.openDetails(e.target.parentNode, response);
                                        break;
                                    case 401:
                                    case 403:
                                        alert("You are not logged in.\nYou will be taken to the login page.")
                                        logout();
                                        break;
                                    case 400:
                                    case 500:
                                        alert(text + "\nYou will be taken to the homepage.");
                                        pageOrchestrator.hide();
                                        pageOrchestrator.showHome();
                                        break;
                                    default:
                                        alert("Unknown error");
                                        pageOrchestrator.hide();
                                        pageOrchestrator.showHome();
                                        return;
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
            img.src = "image?idProduct=" + details.product.codice;
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

            let columnNames = ['Nome','Valutazione','Prezzo Unitario','Sconto Applicato','Spese Spedizione','Spesa minima spedizione gratuita','Già nel carrello','']
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

                let tdSconto = document.createElement('td');
                supplierRow.appendChild(tdSconto);
                tdSconto.textContent = (supplier.discount * 100.00).toFixed(2) + ' %';

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
                tdNelCarrello.setAttribute("data-codicefornitore", supplier.supplier.codice);
                tdNelCarrello.setAttribute("data-codiceprodotto", details.product.codice);
                tdNelCarrello.textContent = "";

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

                    if(isNaN(inputQuantita.value) || inputQuantita.value <= 0 || !Number.isInteger(parseFloat(inputQuantita.value))){
                        alert("Valore quantità non valido.")
                        return;
                    }

                    let amount = inputQuantita.value;
                    let idProduct = e.target.getAttribute('data-codiceprodotto');
                    let idSupplier = e.target.getAttribute('data-codicefornitore');

                    if(isNaN(idProduct) || isNaN(idSupplier) || !Number.isInteger(parseFloat(idProduct)) || !Number.isInteger(parseFloat(idSupplier))){
                        alert("Internal error");
                        return;
                    }

                    cart.addProduct(idProduct,idSupplier,amount);

                    pageOrchestrator.hide();
                    pageOrchestrator.showCart();

                }

                tdAggiungiAlCarrello.appendChild(btnAggiungi);
            }

            this.updateAltriNelCarrello();
        }

        this.closeDetails = function (li){
            let divDetails = li.querySelectorAll("div");
            if (divDetails != null)
                divDetails.forEach( node => {li.removeChild(node)})
        }

        this.updateAltriNelCarrello = function (){
            const self = this;
            makeCall("GET", "priceList", null, function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.updateTextAltri(response);
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in\nYou will ne taken to the login page.");
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text + "\nYou will be taken to the homepage.");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                    }
                }
            });


        }

        this.updateTextAltri = function (response) {

            let listino;

            try{
                listino = JSON.parse(response.responseText);
            }catch(e){
                alert("Internal error");
                return;
            }

            let tds = document.querySelectorAll("td[data-codicefornitore]")
            tds.forEach( td => {
                let sAttr = td.getAttribute("data-codicefornitore");
                let sAttr2 = td.getAttribute("data-codiceprodotto");
                if(isNaN(sAttr) || isNaN(sAttr2)){
                    alert("Internal error\nYou will be taken to the homepage.");
                    pageOrchestrator.hide();
                    pageOrchestrator.showHome();
                    return;
                }
                let idSupplier = parseInt(sAttr);
                let idProduct = parseInt(sAttr2);

                let carrelloFornitore = cart.getCartForSupplier(idSupplier);

                if(carrelloFornitore === undefined){
                    td.textContent = "Nessun prodotto di questo fornitore nel carrello";
                    return;
                }

                let numeroArticoli = carrelloFornitore.prodotti.reduce(function(total, prodotto) {
                    return total + prodotto.amount;
                }, 0);

                let totale = 0;
                for(let i = 0; i< carrelloFornitore.prodotti.length;i++){
                    let prodotto = carrelloFornitore.prodotti[i];
                    let prodottoInListino = listino.filter(x => x.idSupplier === idSupplier && x.idProduct === prodotto.idProduct);
                    if(prodottoInListino.length == 0){
                        alert("Internal error\nYou will be taken to the homepage.");
                        pageOrchestrator.hide();
                        pageOrchestrator.showHome();
                        return;
                    }
                    totale += prodotto.amount * prodottoInListino[0].prezzo;
                }



                td.textContent = numeroArticoli + " articoli di questo fornitore nel carrello, per un valore di " + (totale / 100).toFixed(2) + " €";

                td.onmouseover = function(e) {

                    openModal(e)

                }



            })
        }

        function openModal(e) {
            let modal = document.getElementById("myModal");

            let rect = e.target.getBoundingClientRect();
            let height = e.target.offsetHeight;

            let idSupplier = e.target.getAttribute("data-codicefornitore");
            let cartFornitore = cart.getCartForSupplier(idSupplier);

            if(cartFornitore == null){
                return;
            }

            let string = "[" + JSON.stringify(cartFornitore) + "]"

            postJsonData("cartInfo", string,function(response){

                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:

                            let info;
                            try{
                                info = JSON.parse(response.responseText);
                            }catch (e){
                                alert("Error in parsing JSON: " + e);
                                pageOrchestrator.hide();
                                pageOrchestrator.showHome();
                                return;
                            }

                            modal.style.display = "block"; // Mostra la finestra modale
                            Object.assign(modal.style, {
                                left: `${rect.left - 40}px`,
                                top: `${e.pageY - height}px`,
                                display:'block'
                            });
                            modal.innerHTML = "";

                            let name = document.createElement('h4');
                            name.textContent = info[0].nome;
                            modal.appendChild(name);

                            let list = document.createElement('ul');
                            modal.appendChild(list);


                            let products = info[0].products;
                            products.forEach( prod => {
                                let li = document.createElement('li');
                                li.textContent = prod.amount + "x " + prod.nome;
                                list.appendChild(li);
                            })

                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.\nYou will be taken to the login page.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text + "\nYou will be taken to the homepage.");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                    }
                }

            },false);


        }

        function closeModal() {
            document.getElementById("myModal").style.display = "none"; // Nasconde la finestra modale
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
                pageOrchestrator.showHome();
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
                            alert("You are not logged in.\nYou will be taken to the login page.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            localStorage.removeItem(self.key);
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
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

                    if(isNaN(e.target.getAttribute('data-codicefornitore')) || !Number.isInteger(parseFloat(e.target.getAttribute("data-codicefornitore")))){
                        alert("Internal error");
                        pageOrchestrator.hide();
                        pageOrchestrator.showCart();
                        return;
                    }

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
                    img.src = "image?idProduct=" + product.codice;
                    tdImg.appendChild(img);

                    let tdQuantita = document.createElement('td');
                    row.appendChild(tdQuantita);
                    tdQuantita.textContent = product.amount;

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

            let idSupplier = parseInt(cf);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.showHome();
                return ;
            }

            if(cart == null){
                cart = [];
            }

            let fornitore = cart.filter(o => o.idSupplier == idSupplier);

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

            let idProduct = parseInt(cp);
            let idSupplier = parseInt(cf);
            let amount = parseInt(q);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.showHome();
                return ;
            }

            if(cart === null){
                cart = [];
            }

            let fornitore= cart.filter( o => o.idSupplier === idSupplier)[0]

            if (fornitore === undefined){
                let newVoice = {
                    "idSupplier" : idSupplier,
                    "prodotti" : [
                        {
                            "idProduct" : idProduct,
                            "amount" : amount
                        }
                    ]
                }
                
                cart.push(newVoice);

            }
            else{
                if(fornitore.prodotti.length == 0){
                    let newVoice = {
                                "idProduct" : idProduct,
                                "amount" : amount
                    }

                    fornitore.prodotti.push(newVoice);
                }
                else{
                    let prodotto = fornitore.prodotti.filter(o => o.idProduct === idProduct)[0];

                    if(prodotto === undefined){
                        let newVoice = {
                            "idProduct" : idProduct,
                            "amount" : amount
                        }

                        fornitore.prodotti.push(newVoice);

                    }
                    else{
                        prodotto.amount += amount;
                    }
                }

            }

            localStorage.setItem(this.key, JSON.stringify(cart));
        }

        this.sendOrder = function (cf) {
            const self = this;
            if(isNaN(cf)) {
                alert("Internal error");
                return;
            }

            let idSupplier = parseInt(cf);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to homepage");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.showHome();
                return ;
            }

            let fornitore = cart.filter(o => o.idSupplier === idSupplier)[0];

            if(fornitore === undefined){
                alert("idSupplier non valido");
                pageOrchestrator.hide();
                pageOrchestrator.showCart();
                return ;
                return;
            }
            if( fornitore.prodotti == null || isObjectEmpty(fornitore.prodotti) || fornitore.prodotti.length === 0 ){
                alert("idSupplier non valido");
                cart = cart.filter(o => o.idSupplier != idSupplier);
                localStorage.setItem(JSON.stringify(cart));
                pageOrchestrator.hide();
                pageOrchestrator.showHome();
                return;
            }

            postJsonData("orders",fornitore,function (response){
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.removeProductsOfSupplier(idSupplier);
                            pageOrchestrator.hide();
                            pageOrchestrator.showOrders();
                            break;
                        case 401:
                        case 403:
                            alert("You are not logged in.\nYou will be taken to the login page.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text);
                            pageOrchestrator.hide();
                            pageOrchestrator.showCart();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                    }
                }
            })

        }

        this.removeProductsOfSupplier = function (cf){

            if(isNaN(cf)){
                alert("Internal error");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.showOrders();
            }

            let idSupplier = parseInt(cf);

            let cart;

            try{
                cart = JSON.parse(localStorage.getItem(this.key));
            }catch (e){
                alert("Internal error.\nYou will be taken to the orders page");
                localStorage.removeItem(this.key);
                pageOrchestrator.hide();
                pageOrchestrator.showOrders();
                return ;
            }

            cart = cart.filter(x => x.idSupplier != idSupplier);

            localStorage.setItem(this.key, JSON.stringify(cart));
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
                            alert("You are not logged in.\nYou will be taken to the login page.")
                            logout();
                            break;
                        case 400:
                        case 500:
                            alert(text +  "\nYou will be taken to the homepage.");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
                        default:
                            alert("Unknown error");
                            pageOrchestrator.hide();
                            pageOrchestrator.showHome();
                            break;
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
                pageOrchestrator.showHome();
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
                pFornitore.textContent = "Fornitore: " + order.nomeFornitore;

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

                    let tdNome = document.createElement('td');
                    tdNome.textContent = product.nomeProdotto;
                    rowProduct.appendChild(tdNome);

                    let tdPrezzo = document.createElement('td');
                    tdPrezzo.textContent = (product.prezzoUnitario / 100).toFixed(2) + " €";
                    rowProduct.appendChild(tdPrezzo);

                    let tdQuantita = document.createElement('td');
                    tdQuantita.textContent = product.amount;
                    rowProduct.appendChild(tdQuantita);
                })

            })

        }
    }

    function PageOrchestrator(){

        this.container = document.getElementById('container');

        this.start = function () {
            const self = this;
            home = new Home(this.container);
            search = new Search(this.container);
            cart = new Cart(this.container);
            order = new OrderManager(this.container);

            document.getElementById('aCarrello').onclick= function (e)  {
                self.hide();
                self.showCart();
            };

            document.getElementById('aOrdini').onclick= function (e)  {
                self.hide();
                self.showOrders();
            };

            document.getElementById('aHome').onclick = function (e) {
                self.hide();
                self.showHome();
            };

            self.hide();
        }

        this.showHome = function (){
            this.hide();
            home.show();
        }

        this.showCart = function() {
            this.hide();
            cart.show();
        }

        this.hide = function (){
            this.container.innerHTML = "";
        }

        this.showOrders = function () {
            this.hide();
            order.show();
        }
    }
}