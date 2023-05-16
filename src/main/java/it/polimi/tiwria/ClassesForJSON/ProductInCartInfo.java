package it.polimi.tiwria.ClassesForJSON;

public class ProductInCartInfo {
    private Integer idProduct;
    private Integer amount;

    public ProductInCartInfo(Integer idProduct, Integer amount) {
        this.idProduct = idProduct;
        this.amount = amount;
    }

    public Integer getCodiceProdotto() {
        return idProduct;
    }

    public Integer getQuantita() {
        return amount;
    }
}
