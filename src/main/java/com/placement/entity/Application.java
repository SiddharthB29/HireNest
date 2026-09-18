package com.placement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "applications",
        indexes = {
                @Index(
                        name = "idx_app_student",
                        columnList = "student_id"
                ),
                @Index(
                        name = "idx_app_job",
                        columnList = "job_id"
                ),
                @Index(
                        name = "idx_app_job_status",
                        columnList = "job_id, status"
                ),
                @Index(
                        name = "idx_app_student_job",
                        columnList = "student_id, job_id"
                )
        }
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    private LocalDate applicationDate;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    public Application() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}