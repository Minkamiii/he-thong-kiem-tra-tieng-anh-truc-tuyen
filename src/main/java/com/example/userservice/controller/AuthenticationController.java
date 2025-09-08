package com.example.userservice.controller;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.userservice.dto.reponse.AuthenticationResponse;
import com.example.userservice.dto.reponse.IntrospectResponse;
import com.example.userservice.dto.request.ApiResponse;
import com.example.userservice.dto.request.AuthenticationRequest;
import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.dto.request.LogoutRequest;
import com.example.userservice.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;

@RestController
@RequestMapping("api/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    ApiResponse authenticate(@RequestBody AuthenticationRequest request){
        AuthenticationResponse authenticationResponse = authenticationService.authenticate(request);
        ApiResponse apiResponse = new ApiResponse();
        System.out.println(authenticationResponse.getToken());
        apiResponse.setResult(authenticationResponse);
        return apiResponse;
    }

    @PostMapping("/introspect")
    ApiResponse introspect(@RequestBody IntrospectRequest request) throws JOSEException, ParseException{
        IntrospectResponse introspectResponse = authenticationService.introspect(request);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setResult(introspectResponse);
        return apiResponse;
    }

    @PostMapping("/logout")
    ApiResponse logout(@RequestBody LogoutRequest request) throws JOSEException, ParseException{
        authenticationService.logout(request);
        ApiResponse apiResponse = new ApiResponse();
        return apiResponse;
    }

    @PostMapping("/refreshToken")
    ApiResponse refreshToken(@RequestBody IntrospectRequest request) throws ParseException, JOSEException{
        AuthenticationResponse authenticationResponse = authenticationService.refreshToken(request);
        ApiResponse apiResponse = new ApiResponse();
        System.out.println(authenticationResponse.getToken());
        apiResponse.setResult(authenticationResponse);
        return apiResponse;
    }

}
