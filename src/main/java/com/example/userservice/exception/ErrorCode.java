package com.example.userservice.exception;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception"),
    USER_EXISTED(1001, "User existed"),
    USERNAME_INVALID(1002, "username invalid"),
    PASSWORD_INVALID(1002, "password invalid"),
    EMAIL_INVALID(1002,"email invalid"),
    PHONEN_INVALID(1002,"phoneNum invalid"),
    DOB_INVALID(1002,"date of birth invalid"),
    INFORMATION_NOT_NULL(1003, "information not null"),
    UNAUTHENTICATED(1004, "unauthenticated"),
    USER_UNEXISTED(404, "user not found")
    ;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    private int code;
    private String message;

    public int getCode() {
        return code;
    }
    public String getMessage() {
        return message;
    }

    
}
