package it.polimi.tiwria.Bean;

import java.util.List;

public class Supplier {

    private int codice;
    private String nome;
    private double valutazione;
    private Integer sogliaSpedizioneGratuita = null;
    private List<DeliveryCost> fasceSpedizione;

    public Supplier(int codice, String nome, double valutazione, Integer sogliaSpedizioneGratuita, List<DeliveryCost> fasceSpedizione){
        this.codice = codice;
        this.nome = nome;
        this.valutazione = valutazione;
        this.sogliaSpedizioneGratuita = sogliaSpedizioneGratuita == null ? null : sogliaSpedizioneGratuita;
        this.fasceSpedizione = fasceSpedizione;

    }

    public Supplier(int codice, String nome, double valutazione, List<DeliveryCost> fasceSpedizione ){
        this(codice,nome,valutazione,null,fasceSpedizione);
    }

    public int getCodice() {
        return codice;
    }

    public String getNome() {
        return nome;
    }

    public double getValutazione() {
        return valutazione;
    }

    public Integer getSogliaSpedizioneGratuita() {
        return sogliaSpedizioneGratuita;
    }



    public List<DeliveryCost> getFasceSpedizione() {
        return fasceSpedizione;
    }

}
