package com.khanh.code.answer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.api_response.Question;
import com.khanh.code.submit.Submit;
import com.khanh.code.submit.SubmitRepository;
import com.khanh.code.submit.SubmitRequest;
import com.khanh.code.submit.Submit_Listening;
import com.khanh.code.submit.Submit_Reading;
import com.khanh.code.submit.Submit_Writing;


@Service
public class AnswerService {


    @Autowired
    private final SubmitRepository submitRepository;
    @Autowired
    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository, SubmitRepository submitRepository) {
        this.answerRepository = answerRepository;
        this.submitRepository = submitRepository;
    }

    //get answer by ID
    public ApiResponse getAnswerById(String answerId) {

        ApiResponse response = new ApiResponse();

        if(isNullOrBlank(answerId)){
            response.setMessage("Answer ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

        Answer answer= answerRepository.findById(answerId).orElse(null);

        if(answer == null) {
            response.setMessage("Answer not found");
            response.setStatus(404);
            return response;
        }
        else{
            AnswerDTO answerDTO=new AnswerDTO(answer);
  
            response.setData(answerDTO);
            response.setMessage("Answer found");
            response.setStatus(200);
            return response;
        }
    }

    //get all answers of submit by submit_Id
    public ApiResponse getAnswersBySubmitId(String submitId) {

        ApiResponse response = new ApiResponse();

        if(isNullOrBlank(submitId)){
            response.setMessage("Submit ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

        List<Answer> answers = answerRepository.findBySubmitId(submitId);

        if(answers == null || answers.isEmpty()) {
            response.setMessage("No answers found for this submission");
            response.setStatus(404);
            return response;
        }

        else {
            List<AnswerDTO> answerDTOs= transferAnswer(answers);
            
            response.setData(answerDTOs);
            response.setMessage("Answers found");
            response.setStatus(200);
            return response;
        } 
    }

    //delete list answer
    public void deleteListAnswer(List<Answer> answers) {
        for (Answer answer : answers) {
            Submit submit=answer.getSubmit();
                submit.getAnswers().remove(answer);
                //submitRepository.save(submit);
                updateNumberOfCorrectAndTotalAnswers(submit); 
        }
    }

    //get Answer by submit ID and question ID
    public Answer getAnswerBySubmitIDandQuestionID(String submitId, String questionId) {
        return answerRepository.findBySubmitIdAndQuestionId(submitId, questionId);
    }

    //get answer in a submit using question id
    public ApiResponse getAnswerInSubmitWithQuestionID(String id_submit,String id_question)
    {

        ApiResponse response =new ApiResponse();

        if(isNullOrBlank(id_question)&&isNullOrBlank(id_submit)){
            response.setStatus(400);
            response.setMessage("ID submit and question can not be null or empty");
            return response;
        }

        if(isNullOrBlank(id_question)){
            response.setStatus(400);
            response.setMessage("ID question can not be null or empty");
            return response;
        }

        if(isNullOrBlank(id_submit)){
            response.setStatus(400);
            response.setMessage("ID submit can not be null or empty");
            return response;
        }
        
        Answer answer=getAnswerBySubmitIDandQuestionID(id_submit, id_question);
        if(answer==null){
            response.setStatus(404);
            response.setMessage("Can not find the answer");
            return response;
        }
        AnswerDTO answerDTO=new AnswerDTO(answer);

        response.setStatus(200);
        response.setMessage("Find the needed answer");
        response.setData(answerDTO);
        
        return response;
    }

    //transfer List Answer to List Answer DTO
    List<AnswerDTO> transferAnswer(List<Answer> answers){
        List<AnswerDTO> answerDTOs=new LinkedList<>();
        for(Answer answer:answers){
            AnswerDTO answerDTO=new AnswerDTO(answer);
            answerDTOs.add(answerDTO);
        }
        return answerDTOs;
    }

    //delete answer by ID
    public ApiResponse deleteAnswerByID(String answerID) {
    
    ApiResponse response = new ApiResponse();

        if(isNullOrBlank(answerID)){
            response.setMessage("Answer ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

    Answer answer = answerRepository.findById(answerID).orElse(null);

    if (answer == null) {
        response.setStatus(404);
        response.setMessage("Cannot find answer with ID " + answerID);
        return response;
    }
    
    Submit submit=answer.getSubmit();

    submit.getAnswers().remove(answer);
    //submitRepository.save(submit);
    updateNumberOfCorrectAndTotalAnswers(submit);

    boolean stillExist = answerRepository.existsById(answerID);
    
    if (stillExist) 
    {
        response.setMessage("Fail to delete answer");
        response.setStatus(400);
        return response;
    }

    response.setMessage("Delete answer successfully");
    response.setStatus(200);
    return response;
}

    //Delete answers using question ID
    public ApiResponse deleteAnswerByQuestionID(String questionID){

        ApiResponse response =new ApiResponse();
        
        if(isNullOrBlank(questionID)){
            response.setMessage("Question ID can not be null or empty" );
            response.setStatus(400);
            return response;
        }

        List<Answer>answers=answerRepository.findByQuestionId(questionID);

        if(answers==null||answers.isEmpty()){
            response.setStatus(404);
            response.setMessage("No answer is found for question with ID "+questionID);
            return response;
        }

        else {

            deleteListAnswer(answers);

            List<Answer>check=answerRepository.findByQuestionId(questionID);

            if(check.size()!=0){
                response.setMessage("Fail to delete");
                response.setStatus(400);
                return response;
            }

        }
            response.setMessage("Delete successfully");
            response.setStatus(200);
            return response;
}

    //Update Submit when answer is changed
    public void updateNumberOfCorrectAndTotalAnswers(Submit submit)
    {
        
        if (submit.getType()==Submit.Type.LISTENING) {

                Submit_Listening submit_Listening= submitRepository.findListeningById(submit.getId());

                int number=submit_Listening.calculateNumCorrectAnswers(submit_Listening);
                submit_Listening.setNumber_of_correct(number);

                int requirements=submit_Listening.calculateTotalRequirementToAnswer(submit_Listening);
                submit_Listening.setTotal_Requirement_to_answer(requirements);

                submit_Listening.setNum_of_question_to_answer();

                submitRepository.save(submit_Listening);
            }

        else if (submit.getType()==Submit.Type.READING) {

                Submit_Reading submit_Reading= submitRepository.findReadingById(submit.getId());

                int number=submit_Reading.calculateNumCorrectAnswers(submit_Reading);
                submit_Reading.setNumber_of_correct(number);

                int requirements=submit_Reading.calculateTotalRequirementToAnswer(submit_Reading);
                submit_Reading.setTotal_Requirement_to_answer(requirements);

                submit_Reading.setNum_of_question_to_answer();

                submitRepository.save(submit_Reading);
            }

        else if (submit.getType()==Submit.Type.WRITING) {

            Submit_Writing submit_Writing= submitRepository.findWritingById(submit.getId());

            int requirements=submit.calculateTotalRequirementToAnswer(submit_Writing);
            submit_Writing.setTotal_Requirement_to_answer(requirements);

            submit_Writing.setNum_of_question_to_answer();

            submitRepository.save(submit_Writing);
        }
    }

    //check null or blank
    public boolean isNullOrBlank(String a){
        if(a==null) return true;
        else if(a.isBlank()) return true;
        return false;
    }

    //add answers of a submit
    @SuppressWarnings("unchecked")
    public Object CreateAnswer(Object userAnswer, Submit submit, Question question) {

        ApiResponse response=new ApiResponse();

        String type = question.getType().toUpperCase();
        String id_question=question.get_id();
        
        Answer.Type answer_type;
        Answer answer=new Answer();

        try {
            answer_type = Answer.Type.valueOf(type);
        }
         
        catch (IllegalArgumentException e) {
            response = new ApiResponse();
            response.setMessage("Invalid answer type");
            response.setStatus(400);
            return response;
        }
        
        if(userAnswer==null){
            response.setMessage("Answer can not be null");
            response.setStatus(400);
            return response;
        }

        if (answer_type==Answer.Type.FILL) {

           if(submit.getType()==Submit.Type.WRITING) {
                response.setMessage("Writing test can not have answer for fill question");
                response.setStatus(400);
                return response;
           }

           else 

           {
            //fill(string) but send other type of object
            if (!(userAnswer instanceof String))
            {
                response.setMessage("Fill question must be answered by string");
                response.setStatus(400);
                return response;
            }
            
            String answerFill =(String) userAnswer; 
            String key=question.getKey();

            //trim and lower case for both answer and key before comparing

            boolean check=checkAnswer(answerFill, key);
            
            answer = new Answer_Fill(id_question, submit,answer_type,check, answerFill);
            answer.setNumber_of_requiremient_to_answer(1);

           }
        }
        
        else if (answer_type==Answer.Type.CHOICE) {

            if(submit.getType()==Submit.Type.WRITING) {
                response.setMessage("Writing test can not have answer for choice question");
                response.setStatus(400);
                return response;
            }

            boolean check_All_int=true;

            List<Integer> listKey=question.getKeys();

            if(userAnswer instanceof List<?>)
            {
            
                List<?>answerCheck =(List<?>) userAnswer;

                if(answerCheck.isEmpty()){

                    Map<Integer, Boolean> choices = new HashMap<>();

                    //choices.put(-1, false);

                    answer = new Answer_Choice(id_question, submit,answer_type, choices);
                    answer.setNumber_of_requiremient_to_answer(listKey.size());
                    // boolean checkAllChoices = ((Answer_Choice) answer).checkChoices();
                    // ((Answer_Choice) answer).setCorrect(checkAllChoices);
                    
                }

                else
                    {
                        for(Object item : answerCheck) {
                            if(!(item instanceof Integer)) {
                                check_All_int = false;
                                break;
                            }
                        }
    
                        if(check_All_int)
                        
                        {
                            List<Integer> answerChoices = (List<Integer>) userAnswer;
        
                            Map<Integer, Boolean> choices = new HashMap<>();
                            
                                for(int i:answerChoices)
                                    {
                                        if(!listKey.contains(i)){
                                            choices.put(i, false);
                                        }
                                        
                                        else{
                                            choices.put(i, true);
                                        }
                                    }   
                            answer = new Answer_Choice(id_question, submit,answer_type, choices);
                            answer.setNumber_of_requiremient_to_answer(listKey.size());
                            // boolean checkAllChoices = ((Answer_Choice) answer).checkChoices();
                            // ((Answer_Choice) answer).setCorrect(checkAllChoices);       
                        }
                        else {
                            response.setMessage("List integer must be sent for choice question");
                            response.setStatus(400);
                            return response;
                        }
                    }
                }

            else
                {
                    response.setMessage("List must be sent for choice question");
                    response.setStatus(400);
                    return response;
                }
        }

        else if (answer_type==Answer.Type.ESSAY) 
        {
            //essay but not in writing
            if(submit.getType()!=Submit.Type.WRITING) {
                response.setMessage("Essay question is only for writing test");
                response.setStatus(400);
                return response; 
            }
            
            //essay(string) of writing but send other type of object
            if (!(userAnswer instanceof String)){
                response.setMessage("Essay question must be answered by string");
                response.setStatus(400);
                return response;
            }
            //System.out.println(userAnswer);

            String answerEssay = (String) userAnswer;
            answerEssay = answerEssay.replace("\n", "\\n");
            answerEssay = answerEssay.replace("\r", "\\r");
            //System.out.println(answerEssay);
            answer = new Answer_Essay(id_question, submit,answer_type,answerEssay);
            answer.setNumber_of_requiremient_to_answer(1);
        }

        else 
        {
            response.setMessage("Invalid question type");
            response.setStatus(400);
            return response;
        }
        
        return answer;
    }

    //update answers of a submit and its result
    @SuppressWarnings("unchecked")
    public ApiResponse updateAnswers(SubmitRequest submitRequest)
    {
        ApiResponse response=new ApiResponse();
        List<AnswerRequest> answerRequests=submitRequest.getAnswers();

        if(answerRequests==null||answerRequests.isEmpty())
        {
            response.setMessage("Answer list can not be null or empty");
            response.setStatus(400);
            return response;
        }

        for(AnswerRequest answerRequest:answerRequests)
        {
            Object newAnswer= answerRequest.getAnswer();
            String questionId=answerRequest.getId_question();

            //send invalid question id => skip
            if(isNullOrBlank(questionId)){
                continue;
            }

            if(newAnswer==null){
                continue;
            }

            if(newAnswer instanceof List<?>)
            {
                boolean check=true;
                List<?> answerCheck = (List<?>) newAnswer;

                if(answerCheck.isEmpty()){
                    continue;
                }

                for(Object item : answerCheck) {
                    if(!(item instanceof Integer)) {
                        check = false;
                        break;
                    }
                }
                //wrong type in list => skip (int but send list has other type)
                if (!check) 
                {
                    continue;
                }

                else
                {
                    List<Integer> answerChoices = (List<Integer>) newAnswer;

                    List<Answer_Choice> answers= answerRepository.findChoiceAnswersByQuestionId(questionId);

                    //can not find => skip
                    if(answers==null||answers.isEmpty()){
                        continue;
                    }
                    for(Answer_Choice answer:answers)
                    {
                        Map<Integer, Boolean> chosen_Before = answer.getAnswer();

                        //different size => fix if key size is not smaller?

                        for(int key:chosen_Before.keySet())
                        {
                            if(answerChoices.contains(key))
                            {
                                chosen_Before.put(key, true);
                            }

                            else
                            {
                                chosen_Before.put(key, false);
                            }
                        }

                        answer.setAnswer(chosen_Before);
                        answer.setNumber_of_requiremient_to_answer(answerChoices.size());
                        answerRepository.save(answer); 
                        updateNumberOfCorrectAndTotalAnswers(answer.getSubmit());  
                    }
                }
            }

            else if (newAnswer instanceof String)
            {
                
                String keyFill=(String) newAnswer;

                if(keyFill.isBlank())
                {
                    continue;
                }

                List<Answer_Fill> answers= answerRepository.findFillAnswersByQuestionId(questionId);
                
                //can not find => skip
                if(answers==null||answers.isEmpty())
                {
                    continue;
                }

                for(Answer_Fill answer:answers)
                {
                    String answered_Before= answer.getAnswer();
                    answer.setCorrect(checkAnswer(answered_Before,keyFill));
                    answerRepository.save(answer);
                    updateNumberOfCorrectAndTotalAnswers(answer.getSubmit());
                }
            }

            //invalid type of answer => skip
            else {
                continue;   
            }
        }
        
        response.setMessage("Answers are updated");
        response.setStatus(200);
        return response;
    }

    //generate all possible keys for fill question
    public List<String> allPossibleKey(List<List<String>> optional) {
        List<String> results = new LinkedList<>();
        results.add(""); // start with empty string

        for (int i = 0; i < optional.size(); i++) {
            List<String> current = optional.get(i);
            List<String> newResults = new LinkedList<>();

            for (String result : results) {
                for (String option : current) {
                    // build new combination and trim to avoid leading/trailing spaces
                    newResults.add((result + " " + option).trim());
                }
            }
            results = newResults;
        }
        return results;
    }

    //generate all possible keys from a key string
    public List<String> generateAllCombinations(String key) {
        key = key.toLowerCase().trim();
        List<String> finalResults = new LinkedList<>();

        String[] orParts = key.split("\\[or\\]");

        for (String orPart : orParts) {
            List<List<String>> optional = new LinkedList<>();
            String[] words = orPart.trim().split("\\s+");

            for (String word : words) {
                List<String> group = new LinkedList<>();
                String[] slashParts = word.split("/");

                for (String part : slashParts) {
                    if (part.contains("(") && part.contains(")")) {
                        String with = part.replaceAll("[()]", "");
                        String without = part.replaceAll("\\(.*?\\)", "");
                        group.add(with);
                        group.add(without);
                    } else {
                        group.add(part);
                    }
                }
                optional.add(group);
            }

            finalResults.addAll(allPossibleKey(optional));
        }
        
        return new ArrayList<>(new LinkedHashSet<>(finalResults));
    }

    //check answer for fill question
    public boolean checkAnswer(String userAnswer, String keyFill) {
        List<String> possibleKeys = generateAllCombinations(keyFill);
        String check = userAnswer.toLowerCase().trim();

        for (String key : possibleKeys) {
            if (check.equals(key)) {
                return true;
            }
        }
        return false;
    }

}