package com.placement.service;

import com.placement.entity.Company;
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
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          JobRepository jobRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with username " + username));
    }

    public Company createCompany(Company company) {

        User user = getAuthenticatedUser();

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can create companies"
            );
        }

        return companyRepository.save(company);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
    }

    public Company updateCompany(Long id, Company company) {

        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found with username " + username));

        // Admin can modify any company
        if (user.getRole() != Role.ADMIN) {

            // Recruiter must be associated with a company
            if (user.getCompany() == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Recruiter is not associated with a company"
                );
            }

            // Recruiter can only modify their own company
            if (!user.getCompany().getId().equals(id)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to modify this company"
                );
            }
        }

        existingCompany.setName(company.getName());
        existingCompany.setDescription(company.getDescription());
        existingCompany.setWebsite(company.getWebsite());
        existingCompany.setLocation(company.getLocation());

        return companyRepository.save(existingCompany);
    }

    public void deleteCompany(Long id) {

        Company existingCompany = companyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Company not found with id " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("User not found with username " + username));

        // Only ADMIN reaches this service method for deletion
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can delete companies"
            );
        }

        // Do not delete a company that has recruiters/users
        if (userRepository.existsByCompanyId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Company cannot be deleted because it has associated users"
            );
        }

        // Do not delete a company that has jobs
        if (jobRepository.existsByCompanyId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Company cannot be deleted because it has associated jobs"
            );
        }

        companyRepository.deleteById(id);
    }
}