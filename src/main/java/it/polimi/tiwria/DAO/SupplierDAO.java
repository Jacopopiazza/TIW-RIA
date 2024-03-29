package it.polimi.tiwria.DAO;

import it.polimi.tiwria.Bean.DeliveryCost;
import it.polimi.tiwria.Bean.Supplier;
import it.polimi.tiwria.Utilities.Pair;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SupplierDAO {

    private final Connection connection;

    public SupplierDAO(Connection connection) {
        this.connection = connection;
    }

    public Supplier getSupplier(int idSupplier) throws SQLException {
        String query = "SELECT * FROM fornitore WHERE Codice=?";

        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1,idSupplier);
        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()) return null;
        resultSet.next();

        Integer sogliaSpedizione = resultSet.getInt("SogliaSpedizioneGratuita");
        if(resultSet.wasNull()){
            sogliaSpedizione = null;
        }

        List<DeliveryCost> deliveryCostList = this.getDeliveryCostsForSupplier(resultSet.getInt("Codice"));
        return new Supplier(resultSet.getInt("Codice"),
                resultSet.getString("Nome"),
                resultSet.getDouble("Valutazione"),
                sogliaSpedizione,
                deliveryCostList);


    }

    public Map<Supplier, Pair<Integer,Double>> getSuppliersAndPricesForProduct(int idProduct) throws SQLException {

        String query = "SELECT F.*, Round((Prezzo*(1-Sconto))) as Prezzo, Sconto FROM prodottodafornitore pdf INNER JOIN fornitore F on pdf.CodiceFornitore=F.Codice WHERE CodiceProdotto=?";
        Map<Supplier, Pair<Integer,Double>> suppliers = new HashMap<>();
        PreparedStatement statement = connection.prepareStatement(query);

        statement.setInt(1, idProduct);

        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()){
            return suppliers;
        }

        while (resultSet.next()) {

            Integer sogliaSpedizione = resultSet.getInt("SogliaSpedizioneGratuita");
            if(resultSet.wasNull()){
                sogliaSpedizione = null;
            }

            List<DeliveryCost> deliveryCostList = this.getDeliveryCostsForSupplier(resultSet.getInt("Codice"));
            Supplier supplier = new Supplier(resultSet.getInt("Codice"),
                    resultSet.getString("Nome"),
                    resultSet.getDouble("Valutazione"),
                    sogliaSpedizione,
                    deliveryCostList);



            suppliers.put(supplier, new Pair<Integer,Double>( resultSet.getInt("Prezzo"), resultSet.getDouble("Sconto")));
        }

        return suppliers;

    }

    protected List<DeliveryCost> getDeliveryCostsForSupplier(int idSupplier) throws SQLException{
        String query = "SELECT * FROM fasciaspedizione WHERE CodiceFornitore=?";
        List<DeliveryCost> deliveryCosts = new ArrayList<>();
        PreparedStatement statement = connection.prepareStatement(query);

        statement.setInt(1, idSupplier);

        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()){
            return deliveryCosts;
        }

        while (resultSet.next()) {

            Integer numeroMassimoArticoli = resultSet.getInt("NumeroMassimoArticoli");
            if(resultSet.wasNull()){
                numeroMassimoArticoli = null;
            }

            DeliveryCost deliveryCost = new DeliveryCost(resultSet.getInt("idFasciaSpedizione"),
                    resultSet.getInt("CodiceFornitore"),
                    resultSet.getInt("NumeroMinimoArticoli"),
                    numeroMassimoArticoli,
                    resultSet.getInt("PrezzoSpedizione"));

            deliveryCosts.add(deliveryCost);
        }

        return deliveryCosts;
    }

    public Integer getDeliveryCostOfSupplierForNProducts(int idSupplier, int numeroArticoli) throws SQLException {
        String query = "SELECT PrezzoSpedizione FROM fasciaspedizione WHERE CodiceFornitore = ? AND NumeroMinimoArticoli <= ? AND (NumeroMassimoArticoli IS NULL OR NumeroMassimoArticoli >= ?);";
        PreparedStatement stmt = connection.prepareStatement(query);
        stmt.setInt(1, idSupplier);
        stmt.setInt(2, numeroArticoli);
        stmt.setInt(3, numeroArticoli);

        ResultSet rs = stmt.executeQuery();

        if(!rs.isBeforeFirst()) return null;

        rs.next();
        return rs.getInt("PrezzoSpedizione");

    }



}
