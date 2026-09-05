package com.placement.repository;

import com.placement.entity.Application;
import org.apache.catalina.LifecycleState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
    List<Application> findByJobCompanyId(long companyId);
    List<Application> findByStudentId(Long studentId);
}