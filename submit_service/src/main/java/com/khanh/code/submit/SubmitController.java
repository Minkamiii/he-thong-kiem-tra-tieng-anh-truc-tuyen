package com.khanh.code.submit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.khanh.code.api_response.ApiResponse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})

@RequestMapping(path = "/api/submit")
@Validated
public class SubmitController {

    @Autowired
    private SubmitService submitService;

    @GetMapping(path="/user/id/{userID}")
    public ResponseEntity<ApiResponse> getSubmitsOfUser(
        @PathVariable String userID,
        @RequestParam(required = false, defaultValue = "") String type,
        @RequestParam(required = false, defaultValue = "1") Integer page){
        ApiResponse response = new ApiResponse();
        try {
           response = submitService.getAllSubmitsOfUser(userID,page,type);
           return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            response.setStatus(500);
            response.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping(path="/CheckDone")
    public ResponseEntity<ApiResponse> getAllTestDoneOfUser
    (   @RequestParam(required = false) String userID, 
        @RequestParam @NotBlank @NotNull String test_ids)
    {
        ApiResponse response = new ApiResponse();
        System.out.println("userID: " + userID + ", test_ids: " + test_ids);
        try {
           response = submitService.getTestDoneInformation(userID, test_ids);
           return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            response.setStatus(500);
            response.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping(path="/progressforadmin")
    public ResponseEntity<ApiResponse> getProgressForAdmin
    (@RequestParam @NotBlank @NotNull String test_id)
    {
        ApiResponse response = new ApiResponse();
        try {
           response = submitService.getProgressForAdmin(test_id);
           return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            response.setStatus(500);
            response.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping(path="/user/test")
    public ResponseEntity<ApiResponse> GetByUserAndTestID(
        @RequestParam String userID,
        @RequestParam String testID,
        @RequestParam(required = false, defaultValue = "1") Integer page) {
        try {
            ApiResponse response = submitService.getSubmitByUserAndTest(userID, testID, page);
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping(path = "/newSubmit")
    public ResponseEntity<ApiResponse> submitTest(@RequestBody SubmitRequest submitRequest) {
        try {
            ApiResponse response = submitService.saveSubmit(submitRequest);
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
        
    @DeleteMapping(path="/delete/test/{testID}")
    public ResponseEntity<ApiResponse> deleteSubmitById(@PathVariable String testID) {
        try {
            ApiResponse response = submitService.deleteSubmitByTestId(testID);
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping(path="/delete/{submitID}")
    public ResponseEntity<ApiResponse> deleteById(@PathVariable String submitID){
        try{
            ApiResponse response=submitService.deleteSubmitbyID(submitID);
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        catch(Exception e){
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.setMessage("Error: " + e.getMessage());
            errorResponse.setStatus(500);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping(path="/delete/user/{userID}")
    public ResponseEntity<ApiResponse> deleteSubmitByUserId(@PathVariable String userID)
    {
        try{
            ApiResponse response=submitService.deleteSubmitByUserId(userID);
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