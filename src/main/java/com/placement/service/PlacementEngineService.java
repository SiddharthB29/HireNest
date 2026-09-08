package com.placement.service;

import com.placement.dto.PlacementEvaluation;
import com.placement.dto.PlacementResult;
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

    public PlacementEngineService(
            StudentRepository studentRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository) {

        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public PlacementResult evaluate(Student student, Job job) {

        List<String> reasons = new ArrayList<>();

        // CGPA check
        if (job.getMinimumCgpa() != null &&
                student.getCgpa() < job.getMinimumCgpa()) {

            reasons.add("CGPA is below the minimum requirement");
        }

        // Backlog check
        if (job.getMaximumBacklogs() != null &&
                student.getBacklogs() > job.getMaximumBacklogs()) {

            reasons.add("Student has more backlogs than allowed");
        }

        // Branch check
        if (job.getAllowedBranches() != null &&
                !job.getAllowedBranches().isEmpty() &&
                !job.getAllowedBranches().contains(student.getBranch())) {

            reasons.add("Student's branch is not eligible");
        }

        // Skills check
        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isEmpty()) {

            if (student.getSkills() == null ||
                    !student.getSkills().containsAll(job.getRequiredSkills())) {

                reasons.add("Student does not have all required skills");
            }
        }

        // Graduation year check
        if (job.getGraduationYear() != null &&
                !job.getGraduationYear().equals(student.getGraduationYear())) {

            reasons.add("Student's graduation year does not match the requirement");
        }

        return new PlacementResult(
                reasons.isEmpty(),
                reasons
        );
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

            PlacementResult result = evaluate(student, job);

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

            PlacementResult result = evaluate(student, job);

            evaluations.add(
                    new PlacementEvaluation(
                            student.getId(),
                            student.getName(),
                            result.isEligible(),
                            result.getReasons()
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

            PlacementResult result = evaluate(student, job);

            if (result.isEligible()) {

                candidates.add(
                        new PlacementEvaluation(
                                student.getId(),
                                student.getName(),
                                true,
                                result.getReasons()
                        )
                );
            }
        }

        return candidates;
    }
}