package it.polimi.tiwria.Controller;

import com.google.gson.Gson;
import it.polimi.tiwria.Bean.PriceListEntry;
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

@WebServlet(name = "GetPriceList",value = "/priceList")
public class GetPriceList extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Connection connection;

    public void init() throws UnavailableException {
        this.connection = ConnectionFactory.getConnection(getServletContext());
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ProductDAO productDAO = new ProductDAO(connection);
        Gson gson = new Gson();
        List<PriceListEntry> priceList;
        try{
            priceList = productDAO.getPriceList();
        }catch (SQLException ex){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error while querying db.\nRetry later.");
            return;
        }

        String json = gson.toJson(priceList);
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
