package controllers;



import org.json.simple.JSONObject;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("whiteboardLog/") //this needs to be overhauled
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class WhiteboardLog {

    @POST
    @Path("add/{clientChanges}")
    public static String lineAdd(@PathParam("clientChanges") String clientChanges){
        System.out.println("Invoked Lines.lineAdd()");

        String trimmedClientChanges = clientChanges.substring(1,clientChanges.length()-1);
        String[] clientChangesArray = trimmedClientChanges.split("},\\{"); //Splitting up the path parameter into is JSON Objects

        System.out.println(clientChangesArray);

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

    @GET
    @Path("get/{timetoken}")
    public static String lineGet(@PathParam("timetoken") double timeToken){

        System.out.println("Invoked Lines.lineGet()");

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject serverResponse = new JSONObject();

        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT LineString FROM Lines WHERE TimeToken > ?");
            ps.setDouble(1, timeToken);
            ps.execute();

            ResultSet results = ps.executeQuery();

            List serverLines = new ArrayList();

            while (results.next()==true){
                String tempVar = results.getString(1);
                serverLines.add(tempVar);
                System.out.println(tempVar);
            }

            System.out.println(serverLines);

            serverResponse.put("serverChanges",serverLines);
            serverResponse.put("timeToken",timestamp.getTime());

            return JSONObject.toJSONString(serverResponse);

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to create new lines, please see server console for more info.\"}";
        }

    }
}

