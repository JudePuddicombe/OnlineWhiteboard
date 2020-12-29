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
import java.sql.SQLOutput;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Path("chatboardChats/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class ChatboardChats {

    @POST
    @Path("add/{classroomId}")
    public static String chatAdd(@PathParam ("classroomId") String classroomId, @FormDataParam("chat") String clientChat){


        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject chat = (JSONObject) JSONValue.parse(clientChat);

        System.out.println(chat);

        double timeToken = timestamp.getTime();

        try{

            PreparedStatement ps = Main.db.prepareStatement("INSERT INTO ChatboardChats (Chat,TimeToken) VALUES (?,?)");
            ps.setString(1, chat.toString());
            ps.setDouble(2, timeToken);
            ps.execute();

            System.out.println("Written");

            return "{\"OK\": \"Added Events\"}";

        } catch (Exception exception){
            System.out.println("Database error: " + exception.getMessage() + " when handling " + chat);
            return "{\"Error\": \"Unable to read lines. Please see server console for more info.\"}";
        }
    }

    @GET
    @Path("get/{classroomId}/{timeToken}")
    public static String eventGet(@PathParam("classroomId") String classroomId, @PathParam("timeToken") double timeToken){

        System.out.println("Invoked whiteboardEvents/get");

        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        JSONObject serverResponse = new JSONObject();

        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT Chat FROM ChatboardChats WHERE TimeToken >= ?");
            ps.setDouble(1, timeToken);
            ps.execute();

            ResultSet results = ps.executeQuery();

            List chats = new ArrayList();


            while (results.next()==true){
                String chat = results.getString(1);
                chats.add(chat);
                System.out.println(chat);
            }

            System.out.println(chats);

            serverResponse.put("chats",chats);
            serverResponse.put("timeToken",timestamp.getTime());

            return JSONObject.toJSONString(serverResponse);

        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to read lines. Please see server console for more info.\"}";
        }

    }

}

