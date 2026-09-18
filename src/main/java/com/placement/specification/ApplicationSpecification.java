package com.placement.specification;

import com.placement.entity.Application;
import com.placement.entity.ApplicationStatus;
import com.placement.entity.Job;
import com.placement.entity.Student;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ApplicationSpecification {

    public static Specification<Application> eligibleApplicationsForJob(
            Job job) {

        return (root, query, criteriaBuilder) -> {

            Join<Application, Student> student =
                    root.join("student");

            var predicates =
                    criteriaBuilder.conjunction();

            // Job ID check
            predicates = criteriaBuilder.and(
                    predicates,
                    criteriaBuilder.equal(
                            root.get("job").get("id"),
                            job.getId()
                    )
            );

            // Application status check
            predicates = criteriaBuilder.and(
                    predicates,
                    criteriaBuilder.equal(
                            root.get("status"),
                            ApplicationStatus.APPLIED
                    )
            );

            // CGPA check
            if (job.getMinimumCgpa() != null) {

                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.greaterThanOrEqualTo(
                                student.get("cgpa"),
                                job.getMinimumCgpa()
                        )
                );
            }

            // Backlogs check
            if (job.getMaximumBacklogs() != null) {

                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.lessThanOrEqualTo(
                                student.get("backlogs"),
                                job.getMaximumBacklogs()
                        )
                );
            }

            // Branch check
            if (job.getAllowedBranches() != null &&
                    !job.getAllowedBranches().isEmpty()) {

                predicates = criteriaBuilder.and(
                        predicates,
                        student.get("branch")
                                .in(job.getAllowedBranches())
                );
            }

            // Graduation year check
            if (job.getGraduationYear() != null) {

                predicates = criteriaBuilder.and(
                        predicates,
                        criteriaBuilder.equal(
                                student.get("graduationYear"),
                                job.getGraduationYear()
                        )
                );
            }

            return predicates;
        };
    }
}