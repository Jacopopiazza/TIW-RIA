package it.polimi.tiwria.ClassesForJSON;

public class ProductInCartInfo {
    private Integer codiceProdotto;
    private Integer quantita;

    public ProductInCartInfo(Integer codiceProdotto, Integer quantita) {
        this.codiceProdotto = codiceProdotto;
        this.quantita = quantita;
    }

    public Integer getCodiceProdotto() {
        return codiceProdotto;
    }

    public Integer getQuantita() {
        return quantita;
    }
}
