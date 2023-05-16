package it.polimi.tiwria.Controller;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.Supplier;
import it.polimi.tiwria.Bean.User;
import it.polimi.tiwria.ClassesForJSON.*;
import it.polimi.tiwria.DAO.ProductDAO;
import it.polimi.tiwria.DAO.SupplierDAO;
import it.polimi.tiwria.Utilities.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.awt.print.PageFormat;
import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "GetCartInfo", value = "/cartInfo")
@MultipartConfig
public class GetCartInfo extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");


        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String requestBody = sb.toString();


        // Parse the JSON data into a Java object using Gson
        Gson gson = new Gson();

        Type typeToken = new TypeToken<List<CartInfo>>(){}.getType();

        // Parse the JSON data into a Map<Integer, Map<Integer, Integer>> object using Gson
        List<CartInfo> cart;

        try{
            cart = gson.fromJson(requestBody, typeToken);
        } catch (JsonSyntaxException ex){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid json");
            return;
        }



        SupplierDAO supplierDAO = new SupplierDAO(connection);
        ProductDAO productDAO = new ProductDAO(connection);

        JsonArray result = new JsonArray();

        try {

            for (CartInfo fornitore : cart) {
                JsonObject obj = new JsonObject();
                Supplier s = supplierDAO.getSupplier(fornitore.getCodiceFornitore());

                if(s == null){
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().println("Error while querying db. Retry later");
                    return;
                }
                obj.addProperty("codice",s.getCodice());
                obj.addProperty("nome", s.getNome());

                if(fornitore.getProdotti().size() == 0){
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().println("Invalid cart info provided.");
                    return;
                }

                JsonArray products = new JsonArray();
                for (ProductInCartInfo prodotto : fornitore.getProdotti()){

                    Product p = productDAO.getProduct(prodotto.getCodiceProdotto());
                    if(p == null || !productDAO.checkProductHasSupplier(prodotto.getCodiceProdotto(),fornitore.getCodiceFornitore())){
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        response.getWriter().println("Error while querying db. Retry later");
                        return;
                    }

                    Integer price = productDAO.getPriceForProductFromSupplier(prodotto.getCodiceProdotto(),fornitore.getCodiceFornitore());
                    JsonObject prod = new JsonObject();
                    prod.addProperty("codice", p.codice());
                    prod.addProperty("nome", p.nome());
                    prod.addProperty("prezzo", price);
                    prod.addProperty("amount", prodotto.getQuantita());
                    products.add(prod);


                }

                obj.add("products",products);
                result.add(obj);
            }

        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. Retry later");
            return;
        }

        String json = gson.toJson(result);
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);


    }
    @Override
    public void destroy() {
        try {
            if (connection != null)
                connection.close();
        } catch (SQLException ignored) {
        }
    }



}
