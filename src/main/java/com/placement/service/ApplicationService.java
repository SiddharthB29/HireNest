package com.placement.service;

import com.placement.dto.ApplicationRequest;
import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
    }

    public Application createApplication(ApplicationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        Application application = new Application();

        if (applicationRepository.existsByStudentIdAndJobId(
                request.getStudentId(),
                request.getJobId())) {

            throw new RuntimeException(
                    "Student has already applied to this job"
            );
        }

        application.setStudent(student);
        application.setJob(job);
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());

        return applicationRepository.save(application);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    public Application updateApplication(Long id, ApplicationRequest request) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        application.setStudent(student);
        application.setJob(job);
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());

        return applicationRepository.save(application);
    }

    public Application updateApplicationStatus(
            Long id,
            ApplicationStatus newStatus) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus currentStatus = application.getStatus();

        boolean validTransition =
                (currentStatus == ApplicationStatus.APPLIED &&
                        (newStatus == ApplicationStatus.SHORTLISTED ||
                                newStatus == ApplicationStatus.REJECTED))
                        ||
                        (currentStatus == ApplicationStatus.SHORTLISTED &&
                                (newStatus == ApplicationStatus.SELECTED ||
                                        newStatus == ApplicationStatus.REJECTED));

        if (!validTransition) {
            throw new RuntimeException(
                    "Invalid status transition from "
                            + currentStatus + " to " + newStatus
            );
        }

        application.setStatus(newStatus);

        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
}