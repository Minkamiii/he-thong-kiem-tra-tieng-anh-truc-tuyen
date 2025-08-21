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
import com.khanh.code.answer.AnswerService;
import com.khanh.code.answer.Answer_Choice;
import com.khanh.code.answer.Answer_Fill;
import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.submit.Submit;
import com.khanh.code.submit.SubmitRepository;
import com.khanh.code.submit.SubmitService;
import com.khanh.code.submit.Submit_Reading;

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

    @BeforeEach
    void setup(){

        Date submit_day=Date.from(java.time.Instant.now());

        List<Integer>tasks=new LinkedList<>();
        tasks.add(1);
        tasks.add(2);

        //create submit
        Submit_Reading test_Reading= new Submit_Reading(
            "123","456",
            Submit.Type.READING,tasks,submit_day,0);

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

    //Tests for Add answer

}
