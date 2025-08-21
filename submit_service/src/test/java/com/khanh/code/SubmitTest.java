package com.khanh.code;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.khanh.code.answer.Answer;
import com.khanh.code.answer.AnswerRepository;
import com.khanh.code.answer.Answer_Choice;
import com.khanh.code.answer.Answer_Fill;
import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.submit.Submit;
import com.khanh.code.submit.SubmitDTO;
import com.khanh.code.submit.SubmitRepository;
import com.khanh.code.submit.SubmitRequest;
import com.khanh.code.submit.SubmitService;
import com.khanh.code.submit.Submit_Listening;
import com.khanh.code.submit.Submit_Reading;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@SuppressWarnings("unused")

public class SubmitTest {

    @Autowired
    private SubmitRepository submitRepository;

    @Autowired
    private SubmitService submitService;

    @Autowired
    private AnswerRepository answerRepository;

    private String id_Submit;
    private List<Submit>submits=new LinkedList<>();
    int sizeAnswers;

    @BeforeEach
    void setup(){
        Date submit_day=Date.from(java.time.Instant.now());
        List<Integer>tasks=new LinkedList<>();
        tasks.add(1);
        tasks.add(2);
        //create 2 submits
        Submit_Listening test_Listening= new Submit_Listening(
            "123","456",
            Submit.Type.LISTENING,tasks,submit_day,0);

        Submit_Reading test_Reading= new Submit_Reading(
            "123","457",
            Submit.Type.READING,tasks,submit_day,0);

        //create 2 answers
        Answer_Fill test_Fill=new Answer_Fill("123", 
        test_Listening, Answer.Type.FILL,
         true, "Hello");

        Map<Integer, Boolean> choices = new HashMap<>();
        choices.put(1, true);
        Answer_Choice test_Choice=new Answer_Choice("123", 
        test_Reading, Answer.Type.CHOICE,
        choices);
        
        //add 2 answers to submit
        test_Reading.getAnswers().add(test_Choice);
        test_Listening.getAnswers().add(test_Fill);

        //update then save 2 sbumits
        test_Listening.setNum_of_question_to_answer();
        test_Reading.setNum_of_question_to_answer();  

        submitRepository.save(test_Listening);
        submitRepository.save(test_Reading);

        id_Submit=test_Reading.getId();
        sizeAnswers=test_Reading.getAnswers().size();

        submits.add(test_Reading);
        submits.add(test_Listening);
    }
    //Tests
    @Test
    void SUBMIT_001_get_All_Submits_Of_User_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123");
        Object data= response.getData();
        assertInstanceOf(List.class, data);
        List<SubmitDTO> data1=(List<SubmitDTO>) response.getData();
        assertEquals(data1.size(), 2);
        assertEquals(200, response.getStatus());
    }

    @Test
    void SUBMIT_002_get_All_Submits_Of_User_Non_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("124");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals(response.getMessage(), "This user did not submit any test");
    }

    @Test
    void SUBMIT_003_get_All_Submits_Of_User_NullOrEmpty_ID(){

        ApiResponse response=submitService.getAllSubmitsOfUser(null);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals(response.getMessage(), "User ID can not be null or empty");
    }

    @Test
    void Submit_004_get_Submit_Of_User_Of_Test_Exisited(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id("456");
        submitRequest.setUser_id("123");

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertInstanceOf(List.class, data);
        List<SubmitDTO> data1=(List<SubmitDTO>) response.getData();
        assertEquals(data1.size(), 1);
        assertEquals(200, response.getStatus());    
        SubmitDTO submit=data1.get(0);

        assertEquals("456", submit.getId_test());
        assertEquals("123", submit.getId_user());
    }

    @Test
    void Submit_005_get_Submit_Of_User_Of_Test_NullOrEmpty_IdUser(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id("456");
        submitRequest.setUser_id("");

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID user and test can not be null or empty", response.getMessage());

    }

    @Test
    void Submit_006_get_Submit_Of_User_Of_Test_NullOrEmpty_IdTest(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id("");
        submitRequest.setUser_id("123");

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID test can not be null or empty", response.getMessage());
    }

    @Test
    void Submit_007_get_Submit_Of_User_Of_Test_NullOrEmpty_Both(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id(null);
        submitRequest.setUser_id(null);

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID user and test can not be null or empty", response.getMessage());
    }

    @Test
    void Submit_008_get_Submit_Of_User_Of_Test_NonExisited(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id("457");
        submitRequest.setUser_id("124");

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals("This user did not submit anything for test with ID 457", response.getMessage());

    }

    //get all to check befrore and after delete
    @Test
    void Submit_009_delete_Submit_Id_Existed()
    {
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();

        ApiResponse response=submitService.deleteSubmitbyID(id_Submit);
        boolean check=submitRepository.existsById(id_Submit);
        assertEquals(false, check);
        
        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();

        assertEquals(size1-1, size2);
        assertEquals(size_answers1-sizeAnswers, size_answers2);
        assertEquals(200, response.getStatus());
        assertEquals("Delete successfully submit with ID "+id_Submit, response.getMessage());

    }

    @Test
    void Submit_010_delete_Submit_Id_Non_Existed()
    {
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();

        ApiResponse response=submitService.deleteSubmitbyID("hello");

        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(size_answers1, size_answers2);
        assertEquals(404, response.getStatus());
        assertEquals("Can not find submit with ID hello", response.getMessage());
    }   

    @Test
    void Submit_011_delete_Submit_Id_Null_Empty()
    {
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();

        ApiResponse response=submitService.deleteSubmitbyID(null);

        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(size_answers1, size_answers2);
        assertEquals(400, response.getStatus());
        assertEquals("Submit ID can not be null or empty", response.getMessage());
    }

    //check answer size
    @Test
    void Submit_012_delete_Submit_Test_Id_Existed(){

        int size1=submitRepository.findAll().size();

        int size2=submitRepository.findByTestId("456").size();
        
        ApiResponse response=submitService.deleteSubmitByTestId("456");

        int size3=submitRepository.findAll().size();

        assertEquals(size1-size2, size3);
        assertEquals(200, response.getStatus());
        assertEquals("Deleted all submits for test ID: 456" , response.getMessage());
    }

    @Test
    void Submit_013_delete_Submit_Test_Id_Non_Existed(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("hello");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(404, response.getStatus());
        assertEquals("No submits found for test ID: hello" , response.getMessage());
    }   

    @Test
    void Submit_014_delete_Submit_Test_Id_Null_Empty(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(400, response.getStatus());
        assertEquals("Test ID can not be null or empty" , response.getMessage());
    }

    @Test
    void Submit_015_delete_Submit_List(){

        int size1=submitRepository.findAll().size();
    
        submitService.deleteListSubmits(submits);

        int size2=submitRepository.findAll().size();

        assertEquals(size1-submits.size(), size2);
     
    }

    //Test for update submit


    //Tests for add submit

}
