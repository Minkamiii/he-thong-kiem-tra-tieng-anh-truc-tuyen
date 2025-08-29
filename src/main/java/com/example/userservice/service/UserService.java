package com.example.userservice.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.entity.User;
import com.example.userservice.exception.AppException;
import com.example.userservice.exception.ErrorCode;
import com.example.userservice.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User registerUser(UserCreationRequest request){
        User user=new User();

        if(userRepository.existsByUsername(request.getUsername())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhoneNum(request.getPhoneNum());
        user.setDob(request.getDob());

        return userRepository.save(user);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User getUserByIdUser(String id) {
        return userRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.USER_UNEXISTED));
    }


    public Boolean checkLogin(String username, String password){
        User user=userRepository.findByUsername(username);
        if(user==null ){
            throw new AppException(ErrorCode.USER_UNEXISTED);
        }
        else if(!user.getPassword().equals(password)){
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }
        return true;

    }

    public User updateUser(String id, UserCreationRequest request) {
        User user = getUserByIdUser(id);
        if(user==null){
            throw new AppException(ErrorCode.USER_UNEXISTED);
        }
        else if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhoneNum(request.getPhoneNum());
        user.setDob(request.getDob());
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
