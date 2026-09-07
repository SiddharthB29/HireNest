package com.placement.controller;

import com.placement.dto.PlacementResult;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.service.PlacementEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/placement")
public class PlacementEngineController {

    private final PlacementEngineService placementEngineService;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;

    public PlacementEngineController(
            PlacementEngineService placementEngineService,
            StudentRepository studentRepository,
            JobRepository jobRepository) {

        this.placementEngineService = placementEngineService;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping("/evaluate/{jobId}/{studentId}")
    public ResponseEntity<PlacementResult> evaluateStudent(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id " + jobId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id " + studentId));

        return ResponseEntity.ok(
                placementEngineService.evaluate(student, job)
        );
    }
}