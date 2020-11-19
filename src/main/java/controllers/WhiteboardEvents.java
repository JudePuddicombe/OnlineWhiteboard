package controllers;


import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import play.mvc.*;
import play.mvc.Http.*;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("whiteboardEvents/") //this needs to be overhauled
@Consumes(MediaType.MULTIPART_FORM_DATA)
// @Consumes({"text/plain;charset=UTF-8"})
@Produces(MediaType.APPLICATION_JSON)

public class WhiteboardEvents {

    @POST
    @Path("add/")
    public static String eventAdd(String body) throws Exception{

        MediaType mediaType = new MediaType("MULTIPART_FORM_DATA","*");

        Object clientForm = mediaType.parseMediaType(body);

        System.out.println("Invoked whiteboardEvents/add");

        BodyParser parser = new JSONParser();

        parser.parse(clientForm);

        // JSONArray clientEvents = (JSONArray) parser.parse(body);

        return "{myString: \"string\"}";
    }

    @GET
    @Path("get/{timetoken}")
    public static String lineGet(@PathParam("timetoken") double timeToken){

        System.out.println("Invoked whiteboardEvents/get");

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
