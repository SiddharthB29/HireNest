package com.placement.controller;

import com.placement.dto.ResumeAnalysisResponse;
import com.placement.service.AiResumeAnalysisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiTestController {

    private final AiResumeAnalysisService aiResumeAnalysisService;

    public AiTestController(AiResumeAnalysisService aiResumeAnalysisService) {
        this.aiResumeAnalysisService = aiResumeAnalysisService;
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


    @GetMapping("/test/{studentId}")
    public ResumeAnalysisResponse testAi(@PathVariable Long studentId) {
        return aiResumeAnalysisService.analyzeStudentResume(studentId);
    }

}