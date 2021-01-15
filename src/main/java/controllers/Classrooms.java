package controllers;

import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Path("classrooms/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Classrooms {

    public static String generateClassroomId(){

        String[] letters = {"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"};

        int randomNum;
        String classroomId = "";

        for(int i = 1; i <= 4; i++){
            randomNum = ThreadLocalRandom.current().nextInt(0, 26);
            classroomId += letters[randomNum];
        }

        classroomId += "-";

        for(int i = 1; i <= 4; i++){
            randomNum = ThreadLocalRandom.current().nextInt(0, 26);
            classroomId += letters[randomNum];
        }

        return classroomId;
    }

    @GET
    @Path("check/{classroomId}")
    public static String classroomCheck(@PathParam("classroomId") String classroomId) {

        System.out.println("Invoked classroomCheck");

        try {

            PreparedStatement ps1 = Main.db.prepareStatement("SELECT COUNT(*) FROM WhiteboardEvents WHERE ClassroomId = ?");
            ps1.setString(1, classroomId);

            ResultSet PSOne = ps1.executeQuery();

            PreparedStatement ps2 = Main.db.prepareStatement("SELECT COUNT(*) FROM ChatboardChats WHERE ClassroomId = ?");
            ps2.setString(1, classroomId);

            ResultSet PSTwo = ps2.executeQuery();

            if (PSOne.getInt(1) == 0 && PSTwo.getInt(1) == 0) {
                return "{\"classroomIsFound\": false}";
            } else {
                return "{\"classroomIsFound\": true}";
            }

        } catch (Exception exception) {

            System.out.println("Error!!!");
            return "{\"Error\": \"Something went very wrong while looking for the classroom\"}";
        }

    }

    @GET
    @Path("create/")
    public static String classroomCreate() {

        System.out.println("Invoked classroomCreate");
        try {

            ResultSet resultsOne;
            ResultSet resultsTwo;
            String classroomId;

            do {

                classroomId = generateClassroomId();

                PreparedStatement ps1 = Main.db.prepareStatement("SELECT COUNT(*) FROM WhiteboardEvents WHERE ClassroomId = ?");
                ps1.setString(1, classroomId);
                resultsOne = ps1.executeQuery();

                PreparedStatement ps2 = Main.db.prepareStatement("SELECT COUNT(*) FROM ChatboardChats WHERE ClassroomId = ?");
                ps2.setString(1, classroomId);
                resultsTwo = ps2.executeQuery();

            } while (resultsOne.getInt(1) != 0 || resultsTwo.getInt(1) != 0);

            PreparedStatement ps = Main.db.prepareStatement("INSERT INTO WhiteboardEvents (Event,TimeToken,ClassroomId) VALUES (?,?,?)");
            ps.setString(1,"{\"type\": \"clear\"}");
            ps.setDouble(2,0);
            ps.setString(3,classroomId);

            return "{\"classroomId\":\"" + classroomId + "\"}";

        } catch (Exception exception) {

            System.out.println(exception);
            return "{\"Error\": \"Something went very wrong while making a classroom\"}";
        }

    }
}
