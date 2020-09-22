package server;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;

import org.sqlite.SQLiteConfig;

import java.sql.Connection;
import java.sql.DriverManager;


public class Main {

    public static Connection db = null;

    public static void main(String[] args) {

        openDatabase("DietTracker.db");                     //connect to our database file, when you stop the server the connection to the database
        // is closed and you can access it through SQLite Studio

        ResourceConfig config = new ResourceConfig();       // prepare our Jersey Servlet, 'Servlet' is a Java program that runs on a Java-enabled web servers.
        // Jersey is our Servlet Library, Jetty is our Server Library

        config.packages("controllers");                     // part of the server that provides API, listening and responding to HTTP requests
        config.register(MultiPartFeature.class);            // support multipart HTML forms
        ServletHolder servlet = new ServletHolder(new ServletContainer(config));  //Instantiate the Servlet

        Server server = new Server(8081);                   // prepare our Jetty Server to listen on port 8081
        ServletContextHandler context = new ServletContextHandler(server, "/");  // instantiate the Server
        context.addServlet(servlet, "/*");                  // connect the Servlet to the Server

        try {
            server.start();                                 // start the server
            System.out.println("Server successfully started.");
            server.join();                                  // Wait for the server to rejoin the main thread, program waits here
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public static void openDatabase(String dbFile) {
        try {
            SQLiteConfig config = new SQLiteConfig();
            config.enforceForeignKeys(true);                //need this to cascade delete/update in database
            Class.forName("org.sqlite.JDBC");
            db = DriverManager.getConnection("jdbc:sqlite:resources/" + dbFile, config.toProperties());
            System.out.println("Database connection successfully established.");
        } catch (Exception exception) {
            System.out.println("Database connection error: " + exception.getMessage());
        }
    }
}