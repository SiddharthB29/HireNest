package com.placement.controller;

import com.placement.entity.Job;
import com.placement.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.placement.dto.JobResponse;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/company/{companyId}")
    public ResponseEntity<Job> createJob(
            @PathVariable Long companyId,
            @RequestBody Job job) {

        return ResponseEntity.ok(
                jobService.createJob(companyId, job)
        );
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {

        List<JobResponse> response = jobService.getAllJobs()
                .stream()
                .map(job -> new JobResponse(
                        job.getId(),
                        job.getTitle(),
                        job.getDescription(),
                        job.getLocation(),
                        job.getSalary(),
                        job.getMinimumCgpa(),
                        job.getJobType(),
                        job.getCompany().getId(),
                        job.getCompany().getName()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id) {

        Job job = jobService.getJobById(id);

        JobResponse response = new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getLocation(),
                job.getSalary(),
                job.getMinimumCgpa(),
                job.getJobType(),
                job.getCompany().getId(),
                job.getCompany().getName()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobResponse>> getJobsByCompany(
            @PathVariable Long companyId) {

        List<JobResponse> response = jobService.getJobsByCompanyId(companyId)
                .stream()
                .map(job -> new JobResponse(
                        job.getId(),
                        job.getTitle(),
                        job.getDescription(),
                        job.getLocation(),
                        job.getSalary(),
                        job.getMinimumCgpa(),
                        job.getJobType(),
                        job.getCompany().getId(),
                        job.getCompany().getName()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job job) {

        return ResponseEntity.ok(
                jobService.updateJob(id, job)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id) {

        jobService.deleteJob(id);

        return ResponseEntity.noContent().build();
    }
}