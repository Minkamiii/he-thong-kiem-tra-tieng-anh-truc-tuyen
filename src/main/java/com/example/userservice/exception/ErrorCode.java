package com.example.userservice.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception",HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "username invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1002, "password invalid", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1002,"email invalid", HttpStatus.BAD_REQUEST),
    PHONEN_INVALID(1002,"phoneNum invalid", HttpStatus.BAD_REQUEST),
    DOB_INVALID(1002,"date of birth invalid", HttpStatus.BAD_REQUEST),
    INFORMATION_NOT_NULL(1003, "information not null", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1004, "unauthenticated", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(1005, "invalid token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1006, "token expired", HttpStatus.UNAUTHORIZED),
    USER_UNEXISTED(404, "user not found", HttpStatus.NOT_FOUND)
    ;

    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    private final int code;
    private final String message;
    private final HttpStatus status;

    public int getCode() {
        return code;
    }
    public String getMessage() {
        return message;
    }
    public HttpStatus getStatus() {
        return status;
    }
    
}
