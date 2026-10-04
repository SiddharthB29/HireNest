package com.placement.controller;

import com.placement.entity.Job;
import com.placement.entity.Company;
import com.placement.exception.GlobalExceptionHandler;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.service.JobService;
import com.placement.service.PlacementEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class JobControllerTest {

    private JobService jobService;
    private JobRepository jobRepository;
    private StudentRepository studentRepository;
    private PlacementEngine placementEngine;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        jobService = mock(JobService.class);
        jobRepository = mock(JobRepository.class);
        studentRepository = mock(StudentRepository.class);
        placementEngine = mock(PlacementEngine.class);
        JobController controller = new JobController(
                jobService, jobRepository, studentRepository, placementEngine);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void publicJobListingReturnsMappedJobResponse() throws Exception {
        Job job = new Job();
        job.setTitle("Backend Engineer");
        Company company = new Company();
        company.setName("Example Corp");
        job.setCompany(company);
        given(jobService.getAllJobs()).willReturn(List.of(job));

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Backend Engineer"));
    }

    @Test
    void eligibilityEndpointDelegatesAndReturnsVerdict() throws Exception {
        Job job = new Job();
        job.setTitle("Backend Engineer");
        given(jobRepository.findById(5L)).willReturn(java.util.Optional.of(job));
        com.placement.entity.Student student = new com.placement.entity.Student();
        given(studentRepository.findById(9L)).willReturn(java.util.Optional.of(student));
        given(placementEngine.evaluate(student, job)).willReturn(
                new com.placement.service.EligibilityResult(true, List.of()));

        mockMvc.perform(get("/api/jobs/5/eligibility/9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eligible").value(true))
                .andExpect(jsonPath("$.failedCriteria").isEmpty());
    }

    @Test
    void publicJobDetailReturnsNotFoundWithErrorPayload() throws Exception {
        given(jobService.getJobById(999L)).willThrow(
                new ResourceNotFoundException("Job not found with id 999"));

        mockMvc.perform(get("/api/jobs/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Job not found with id 999"));
    }
}
