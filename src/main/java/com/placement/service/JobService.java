package com.placement.service;

import com.placement.entity.Company;
import com.placement.entity.Job;
import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.CompanyRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            CompanyRepository companyRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public Job createJob(Long companyId, Job job) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found with id " + companyId));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found with username " + username));

        // Admin can create a job for any company
        if (user.getRole() != Role.ADMIN) {

            // Recruiter must be associated with a company
            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            // Recruiter can only create jobs for their own company
            if (!user.getCompany().getId().equals(companyId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to create a job for this company"
                );
            }
        }

        job.setCompany(company);

        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(Long id) {

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job not found with id " + id));
    }

    public List<Job> getJobsByCompanyId(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }

    public Job updateJob(Long id, Job updatedJob) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job not found with id " + id));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with username " + username));

        // Admin can modify any company's job
        if (user.getRole() != Role.ADMIN) {

            // Recruiter must belong to a company
            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            // Recruiter's company must own the job
            if (!user.getCompany().getId()
                    .equals(existingJob.getCompany().getId())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to modify this job"
                );
                //We're now comparing the company belonging to the logged-in recruiter against
                // the company that owns the job.
            }
        }

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setSalary(updatedJob.getSalary());
        existingJob.setMinimumCgpa(updatedJob.getMinimumCgpa());
        existingJob.setMaximumBacklogs(updatedJob.getMaximumBacklogs());
        existingJob.setRequiredSkills(updatedJob.getRequiredSkills());
        existingJob.setJobType(updatedJob.getJobType());

        return jobRepository.save(existingJob);
    }

    public void deleteJob(Long id) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id " + id));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with username " + username));

        // Admin can delete any company's job
        if (user.getRole() != Role.ADMIN) {

            // Recruiter must be associated with a company
            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            // Recruiter can only delete jobs belonging to their company
            if (!user.getCompany().getId()
                    .equals(existingJob.getCompany().getId())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to delete this job"
                );
            }
        }
        jobRepository.deleteById(id);
    }
}