package com.placement.service;

import com.placement.dto.ApplicationRequest;
import com.placement.entity.Application;
import com.placement.entity.Company;
import com.placement.entity.Student;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.CompanyRepository;
import com.placement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              CompanyRepository companyRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
    }

    public Application createApplication(ApplicationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        Application application = new Application();

        application.setStudent(student);
        application.setCompany(company);
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
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        application.setStudent(student);
        application.setCompany(company);
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());

        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
}