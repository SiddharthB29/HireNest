package com.placement.dto;

import com.placement.entity.ApplicationStatus;

//This DTO represents a request whose only purpose is changing application status.
public class ApplicationStatusRequest {
    private ApplicationStatus status;

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
