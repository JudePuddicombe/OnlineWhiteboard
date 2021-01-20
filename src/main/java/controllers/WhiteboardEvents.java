package controllers;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("whiteboardEvents/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class WhiteboardEvents {

    public static void genericEvent(String classroomId, Object genericEvent, double timeToken) throws Exception{

        PreparedStatement ps = Main.db.prepareStatement("INSERT INTO WhiteboardEvents (ClassroomId,Event,TimeToken) VALUES (?,?,?)");
        ps.setString(1, classroomId);
        ps.setString(2, genericEvent.toString());
        ps.setDouble(3, timeToken);
        ps.execute();

        System.out.println("Entered");
    }

    public static void clearEvent(String classroomId, Object clearEvent, double timeToken) throws Exception{
        PreparedStatement ps = Main.db.prepareStatement("DELETE FROM WhiteboardEvents WHERE ClassroomId = ?");
        ps.setString(1,classroomId);
        ps.execute();

        PreparedStatement ps2 = Main.db.prepareStatement("INSERT INTO WhiteboardEvents (ClassroomId,Event,TimeToken) VALUES (?,?,?)");
        ps2.setString(1, classroomId);
        ps2.setString(2, clearEvent.toString());
        ps2.setDouble(3, timeToken);
        ps2.execute();

        System.out.println("Cleared");
    }

    @POST
    @Path("add/{classroomId}")
    public static String eventAdd(@PathParam("classroomId") String classroomId, @FormDataParam("clientEvents") String clientEvents){

        JSONArray events =  (JSONArray)JSONValue.parse(clientEvents);

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        System.out.println("New clientEvents: ");

        for(int i = 0; i < events.size(); i++){
            JSONObject event = (JSONObject) events.get(i);
            System.out.println(event);

            double timeToken = timestamp.getTime();

            try {
                switch (event.get("type").toString()) {
                    case "clear":
                        clearEvent(classroomId, event,timeToken);
                        break;
                    default:
                        genericEvent(classroomId,event,timeToken);
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
    @Path("get/{classroomId}/{timeToken}")
    public static String eventGet(@PathParam("classroomId") String classroomId, @PathParam("timeToken") double timeToken){

        System.out.println("Invoked whiteboardEvents/get");

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject serverResponse = new JSONObject();

        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT Event FROM WhiteboardEvents WHERE TimeToken >= ? AND ClassroomId = ?");
            ps.setDouble(1, timeToken - 50);
            ps.setString(2,classroomId);
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

