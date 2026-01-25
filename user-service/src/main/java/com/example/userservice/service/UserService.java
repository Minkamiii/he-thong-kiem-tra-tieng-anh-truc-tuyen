package com.example.userservice.service;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.userservice.dto.reponse.UserListResponse;
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
            if(request.getRoles()==null){
                throw new AppException(ErrorCode.ROLE_INVALID);
            }
            roles.addAll(request.getRoles());
        }else{
            if(request.getRoles()!=null ){
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            roles.add("USER");
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    public Map<String, Object> getAllUser(int page,String keyword) {
        Pageable pageable = PageRequest.of(page, 12);
        Page<User> userPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            userPage = userRepository.findByUsernameContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

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
        
        if (userRepository.existsByUsernameAndIdNot(request.getUsername(), id)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }   
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNum(request.getPhoneNum());
        user.setDob(request.getDob());
        if (isAdmin) {
            if(request.getRoles() == null) {
                throw new AppException(ErrorCode.ROLE_INVALID);
            }
            user.setRoles(request.getRoles());
        }else{
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            if(request.getRoles() != null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
        }
        return userRepository.save(user);
    }

    public List<UserListResponse> getListUserById(List<String> userId) {
        List<User> users=userRepository.findByIdIn(userId);
        List<UserListResponse> response=users.stream()
            .map(user -> new UserListResponse(user.getId(), user.getUsername()))
            .toList();
        return response;
    }

    public void deleteUser(String id) {
        if(!userRepository.existsById(id)){
            throw new AppException(ErrorCode.USER_UNEXISTED);
        }
        userRepository.deleteById(id);
        try {
            String url="http://submit-service:8080/api/submit/delete/user/"+id;
        restTemplate.delete(url);
        } catch (Exception e) {
            // TODO: handle exception
        }
        
    }
}
