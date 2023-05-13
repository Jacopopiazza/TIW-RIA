package it.polimi.tiwria.Controller;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.Supplier;
import it.polimi.tiwria.Bean.User;
import it.polimi.tiwria.ClassesForJSON.ProductWithFullInfo;
import it.polimi.tiwria.ClassesForJSON.ProductWithPrice;
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

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String requestBody = sb.toString();


        // Define the type of the object we want to create
        Type type = new TypeToken<Map<Integer, Map<Integer, Integer>>>(){}.getType();
        Type returnType = new TypeToken<Map<Supplier,Map<ProductWithPrice,Integer>>>(){}.getType();

        JsonSerializer<Map<Supplier, Map<ProductWithPrice, Integer>>> serializer = new JsonSerializer<Map<Supplier, Map<ProductWithPrice, Integer>>>() {
            @Override
            public JsonElement serialize(Map<Supplier, Map<ProductWithPrice, Integer>> src, Type typeOfSrc, JsonSerializationContext context) {
                JsonArray result = new JsonArray();
                for (Supplier supplier : src.keySet()) {
                    JsonObject innerObj = new JsonObject();
                    innerObj.add("codice", new JsonPrimitive(supplier.getCodice()));
                    innerObj.add("nome", new JsonPrimitive(supplier.getNome()));

                    JsonArray products = new JsonArray();
                    for (ProductWithPrice product : src.get(supplier).keySet()) {
                        Gson gson = new GsonBuilder().create();
                        JsonObject jsonObject = gson.toJsonTree(product).getAsJsonObject();
                        jsonObject.add("quantita", new JsonPrimitive(src.get(supplier).get(product)));
                        products.add(jsonObject);
                    }

                    innerObj.add("products",products);
                    result.add(innerObj);

                }
                return result;


            }
        };

        // Parse the JSON data into a Java object using Gson
        Gson gson = new GsonBuilder().registerTypeAdapter(returnType, serializer).create();

        // Parse the JSON data into a Map<Integer, Map<Integer, Integer>> object using Gson
        Map<Integer, Map<Integer, Integer>> data = gson.fromJson(requestBody, type);

        Map<Supplier, Map<ProductWithPrice, Integer>> finalData = new HashMap<>();

        SupplierDAO supplierDAO = new SupplierDAO(connection);
        ProductDAO productDAO = new ProductDAO(connection);

        try {

            for (Integer codiceFornitore : data.keySet()) {

                Supplier s = supplierDAO.getSupplier(codiceFornitore);

                if(s == null){
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().println("Error while querying db. Retry later");
                    return;
                }

                Map<ProductWithPrice, Integer> prod = new HashMap<>();
                finalData.put(s, prod);

                for (Integer codiceProdotto : data.get(codiceFornitore).keySet()){

                    Product p = productDAO.getProduct(codiceProdotto);
                    if(p == null || !productDAO.checkProductHasSupplier(codiceProdotto,codiceFornitore)){
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        response.getWriter().println("Error while querying db. Retry later");
                        return;
                    }

                    Integer price = productDAO.getPriceForProductFromSupplier(codiceProdotto,codiceFornitore);

                    ProductWithPrice product = new ProductWithPrice(p, price);
                    prod.put(product,data.get(codiceFornitore).get(codiceProdotto));

                }

            }

        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. Retry later");
            return;
        }

        String json = gson.toJson(finalData);
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
