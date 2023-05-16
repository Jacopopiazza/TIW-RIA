package it.polimi.tiwria.Bean;

public class DeliveryCost {
    private int id;
    private int idSupplier;
    private int numeroMinimoArticoli;
    private Integer numeroMassimoArticoli = null;
    private int prezzoSpedizione;

    public DeliveryCost(int id, int idSupplier, int numeroMinimoArticoli, Integer numeroMassimoArticoli, int prezzoSpedizione){

        this.id = id;
        this.idSupplier = idSupplier;
        this.numeroMinimoArticoli = numeroMinimoArticoli;
        this.numeroMassimoArticoli = numeroMassimoArticoli;
        this.prezzoSpedizione = prezzoSpedizione;

    }

    public DeliveryCost(int id, int idSupplier, int numeroMinimoArticoli, int prezzoSpedizione){

        this(id,idSupplier,numeroMinimoArticoli,null, prezzoSpedizione);

    }

    public int getId() {
        return id;
    }

    public int getCodiceFornitore() {
        return idSupplier;
    }

    public int getNumeroMinimoArticoli() {
        return numeroMinimoArticoli;
    }

    public Integer getNumeroMassimoArticoli() {
        return numeroMassimoArticoli;
    }

    public int getPrezzoSpedizione() {
        return prezzoSpedizione;
    }
}
