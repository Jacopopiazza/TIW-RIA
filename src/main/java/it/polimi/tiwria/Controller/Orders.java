package it.polimi.tiwria.Controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import it.polimi.tiwria.Bean.*;
import it.polimi.tiwria.ClassesForJSON.CartInfo;
import it.polimi.tiwria.ClassesForJSON.ProductInCartInfo;
import it.polimi.tiwria.DAO.OrderDAO;
import it.polimi.tiwria.DAO.ProductDAO;
import it.polimi.tiwria.DAO.SupplierDAO;
import it.polimi.tiwria.Utilities.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet(name ="Orders", value = "/orders")
public class Orders extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        OrderDAO orderDAO = new OrderDAO(connection);

        User user = (User)session.getAttribute("user");

        List<Order> ordini;

        try {
            ordini = orderDAO.getOrdersForUser(user.email());
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error in fetching orders for logged user from db.\n" + ex.getMessage());
            return;
        }

        if(ordini == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error in fetching orders for logged user from db.");
            return;
        }

        Gson gson = new GsonBuilder()
                .setDateFormat("dd/MM/yyyy")
                .create();
        String json = gson.toJson(ordini);
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);


    }
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        BufferedReader reader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String requestBody = sb.toString();

        // Parse the JSON data into a Java object using Gson
        Gson gson = new Gson();

        // Parse the JSON data
        CartInfo data;

        try{
           data = gson.fromJson(requestBody, CartInfo.class);
        } catch (JsonSyntaxException ex){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid json");
            return;
        }

        int idSupplier = data.getCodiceFornitore();

        if(idSupplier < 0){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid parameter");
            return;
        }

        ProductDAO productDAO = new ProductDAO(connection);
        SupplierDAO supplierDAO = new SupplierDAO(connection);

        //Create it from JSON
        List<ProductInCartInfo> prodottiPerOrdine = data.getProdotti();
        int finalCodiceFornitore = idSupplier;
        int subTotale = -1;
        int articoliNelCarrello = prodottiPerOrdine.stream().map(o -> o.getQuantita()).reduce(0, Integer::sum);
        int speseSpedizione = 0;
        Supplier supplier;

        if(articoliNelCarrello == 0){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("No products in cart for this supplier, cannot create an order.");
            return;
        }

        for(ProductInCartInfo prod : prodottiPerOrdine){
            try{
                if(!productDAO.checkProductHasSupplier(prod.getCodiceProdotto(),data.getCodiceFornitore())){
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Error product not sold by given supplier");
                    return;
                }
            }catch (SQLException ex){
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("Error in checking product/supplier info.");
                return;
            }
        }

        //Calcuate total of the order
        try {
            subTotale =  prodottiPerOrdine.stream().map(x -> {
                try {
                    return productDAO.getPriceForProductFromSupplier(x.getCodiceProdotto(), finalCodiceFornitore) * x.getQuantita();
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            }).reduce(0, Integer::sum);
        }catch (RuntimeException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error in retriving prices.");
            return;
        }

        //If total < 0 -> error
        if(subTotale < 0){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("No products in cart for this supplier, cannot create an order.");
            return;
        }

        //Get supplier to calculate delivery costs
        try{
            supplier = supplierDAO.getSupplier(idSupplier);
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error in retriving supplier info.");
            return;
        }

        if(supplier == null){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error in retriving supplier info.");
            return;
        }

        //get eventual delivery costs
        if(supplier.getSogliaSpedizioneGratuita() == null ||  subTotale < supplier.getSogliaSpedizioneGratuita()){
            try{
                speseSpedizione = supplierDAO.getDeliveryCostOfSupplierForNProducts(idSupplier, articoliNelCarrello);
            }catch (SQLException ex){
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("Error in retriving delivery cost info.");
                return;
            }
        }

        //Create order
        OrderDAO orderDAO = new OrderDAO(connection);
        User user = (User)request.getSession(false).getAttribute("user");

        try{
            orderDAO.createOrder(user, idSupplier, speseSpedizione, subTotale, prodottiPerOrdine, supplier.getNome());
        }catch (SQLException ex){

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error while creating the order");
            return;
        }

        response.setStatus(HttpServletResponse.SC_OK);

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
