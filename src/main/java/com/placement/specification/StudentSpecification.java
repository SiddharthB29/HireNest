package com.placement.specification;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public class StudentSpecification {

    // 1. CGPA check
    public static Specification<Student> cgpaGreaterThanOrEqualTo(
            Double minimumCgpa) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("cgpa"),
                        minimumCgpa
                );
    }

    // 2. Backlogs check
    public static Specification<Student> backlogsLessThanOrEqualTo(
            Integer maximumBacklogs) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("backlogs"),
                        maximumBacklogs
                );
    }

    // 3. Branch check
    public static Specification<Student> branchIn(
            Set<String> allowedBranches) {

        return (root, query, criteriaBuilder) ->
                root.get("branch").in(allowedBranches);
    }

    // 4. Graduation year check
    public static Specification<Student> graduationYearEquals(
            Integer graduationYear) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("graduationYear"),
                        graduationYear
                );
    }

    public static Specification<Student> eligibleForJob(Job job) {

        Specification<Student> specification =
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.conjunction();

        if (job.getMinimumCgpa() != null) {
            specification = specification.and(
                    cgpaGreaterThanOrEqualTo(job.getMinimumCgpa())
            );
        }

        if (job.getMaximumBacklogs() != null) {
            specification = specification.and(
                    backlogsLessThanOrEqualTo(job.getMaximumBacklogs())
            );
        }

        if (job.getAllowedBranches() != null &&
                !job.getAllowedBranches().isEmpty()) {

            specification = specification.and(
                    branchIn(job.getAllowedBranches())
            );
        }

        if (job.getGraduationYear() != null) {
            specification = specification.and(
                    graduationYearEquals(job.getGraduationYear())
            );
        }

        return specification;
    }
}