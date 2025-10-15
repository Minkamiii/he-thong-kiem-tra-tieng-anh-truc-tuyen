package com.example.userservice.service;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.userservice.dto.request.UserCreationRequest;
import com.example.userservice.dto.request.UserUpdateRequest;
import com.example.userservice.entity.User;
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

    public Map<String, Object> getAllUser(int page) {
        Pageable pageable = PageRequest.of(page, 12);
        Page<User> userPage;
        userPage = userRepository.findAll(pageable);

        Map<String, Object> userList = new LinkedHashMap<>();
        userList.put("data", userPage.getContent());
        userList.put("currentItems", userPage.getNumberOfElements());
        userList.put("pageSize", userPage.getSize());
        userList.put("totalItems", userPage.getTotalElements());
        userList.put("currentPage", userPage.getNumber());
        userList.put("totalPages", userPage.getTotalPages());
        return userList;
    }

    public User getUserByIdUser(String id) {
        return userRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.USER_UNEXISTED));
    }

    public User updateUser(String id, UserUpdateRequest request, boolean isAdmin) {
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
        if (isAdmin) {
            user.setRoles(request.getRoles());
        }
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
        // String url="http://localhost:8080/api/submit/delete/user/"+id;
        // restTemplate.delete(url);
    }
}
