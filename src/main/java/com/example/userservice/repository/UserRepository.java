package com.example.userservice.repository;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.userservice.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    boolean existsByUsernameAndIdNot(String username,String userId);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    LinkedList<User> findByIdIn(List<String> userId);
}
