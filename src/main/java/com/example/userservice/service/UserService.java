package com.example.userservice.service;

import java.util.HashSet;
import java.util.List;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.userservice.dto.reponse.ApiResponse;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserUpdateRequest;
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
    private final RestTemplate restTemplate=new RestTemplate();

    public User registerUser(UserCreationRequest request,boolean isAdmin) {

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
        if(isAdmin){
            roles.addAll(request.getRoles());
        }else{
            roles.add("USER");
        }
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

    public User updateUser(String id, UserUpdateRequest request) {
        User user = getUserByIdUser(id);

        if(user==null){
            throw new AppException(ErrorCode.USER_UNEXISTED);
        }
        else if (userRepository.existsByUsernameAndIdNot(request.getUsername(), id)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }   
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNum(request.getPhoneNum());
        user.setDob(request.getDob());
        user.setRoles(request.getRoles());
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
        // String url="http://localhost:8080/api/submit/delete/user/"+id;
        // restTemplate.delete(url);
    }
}
