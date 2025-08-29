package com.khanh.code.submit;

//import java.net.http.HttpHeaders;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

//import org.apache.tomcat.util.http.parser.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.khanh.code.answer.Answer;
import com.khanh.code.answer.AnswerRequest;
import com.khanh.code.answer.AnswerService;
import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.api_response.Question;
import com.khanh.code.api_response.QuestionResponse;
import com.khanh.code.api_response.SectionsResponse;
import com.khanh.code.api_response.TaskResponse;
import com.khanh.code.api_response.TestResponse;


@Service
public class SubmitService {
    
    @Autowired
    private final SubmitRepository submitRepository;
    private final AnswerService answerService;

    private final RestTemplate restTemplate=new RestTemplate();

    public SubmitService(SubmitRepository submitRepository, AnswerService answerService) {
        this.submitRepository = submitRepository;
        this.answerService = answerService;
    }
    
    //get all submits of user
    public ApiResponse getAllSubmitsOfUser(String userId) {
        ApiResponse response = new ApiResponse();

        if(answerService.isNullOrBlank(userId)){
            response.setMessage("User ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

        List<Submit> submits = submitRepository.findByUserId(userId);
        
        if(submits == null || submits.isEmpty()) {
            response.setMessage("This user did not submit any test" );
            response.setStatus(404);
            return response;
        }
        else {
            List<SubmitDTO> submitDTOs = transferSubmit(submits);
            response.setMessage("Get all submits successfully");
            response.setStatus(200);
            response.setData(submitDTOs);
            return response;
        }
    }

    //get submit by user ID and test ID
    public ApiResponse getSubmitByUserAndTest(SubmitRequest submitRequest)
    {

        String id_test=submitRequest.getTest_id();
        String id_user=submitRequest.getUser_id();

        if(answerService.isNullOrBlank(id_test) && answerService.isNullOrBlank(id_user)){
            ApiResponse response = new ApiResponse();
            response.setMessage("ID user and test can not be null or empty");
            response.setStatus(400);
            return response;
        }

        if(answerService.isNullOrBlank(id_test)){

            ApiResponse response =new ApiResponse();
            response.setStatus(400);
            response.setMessage("ID test can not be null or empty");
            return response;

        }

        if(answerService.isNullOrBlank(id_user)){
            ApiResponse response =new ApiResponse();
            response.setStatus(400);
            response.setMessage("ID user can not be null or empty");
            return response;
        }

        List<Submit> submits=submitRepository.findByUserIdAndTestId(id_user, id_test);

        if(submits==null||submits.isEmpty()){
            ApiResponse response = new ApiResponse();
            response.setMessage("This user did not submit anything for test with ID " + id_test);
            response.setStatus(404);
            return response;
        }

        List<SubmitDTO> submitDTOs=transferSubmit(submits);

        ApiResponse response = new ApiResponse();
        response.setMessage("Get all submits successfully");
        response.setStatus(200);
        response.setData(submitDTOs);
        return response;
    }

    //delete Submits by test id
    public ApiResponse deleteSubmitByTestId(String testId) {

        ApiResponse response = new ApiResponse();

        if(answerService.isNullOrBlank(testId)){
            response.setMessage("Test ID can not be null or empty");
            response.setStatus(400);
            return response;
        }

        List<Submit> submits = submitRepository.findByTestId(testId);

        if(submits==null||submits.isEmpty()){
            response.setMessage("No submits found for test ID: " + testId);
            response.setStatus(404);
            return response;
        }
            deleteListSubmits(submits);
            List<Submit> submitCheck = submitRepository.findByTestId(testId);

            if(submitCheck.size()!=0){
                response.setMessage("Fail to delete test with ID: " + testId);
                response.setStatus(400);
                return response;
            }
           
            response.setMessage("Deleted all submits for test ID: " + testId);
            response.setStatus(200);
            return response;
    }

    //delete submit by id of submit
    public ApiResponse deleteSubmitbyID(String submitId) {

        ApiResponse apiResponse = new ApiResponse();

        if(answerService.isNullOrBlank(submitId)){
            apiResponse.setMessage("Submit ID can not be null or empty" );
            apiResponse.setStatus(400);
            return apiResponse;
        }

        boolean exist=submitRepository.existsById(submitId);

        if(exist){

            submitRepository.deleteById(submitId);
            boolean recheck=submitRepository.existsById(submitId);

            if(recheck){
                apiResponse.setMessage("Fail to delete submit with ID "+submitId);
                apiResponse.setStatus(400);
                return apiResponse;
            }

            apiResponse.setMessage("Delete successfully submit with ID "+submitId);
            apiResponse.setStatus(200);
            return apiResponse;
        }

        else
        {
            apiResponse.setMessage("Can not find submit with ID "+submitId);
            apiResponse.setStatus(404);
            return apiResponse;
        }
    }

    //submit and save answers
    public ApiResponse saveSubmit(SubmitRequest request) {

        ApiResponse response = new ApiResponse();

        Submit.Type submitType;
        Submit submit=new Submit();

        String user_id=request.getUser_id();
        String test_id=request.getTest_id();

        if (answerService.isNullOrBlank(user_id) && answerService.isNullOrBlank(test_id)) 
        {
            response.setMessage("ID user and test can not be null or empty");
            response.setStatus(400);
            return response;
            
        }

        if(answerService.isNullOrBlank(user_id)){
            response.setMessage("ID user can not be null or empty");
            response.setStatus(400);
            return response;
        }


        if(answerService.isNullOrBlank(test_id)){
            response.setMessage("ID test can not be null or empty");
            response.setStatus(400);
            return response;
        }

        //Only check 200 of user service
        boolean check=checkUser(user_id);

        if(check==false){
            response.setMessage("Can not get user in user service with ID "+user_id);
            response.setStatus(404);
            return response;
        }

        List<Integer>tasks=request.getTasks();

        if( tasks==null||tasks.isEmpty())
        {
            response.setMessage("List tasks can not be null or empty");
            response.setStatus(400);
            return response;
        }

        TestResponse testResponse=testAPI(test_id, tasks);

        if(testResponse==null){
            response.setMessage("Can not find test in test service with ID "+test_id);
            response.setStatus(404);
            return response;
        }

        String type=testResponse.getTestType().toUpperCase();

        //System.out.println(type);

        try {
            submitType = Submit.Type.valueOf(type);
        } 
        catch (IllegalArgumentException e) {
            response.setMessage("Invalid test type");
            response.setStatus(400);
            return response;
        }

        if(submitType == Submit.Type.LISTENING){
            submit = new Submit_Listening(user_id,
            test_id, 
            submitType,
            tasks,
            Date.from(java.time.Instant.now()),
            0);
        }

        else if(submitType == Submit.Type.READING){
            submit =new Submit_Reading(user_id,
            test_id,
            submitType,
            tasks,
            Date.from(java.time.Instant.now()),
            0);
        }

        else if(submitType == Submit.Type.WRITING)
        {
            submit = new Submit_Writing(user_id,
            test_id,
            submitType,
            tasks,
            Date.from(java.time.Instant.now()));
        }

        //submit.setTasks(tasks);
        submitRepository.save(submit);
        String submitId = submit.getId();
        
        List<Answer> answers = submit.getAnswers();
        List<AnswerRequest> answerRequests=request.getAnswers();

        if (answerRequests == null || answerRequests.isEmpty()) {
            //submit but no answer list
            submitRepository.delete(submit);
            response.setMessage("Answer list can not be null or empty");
            response.setStatus(400);
            return response;
        }
        
        else
        {
            //get all question inside 
            List<Question> questions=new LinkedList<>();

            List<TaskResponse> taskResponses=testResponse.getTasks();

            for(TaskResponse taskResponse :taskResponses){

                List<SectionsResponse> sectionResponses=taskResponse.getSections();

                for(SectionsResponse sectionResponse: sectionResponses){

                    List<QuestionResponse> questionResponses= sectionResponse.getQuestions();

                    for( QuestionResponse questionResponse: questionResponses){
                        Question question =questionResponse.getQuestion();
                        System.out.println(question.get_id());
                        System.out.println(question.getType());
                        questions.add(question);
                    }
                }
            }
            
            for(AnswerRequest answerRequest : answerRequests) {

                String questionId = answerRequest.getId_question();

                if(answerService.isNullOrBlank(questionId))

                {
                    submitRepository.delete(submit);
                    response.setMessage("Question ID can not be null or empty");
                    response.setStatus(400);
                    return response;
                }

                Answer checkedAnswer = answerService.getAnswerBySubmitIDandQuestionID(submitId, questionId);

                if (checkedAnswer != null) 
                {
                    submitRepository.delete(submit);
                    response.setMessage("Answer for question with ID " + questionId + " already exists.");
                    response.setStatus(400);
                    return response;
                }

                Question question=findById(questionId, questions); //find question

                if(question==null){
                    submitRepository.delete(submit);
                    response.setMessage("Send answer to non-exited question with ID "+questionId);
                    response.setStatus(400);
                    return response;
                }

                //create answer
                Object answer = answerService.CreateAnswer(answerRequest, submit,question);

                if (answer instanceof ApiResponse) {
                    submitRepository.delete(submit);
                    return (ApiResponse) answer;
                }
                
                answers.add((Answer) answer);
            }

        submitRepository.save(submit);
    }

        Submit savedSubmit = submitRepository.findById(submitId).orElse(null);
        
        if(savedSubmit != null) {
            answerService.updateNumberOfCorrectAndTotalAnswers(savedSubmit);
        }

        else
        {
            response.setMessage("Submit is not created");
            response.setStatus(404);
            return response;
        }

        response.setMessage("Submit successfully");
        response.setStatus(200);
        return response;
    }

    //call user service to check user exist
    public boolean checkUser(String userID){
        String url ="http://localhost:8081/userservice/"+userID;
        try{
            ResponseEntity<Void> response= restTemplate.getForEntity(url,Void.class);
            //System.out.println(response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();
        }
        catch(Exception e){
            return false;
        }
    }

    //call test service
    // HttpHeaders headers = new HttpHeaders();
    // headers.setContentType(MediaType.APPLICATION_JSON);
    public TestResponse testAPI(String id_test,List<Integer>tasks)
    {
        String baseUrl = "http://[::1]:8000/api/test/" + id_test + "/questions";

    
        String tasksParam = tasks.stream()
                            .map(String::valueOf)
                            .collect(Collectors.joining(","));

        String url = baseUrl + "?tasks=" + tasksParam;

        ResponseEntity<TestResponse> response =
                restTemplate.exchange(url, HttpMethod.GET, null, TestResponse.class);

        return response.getBody();

    }


    //delete list submits
    public void deleteListSubmits(List<Submit> submits) {
        for (Submit submit : submits) {
            submitRepository.delete(submit);
        }
    }

    //transfer List Submit to List Submit DTO
    List<SubmitDTO> transferSubmit(List<Submit> submits){
        List<SubmitDTO> submitDTOs=new LinkedList<>();
        for(Submit submit:submits){
            SubmitDTO submitDTO=new SubmitDTO(submit);
            submitDTOs.add(submitDTO);
        }
        return submitDTOs;
    }


    public Question findById(String id, List<Question>questions)
    {
        Question question_return=null;

        for(Question question:questions)
        {
            if(question.get_id().equals(id))
            {
                question_return=question;
            }
        }

        return question_return;
    }

}