package com.khanh.code.answer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.khanh.code.api_response.ApiResponse;
import com.khanh.code.submit.SubmitRequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@Controller
@RequestMapping(path = "/api")
@Validated

public class AnswerController {
    @Autowired
    private AnswerService answerService;

    @GetMapping(path="/answer/{answerId}")
    public ResponseEntity<ApiResponse> getAnswerByID(@PathVariable String answerId) {
        try{
            ApiResponse response = answerService.getAnswerById(answerId);
            return ResponseEntity.status(response.getStatus()).body(response);

        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping(path="/answers/submit/{submitId}")
    public ResponseEntity<ApiResponse> getAnswerBySubmit(@PathVariable String submitId) {
        try{
            ApiResponse response = answerService.getAnswersBySubmitId(submitId);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    //Request Param
    @GetMapping(path="/answer/submit/question")
    public ResponseEntity<ApiResponse> getAnswerinSubmitByQuestion(
                @RequestParam @NotNull @NotBlank String submitId,
                @RequestParam @NotNull @NotBlank String questionId) 
    {
         try{
            ApiResponse response = answerService.getAnswerInSubmitWithQuestionID(submitId,questionId);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @DeleteMapping(path="/answer/{answerId}")
    public ResponseEntity<ApiResponse> deleteAnswerByID(@PathVariable String answerId) {
        try{
            ApiResponse response = answerService.deleteAnswerByID(answerId);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping(path="/answer/question/{questionId}")
    public ResponseEntity<ApiResponse> deleteAnswerByQuestion(@PathVariable String questionId) {
        try{
            ApiResponse response = answerService.deleteAnswerByQuestionID(questionId);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    } 

    //Put 
    @PutMapping(path="/answers/update")
    public ResponseEntity<ApiResponse> updateAnswersByQuestion(@RequestBody SubmitRequest request) 
    {
        try{
            ApiResponse response = answerService.updateAnswers(request);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
}
