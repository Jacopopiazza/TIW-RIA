package it.polimi.tiwria.DAO;

import it.polimi.tiwria.Bean.PriceListEntry;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

public class ProductDAO {

    private final Connection connection;

    public ProductDAO(Connection connection) {
        this.connection = connection;
    }

    public Product getProduct(int codiceProdotto) throws SQLException{
        String query = "SELECT * FROM prodotto WHERE Codice = ?";

        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1, codiceProdotto);
        ResultSet resultSet = statement.executeQuery();

        if(resultSet.isBeforeFirst()) {
            resultSet.next();


            Product product = new Product(resultSet.getInt("Codice"),
                    resultSet.getString("Nome"),
                    resultSet.getString("Descrizione"),
                    resultSet.getString("Foto"),
                    resultSet.getString("Categoria"));
            return product;


        }
        return null;
    }

    public List<Product> getMenuProductsForUser(String email)throws SQLException {

        String query = "SELECT P.*, Timestamp FROM db_tiw.visualizzazioni v1 INNER JOIN prodotto P on P.Codice=v1.CodiceProdotto WHERE Timestamp = (SELECT MAX(Timestamp) FROM visualizzazioni v2 WHERE P.Codice in (SELECT CodiceProdotto FROM prodottodafornitore) AND v2.EmailUtente=? AND v2.CodiceProdotto=v1.CodiceProdotto) ORDER BY Timestamp DESC LIMIT 5;";
        List<Product> lasts = new ArrayList<>();

        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, email);
        ResultSet resultSet = statement.executeQuery();

        if(resultSet.isBeforeFirst()) {


            while (resultSet.next()) {
                Product product = new Product(resultSet.getInt("Codice"),
                        resultSet.getString("Nome"),
                        resultSet.getString("Descrizione"),
                        resultSet.getString("Foto"),
                        resultSet.getString("Categoria"));
                lasts.add(product);
            }

        }

        if(lasts.size() < 5){

            Queue<Product> randomProducts;
            randomProducts = getFiveRandomProducts(lasts);


            while(!randomProducts.isEmpty() && lasts.size() < 5){
                Product p = randomProducts.poll();
                if(!lasts.contains(p)){
                    lasts.add(p);
                }
            }
        }

        return lasts;
    }

    public String getFotoPathFromCodiceProdotto(int codiceProdotto) throws SQLException{
        String query = "SELECT Foto FROM prodotto P INNER JOIN prodottodafornitore pdf ON P.Codice=pdf.CodiceProdotto WHERE Codice = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1, codiceProdotto);
        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()){
            return null;
        }

        resultSet.next();
        return resultSet.getString("Foto");
    }

    public Queue<Product> getFiveRandomProducts(List<Product> notIn) throws SQLException{
        String query = "SELECT * FROM prodotto P WHERE P.Categoria='Tech' AND P.Codice in (SELECT CodiceProdotto FROM prodottodafornitore) ";
        if(!notIn.isEmpty()){
            query += " AND P.Codice NOT IN (";
            for(int  i = 0; i < notIn.size();i++){
                query += " ? ";
                if( i != notIn.size()-1) query += ", ";
            }
            query += " ) ";
        }
        query += " ORDER BY RAND() LIMIT 5";

        Queue<Product> lasts = new LinkedList<>();
        PreparedStatement statement = connection.prepareStatement(query);


        for(int  i = 0; i < notIn.size();i++){
            statement.setInt(i+1, notIn.get(i).codice());
        }
        ResultSet resultSet = statement.executeQuery();


        if(!resultSet.isBeforeFirst()){
            return lasts;
        }

        while (resultSet.next()) {
            Product product = new Product(resultSet.getInt("Codice"),
                    resultSet.getString("Nome"),
                    resultSet.getString("Descrizione"),
                    resultSet.getString("Foto"),
                    resultSet.getString("Categoria"));
            lasts.add(product);
        }




        return lasts;
    }

    public List<PriceListEntry> getPriceList() throws SQLException{
        String query = "SELECT CodiceProdotto, CodiceFornitore, Prezzo FROM prodottodafornitore;";
        List<PriceListEntry> results = new ArrayList<>();
        PreparedStatement statement = connection.prepareStatement(query);

        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()){
            return results;
        }

        while (resultSet.next()) {
            PriceListEntry entry = new PriceListEntry(resultSet.getInt("CodiceFornitore"),
                                                        resultSet.getInt("CodiceProdotto"),
                                                        resultSet.getInt("Prezzo"));
            results.add(entry);
        }

        return results;

    }

    public Map<Product, Integer> getProductsFromQueryString(String queryString) throws SQLException{
        String query = "SELECT P.*, Min(Prezzo) AS PrezzoMinimo FROM db_tiw.prodotto P INNER JOIN db_tiw.prodottodafornitore PDF on P.Codice=PDF.CodiceProdotto WHERE P.Nome LIKE ? OR P.Descrizione LIKE ? GROUP BY CodiceProdotto ORDER BY PrezzoMinimo;";
        Map<Product, Integer> prods = new HashMap<>();
        PreparedStatement statement = connection.prepareStatement(query);

        statement.setString(1, "%" + queryString + "%");
        statement.setString(2, "%" + queryString + "%");

        ResultSet resultSet = statement.executeQuery();

        if(!resultSet.isBeforeFirst()){
            return prods;
        }

        while (resultSet.next()) {
            Product product = new Product(resultSet.getInt("Codice"),
                    resultSet.getString("Nome"),
                    resultSet.getString("Descrizione"),
                    resultSet.getString("Foto"),
                    resultSet.getString("Categoria"));

            prods.put(product, resultSet.getInt("PrezzoMinimo"));
        }

        return prods;
    }

    public void prodottoVisualizzato(User user, int codiceProdotto) throws SQLException{
        String query = "INSERT into visualizzazioni (EmailUtente, CodiceProdotto)   VALUES(?, ?)";
        PreparedStatement pstatement = connection.prepareStatement(query);
        pstatement.setString(1, user.email());
        pstatement.setInt(2, codiceProdotto);
        pstatement.executeUpdate();
    }

    public boolean checkProductHasSupplier(int codiceProdotto, int codiceFornitore) throws SQLException {
        String query = "SELECT * FROM prodottodafornitore WHERE CodiceProdotto=? AND CodiceFornitore=?";
        PreparedStatement statement = connection.prepareStatement(query);

        statement.setInt(1, codiceProdotto);
        statement.setInt(2, codiceFornitore);

        ResultSet resultSet = statement.executeQuery();

        return resultSet.isBeforeFirst();

    }

    public int getPriceForProductFromSupplier(int codiceProdotto, int codiceFornitore) throws SQLException{
        String query = "SELECT * FROM prodottodafornitore WHERE CodiceProdotto=? AND CodiceFornitore=?";
        PreparedStatement statement = connection.prepareStatement(query);

        statement.setInt(1, codiceProdotto);
        statement.setInt(2, codiceFornitore);

        ResultSet resultSet = statement.executeQuery();

        resultSet.next();

        return resultSet.getInt("Prezzo");
    }

}