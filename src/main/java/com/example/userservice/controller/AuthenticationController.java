package com.example.userservice.controller;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.reponse.IntrospectResponse;
import com.example.userservice.dto.request.AuthenticationRequest;
import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.dto.request.LogoutRequest;
import com.example.userservice.dto.request.RefreshTokenRequest;
import com.example.userservice.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;

@RestController
@RequestMapping("api/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    ResponseEntity<ApiResponse> authenticate(@RequestBody AuthenticationRequest request){
        ResponseEntity<ApiResponse> authenticationResponse = authenticationService.authenticate(request,false);
        return authenticationResponse;
    }

    @PostMapping("/loginAdmin")
    ResponseEntity<ApiResponse> authenticateAdmin(@RequestBody AuthenticationRequest request){
        ResponseEntity<ApiResponse> authenticationResponse = authenticationService.authenticate(request,true);
        return authenticationResponse;
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
    ResponseEntity<ApiResponse> refreshToken(@RequestBody RefreshTokenRequest request) throws ParseException, JOSEException{
        ResponseEntity<ApiResponse> accessToken = authenticationService.refreshToken(request);
        return accessToken;
    }

}
