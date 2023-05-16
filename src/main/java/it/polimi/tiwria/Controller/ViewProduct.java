package it.polimi.tiwria.Controller;

import com.google.gson.Gson;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.Supplier;
import it.polimi.tiwria.Bean.User;
import it.polimi.tiwria.ClassesForJSON.ProductWithFullInfo;
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

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

@WebServlet(name = "ViewProduct", value="/view")
public class ViewProduct extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String sCodiceProdotto = request.getParameter("codiceProdotto");

        if(sCodiceProdotto == null || sCodiceProdotto.isEmpty()){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing codiceProdotto parameter");
            return;
        }

        int codiceProdotto;
        try{
            codiceProdotto = Integer.parseInt(sCodiceProdotto);
        }catch (NumberFormatException ex){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid codiceProdotto parameter");
            return;
        }

        if(codiceProdotto < 0){
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid codiceProdotto parameter");
            return;
        }

        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");

        ProductDAO productDAO = new ProductDAO(connection);
        SupplierDAO supplierDAO = new SupplierDAO(connection);
        ProductWithFullInfo product;
        Product prod;
        Map<Supplier,Integer> map;

        try {
            productDAO.prodottoVisualizzato(user,codiceProdotto);
            prod = productDAO.getProduct(codiceProdotto);
            map = supplierDAO.getSuppliersAndPricesForProduct(codiceProdotto);
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. Retry later");
            return;
        }

        if(prod == null || map == null){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Missing data from db. Retry later");
            return;
        }
        product = new ProductWithFullInfo(prod,map);

        Gson gson = new Gson();
        String json = gson.toJson(product);

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
