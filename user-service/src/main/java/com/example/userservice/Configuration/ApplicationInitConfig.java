package com.example.userservice.Configuration;

import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.userservice.entity.User;
import com.example.userservice.entity.enums.Role;
import com.example.userservice.repository.UserRepository;

@Configuration
public class ApplicationInitConfig {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            if(userRepository.findByUsername("super_admin").isEmpty()){
                Set<String> roles =new HashSet<>();
                roles.add(Role.SUPER_ADMIN.name());

                User user = new User();
                user.setUsername("super_admin");
                user.setPassword(passwordEncoder.encode("superadmin123"));
                user.setRoles(roles);
                userRepository.save(user);
            }
        };
    }
}
