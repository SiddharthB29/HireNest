package com.placement.dto;

import com.placement.entity.Job;
import lombok.Data;
@Data
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private Double salary;
    private Double minimumCgpa;
    private String jobType;

    private Long companyId;
    private String companyName;

    public JobResponse() {
    }

    public JobResponse(Long id, String title, String description,
                       String location, Double salary, Double minimumCgpa,
                       String jobType, Long companyId, String companyName) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.salary = salary;
        this.minimumCgpa = minimumCgpa;
        this.jobType = jobType;
        this.companyId = companyId;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public Double getSalary() {
        return salary;
    }

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public String getJobType() {
        return jobType;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }
}
