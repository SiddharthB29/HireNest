package com.placement.service;

import com.placement.dto.ApplicationRequest;
import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.exception.ConflictException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              JobRepository jobRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
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

    private void authorizeApplicationAccess(Application application) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with username " + username));

        // Admin can access any application
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // Student can access only their own applications
        if (user.getRole() == Role.STUDENT) {

            if (user.getStudent() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Student profile not found"
                );
            }

            if (!user.getStudent().getId()
                    .equals(application.getStudent().getId())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to access this application"
                );
            }

            return;
        }

        // Recruiter can access applications belonging to their company
        if (user.getRole() == Role.RECRUITER) {

            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            if (!user.getCompany().getId()
                    .equals(application.getJob().getCompany().getId())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to manage this application"
                );
            }

            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to access this application"
        );
    }

    public Application createApplication(ApplicationRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with username " + username));

        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can create applications"
            );
        }

        if (user.getStudent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student profile not found"
            );
        }

        Student student = user.getStudent();

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found with id " + request.getJobId()));

        if (applicationRepository.existsByStudentIdAndJobId(
                student.getId(), job.getId())) {

            throw new ConflictException(
                    "Student already applied to this job"
            );
        }

        Application application = new Application();

        application.setStudent(student);
        application.setJob(job);
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());

        return applicationRepository.save(application);
    }

    public List<Application> getAllApplications() {

        User user = getAuthenticatedUser();

        // Admin can see all applications
        if (user.getRole() == Role.ADMIN) {
            return applicationRepository.findAll();
        }

        // Recruiter must be associated with a company
        if (user.getRole() == Role.RECRUITER) {

            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            return applicationRepository.findByJobCompanyId(
                    user.getCompany().getId()
            );
        }

        // Student can see only their own applications
        if (user.getRole() == Role.STUDENT) {

            if (user.getStudent() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Student profile not found"
                );
            }

            return applicationRepository.findByStudentId(
                    user.getStudent().getId()
            );
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to access applications"
        );
    }

    public Optional<Application> getApplicationById(Long id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id " + id));

        authorizeApplicationAccess(application);

        return Optional.of(application);
    }

    public Application updateApplication(Long id, ApplicationRequest request) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id " + id));

        authorizeApplicationAccess(application);

        // Student and Job ownership cannot be changed after creation.
        // Only the application date can be updated.
        application.setApplicationDate(request.getApplicationDate());

        return applicationRepository.save(application);
    }

    public Application updateApplicationStatus(
            Long id,
            ApplicationStatus newStatus) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id " + id));

        authorizeApplicationAccess(application);

        ApplicationStatus currentStatus = application.getStatus();

        boolean validTransition =
                (currentStatus == null &&
                        newStatus == ApplicationStatus.APPLIED)
                        ||
                        (currentStatus == ApplicationStatus.APPLIED &&
                                (newStatus == ApplicationStatus.SHORTLISTED ||
                                        newStatus == ApplicationStatus.REJECTED))
                        ||
                        (currentStatus == ApplicationStatus.SHORTLISTED &&
                                (newStatus == ApplicationStatus.SELECTED ||
                                        newStatus == ApplicationStatus.REJECTED));

        if (!validTransition) {
            throw new ConflictException(
                    "Invalid status transition from "
                            + currentStatus + " to " + newStatus
            );
        }

        application.setStatus(newStatus);

        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id " + id));

        authorizeApplicationAccess(application);

        applicationRepository.deleteById(id);
    }
}