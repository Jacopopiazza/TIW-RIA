package it.polimi.tiwria.DAO;

import it.polimi.tiwria.Bean.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {

    private Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean doesEmailExist(String email) throws SQLException {
        String query = "SELECT Email FROM utente WHERE Email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.isBeforeFirst();
            }
        }
    }

    public User checkCredentials(String usrn, String pwd) throws SQLException {
        String query = "SELECT * FROM utente WHERE Email = ? AND password =?";
        try (PreparedStatement pstatement = connection.prepareStatement(query);) {
            pstatement.setString(1, usrn);
            pstatement.setString(2, pwd);
            try (ResultSet result = pstatement.executeQuery();) {
                if (!result.isBeforeFirst()) // no results, credential check failed
                    return null;
                else {
                    result.next();
                    return new User(result.getString("Email"),
                            result.getString("Nome"),
                            result.getString("Cognome"),
                            result.getString("Via"),
                            result.getString("Civico"),
                            result.getString("CAP"),
                            result.getString("Citta"),
                            result.getString("Stato"),
                            result.getString("Provincia"));
                }
            }
        }
    }

    public static boolean isValidEmail(String email) {
        return email != null && email.matches("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}])|(([a-zA-Z\\-\\d]+\\.)+[a-zA-Z]{2,}))$")
                && email.length() <= 50;
    }


}
