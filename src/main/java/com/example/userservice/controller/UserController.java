package com.example.userservice.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserUpdateRequest;
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
        apiResponse.setResult(userService.registerUser(request,false));
        return apiResponse;
    }

    @PostMapping("/adduser")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    ApiResponse adduser(@RequestBody @Valid UserCreationRequest request) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.registerUser(request, true));
        return apiResponse;
    }

    @GetMapping("/getAll")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')||hasAuthority('SCOPE_ADMIN')")
    ApiResponse getAllUsers() {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.getAllUsers());
        return apiResponse;
    }

    @GetMapping("/info/{userId}")
    ApiResponse getUserById(@PathVariable String userId) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.getUserByIdUser(userId));
        return apiResponse;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        User foundUser = userService.getUser(userId);
        System.out.println("find user with id" + userId + " : " + foundUser);
        if (foundUser != null) {
            return ResponseEntity.status(200).body(foundUser);
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }


    @PutMapping("/update/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    ApiResponse updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request){
        ApiResponse apiResponse=new ApiResponse();
        apiResponse.setResult(userService.updateUser(userId,request));
        return apiResponse;
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN') or #userId == authentication.principal.id")
    void deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
    }
}
