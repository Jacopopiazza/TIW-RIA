package it.polimi.tiwria.ClassesForJSON;

import java.util.List;

public class CartInfo {
    private Integer codiceFornitore;

    private List<ProductInCartInfo> prodotti;

    public CartInfo(Integer codiceFornitore, List<ProductInCartInfo> prodotti) {
        this.codiceFornitore = codiceFornitore;
        this.prodotti = prodotti;
    }

    public Integer getCodiceFornitore() {
        return codiceFornitore;
    }

    public List<ProductInCartInfo> getProdotti() {
        return prodotti;
    }
}
