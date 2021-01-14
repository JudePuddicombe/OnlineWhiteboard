package controllers;

import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@Path("classrooms/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Classrooms {

    @GET
    @Path("check/{classroomId}")
    public static String classroomCheck(@PathParam ("classroomId") String classroomId){

        System.out.println("Invoked classroomCheck");

        try{

            PreparedStatement ps = Main.db.prepareStatement("SELECT COUNT(*) FROM Classrooms WHERE classroomId = ?");
            ps.setString(1,classroomId);

            ResultSet response = ps.executeQuery();

            int myInt  = response.getInt(1);

            if(myInt == 1){
                System.out.println("Classroom found");
                return "{\"classroomIsFound\": true}";
            } else if (myInt == 0){
                System.out.println("Classroom not found");
                return "{\"classroomIsFound\": false}";
            } else {
                return "{\"Error\": \"Response should only ever be one or two so something bad has happened\"}";
            }

        } catch (Exception exception){
            System.out.println("Error!!!");
            return "{\"Error\": \"Something went very wrong while looking for the classroom\"}";
        }

    }
}
