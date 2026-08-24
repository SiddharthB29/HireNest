package com.placement.dto;

import com.placement.entity.ApplicationStatus;

import java.time.LocalDate;

public class ApplicationResponse {

    private Long id;
    private LocalDate applicationDate;
    private ApplicationStatus status;

    private Long studentId;
    private String studentName;

    private Long companyId;
    private String companyName;

    public ApplicationResponse() {
    }

    public ApplicationResponse(
            Long id,
            LocalDate applicationDate,
            ApplicationStatus status,
            Long studentId,
            String studentName,
            Long companyId,
            String companyName) {

        this.id = id;
        this.applicationDate = applicationDate;
        this.status = status;
        this.studentId = studentId;
        this.studentName = studentName;
        this.companyId = companyId;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }
}