package com.placement.service;

import com.placement.dto.PlacementEvaluation;
import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlacementEngineService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementEngine placementEngine;

    public PlacementEngineService(
            StudentRepository studentRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            PlacementEngine placementEngine) {

        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.placementEngine = placementEngine;
    }



    public Job getJob(Long jobId) {

        return jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id " + jobId));
    }

    public List<Student> getEligibleStudents(Job job) {

        List<Student> eligibleStudents = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {
                eligibleStudents.add(student);
            }
        }

        return eligibleStudents;
    }

    public List<PlacementEvaluation> evaluateAllStudents(Job job) {

        List<PlacementEvaluation> evaluations = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            evaluations.add(
                    new PlacementEvaluation(
                            student.getId(),
                            student.getName(),
                            result.isEligible(),
                            result.getFailedCriteria()
                    )
            );
        }

        return evaluations;
    }

    public List<PlacementEvaluation> getCandidatePool(Job job) {

        List<PlacementEvaluation> candidates = new ArrayList<>();

        List<Application> applications =
                applicationRepository.findByJobIdAndStatus(
                        job.getId(),
                        ApplicationStatus.APPLIED
                );

        for (Application application : applications) {

            Student student = application.getStudent();

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {
                candidates.add(
                        new PlacementEvaluation(
                                student.getId(),
                                student.getName(),
                                true,
                                result.getFailedCriteria()
                        )
                );
            }
        }

        return candidates;
    }
}