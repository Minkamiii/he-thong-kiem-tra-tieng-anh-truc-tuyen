package com.khanh.code;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
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
import com.khanh.code.answer.AnswerRequest;
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
@SuppressWarnings("unchecked")
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

    private SubmitRequest submitRequest=new SubmitRequest();

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

        //create submitRequest
        submitRequest.setTasks(tasks);
        submitRequest.setUser_id("a68feeb1-14f5-435d-bb44-09700b3560fe");
        submitRequest.setTest_id("68b1ad6fda6d33637440c21c");
        
        List<AnswerRequest> submitAnswers=new LinkedList<>();
        //create answerRequest
        AnswerRequest answer1=new AnswerRequest();
        answer1.setId_question("68b1ad6fda6d33637440c218");
        answer1.setAnswer("bag");
        submitAnswers.add(answer1);

        submitRequest.setAnswers(submitAnswers);
        

    }

    //Tests
    @Test
    void SUBMIT_01_get_All_Submits_Of_User_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123");
        Object data= response.getData();
        assertInstanceOf(List.class, data);
        List<SubmitDTO> data1=(List<SubmitDTO>) response.getData();
        assertEquals(data1.size(), 2);
        assertEquals(200, response.getStatus());
    }

    @Test
    void SUBMIT_02_get_All_Submits_Of_User_Non_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("124");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals(response.getMessage(), "This user did not submit any test");
    }

    @Test
    void SUBMIT_03_get_All_Submits_Of_User_NullOrEmpty_ID(){

        ApiResponse response=submitService.getAllSubmitsOfUser(null);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals(response.getMessage(), "User ID can not be null or empty");
    }

    @Test
    void SUBMIT_04_get_Submit_Of_User_Of_Test_Exisited(){

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
    void SUBMIT_05_get_Submit_Of_User_Of_Test_NullOrEmpty_IdUser(){

        SubmitRequest submitRequest=new SubmitRequest();
        submitRequest.setTest_id("456");
        submitRequest.setUser_id("");

        ApiResponse response=submitService.getSubmitByUserAndTest(submitRequest);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID user can not be null or empty", response.getMessage());

    }

    @Test
    void SUBMIT_06_get_Submit_Of_User_Of_Test_NullOrEmpty_IdTest(){

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
    void SUBMIT_07_get_Submit_Of_User_Of_Test_NullOrEmpty_Both(){

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
    void SUBMIT_08_get_Submit_Of_User_Of_Test_NonExisited(){

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
    void SUBMIT_09_delete_Submit_Id_Existed()
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
    void SUBMIT_10_delete_Submit_Id_Non_Existed()
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
    void SUBMIT_11_delete_Submit_Id_Null_Empty()
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
    void SUBMIT_12_delete_Submit_Test_Id_Existed(){

        int size1=submitRepository.findAll().size();

        int size2=submitRepository.findByTestId("456").size();
        
        ApiResponse response=submitService.deleteSubmitByTestId("456");

        int size3=submitRepository.findAll().size();

        assertEquals(size1-size2, size3);
        assertEquals(200, response.getStatus());
        assertEquals("Deleted all submits for test ID: 456" , response.getMessage());
    }

    @Test
    void SUBMIT_13_delete_Submit_Test_Id_Non_Existed(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("hello");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(404, response.getStatus());
        assertEquals("No submits found for test ID: hello" , response.getMessage());
    }   

    @Test
    void SUBMIT_14_delete_Submit_Test_Id_Null_Empty(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(400, response.getStatus());
        assertEquals("Test ID can not be null or empty" , response.getMessage());
    }

    @Test
    void SUBMIT_15_delete_Submit_List(){

        int size1=submitRepository.findAll().size();
    
        submitService.deleteListSubmits(submits);

        int size2=submitRepository.findAll().size();

        assertEquals(size1-submits.size(), size2);
     
    }

    //Tests for add submit
    @Test
    void SUBMIT_16_add_Submit_Success(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(200, response.getStatus());
        assertEquals("Submit successfully", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1+1, size_Submit2);
        assertEquals(size_Answer1+1, size_Answer2);
    }

    @Test
    void SUBMIT_17_add_Submit_Null_Task(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTasks(null);

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("List tasks can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2); 
    }

    @Test
    void SUBMIT_18_add_Submit_Empty_Task(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTasks(new LinkedList<>());

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("List tasks can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2); 
    }

    @Test
    void SUBMIT_19_add_Submit_Id_question_In_AnswerRequest_Non_Existed()

    {
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        AnswerRequest wrongAnswer=new AnswerRequest();
        wrongAnswer.setId_question("hello");
        wrongAnswer.setAnswer("jmklasdjdsa");
        submitRequest.getAnswers().add(wrongAnswer);

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Send answer to non-exited question with ID hello", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);

    }


    @Test
    void SUBMIT_20_add_Submit_Null_AnswerRequest_List()
    {
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setAnswers(null);
        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Answer list can not be null or empty", response.getMessage());    

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
    }


    @Test
    void SUBMIT_21_add_Submit_Two_Answer_For_One_Question(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        AnswerRequest answer2=new AnswerRequest();
        answer2.setId_question("68b1ad6fda6d33637440c218");
        answer2.setAnswer("hello");
        submitRequest.getAnswers().add(answer2);

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Answer for question with ID "+ answer2.getId_question()+" already exists.", response.getMessage()); 
        
        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
        
    }

    @Test
    void SUBMIT_22_add_Submit_Id_question_In_AnswerRequest_Empty(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        List<AnswerRequest> answers=new LinkedList<>();
        submitRequest.setAnswers(answers);
        
        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Answer list can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
        
    }

    @Test
    void SUBMIT_23_add_Submit_Id_question_In_AnswerRequest_Null(){
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        List<AnswerRequest> answers=new LinkedList<>();
        AnswerRequest answer1=new AnswerRequest();

        answer1.setId_question(null);
        answer1.setAnswer("bag");

        answers.add(answer1);
        submitRequest.setAnswers(answers);

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Question ID can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);   
        
    }

    @Test
    void SUBMIT_24_add_Submit_Empty_userId_In_Request(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setUser_id("");
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID user can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);

    }

    @Test
    void SUBMIT_25_add_Submit_Empty_testId_In_Request(){
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTest_id("");
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID test can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
    }

    @Test
    void SUBMIT_26_add_Submit_Null_Both_User_Test_ID(){
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTest_id(null);
        submitRequest.setUser_id(null);
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID user and test can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
    }

    @Test
    void SUBMIT_27_add_Submit_Empty_Both_User_Test_ID(){
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTest_id("");
        submitRequest.setUser_id("");
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID user and test can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
    }


    @Test
    void SUBMIT_28_add_Submit_Null_userId_In_Request(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setUser_id(null);
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID user can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);

    }

    @Test
    void SUBMIT_29_add_Submit_Null_testId_In_Request(){
        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setTest_id(null);
        ApiResponse response=submitService.saveSubmit(submitRequest);

        assertEquals(400, response.getStatus());
        assertEquals("ID test can not be null or empty", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();
        
        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2);
    }
    
    @Test
    void SUBMIT_30_delete_Submit_By_User_id_success(){
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();

        ApiResponse response=submitService.deleteSubmitByUserId("123");
        List<Submit> check=submitRepository.findByUserId("123");
        assertEquals(0, check.size());
        
        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();

        assertEquals(size1-2, size2);
        assertEquals(size_answers1-2, size_answers2);
        assertEquals(200, response.getStatus());
        assertEquals("Deleted all submits for user ID: 123", response.getMessage());
    }

    @Test
    void SUBMIT_31_delete_Submit_By_User_id_No_Submit(){
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();    
        ApiResponse response=submitService.deleteSubmitByUserId("hello");
        
        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();
        assertEquals("No submits found for user ID: hello", response.getMessage());
        assertEquals(404, response.getStatus());

        assertEquals(size1, size2);
        assertEquals(size_answers1, size_answers2);
    }
    
    @Test
    void SUBMIT_32_delete_Submit_By_User_id_Null_Empty(){

        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();    
        ApiResponse response=submitService.deleteSubmitByUserId("");
        
        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();
        assertEquals("User ID can not be null or empty", response.getMessage());
        assertEquals(400, response.getStatus());

        assertEquals(size1, size2);
        assertEquals(size_answers1, size_answers2);
        
    }

}