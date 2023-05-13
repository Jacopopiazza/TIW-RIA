package it.polimi.tiwria.Controller;

import com.google.gson.Gson;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.ClassesForJSON.ProductWithPrice;
import it.polimi.tiwria.DAO.ProductDAO;
import it.polimi.tiwria.Utilities.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet(name = "Results", value = "/results")

public class Results extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //Check param is there
        String queryString = request.getParameter("queryString");
        if (queryString == null || queryString.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Querystring is not valid");
            return;
        }

        ProductDAO productDAO = new ProductDAO(connection);
        Map<Product,Integer> products;
        try{
            products = productDAO.getProductsFromQueryString(queryString);
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. retry later");
            return;
        }

        if(products == null){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error in data retrived from db. retry later");
            return;
        }

        List<ProductWithPrice> results = products.entrySet().stream().map(x -> new ProductWithPrice(x.getKey(),x.getValue())).toList();
        Gson gson = new Gson();
        String json = gson.toJson(results);

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
