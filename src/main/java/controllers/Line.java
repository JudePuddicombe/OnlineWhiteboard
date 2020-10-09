package controllers;


import jdk.nashorn.internal.parser.JSONParser;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;

@Path("line/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Line {

    @POST
    @Path("add/{clientChanges}")
    public String lineAdd(@PathParam(("clientChanges") String clientChanges){
        System.out.println("Invoked Lines.lineAdd()");

        String[] clientChangesArray = clientChanges.split("},{",0);
        JSONParser parser = new JSONParser();

        try {
            PreparedStatement ps = Main.db.prepareStatement("INSERT INTO Lines (YStart,XStart,YEnd,XEnd) VALUES (?,?,?,?)");
            for(int i = 0; i < clientChangesArray.length; i++){
                JSONObject line = (JSONObject) parser.parse("{" + clientChangesArray[i] + "}");
                ps.setInt(1,line.startX);
                ps.setInt(2,line.startY);
                ps.setInt(3,line.endX);
                ps.setInt(4,line.endY);
                ps.execute();
            }

            return "{\"OK\": \"Added food.\"}";

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to create new item, please see server console for more info.\"}";
        }

    }

