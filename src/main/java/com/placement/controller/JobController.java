package com.placement.controller;

import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.service.EligibilityResult;
import com.placement.service.JobService;
import com.placement.service.PlacementEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.placement.dto.JobResponse;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final StudentRepository studentRepository;
    private final PlacementEngine placementEngine;

    public JobController(JobService jobService,
                         JobRepository jobRepository,
                         StudentRepository studentRepository,
                         PlacementEngine placementEngine) {
        this.jobService = jobService;
        this.jobRepository = jobRepository;
        this.studentRepository = studentRepository;
        this.placementEngine = placementEngine;
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
                        job.getMaximumBacklogs(),
                        job.getRequiredSkills(),
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
                job.getMaximumBacklogs(),
                job.getRequiredSkills(),
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
                        job.getMaximumBacklogs(),
                        job.getRequiredSkills(),
                        job.getJobType(),
                        job.getCompany().getId(),
                        job.getCompany().getName()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{jobId}/eligibility/{studentId}")
    public EligibilityResult checkEligibility(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return placementEngine.evaluate(student, job);
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