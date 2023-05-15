package it.polimi.tiwria.Controller;

import com.google.gson.Gson;
import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.User;
import it.polimi.tiwria.DAO.ProductDAO;
import it.polimi.tiwria.Utilities.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@WebServlet(name = "MenuProducts",value = "/menu")
@MultipartConfig

public class LastViewedProducts extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        ProductDAO productDAO = new ProductDAO(connection);
        HttpSession session = request.getSession(false);
        String userEmail = ((User)session.getAttribute("user")).email();
        List<Product> productList;
        try{
            productList = productDAO.getMenuProductsForUser(userEmail);
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while querying db. retry later");
            return;
        }

        if(productList == null){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error in data retrived from db. retry later");
            return;
        }

        Gson gson = new Gson();
        String json = gson.toJson(productList);

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
