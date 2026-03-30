package com.autofleet.autofleet_ai.repository;

import com.autofleet.autofleet_ai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA va genera automat query-ul SQL: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
}