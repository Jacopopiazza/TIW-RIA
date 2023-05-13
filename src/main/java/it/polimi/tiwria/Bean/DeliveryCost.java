package it.polimi.tiwria.Bean;

public class DeliveryCost {
    private int id;
    private int codiceFornitore;
    private int numeroMinimoArticoli;
    private Integer numeroMassimoArticoli = null;
    private int prezzoSpedizione;

    public DeliveryCost(int id, int codiceFornitore, int numeroMinimoArticoli, Integer numeroMassimoArticoli, int prezzoSpedizione){

        this.id = id;
        this.codiceFornitore = codiceFornitore;
        this.numeroMinimoArticoli = numeroMinimoArticoli;
        this.numeroMassimoArticoli = numeroMassimoArticoli;
        this.prezzoSpedizione = prezzoSpedizione;

    }

    public DeliveryCost(int id, int codiceFornitore, int numeroMinimoArticoli, int prezzoSpedizione){

        this(id,codiceFornitore,numeroMinimoArticoli,null, prezzoSpedizione);

    }

    public int getId() {
        return id;
    }

    public int getCodiceFornitore() {
        return codiceFornitore;
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
