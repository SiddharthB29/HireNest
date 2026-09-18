package com.placement.repository;

import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long>,
        JpaSpecificationExecutor<Application> {

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    List<Application> findByJobCompanyId(long companyId);

    List<Application> findByStudentId(Long studentId);

    Page<Application> findByJobIdAndStatus(
            Long jobId,
            ApplicationStatus status,
            Pageable pageable
    );

    @Override
    @EntityGraph(attributePaths = {"student"})
    List<Application> findAll(
            org.springframework.data.jpa.domain.Specification<Application> spec
    );
}