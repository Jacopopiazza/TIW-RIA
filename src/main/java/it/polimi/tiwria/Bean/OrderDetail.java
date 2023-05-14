package it.polimi.tiwria.Bean;

public record OrderDetail(int codiceOrdine, Product product, int prezzoUnitario, int quantita) {
}
