package com.example.userservice.service;

import java.util.HashSet;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.entity.User;
import com.example.userservice.entity.enums.Role;
import com.example.userservice.exception.AppException;
import com.example.userservice.exception.ErrorCode;
import com.example.userservice.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserCreationRequest request){

        if(userRepository.existsByUsername(request.getUsername())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user=new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhoneNum(request.getPhoneNum());
        user.setDob(request.getDob());
        HashSet<String> roles = new HashSet<>();
        roles.add(Role.USER.name());
        user.setRoles(roles);

        return userRepository.save(user);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User getUserByIdUser(String id) {
        return userRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.USER_UNEXISTED));
    }

    public User getUser(String userId) {
        return userRepository.findById(userId).orElse(null);
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
