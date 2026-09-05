package com.placement.repository;

import com.placement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String userName);
    boolean existsByUsername(String userName);
    boolean existsByCompanyId(Long companyId);
    Optional<User> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
}
