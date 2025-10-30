package com.example.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.text.ParseException;
import java.time.LocalDate;
import java.util.HashSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.reponse.AuthenticationResponse;
import com.example.userservice.dto.request.AuthenticationRequest;
import com.example.userservice.dto.request.IntrospectRequest;
import com.example.userservice.dto.request.LogoutRequest;
import com.example.userservice.dto.request.RefreshTokenRequest;
import com.example.userservice.entity.User;
import com.example.userservice.exception.AppException;
import com.example.userservice.exception.ErrorCode;
import com.example.userservice.repository.InvalidatedTokenRepository;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.service.AuthenticationService;
import com.mysql.cj.log.Log;
import com.nimbusds.jose.JOSEException;


@SpringBootTest
@Transactional
@Rollback
public class AuthenticationTest {
    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setUsername("user1");
        user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("user1234"));
        user.setEmail("test@example.com");
        user.setPhoneNum("0912345678");
        user.setDob(LocalDate.of(2000, 10, 10));

        HashSet<String> roles = new HashSet<>();
        roles.add("USER");
        user.setRoles(roles);

        userRepository.save(user);
    }

    @Test
    void AUTH_001_loginAdmin_success() {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("super_admin");
        req.setPassword("superadmin123");

        ApiResponse response = authenticationService.authenticate(req, true);
        assertEquals(200, response.getCode());
        assertEquals("successfully", response.getMessage());
    }

    @Test
    void AUTH_002_loginUser_success() {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        assertEquals(200, response.getCode());
        assertEquals("successfully", response.getMessage());
    }

    @Test
    void AUTH_003_Login_By_Invalid_Username() {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1_invalid");
        req.setPassword("user1234");

        AppException exception = assertThrows(AppException.class, () -> authenticationService.authenticate(req, false));
        assertEquals(ErrorCode.LOGIN_INVALID, exception.getErrorCode());

    }

    @Test
    void AUTH_004_Login_By_Invalid_Password() {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234_invalid");

        AppException exception = assertThrows(AppException.class, () -> authenticationService.authenticate(req, false));
        assertEquals(ErrorCode.LOGIN_INVALID, exception.getErrorCode());
    }

    @Test
    void AUTH_005_LoginforAdmin_By_AccountUser() {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        AppException exception = assertThrows(AppException.class, () -> authenticationService.authenticate(req, true));
        assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
    }

    @Test 
    void AUTH_006_Logout_Success() throws ParseException, JOSEException{
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String accessToken = result.getAccessToken();

        LogoutRequest authenticationRequest = new LogoutRequest();
        authenticationRequest.setToken(accessToken);
        long a= invalidatedTokenRepository.count();
        authenticationService.logout(authenticationRequest);

        assertEquals(a+1, invalidatedTokenRepository.count());
    }

    @Test 
    void AUTH_006_Logout_By_Invalid_Token() throws ParseException, JOSEException{
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String invalidToken = result.getRefreshToken();

        LogoutRequest authenticationRequest = new LogoutRequest();
        authenticationRequest.setToken(invalidToken);
        AppException exception = assertThrows(AppException.class, () -> authenticationService.logout(authenticationRequest));
        assertEquals(ErrorCode.INVALID_TOKEN, exception.getErrorCode());
    }

    @Test
    void AUTH_007_introspect_valid_token() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String Token = result.getAccessToken();


        IntrospectRequest introspectRequest = new IntrospectRequest();
        introspectRequest.setToken(Token);

        var introspectResult = authenticationService.introspect(introspectRequest,false);
        assertTrue(introspectResult.isValid());
    }

    @Test
    void AUTH_007_introspect_invalid_token() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String Token = result.getRefreshToken();

        IntrospectRequest introspectRequest = new IntrospectRequest();
        introspectRequest.setToken(Token);

        AppException exception = assertThrows(AppException.class, () -> authenticationService.introspect(introspectRequest,false));
        assertEquals(ErrorCode.INVALID_TOKEN, exception.getErrorCode());
    }

    @Test
    void AUTH_008_introspect_tokenIsLogout() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String Token = result.getAccessToken();

        IntrospectRequest introspectRequest = new IntrospectRequest();
        introspectRequest.setToken(Token);

        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setToken(Token);
        authenticationService.logout(logoutRequest);

        AppException exception = assertThrows(AppException.class, () -> authenticationService.introspect(introspectRequest,false));
        assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
    }

    @Test
    void AUTH_009_introspect_Expired_token() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String Token = result.getAccessToken();

        IntrospectRequest introspectRequest = new IntrospectRequest();
        introspectRequest.setToken(Token);

        AppException exception = assertThrows(AppException.class, () -> authenticationService.introspect(introspectRequest,false));
        assertEquals(ErrorCode.TOKEN_EXPIRED, exception.getErrorCode());
    }

    @Test
    void AUTH_010_RefreshToken_Success() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String refreshToken = result.getRefreshToken();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);

        ApiResponse apiResponse = authenticationService.refreshToken(refreshRequest);
        assertEquals(200, apiResponse.getCode());
        assertEquals("successfully", apiResponse.getMessage());
    }

    @Test
    void AUTH_011_RefreshToken_By_Invalid_Token() throws Exception {
        AuthenticationRequest req = new AuthenticationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");

        ApiResponse response = authenticationService.authenticate(req, false);
        AuthenticationResponse result =(AuthenticationResponse) response.getResult();
        String refreshToken = result.getAccessToken();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);

        AppException exception = assertThrows(AppException.class, () -> authenticationService.refreshToken(refreshRequest));
        assertEquals(ErrorCode.INVALID_TOKEN, exception.getErrorCode());
    }




    // // ✅ 4. Test generate & introspect token
    // @Test
    // void AUTH_004_introspect_valid_token() throws Exception {
    //     AuthenticationRequest req = new AuthenticationRequest();
    //     req.setUsername("testuser");
    //     req.setPassword("password123");

    //     ApiResponse response = authenticationService.authenticate(req, false);
    //     String token = response.getResult().toString();
    //     String accessToken = token.split("accessToken=")[1].split(",")[0].trim();

    //     IntrospectRequest introspectRequest = new IntrospectRequest();
    //     introspectRequest.setToken(accessToken);

    //     var result = authenticationService.introspect(introspectRequest);
    //     Assertions.assertTrue(result.isValid());
    // }

    // // ✅ 5. Test refresh token
    // @Test
    // void AUTH_005_refresh_token_success() throws Exception {
    //     AuthenticationRequest req = new AuthenticationRequest();
    //     req.setUsername("testuser");
    //     req.setPassword("password123");

    //     ApiResponse response = authenticationService.authenticate(req, false);
    //     String tokenStr = response.getResult().toString();
    //     String refreshToken = tokenStr.split("refreshToken=")[1].split(",")[0].trim();

    //     RefreshTokenRequest refresh = new RefreshTokenRequest();
    //     refresh.setRefreshToken(refreshToken);

    //     ApiResponse newToken = authenticationService.refreshToken(refresh);
    //     Assertions.assertNotNull(newToken);
    // }

    // // ✅ 6. Test logout
    // @Test
    // void AUTH_006_logout_token() throws Exception {
    //     AuthenticationRequest req = new AuthenticationRequest();
    //     req.setUsername("testuser");
    //     req.setPassword("password123");

    //     ApiResponse response = authenticationService.authenticate(req, false);
    //     String tokenStr = response.getResult().toString();
    //     String accessToken = tokenStr.split("accessToken=")[1].split(",")[0].trim();

    //     LogoutRequest logout = new LogoutRequest();
    //     logout.setToken(accessToken);

    //     authenticationService.logout(logout);

    //     Assertions.assertTrue(invalidatedTokenRepository.findAll().size() > 0);
    // }

    // // ❌ 7. Test introspect token hết hạn (tuỳ chỉnh test case)
    // @Test
    // void AUTH_007_introspect_expired_token() throws JOSEException, ParseException {
    //     // Tạo token giả sai để test
    //     IntrospectRequest request = new IntrospectRequest();
    //     request.setToken("invalid.token.value");

    //     Assertions.assertThrows(Exception.class, () -> {
    //         authenticationService.introspect(request);
    //     });
    // }
}
