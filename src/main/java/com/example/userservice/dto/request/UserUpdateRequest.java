package com.example.userservice.dto.request;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    @Size(min = 5, max = 10 , message = "USERNAME_INVALID")
    private String username;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private String email;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private String phoneNum;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private LocalDate dob;

    @NotNull(message = "INFORMATION_NOT_NULL")
    private Set<String> roles;
    
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
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

    public Set<String> getRoles() {
        return roles;
    }
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
