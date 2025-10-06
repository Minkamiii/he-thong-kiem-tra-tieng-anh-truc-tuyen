package com.example.userservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.example.userservice.dto.reponse.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandle {
    
    @ExceptionHandler(value = Exception.class) //exception cụ thể
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception){
        ApiResponse apiResponse =new ApiResponse();

        apiResponse.setCode(ErrorCode.UNAUTHENTICATED.getCode());
        apiResponse.setMessage(ErrorCode.UNAUTHENTICATED.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(AppException exception){
        ErrorCode errorCode= exception.getErrorCode();
        ApiResponse apiResponse =new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingMethodArgumentNotvalidation(MethodArgumentNotValidException exception){
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.valueOf(enumKey);

        ApiResponse apiResponse =new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }
}
