package com.placement.service;

import com.placement.entity.Company;
import com.placement.entity.Job;
import com.placement.repository.CompanyRepository;
import com.placement.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(
            JobRepository jobRepository,
            CompanyRepository companyRepository) {

        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    public Job createJob(Long companyId, Job job) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new RuntimeException("Company not found"));

        job.setCompany(company);

        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(Long id) {

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));
    }

    public Job updateJob(Long id, Job updatedJob) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setSalary(updatedJob.getSalary());
        existingJob.setMinimumCgpa(updatedJob.getMinimumCgpa());
        existingJob.setJobType(updatedJob.getJobType());

        return jobRepository.save(existingJob);
    }

    public void deleteJob(Long id) {

        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found");
        }

        jobRepository.deleteById(id);
    }
}