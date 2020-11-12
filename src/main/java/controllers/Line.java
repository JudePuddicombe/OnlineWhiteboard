package controllers;



import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("line/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Line {

    @POST
    @Path("add/{clientChanges}")
    public static String lineAdd(@PathParam("clientChanges") String clientChanges){
        System.out.println("Invoked Lines.lineAdd()");

        String[] clientChangesArray = clientChanges.split("},\\{");
        JSONParser parser = new JSONParser();

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        double timeToken = timestamp.getTime();

        try {
            PreparedStatement ps = Main.db.prepareStatement("INSERT INTO Lines (LineString,timeToken) VALUES (?,?)");
            for(int i = 0; i < clientChangesArray.length; i++) {

                String lineString = "{" + clientChangesArray[i] + "}";

                ps.setString(1, lineString);
                ps.setDouble(2, timeToken);
                ps.execute();
            }

            return "{\"OK\": \"Added lines.\"}";

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to create new lines, please see server console for more info.\"}";
        }

    }

    @POST
    @Path("get/{timetoken}")
    public static String lineGet(@PathParam("timetoken") double timeToken){
        System.out.println("Invoked Lines.lineGet()");

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject serverResponse = new JSONObject();
        serverResponse.put("preSnap",false);

        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT LineString WHERE TimeToken > timetoken");
            ps.execute();

            ResultSet results = ps.executeQuery();

            List serverLines = new ArrayList();

            while (results.next()==true){
                serverLines.add(results.getString(1));
            }

            serverResponse.put("serverChanges",serverLines);
            serverResponse.put("timeToken",timestamp.getTime());

            return JSONObject.toJSONString(serverResponse);

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to create new lines, please see server console for more info.\"}";
        }

    }
}

