package com.example.userservice.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.userservice.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsernameAndIdNot(String username,String userId);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
}
