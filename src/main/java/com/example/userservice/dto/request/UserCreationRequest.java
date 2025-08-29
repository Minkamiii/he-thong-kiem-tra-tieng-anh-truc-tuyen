package com.example.userservice.dto.request;

import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserCreationRequest {
    @Size(min = 5, max = 10 , message = "USERNAME_INVALID")
    private String username;

    @Size(min = 8, max = 20 , message = "PASSWORD_INVALID")
    private String password;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private String email;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private String phoneNum;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private LocalDate dob;
    
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhoneNum() {
        return phoneNum;
    }
    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
    public LocalDate getDob() {
        return dob;
    }
    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    
}
