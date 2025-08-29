package com.example.userservice.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.userservice.dto.request.ApiResponse;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserLoginRequest;
import com.example.userservice.entity.User;
import com.example.userservice.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    ApiResponse<User> registerUser(@RequestBody @Valid UserCreationRequest request) {
        ApiResponse<User> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.registerUser(request));
        return apiResponse;
    }

    @GetMapping("")
    List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("{userId}")
    ApiResponse<User> getUserById(@PathVariable String userId) {
        ApiResponse<User> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserByIdUser(userId));
        return apiResponse;
    }

    @PostMapping("login")
    ApiResponse<UserLoginRequest> loginUser(@RequestBody UserLoginRequest request){
        ApiResponse<UserLoginRequest> apiResponse = new ApiResponse<>();
        if(userService.checkLogin(request.getUsername(), request.getPassword())){
            apiResponse.setResult(request);
            return apiResponse;
        }
        return apiResponse;
    }

    @PutMapping("{userId}")
    ApiResponse<User> updateUser(@PathVariable String userId, @RequestBody UserCreationRequest request){
        ApiResponse<User> apiResponse=new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userId,request));
        return apiResponse;
    }

    @DeleteMapping("{userId}")
    void deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
    }
}
