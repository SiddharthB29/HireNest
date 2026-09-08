package com.placement.dto;

import com.placement.entity.ApplicationStatus;

import java.time.LocalDate;

public class ApplicationRequest {

    private Long jobId;
    private LocalDate applicationDate;

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }
}