package com.example.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserUpdateRequest;
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
        System.out.println(2);
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
    ApiResponse getAllUsers(
        @RequestParam(required = false, defaultValue = "0") int page
    ) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.getAllUser(page));
        return apiResponse;
    }

    @GetMapping("/{userId}")
    ApiResponse getUserById(@PathVariable String userId) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(userService.getUserByIdUser(userId));
        return apiResponse;
    }

    @PutMapping("/update/{userId}")
    // @PreAuthorize("userId == authentication.principal.id")
    ApiResponse updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request){
        ApiResponse apiResponse=new ApiResponse();
        apiResponse.setResult(userService.updateUser(userId,request,false));
        return apiResponse;
    }

    @PutMapping("/updateAdmin/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN') ")
    ApiResponse updateAdmin(@PathVariable String userId, @RequestBody UserUpdateRequest request){
        ApiResponse apiResponse=new ApiResponse();
        apiResponse.setResult(userService.updateUser(userId,request,true));
        return apiResponse;
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasAuthority('SCOPE_SUPER_ADMIN')")
    void deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
    }
}
