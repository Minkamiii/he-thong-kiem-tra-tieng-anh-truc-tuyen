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
import com.khanh.code.api_response.TestDoneRespone;
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
        tasks.add(0);
        tasks.add(1);

        //create 2 submits
        Submit_Listening test_Listening= new Submit_Listening(
            "789","457",
            Submit.Type.LISTENING,tasks,submit_day,0);
            test_Listening.setKind(Submit.Kind.EXAM);

        Submit_Reading test_Reading= new Submit_Reading(
            "123","456",
            Submit.Type.READING,tasks,submit_day,0);
            test_Reading.setKind(Submit.Kind.PRACTICE);

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
        test_Listening.setTestName("Listening Test 1");
        test_Reading.setTestName("Reading Test 1");
        
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
        submitRequest.setUser_id("1da738e8-7648-4f4e-a2a5-7c60faf044e2");
        submitRequest.setTest_id("68d13a9cc35d63eb8543f27d");
        submitRequest.setKind("exam");
        
        List<AnswerRequest> submitAnswers=new LinkedList<>();
        //create answerRequest
        AnswerRequest answer1=new AnswerRequest();
        answer1.setId_question("68d13a9cc35d63eb8543f27b");
        answer1.setAnswer("bag");
        submitAnswers.add(answer1);

        submitRequest.setTime_to_complete(3600);
        submitRequest.setAnswers(submitAnswers);
        
    }

    @Test
    void SUBMIT_001_get_All_Submits_Of_User_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123", 1,"READING");
        Object data= response.getData();
        assertInstanceOf(Map.class, data);
        Map<String, Object> data1=(Map<String, Object>) response.getData();
        
        List<?> data2=(List<?>) data1.get("submits");
        assertInstanceOf(List.class, data2);

        assertInstanceOf(SubmitDTO.class, data2.get(0));
        List<SubmitDTO> data3=(List<SubmitDTO>) data1.get("submits");
        assertEquals(data3.size(), 1);
        
        SubmitDTO submit=data3.get(0);
        assertEquals("456", submit.getId_test());
        assertEquals("123", submit.getId_user());
        assertEquals("READING", submit.getType());
        assertEquals("PRACTICE", submit.getKind());  

        assertEquals(200, response.getStatus());
        assertEquals(response.getMessage(), "Get all submits successfully");
    }

    @Test
    void SUBMIT_002_get_All_Submits_Of_User_Non_Existed(){

        ApiResponse response=submitService.getAllSubmitsOfUser("124",1,"reading");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals(response.getMessage(), "Can not find submit of user");
    }

    @Test
    void SUBMIT_003_get_All_Submits_Of_User_NullOrEmpty_ID(){

        ApiResponse response=submitService.getAllSubmitsOfUser(null,1,"reading");
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals(response.getMessage(), "User ID can not be null or empty");
    }

    @Test
    void SUBMIT_004_get_Submit_Of_User_Of_Test_Exisited()
    {

        ApiResponse response=submitService.getSubmitByUserAndTest("123","456");
        Object data= response.getData();
        assertInstanceOf(List.class, data);
        List<SubmitDTO> data1=(List<SubmitDTO>) response.getData();
        assertEquals(data1.size(), 1);
        assertEquals(200, response.getStatus());    
        SubmitDTO submit=data1.get(0);

        assertEquals("456", submit.getId_test());
        assertEquals("123", submit.getId_user());
        assertEquals("READING", submit.getType());
        assertEquals("Get all submits successfully", response.getMessage());
        assertEquals("PRACTICE", submit.getKind());

    }

    @Test
    void SUBMIT_005_get_Submit_Of_User_Of_Test_NullOrEmpty_IdUser(){

        ApiResponse response=submitService.getSubmitByUserAndTest("","456");
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID user can not be null or empty", response.getMessage());

    }

    @Test
    void SUBMIT_006_get_Submit_Of_User_Of_Test_NullOrEmpty_IdTest(){

        ApiResponse response=submitService.getSubmitByUserAndTest("123","");
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID test can not be null or empty", response.getMessage());
    }

    @Test
    void SUBMIT_007_get_Submit_Of_User_Of_Test_NullOrEmpty_Both(){

        ApiResponse response=submitService.getSubmitByUserAndTest(null,null);
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("ID user and test can not be null or empty", response.getMessage());
    }

    @Test
    void SUBMIT_008_get_Submit_Of_User_Of_Test_NonExisited_Both(){
        
        ApiResponse response=submitService.getSubmitByUserAndTest("124","457");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals("User with id 124 did not submit anything for test with ID 457", response.getMessage());

    }

    //get all to check befrore and after delete
    @Test
    void SUBMIT_009_delete_Submit_Id_Existed()
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
    void SUBMIT_010_delete_Submit_Id_Non_Existed()
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
    void SUBMIT_011_delete_Submit_Id_Null_Empty()
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
    void SUBMIT_012_delete_Submit_Test_Id_Existed(){

        int size1=submitRepository.findAll().size();

        int size2=submitRepository.findByTestId("456").size();
        
        ApiResponse response=submitService.deleteSubmitByTestId("456");

        int size3=submitRepository.findAll().size();

        assertEquals(size1-size2, size3);
        assertEquals(200, response.getStatus());
        assertEquals("Deleted all submits for test ID: 456" , response.getMessage());
    }

    @Test
    void SUBMIT_013_delete_Submit_Test_Id_Non_Existed(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("hello");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(404, response.getStatus());
        assertEquals("No submits found for test ID: hello" , response.getMessage());
    }   

    @Test
    void SUBMIT_014_delete_Submit_Test_Id_Null_Empty(){
        int size1=submitRepository.findAll().size();
    
        ApiResponse response=submitService.deleteSubmitByTestId("");

        int size2=submitRepository.findAll().size();

        assertEquals(size1, size2);
        assertEquals(400, response.getStatus());
        assertEquals("Test ID can not be null or empty" , response.getMessage());
    }

    @Test
    void SUBMIT_015_delete_Submit_List(){

        int size1=submitRepository.findAll().size();
        int size1_answer=answerRepository.findAll().size();
    
        submitService.deleteListSubmits(submits);

        int size2=submitRepository.findAll().size();
        int size2_answer=answerRepository.findAll().size();

        assertEquals(size1-submits.size(), size2);
        assertEquals(size1_answer-2, size2_answer);
     
    }

    //Tests for add submit
    @Test
    void SUBMIT_016_add_Submit_Reading_Success(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(200, response.getStatus());
        assertEquals("Submit successfully", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1+1, size_Submit2);
        assertEquals(size_Answer1+1, size_Answer2);

        Submit submit=submitRepository.findAllOrderDayDESC().get(0);

        assertEquals(submit.getId_test(), "68d13a9cc35d63eb8543f27d");
        assertEquals(submit.getId_user(), "1da738e8-7648-4f4e-a2a5-7c60faf044e2");
        assertEquals(submit.getType().toString(), "LISTENING");
        assertEquals(submit.getKind().toString(), "EXAM");

        Answer answer= submit.getAnswers().get(0);
        assertEquals(answer.getType().toString(), "FILL");
        
        Answer_Fill answer_Fill=(Answer_Fill) answer;
        assertEquals("bag", answer_Fill.getAnswer());

    }

    @Test
    void SUBMIT_017_add_Submit_Null_Task(){

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
    void SUBMIT_018_add_Submit_Empty_Task(){

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
    void SUBMIT_019_add_Submit_Id_question_In_AnswerRequest_Non_Existed()

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
    void SUBMIT_020_add_Submit_Null_AnswerRequest_List()
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
    void SUBMIT_021_add_Submit_Two_Answer_For_One_Question(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        AnswerRequest answer2=new AnswerRequest();
        answer2.setId_question("68d13a9cc35d63eb8543f27b");
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
    void SUBMIT_022_add_Submit_Id_question_In_AnswerRequest_Empty(){

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
    void SUBMIT_023_add_Submit_Id_question_In_AnswerRequest_Null(){
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
    void SUBMIT_024_add_Submit_Empty_userId_In_Request(){

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
    void SUBMIT_025_add_Submit_Empty_testId_In_Request(){
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
    void SUBMIT_026_add_Submit_Null_Both_User_Test_ID(){
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
    void SUBMIT_027_add_Submit_Empty_Both_User_Test_ID(){
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
    void SUBMIT_028_add_Submit_Null_userId_In_Request(){

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
    void SUBMIT_029_add_Submit_Null_testId_In_Request(){
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
    void SUBMIT_030_delete_Submit_By_User_id_success(){
        int size1=submitRepository.findAll().size();
        int size_answers1=answerRepository.findAll().size();

        ApiResponse response=submitService.deleteSubmitByUserId("123");
        List<Submit> check=submitRepository.findByUserId("123");
        assertEquals(0, check.size());
        
        int size2=submitRepository.findAll().size();
        int size_answers2=answerRepository.findAll().size();

        assertEquals(size1-1, size2);
        assertEquals(size_answers1-1, size_answers2);
        assertEquals(200, response.getStatus());
        assertEquals("Deleted all submits for user ID: 123", response.getMessage());
    }

    @Test
    void SUBMIT_031_delete_Submit_By_User_id_No_Submit(){
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
    void SUBMIT_032_delete_Submit_By_User_id_Null_Empty(){

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

    @Test
    void SUBMIT_033_get_Submit_Of_User_Of_Test_NonExisited_TestID(){
        
        ApiResponse response=submitService.getSubmitByUserAndTest("123","459");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals("User with id 123 did not submit anything for test with ID 459", response.getMessage());

    }

    @Test
    void SUBMIT_034_get_Submit_Of_User_Of_Test_NonExisited_UserID(){
        
        ApiResponse response=submitService.getSubmitByUserAndTest("124","456");
        Object data= response.getData();
        assertNull(data);
        assertEquals(404, response.getStatus());
        assertEquals("User with id 124 did not submit anything for test with ID 456", response.getMessage());

    }
    
    @Test
    void SUBMIT_035_get_Test_Been_one_Information_Of_User_UserID_Existed(){
        
        ApiResponse response=submitService.getTestDoneInformation("123","456");
        Object data= response.getData();

        assertInstanceOf(List.class,data);
        assertEquals(200, response.getStatus());
        assertEquals("Get all information of tests done by users successfully", response.getMessage());

        List<?>data1=(List<?>) data;
        assertEquals(1, data1.size());

        Object inside=data1.get(0);
        assertInstanceOf(TestDoneRespone.class, inside);

        TestDoneRespone testDone=(TestDoneRespone) inside;
        assertEquals("456", testDone.getId_test());
        assertEquals(1, testDone.getNumber_of_user_done());
        assertEquals(true, testDone.isThis_user_done_before());

    }

    @Test
    void SUBMIT_036_get_Test_Been_Done_Information_Of_User_UserID_Never_Submit_The_Test(){
        
        ApiResponse response=submitService.getTestDoneInformation("hello","456");
        Object data= response.getData();

        assertInstanceOf(List.class,data);
        assertEquals(200, response.getStatus());
        assertEquals("Get all information of tests done by users successfully", response.getMessage());

        List<?>data1=(List<?>) data;
        assertEquals(1, data1.size());

        Object inside=data1.get(0);
        assertInstanceOf(TestDoneRespone.class, inside);

        TestDoneRespone testDone=(TestDoneRespone) inside;
        assertEquals("456", testDone.getId_test());
        assertEquals(1, testDone.getNumber_of_user_done());
        assertEquals(false, testDone.isThis_user_done_before());
    }

    @Test
    void SUBMIT_037_get_All_Test_Been_Done_Information_Of_User_Null_Blank_test_id(){
        
        ApiResponse response=submitService.getTestDoneInformation("123","hello,,hi");
        Object data= response.getData();

        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals("Test ID in list can not be null or empty", response.getMessage());
    }

    @Test
    void SUBMIT_038_get_All_Submits_Of_User_Existed_NoSpecificType(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123",1,"");
        Object data= response.getData();
        assertInstanceOf(Map.class, data);
        Map<String, Object> data1=(Map<String, Object>) response.getData();
        
        List<?> data2=(List<?>) data1.get("submits");
        assertInstanceOf(List.class, data2);

        assertInstanceOf(SubmitDTO.class, data2.get(0));
        List<SubmitDTO> data3=(List<SubmitDTO>) data1.get("submits");
        assertEquals(data3.size(), 1);
        
        SubmitDTO submit=data3.get(0);
        assertEquals("456", submit.getId_test());
        assertEquals("123", submit.getId_user());
        assertEquals("READING", submit.getType());
        assertEquals("PRACTICE", submit.getKind());  

        assertEquals(200, response.getStatus());
        assertEquals(response.getMessage(), "Get all submits successfully");
    }

    @Test
    void SUBMIT_039_get_All_Submits_Of_User_Existed_TypeNotExist(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123",1,"hello");
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals(response.getMessage(), "Invalid type: hello" );
    }

    @Test
    void SUBMIT_040_get_All_Submits_Of_User_Existed_PageSmallerthan1(){

        ApiResponse response=submitService.getAllSubmitsOfUser("123",0,"hello");
        Object data= response.getData();
        assertNull(data);
        assertEquals(400, response.getStatus());
        assertEquals(response.getMessage(), "Page number must be greater than 0" );
    }

    @Test
    void SUBMIT_041_Add_Submit_WrongKind(){

        int size_Submit1=submitRepository.findAll().size();
        int size_Answer1=answerRepository.findAll().size();

        submitRequest.setKind("Hello");

        ApiResponse response=submitService.saveSubmit(submitRequest);
        assertEquals(400, response.getStatus());
        assertEquals("Invalid test kind", response.getMessage());

        int size_Submit2=submitRepository.findAll().size();
        int size_Answer2=answerRepository.findAll().size();

        assertEquals(size_Submit1, size_Submit2);
        assertEquals(size_Answer1, size_Answer2); 
    }

    //submit write and listen success (test 42,43)
}