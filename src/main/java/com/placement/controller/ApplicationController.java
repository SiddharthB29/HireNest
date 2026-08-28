package com.placement.controller;

import com.placement.dto.ApplicationRequest;
import com.placement.dto.ApplicationResponse;
import com.placement.dto.ApplicationStatusRequest;
import com.placement.entity.Application;
import com.placement.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public Application createApplication(@RequestBody ApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    @GetMapping
    public List<ApplicationResponse> getAllApplications() {

        return applicationService.getAllApplications()
                .stream()
                .map(application -> new ApplicationResponse(
                        application.getId(),
                        application.getApplicationDate(),
                        application.getStatus(),
                        application.getStudent().getId(),
                        application.getStudent().getName(),
                        application.getJob().getId(),
                        application.getJob().getTitle(),
                        application.getJob().getCompany().getId(),
                        application.getJob().getCompany().getName()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable Long id) {

        return applicationService.getApplicationById(id)
                .map(application -> new ApplicationResponse(
                        application.getId(),
                        application.getApplicationDate(),
                        application.getStatus(),
                        application.getStudent().getId(),
                        application.getStudent().getName(),
                        application.getJob().getId(),
                        application.getJob().getTitle(),
                        application.getJob().getCompany().getId(),
                        application.getJob().getCompany().getName()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(
            @PathVariable Long id,
            @RequestBody ApplicationRequest request) {

        try {
            return ResponseEntity.ok(
                    applicationService.updateApplication(id, request)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody ApplicationStatusRequest request) {

        try {
            return ResponseEntity.ok(
                    applicationService.updateApplicationStatus(
                            id,
                            request.getStatus()
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {

        applicationService.deleteApplication(id);

        return ResponseEntity.noContent().build();
    }
}
