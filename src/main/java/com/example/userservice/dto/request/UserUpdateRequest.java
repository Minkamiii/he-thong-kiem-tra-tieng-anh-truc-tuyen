package com.example.userservice.dto.request;

import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    @Size(min = 5, max = 10 , message = "USERNAME_INVALID")
    @NotBlank(message = "INFORMATION_NOT_NULL")
    private String username;

    @Size(min = 8, max = 20 , message = "PASSWORD_INVALID")
    @NotBlank(message = "INFORMATION_NOT_NULL")
    private String password;

    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "INFORMATION_NOT_NULL")
    private String email;

    @Pattern(
        regexp = "^(0|\\+84)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$",
        message = "PHONEN_INVALID"
    )
    @NotBlank(message = "INFORMATION_NOT_NULL")
    private String phoneNum;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull(message = "INFORMATION_NOT_NULL")
    private LocalDate dob;

    private Set<String> roles;
    
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

    public Set<String> getRoles() {
        return roles;
    }
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
