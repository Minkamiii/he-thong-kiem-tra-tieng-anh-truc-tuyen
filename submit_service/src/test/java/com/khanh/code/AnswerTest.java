package com.khanh.code;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.booleanThat;

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
import com.khanh.code.answer.AnswerDTO;
import com.khanh.code.answer.AnswerRepository;
import com.khanh.code.answer.AnswerRequest;
import com.khanh.code.answer.AnswerService;
import com.khanh.code.answer.Answer_Choice;
import com.khanh.code.answer.Answer_Essay;
import com.khanh.code.answer.Answer_Fill;
import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.api_response.Question;
import com.khanh.code.submit.Submit;
import com.khanh.code.submit.SubmitRepository;
import com.khanh.code.submit.SubmitService;
import com.khanh.code.submit.Submit_Reading;
import com.khanh.code.submit.Submit_Writing;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional

@SuppressWarnings("unused")
public class AnswerTest {

    @Autowired
    private AnswerService answerService;

    @Autowired
    private SubmitRepository submitRepository;

    @Autowired
    private SubmitService submitService;

    @Autowired
    private AnswerRepository answerRepository;

    private String id_Submit;
    private List<Answer>answers=new LinkedList<>();
    private String id_answer;

    private AnswerRequest answerRequest_String=new AnswerRequest();;
    private AnswerRequest answerRequest_choice=new AnswerRequest();;
    private AnswerRequest answerRequest_null=new AnswerRequest();;
    
    private Question question_Fill=new Question();
    private Question question_Choice=new Question();
    private Question question_Essay=new Question()  ;

    private Submit_Reading test_Reading;
    private Submit_Writing test_Writing;

    @BeforeEach
    void setup(){

        Date submit_day=Date.from(java.time.Instant.now());

        List<Integer>tasks=new LinkedList<>();
        tasks.add(1);
        tasks.add(2);

        //create submit
        test_Reading= new Submit_Reading(
            "123","456",
            Submit.Type.READING,tasks,submit_day,0);

        test_Writing= new Submit_Writing("123","789",
            Submit.Type.WRITING,tasks,submit_day);

        //create 2 answers
        Answer_Fill test_Fill=new Answer_Fill("123", 
        test_Reading, Answer.Type.FILL,
         true, "Hello");

        Map<Integer, Boolean> choices = new HashMap<>();
        choices.put(1, true);

        Answer_Choice test_Choice=new Answer_Choice("124", 
        test_Reading, Answer.Type.CHOICE,
        choices);
        
        //add 2 answers to submit
        test_Reading.getAnswers().add(test_Choice);
        test_Reading.getAnswers().add(test_Fill);

        //update then save 2 sbumits
        test_Reading.setNum_of_question_to_answer();
        test_Reading.setNum_of_question_to_answer();  

        submitRepository.save(test_Reading);
        submitRepository.save(test_Reading);

        id_Submit=test_Reading.getId();
        id_answer=test_Fill.getId();

        answers.add(test_Fill);
        answers.add(test_Choice);

        //create answer question when receive for test
        question_Fill.set_id("125");
        question_Fill.setType("fill");
        question_Fill.setKey("Hello");

        question_Choice.set_id("126");
        question_Choice.setType("choice");

        List<Integer> keys=new LinkedList<>();
        keys.add(1);

        question_Choice.setKeys(keys);

        question_Essay.set_id("127");
        question_Essay.setType("essay");

        //create answer request when receive for test
        answerRequest_String.setAnswer("Hello");

        answerRequest_null.setAnswer(null);

        List<Integer> answer_choice=new LinkedList<>();
        answer_choice.add(1);
        answerRequest_choice.setAnswer(answer_choice);
    }

    @Test
    void ANSWER_001_get_Answer_By_ID_Existed(){
        ApiResponse response=answerService.getAnswerById(id_answer);
        Object data=response.getData();
        assertNotNull(data);
        assertInstanceOf(AnswerDTO.class,data);
        AnswerDTO answerDTO=(AnswerDTO) data;
        assertEquals("FILL", answerDTO.getType());
        assertEquals("Hello", answerDTO.getAnswer());
        assertEquals(response.getMessage(), "Answer found");
        assertEquals(200, response.getStatus());
    }

    @Test
    void ANSWER_002_get_Answer_By_ID_Non_Existed(){
        ApiResponse response=answerService.getAnswerById("Hello");
        assertEquals("Answer not found", response.getMessage());
        assertEquals(404, response.getStatus());
    }

    @Test
    void ANSWER_003_get_Answer_By_ID_Null(){
        ApiResponse response=answerService.getAnswerById(null);
        assertEquals("Answer ID can not be null or empty", response.getMessage());
        assertEquals(400, response.getStatus());
    }

    @SuppressWarnings("unchecked")
    @Test
    void ANSWER_004_get_Answers_By_ID_Submit_Existed(){
        ApiResponse response=answerService.getAnswersBySubmitId(id_Submit);
        Object data=response.getData();
        assertNotNull(data);
        assertInstanceOf(List.class,data);
        List<AnswerDTO> answerDTOs=(List<AnswerDTO>) data;
        assertEquals(2, answerDTOs.size());
        assertEquals(response.getMessage(), "Answers found");
        assertEquals(200, response.getStatus());

    }

    @Test
    void ANSWER_005_get_Answers_By_ID_Submit_Non_Existed(){
        ApiResponse response=answerService.getAnswersBySubmitId("Hello");
        assertNull(response.getData());
        assertEquals(response.getMessage(), "No answers found for this submission");
        assertEquals(404, response.getStatus());
    }

    @Test
    void ANSWER_006_get_Answers_By_ID_Submit_NullOrEmpty(){
        ApiResponse response=answerService.getAnswersBySubmitId(null);
        assertNull(response.getData());
        assertEquals(response.getMessage(), "Submit ID can not be null or empty");
        assertEquals(400, response.getStatus());
    }

    @Test
    void ANSWER_007_Delete_List_Answer(){
        int size1=answerRepository.findAll().size();
        answerService.deleteListAnswer(answers);
        int size2=answerRepository.findAll().size();
        assertEquals(size1-answers.size(), size2);

    }

    @Test
    void ANSWER_008_Get_Answer_Submit_ID_Question_ID_Existed(){
        ApiResponse response=answerService.getAnswerInSubmitWithQuestionID(id_Submit,"123");

        Object data=response.getData();
        assertNotNull(data);
        assertInstanceOf(AnswerDTO.class,data);
        AnswerDTO answerDTO=(AnswerDTO) data;
        assertEquals("Hello", answerDTO.getAnswer());
        assertEquals(response.getMessage(), "Find the needed answer");
        assertEquals(200, response.getStatus());
    }
    @Test
    void ANSWER_009_Get_Answer_Submit_ID_Question_ID_Non_Existed(){
        ApiResponse response=answerService.getAnswerInSubmitWithQuestionID(id_Submit,"hello");

        Object data=response.getData();
        assertNull(data);
        assertEquals(response.getMessage(), "Can not find the answer");
        assertEquals(404, response.getStatus());
    }

    @Test
    void ANSWER_010_Get_Answer_Submit_ID_Question_ID_NullOrEmpty(){
        ApiResponse response=answerService.getAnswerInSubmitWithQuestionID(id_Submit,null);

        Object data=response.getData();
        assertNull(data);
        assertEquals(response.getMessage(), "ID question can not be null or empty");
        assertEquals(400, response.getStatus());
    }

    @Test
    void ANSWER_011_Get_Answers_Submit_ID_Question_ID_NullOrEmpty_Both(){
        ApiResponse response=answerService.getAnswerInSubmitWithQuestionID("",null);

        Object data=response.getData();
        assertNull(data);
        assertEquals(response.getMessage(), "ID submit and question can not be null or empty");
        assertEquals(400, response.getStatus());
    }

    @Test
    void ANSWER_012_Delete_Answer_ID_Existed(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByID(id_answer);
        int size2=answerRepository.findAll().size();

        assertEquals(response.getMessage(), "Delete answer successfully");
        assertEquals(response.getStatus(), 200);
        assertEquals(size1-1, size2);
    }

    @Test
    void ANSWER_013_Delete_Answer_ID_Non_Existed(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByID("hello");
        int size2=answerRepository.findAll().size();

        assertEquals(response.getMessage(), "Cannot find answer with ID hello");
        assertEquals(response.getStatus(), 404);
        assertEquals(size1, size2);
    }

    @Test
    void ANSWER_014_Delete_Answer_ID_Null(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByID(null);
        int size2=answerRepository.findAll().size();

        assertEquals(response.getMessage(), "Answer ID can not be null or empty");
        assertEquals(response.getStatus(), 400);
        assertEquals(size1, size2);
    }

    @Test
    void ANSWER_015_Delete_Answers_Question_ID_Existed(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByQuestionID("123");
        
        int size2=answerRepository.findAll().size();
        assertEquals(size1-1, size2);
        assertEquals(response.getMessage(), "Delete successfully");
        assertEquals(response.getStatus(), 200);
    }

    @Test
    void ANSWER_016_Delete_Answer_ID_Non_Existed(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByQuestionID("hello");
        
        int size2=answerRepository.findAll().size();
        assertEquals(size1, size2);
        assertEquals(response.getMessage(), "No answer is found for question with ID hello");
        assertEquals(response.getStatus(), 404);
    }

    @Test
    void ANSWER_017_Delete_Answer_ID_NullOrEmpty(){
        int size1=answerRepository.findAll().size();
        ApiResponse response=answerService.deleteAnswerByQuestionID(null);
        
        int size2=answerRepository.findAll().size();
        assertEquals(size1, size2);
        assertEquals(response.getMessage(), "Question ID can not be null or empty");
        assertEquals(response.getStatus(), 400);
    }


    @Test
    void ANSWER_018_Check_Null_Blank_NullString(){
        boolean check=answerService.isNullOrBlank("Hello");
        assertFalse(check);
    }

    @Test
    void ANSWER_019_Check_Null_Blank_EmptyString(){
        boolean check=answerService.isNullOrBlank("");
        assertTrue(check);
    }

    @Test
    void ANSWER_020_Check_Null_Blank_String(){
        boolean check=answerService.isNullOrBlank(null);
        assertTrue(check);
    }

    //Tests for create answer
    @Test
    void ANSWER_021_Create_Answer_Success_Fill()
    {   
        Object answer_Return= answerService.CreateAnswer(answerRequest_String, test_Reading,question_Fill);
        assertInstanceOf(Answer_Fill.class, answer_Return);
        Answer_Fill answer=(Answer_Fill) answer_Return;
        
        assertEquals(answer.getSubmit().getId(), test_Reading.getId());
        assertEquals(answer.getAnswer(), "hello");
        assertEquals(answer.getType(), Answer.Type.FILL);
        assertEquals(answer.getId_question(), question_Fill.get_id());
        assertTrue(answer.isCorrect());
    }

    @Test
    void ANSWER_022_Create_Answer_Null_UserAnswer()
    {   
        Object answer_Return= answerService.CreateAnswer(answerRequest_null, test_Reading,question_Fill);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Answer can not be null");
    }

    @Test
    void ANSWER_023_Create_Answer_Fill_In_Writing()
    {   
        Object answer_Return= answerService.CreateAnswer(answerRequest_String, test_Writing,question_Fill);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Writing test can not have answer for fill question");
    }

    @Test
    void ANSWER_024_Create_Answer_Choice_In_Writing()
    {   
        Object answer_Return= answerService.CreateAnswer(answerRequest_choice, test_Writing,question_Choice);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Writing test can not have answer for choice question");
    }

    @Test
    void ANSWER_025_Create_Answer_Essay_Not_In_Writing()
    {   
        Object answer_Return= answerService.CreateAnswer(answerRequest_String, test_Reading,question_Essay);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Essay question is only for writing test");
    }

    @Test
    void ANSWER_026_Create_Answer_Wrong_Type_Fill(){
        Object answer_Return= answerService.CreateAnswer(answerRequest_choice, test_Reading,question_Fill);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Fill question must be answered by string");
    }

    @Test
    void ANSWER_027_Create_Answer_Wrong_Type_String_For_Choice()
    {
        Object answer_Return= answerService.CreateAnswer(answerRequest_String, test_Reading,question_Choice);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "List must be sent for choice question");
    }

    @Test
    void ANSWER_028_Create_Answer_Choice_List_Not_Int()
    {
        AnswerRequest answerRequest_wrong=new AnswerRequest();
        List<String> answer_choice_wrong=new LinkedList<>();
        answer_choice_wrong.add("Hello");
        answerRequest_wrong.setAnswer(answer_choice_wrong);

        Object answer_Return= answerService.CreateAnswer(answerRequest_wrong, test_Reading,question_Choice);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "List integer must be sent for choice question");
    }

    @Test
    void ANSWER_029_Create_Answer_Choice_Blank_List()
    {
        AnswerRequest answerRequest_wrong=new AnswerRequest();
        List<Integer> answer_choice_wrong=new LinkedList<>();
        answerRequest_wrong.setAnswer(answer_choice_wrong);

        Object answer_Return= answerService.CreateAnswer(answerRequest_wrong, test_Reading,question_Choice);
        assertInstanceOf(Answer_Choice.class, answer_Return);

        Answer_Choice answer=(Answer_Choice) answer_Return;
        assertEquals(answer.getType(), Answer.Type.CHOICE);
        assertEquals(answer.getId_question(), question_Choice.get_id());
        assertEquals(answer.getSubmit().getId(), test_Reading.getId());
        assertEquals(answer.getAnswer().size(),0);
    }

    @Test
    void ANSWER_030_Create_Answer_Wrong_Type_Essay(){
        Object answer_Return= answerService.CreateAnswer(answerRequest_choice, test_Reading,question_Essay);
        assertInstanceOf(ApiResponse.class, answer_Return);

        ApiResponse response=(ApiResponse) answer_Return;
        assertEquals(response.getStatus(), 400);
        assertEquals(response.getMessage(), "Essay question is only for writing test");
    }

    @Test
    void ANSWER_031_Create_Answer_Success_Choice(){
        Object answer_Return= answerService.CreateAnswer(answerRequest_choice, test_Reading,question_Choice);
        assertInstanceOf(Answer_Choice.class, answer_Return);
        Answer_Choice answer=(Answer_Choice) answer_Return;
        
        assertEquals(answer.getSubmit().getId(), test_Reading.getId());
        assertEquals(answer.getType(), Answer.Type.CHOICE);
        assertEquals(answer.getId_question(), question_Choice.get_id());
        assertEquals(answer.getAnswer().size(),question_Choice.getKeys().size());
    }

    @Test
    void ANSWER_032_Create_Answer_Success_Essay(){
        
        Object answer_Return= answerService.CreateAnswer(answerRequest_String, test_Writing,question_Essay);
        assertInstanceOf(Answer_Essay.class, answer_Return);
        Answer_Essay answer=(Answer_Essay) answer_Return;
        
        assertEquals(answer.getSubmit().getId(), test_Writing.getId());
        assertEquals(answer.getType(), Answer.Type.ESSAY);
        assertEquals(answer.getId_question(), question_Essay.get_id());
        assertEquals(answer.getAnswer(), "Hello");
    }

    @Test
    void ANSWER_033_Create_Answer_Blank_List_for_Multi_Choice()
    {

        Question question_multi_Choice=new Question();

        question_multi_Choice.set_id("128");
        question_multi_Choice.setType("choice");

        List<Integer> keys=new LinkedList<>();

        keys.add(1);
        keys.add(2);
        keys.add(3);

        question_multi_Choice.setKeys(keys);

        AnswerRequest answerRequest_multi_choice=new AnswerRequest();

        List<Integer> answer_choice=new LinkedList<>();

        answerRequest_multi_choice.setAnswer(answer_choice);

        Object answer_Return= answerService.CreateAnswer(answerRequest_multi_choice, test_Reading,question_multi_Choice);
        assertInstanceOf(Answer_Choice.class, answer_Return);

        Answer_Choice answer=(Answer_Choice) answer_Return;
        
        assertEquals(answer.getSubmit().getId(), test_Reading.getId());
        assertEquals(answer.getType(), Answer.Type.CHOICE);
        assertEquals(answer.getId_question(), question_multi_Choice.get_id());
        assertEquals(answer.getAnswer().size(),0);
    }

}
