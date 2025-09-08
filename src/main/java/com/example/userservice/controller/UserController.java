package com.example.userservice.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.example.userservice.entity.User;
import com.example.userservice.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    ApiResponse registerUser(@RequestBody @Valid UserCreationRequest request) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.registerUser(request));
        return apiResponse;
    }

    @GetMapping("/getAll")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/info/{userId}")
    ApiResponse getUserById(@PathVariable String userId) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.getUserByIdUser(userId));
        return apiResponse;
    }

    @PutMapping("/update/{userId}")
    ApiResponse updateUser(@PathVariable String userId, @RequestBody UserCreationRequest request){
        ApiResponse apiResponse=new ApiResponse();
        apiResponse.setResult(userService.updateUser(userId,request));
        return apiResponse;
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or #userId == authentication.principal.id")
    void deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
    }
}
