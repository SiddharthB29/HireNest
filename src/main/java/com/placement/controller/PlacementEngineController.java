package com.placement.controller;

import com.placement.dto.PlacementEvaluation;
import com.placement.dto.PlacementResult;
import com.placement.entity.Job;
import com.placement.entity.Role;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import com.placement.service.PlacementEngineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/placement")
public class PlacementEngineController {

    private final PlacementEngineService placementEngineService;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public PlacementEngineController(
            PlacementEngineService placementEngineService,
            StudentRepository studentRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.placementEngineService = placementEngineService;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }


    private void verifyJobAccess(Job job) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with username " + username));

        // Admin can access any job
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // Only recruiters can use the placement engine
        if (user.getRole() != Role.RECRUITER ||
                user.getCompany() == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to use the placement engine"
            );
        }

        // Recruiter can only access jobs belonging to their company
        if (!user.getCompany().getId()
                .equals(job.getCompany().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to evaluate students for this job"
            );
        }
    }


    @GetMapping("/evaluate/{jobId}/{studentId}")
    public ResponseEntity<PlacementResult> evaluateStudent(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {

        Job job = placementEngineService.getJob(jobId);

        verifyJobAccess(job);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id " + studentId));

        return ResponseEntity.ok(
                placementEngineService.evaluate(student, job)
        );
    }

    @GetMapping("/eligible/{jobId}")
    public ResponseEntity<List<Student>> getEligibleStudents(
            @PathVariable Long jobId) {

        Job job = placementEngineService.getJob(jobId);

        verifyJobAccess(job);

        return ResponseEntity.ok(
                placementEngineService.getEligibleStudents(job)
        );
    }

    @GetMapping("/results/{jobId}")
    public ResponseEntity<List<PlacementEvaluation>> evaluateAllStudents(
            @PathVariable Long jobId) {

        Job job = placementEngineService.getJob(jobId);

        verifyJobAccess(job);

        return ResponseEntity.ok(
                placementEngineService.evaluateAllStudents(job)
        );
    }

    @GetMapping("/candidates/{jobId}")
    public ResponseEntity<List<PlacementEvaluation>> getCandidatePool(
            @PathVariable Long jobId) {

        Job job = placementEngineService.getJob(jobId);

        verifyJobAccess(job);

        return ResponseEntity.ok(
                placementEngineService.getCandidatePool(job)
        );
    }
}