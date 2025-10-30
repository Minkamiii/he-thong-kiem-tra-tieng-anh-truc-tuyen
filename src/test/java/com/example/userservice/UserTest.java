package com.example.userservice;

import com.example.userservice.dto.reponse.UserListResponse;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserUpdateRequest;
import com.example.userservice.entity.User;
import com.example.userservice.exception.AppException;
import com.example.userservice.exception.ErrorCode;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.service.UserService;

import jakarta.validation.Validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@Rollback
class UserTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private Validator validator;

    private User user1,user3;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        user1 = new User();
        user1.setUsername("user1"); 
        user1.setPassword(passwordEncoder.encode("user12345"));
        user1.setEmail("user1@mail.com");
        user1.setPhoneNum("0123456789");
        user1.setDob(LocalDate.of(2000, 01, 01));
        user1.setRoles(Set.of("USER"));
        userRepository.save(user1);

        user3 = new User();
        user3.setUsername("user3");
        user3.setPassword(passwordEncoder.encode("user12345"));
        user3.setEmail("user3@mail.com");
        user3.setPhoneNum("0123456789");
        user3.setDob(LocalDate.of(2000, 01, 01));
        user3.setRoles(Set.of("USER"));
        userRepository.save(user3);
    }

    @Test
    void USER_001_registerUserByUser_Success() {
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0123456789");
        req.setDob(LocalDate.of(2000, 10, 10));

        User user = userService.registerUser(req, false);

        assertNotNull(user.getId());
        assertTrue(passwordEncoder.matches("user1234", user.getPassword()));
        assertTrue(user.getRoles().contains("USER"));
        assertEquals(3, userRepository.count());
    }

    @Test
    void USER_002_registerUserByUser_By_Username_Existed() {
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setDob(LocalDate.of(2000, 10, 10));
        AppException exception = assertThrows(AppException.class, () -> userService.registerUser(req, false));
        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
    }

    @Test
    void USER_003_registerUserByUser_By_Invalid_Username(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_004_registerUserByUser_By_Invalid_Password(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("012");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_005_registerUserByUser_By_Invalid_Email(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2");
        req.setPhoneNum("0987654321");
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_006_registerUserByUser_By_Invalid_PhoneNumber(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("098765");
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_007_registerUserByAdmin_Success() {
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("admin");
        req.setPassword("admin1234");
        req.setEmail("admin@mail.com");
        req.setPhoneNum("0123456789");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));

        User user = userService.registerUser(req, true);

        assertNotNull(user.getId());
        assertTrue(passwordEncoder.matches("admin1234", user.getPassword()));
        assertTrue(user.getRoles().contains("ADMIN"));
        assertEquals(3, userRepository.count());
    }

    @Test
    void USER_008_registerUserByAdmin_By_Username_Existed() {
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user1");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));
        AppException exception = assertThrows(AppException.class, () -> userService.registerUser(req, true));
        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
    }

    @Test
    void USER_009_registerUserByAdmin_By_Invalid_Username(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_010_registerUserByAdmin_By_Invalid_Password(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("012");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0987654321");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_011_registerUserByAdmin_By_Invalid_Email(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2");
        req.setPhoneNum("0987654321");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_012_registerUserByAdmin_By_Invalid_PhoneNumber(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("098765");
        req.setRoles(Set.of("ADMIN"));
        req.setDob(LocalDate.of(2000, 10, 10));
        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_013_registerUserByAdmin_By_Invalid_Role(){
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("098765");
        req.setRoles(null);
        req.setDob(LocalDate.of(2000, 10, 10));
        AppException exception = assertThrows(AppException.class, () -> userService.registerUser(req, true));
        assertEquals(ErrorCode.ROLE_INVALID, exception.getErrorCode());
    }
    
    @Test
    void USER_014_getAllUser_Success() {
        Map<String, Object> result = userService.getAllUser(0, "");
        assertTrue(result.containsKey("data"));
        assertEquals(2, ((List<?>) result.get("data")).size());
    }

    @Test
    void USER_015_getAllUser_Success_ByKeyword() {
        Map<String, Object> result = userService.getAllUser(0, "user1 ");
        assertTrue(result.containsKey("data"));
        assertEquals(1, ((List<?>) result.get("data")).size());
    }

    @Test
    void USER_016_getUserByIdUser_Success() {
        User user = userService.getUserByIdUser(user1.getId());
        assertEquals("user1", user.getUsername());
    }

    @Test
    void USER_017_getUser_By_Invalid_IdUser() {
        AppException exception = assertThrows(AppException.class, () -> userService.getUserByIdUser("999"));
        assertEquals(ErrorCode.USER_UNEXISTED, exception.getErrorCode());
    }

    @Test
    void USER_018_updateUserByAdmin_Success() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("updatedUser");
        req.setEmail("update@mail.com");
        req.setPhoneNum("0292736481");
        req.setDob(LocalDate.of(2001, 1, 1));
        req.setRoles(Set.of("ADMIN"));

        User updated = userService.updateUser(user1.getId(), req, true);

        assertEquals("updatedUser", updated.getUsername());
        assertTrue(passwordEncoder.matches("user12345", updated.getPassword()));
        assertTrue(updated.getRoles().contains("ADMIN"));
        assertEquals(2, userRepository.count());
    }

    @Test
    void USER_019_updateUser_By_Invalid_IdUser() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("updatedUser");
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("011223344");
        req.setDob(LocalDate.of(2001, 1, 1));

        AppException exception = assertThrows(AppException.class, () -> userService.updateUser("123", req, true));
        assertEquals(ErrorCode.USER_UNEXISTED, exception.getErrorCode());
    }

    @Test
    void USER_020_updateUser_By_Username_Existed() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user3");
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("011223344");
        req.setDob(LocalDate.of(2001, 1, 1));
        req.setRoles(Set.of("ADMIN"));

        AppException exception = assertThrows(AppException.class, () -> userService.updateUser(user1.getId(), req, true));
        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
    }

    @Test
    void USER_021_updateUser_By_Invalid_Username() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername(null);
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("011223344");
        req.setDob(LocalDate.of(2001, 1, 1));

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_022_updateUser_By_Invalid_Password() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user2");
        req.setPassword("");
        req.setEmail("update@mail.com");
        req.setPhoneNum("011223344");
        req.setDob(LocalDate.of(2001, 1, 1));

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_023_updateUser_By_Invalid_Email() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user2");
        req.setPassword("user123");
        req.setEmail("");
        req.setPhoneNum("011223344");
        req.setDob(LocalDate.of(2001, 1, 1));

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_024_updateUser_By_Invalid_PhoneNum() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user2");
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("");
        req.setDob(LocalDate.of(2001, 1, 1));

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void USER_025_updateRoleUser_By_User() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user2");
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("");
        req.setDob(LocalDate.of(2001, 1, 1));
        req.setRoles(Set.of("ADMIN"));

         AppException exception = assertThrows(AppException.class, () -> userService.updateUser(user1.getId(), req, false));
         assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
    }

    @Test
    void USER_026_updateUser_By_Invalid_Role() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("user2");
        req.setPassword("user123");
        req.setEmail("update@mail.com");
        req.setPhoneNum("");
        req.setDob(LocalDate.of(2001, 1, 1));
        req.setRoles(null);

         AppException exception = assertThrows(AppException.class, () -> userService.updateUser(user1.getId(), req, true));
         assertEquals(ErrorCode.ROLE_INVALID, exception.getErrorCode());
    }



    @Test
    void USER_027_getListUser_By_Id_Success() {
        List<UserListResponse> res = userService.getListUserById(List.of(user3.getId()));
        assertEquals(1, res.size());
        assertEquals("user3", res.get(0).getUsername());
    }

    @Test
    void USER_028_getListUser_By_InvalidId() {
        List<UserListResponse> res = userService.getListUserById(List.of("hsfdjv","jjbfdshj"));
        assertEquals(0, res.size());

    }

    @Test
    void USER_029_deleteUser_Success() {
        userService.deleteUser(user1.getId());
        assertEquals(1, userRepository.count());
    }

    @Test
    void USER_030_deleteUser_By_Invalid_Id() {
        AppException exception = assertThrows(AppException.class, () -> userService.deleteUser("uysgdfus"));
        assertEquals(2, userRepository.count());
        assertEquals(ErrorCode.USER_UNEXISTED, exception.getErrorCode());
    }

    @Test
    void USER_031_registerUserByUser_Success() {
        UserCreationRequest req = new UserCreationRequest();
        req.setUsername("user2");
        req.setPassword("user1234");
        req.setEmail("user2@mail.com");
        req.setPhoneNum("0123456789");
        req.setDob(LocalDate.of(2000, 10, 10));
        req.setRoles(Set.of("ADMIN"));

        AppException exception = assertThrows(AppException.class, () -> userService.registerUser(req, false));;
        assertEquals(ErrorCode.UNAUTHENTICATED, exception.getErrorCode());
    }

    @Test
    void USER_032_updateUserByUser_Success() {
        UserUpdateRequest req = new UserUpdateRequest();
        req.setUsername("updatedUser");
        req.setPassword("user1234");
        req.setEmail("update@mail.com");
        req.setPhoneNum("011223344");
        req.setPassword("user1234");
        req.setDob(LocalDate.of(2001, 1, 1));

        User updated = userService.updateUser(user1.getId(), req, false);

        assertEquals("updatedUser", updated.getUsername());
        assertTrue(passwordEncoder.matches("user1234", updated.getPassword()));
    }
}

