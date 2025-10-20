package com.khanh.code.submit;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import com.khanh.code.api_response.TestDoneRespone;
import com.khanh.code.api_response.TestResponse;
import org.springframework.beans.factory.annotation.Value;

@Service
public class SubmitService {
    
    @Autowired
    private final SubmitRepository submitRepository;
    private final AnswerService answerService;

    @Value("${TEST_SERVICE_URL}")
    private String testServiceUrl;

    @Value("${USER_SERVICE_URL}")
    private String userServiceUrl;

    private final RestTemplate restTemplate=new RestTemplate();

    public SubmitService(SubmitRepository submitRepository, AnswerService answerService) {
        this.submitRepository = submitRepository;
        this.answerService = answerService;
    }
    
    //get all submits of user
    public ApiResponse getAllSubmitsOfUser(String userId,int page,String type) {
        ApiResponse response = new ApiResponse();

        if(answerService.isNullOrBlank(userId)){
            response.setMessage("User ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

        if(page<1){
            response.setMessage("Page number must be greater than 0");
            response.setStatus(400);
            return response;
        }

        Pageable pageable = PageRequest.of(page-1, 12);

        Page<Submit> submitPage;

        if(answerService.isNullOrBlank(type)) {
            submitPage = submitRepository.findByUserIdOrderBySubmitDayDESC(userId, pageable);
        } 
        
        else {
            Submit.Type typeTest;

            try {
                typeTest = Submit.Type.valueOf(type.toUpperCase());
            } 
            
            catch (IllegalArgumentException e) 
            {
                response.setMessage("Invalid type: " + type);
                response.setStatus(400);
                return response;
            }

            submitPage = submitRepository.findByUserIdAndTypeOrderBySubmitDayDesc(userId, typeTest, pageable);
        }

        if (submitPage.isEmpty()) {
            response.setMessage("Can not find submit of user");
            response.setStatus(404);
            return response;
        }

        else {

            List<SubmitDTO> submitDTOs = transferSubmit(submitPage.getContent());
            Map<String, Object> data = new HashMap<>();
            data.put("submits", submitDTOs);
            data.put("currentPage", submitPage.getNumber()+1);
            data.put("pageSize", submitPage.getSize());
            data.put("totalItems", submitPage.getTotalElements());
            data.put("totalPages", submitPage.getTotalPages());

            response.setMessage("Get all submits successfully");
            response.setStatus(200);
            response.setData(data);
            return response;
        }
    }

    //get submits by user ID and test ID
    public ApiResponse getSubmitByUserAndTest(String id_user,String id_test,Integer page)
    {
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

        Pageable pageable = PageRequest.of(page-1, 5);

        Page<Submit> submitPage = submitRepository.findByUserIdAndTestIdOrderBySubmitDayDESC(id_user, id_test, pageable);

        if(submitPage==null||submitPage.isEmpty()){
            ApiResponse response = new ApiResponse();
            response.setMessage("User with id "+ id_user+ " did not submit anything for test with ID " + id_test);
            response.setStatus(404);
            return response;
        }
        // Submit s=submitPage.getContent().get(0);
        // Submit.Type type=s.getType();

        List<SubmitDTO> submitDTOs=transferSubmit(submitPage.getContent());

        ApiResponse response = new ApiResponse();

        Map<String, Object> data = new HashMap<>();
        data.put("submits", submitDTOs);
        data.put("currentPage", submitPage.getNumber()+1);
        data.put("pageSize", submitPage.getSize());
        data.put("totalItems", submitPage.getTotalElements());
        data.put("totalPages", submitPage.getTotalPages());

        response.setMessage("Get all submits successfully");
        response.setStatus(200);
        
        // if(type==Submit.Type.LISTENING){
        //     Integer max_listening=submitRepository.findMaxListeningCorrect(id_test);
        //     Integer min_listening=submitRepository.findMinListeningCorrect(id_test);
        //     data.put("highest", max_listening);
        //     data.put("lowest", min_listening);
            
        // }

        // else if(type==Submit.Type.READING){
        //     Integer max_reading=submitRepository.findMaxReadingCorrect(id_test);
        //     Integer min_reading=submitRepository.findMinReadingCorrect(id_test);
        //     data.put("highest", max_reading);
        //     data.put("lowest", min_reading);
        // }
        response.setData(data);

        return response;
    }

    //get all tests that have been done
     public ApiResponse getTestDoneInformation(String userID, String test_ids) {

        ApiResponse response = new ApiResponse();

        List<TestDoneRespone> testDoneResponeList=new LinkedList<>();
        String[] id_tests = test_ids.split(",");

        for(String id_test: id_tests){

            boolean done=true;

            if(answerService.isNullOrBlank(id_test)){
                response.setMessage("Test ID in list can not be null or empty");
                response.setStatus(400);
                return response;
            }
            int count = submitRepository.countDistinctUsersByTestId(id_test);

            Page<Submit> submitPage = submitRepository.findByUserIdAndTestIdOrderBySubmitDayDESC(userID, id_test, 
            PageRequest.of(0,1));

            //List<Submit> submits=submitRepository.findByUserIdAndTestIdBySubmitDayDESC(userID, id_test);
            
            if(submitPage==null||submitPage.isEmpty()){
                done=false;
            }

            TestDoneRespone testDoneRespone=new TestDoneRespone(id_test, count, done);
            testDoneResponeList.add(testDoneRespone);
        }

        
        response.setMessage("Get all information of tests done by users successfully");
        response.setStatus(200);
        response.setData(testDoneResponeList);
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

    //delete submits by user id
    public ApiResponse deleteSubmitByUserId(String userId) {
        ApiResponse response = new ApiResponse();

        if(answerService.isNullOrBlank(userId)){
            response.setMessage("User ID can not be null or empty");
            response.setStatus(400);
            return response;
        }

        List<Submit> submits = submitRepository.findByUserId(userId);

        if(submits==null||submits.isEmpty()){
            response.setMessage("No submits found for user ID: " + userId);
            response.setStatus(404);
            return response;
        }
            deleteListSubmits(submits);
            List<Submit> submitCheck = submitRepository.findByUserId(userId);

            if(submitCheck.size()!=0){
                response.setMessage("Fail to delete test with ID: " + userId);
                response.setStatus(400);
                return response;
            }
           
            response.setMessage("Deleted all submits for user ID: " + userId);
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

        Submit.Kind testKind;

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

        String kind=request.getKind().toUpperCase();

        try {
            testKind = Submit.Kind.valueOf(kind);
        } 
        catch (IllegalArgumentException e) {
            response.setMessage("Invalid test kind");
            response.setStatus(400);
            return response;
        }

        submit.setKind(testKind);
        submit.setTestName(testResponse.getTestName());
        submit.setTime_to_complete(request.getTime_to_complete());

        // submitRepository.save(submit);
        // String submitId = submit.getId();
        
        List<Answer> answers = submit.getAnswers();
        List<AnswerRequest> answerRequests=request.getAnswers();

        if (answerRequests == null || answerRequests.isEmpty()) {
            //submit but no answer list
            //submitRepository.delete(submit);
            response.setMessage("Answer list can not be null or empty");
            response.setStatus(400);
            return response;
        }
        
        else
        {
            //get all question inside 
            List<Question> questions=new LinkedList<>();
            //System.out.println(testResponse.getTasks());

            List<TaskResponse> taskResponses=testResponse.getTasks();

            for(TaskResponse taskResponse :taskResponses){
               
                List<SectionsResponse> sectionResponses=taskResponse.getSections();

                for(SectionsResponse sectionResponse: sectionResponses){

                    List<QuestionResponse> questionResponses= sectionResponse.getQuestions();

                    for( QuestionResponse questionResponse: questionResponses){
                        Question question =questionResponse.getQuestion();
                        
                        questions.add(question);
                    }
                }
            }
            
            for(AnswerRequest answerRequest : answerRequests) {

                String questionId = answerRequest.getId_question();

                if(answerService.isNullOrBlank(questionId))

                {
                    //submitRepository.delete(submit);
                    response.setMessage("Question ID can not be null or empty");
                    response.setStatus(400);
                    return response;
                }

                boolean answered = answers.stream()
                                        .anyMatch(a -> a.getId_question().equals(questionId));
                if (answered) 
                {
                    //submitRepository.delete(submit);
                    response.setMessage("Answer for question with ID " + questionId + " already exists.");
                    response.setStatus(400);
                    return response;
                }

                Question question=findById(questionId, questions); //find question

                if(question==null)
                {
                    //submitRepository.delete(submit);
                    response.setMessage("Send answer to non-exited question with ID "+ questionId);
                    response.setStatus(400);
                    return response;
                }

                //create answer
                Object userAnswer= answerRequest.getAnswer();
                Object answer = answerService.CreateAnswer(userAnswer, submit,question);

                if (answer instanceof ApiResponse) {
                    //submitRepository.delete(submit);
                    return (ApiResponse) answer;
                }
                
                answers.add((Answer) answer);
            }
            submitRepository.save(submit);
    }
        String submitId = submit.getId();
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
        String url =userServiceUrl+userID;
        try{
            ResponseEntity<Void> response= restTemplate.getForEntity(url,Void.class);
            //System.out.println(response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();
        }
        catch(Exception e){
            return false;
        }
    }

    // call test service
    // HttpHeaders headers = new HttpHeaders();
    // headers.setContentType(MediaType.APPLICATION_JSON);
    public TestResponse testAPI(String id_test,List<Integer>tasks)
    {
        String baseUrl = testServiceUrl + id_test+"/questions";
        //"http://[::1]:8000/api/test/" + id_test+"/questions";

    
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