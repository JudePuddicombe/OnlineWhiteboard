package controllers;


import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLOutput;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("whiteboardEvents/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
// @Consumes({"text/plain;charset=UTF-8"})
@Produces(MediaType.APPLICATION_JSON)

public class WhiteboardEvents {

    public static void drawEvent(Object drawEvent, double timeToken) throws Exception{

        PreparedStatement ps = Main.db.prepareStatement("INSERT INTO WhiteboardEvents (Events,TimeToken) VALUES (?,?)");
        ps.setString(1, drawEvent.toString());
        ps.setDouble(2, timeToken);
    }

    public static void clearEvent(Object clearEvent, double timeToken) throws Exception{
        PreparedStatement ps = Main.db.prepareStatement("DELETE FROM WhiteboardEvents");
        ps.execute();

        PreparedStatement ps2 = Main.db.prepareStatement("INSERT INTO WhiteboardEvents (Events,TimeToken) VALUES (?,?)");
        ps2.setString(1, clearEvent.toString());
        ps2.setDouble(2, timeToken);
        ps2.execute();
    }

    @POST
    @Path("add/")
    public static String eventAdd(@FormDataParam("clientEvents") String clientEvents){

        JSONArray events =  (JSONArray)JSONValue.parse(clientEvents);

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        System.out.println("New clientEvents: ");

        for(int i = 0; i < events.size(); i++){
            JSONObject event = (JSONObject) events.get(i);
            System.out.println(event);

            double timeToken = timestamp.getTime();

            try {
                switch (event.get("type").toString()) {
                    case "draw":
                        System.out.println("Moo");
                        drawEvent(event,timeToken);
                        break;
                    case "clear":
                        System.out.println("Bark");
                        clearEvent(event,timeToken);
                        break;
                    default:
                        break;
                }
            } catch (Exception exception){
                System.out.println("Database error: " + exception.getMessage() + " when handling " + event);
                return "{\"Error\": \"Unable to create new lines, please see server console for more info.\"}";
            }

        }
        return "{\"OK\": \"Added Events\"}";
    }

    @GET
    @Path("get/{timetoken}")
    public static String lineGet(@PathParam("timetoken") double timeToken){

        System.out.println("Invoked whiteboardEvents/get");

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject serverResponse = new JSONObject();

        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT Events FROM WhiteboardEvents WHERE TimeToken > ?");
            ps.setDouble(1, timeToken);
            ps.execute();

            ResultSet results = ps.executeQuery();

            List events = new ArrayList();

            while (results.next()==true){
                String event = results.getString(1);
                events.add(event);
                System.out.println(event);
            }

            System.out.println(events);

            serverResponse.put("events",events);
            serverResponse.put("timeToken",timestamp.getTime());

            return JSONObject.toJSONString(serverResponse);

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to create new lines, please see server console for more info.\"}";
        }

    }
}

