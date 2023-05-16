package it.polimi.tiwria.ClassesForJSON;

import java.util.List;

public class CartInfo {
    private Integer idSupplier;

    private List<ProductInCartInfo> prodotti;

    public CartInfo(Integer idSupplier, List<ProductInCartInfo> prodotti) {
        this.idSupplier = idSupplier;
        this.prodotti = prodotti;
    }

    public Integer getCodiceFornitore() {
        return idSupplier;
    }

    public List<ProductInCartInfo> getProdotti() {
        return prodotti;
    }
}
