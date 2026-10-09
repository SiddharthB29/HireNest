
package com.placement.controller;

import com.placement.dto.ResumeAnalysisResponse;
import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.UserRepository;
import com.placement.service.AiResumeAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ai")
public class AiTestController {

    private final AiResumeAnalysisService aiResumeAnalysisService;
    private final UserRepository userRepository;

    public AiTestController(
            AiResumeAnalysisService aiResumeAnalysisService,
            UserRepository userRepository) {
        this.aiResumeAnalysisService = aiResumeAnalysisService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with username " + username));
    }

    @GetMapping("/test")
    public ResumeAnalysisResponse testAi() {

        String sampleResume = """
                John Doe
                Computer Science Student

                Skills:
                Java, Spring Boot, PostgreSQL, React, Docker

                Projects:
                Built a placement management system using Spring Boot
                and React. Implemented REST APIs, JWT authentication,
                PostgreSQL database integration and Redis caching.

                Education:
                B.Tech Computer Science
                """;

        return aiResumeAnalysisService.analyzeResume(sampleResume);
    }

    @GetMapping("/resume-analysis")
    public ResumeAnalysisResponse analyzeMyResume() {

        User user = getAuthenticatedUser();

        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can analyze their resumes"
            );
        }

        if (user.getStudent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No student profile is linked to this account"
            );
        }

        Long studentId = user.getStudent().getId();

        return aiResumeAnalysisService.analyzeStudentResume(studentId);
    }
}
