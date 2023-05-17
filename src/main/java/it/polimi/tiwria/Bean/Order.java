package it.polimi.tiwria.Bean;

import java.util.Date;
import java.util.List;

public record Order (int codice, int totaleOrdine, int speseSpedizione, String via,
                     String civico, String citta, String provincia, String CAP, String stato, String emailUtente, Date dataSpedizione, List<OrderDetail> orderDetails, String nomeFornitore){
}
