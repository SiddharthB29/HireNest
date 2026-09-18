package com.placement.service;

import com.placement.dto.CandidateRankingResponse;
import com.placement.dto.PlacementEvaluation;
import com.placement.entity.*;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import com.placement.specification.ApplicationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlacementEngineService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementEngine placementEngine;
    private final CandidateScoringService candidateScoringService;

    public PlacementEngineService(
            StudentRepository studentRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            PlacementEngine placementEngine,
            CandidateScoringService candidateScoringService) {

        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.placementEngine = placementEngine;
        this.candidateScoringService = candidateScoringService;
    }



    public Job getJob(Long jobId) {

        return jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id " + jobId));
    }

    public List<Student> getEligibleStudents(Job job) {

        List<Student> eligibleStudents = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {
                eligibleStudents.add(student);
            }
        }

        return eligibleStudents;
    }

    public List<PlacementEvaluation> evaluateAllStudents(Job job) {

        List<PlacementEvaluation> evaluations = new ArrayList<>();

        List<Student> students = studentRepository.findAll();

        for (Student student : students) {

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            evaluations.add(
                    new PlacementEvaluation(
                            student.getId(),
                            student.getName(),
                            result.isEligible(),
                            result.getFailedCriteria()
                    )
            );
        }

        return evaluations;
    }

    public Page<CandidateRankingResponse> getCandidatePool(Job job,
                                                           Double minScore,
                                                           Double minCgpa,
                                                           Double minSkillScore,
                                                           Double minProjectScore,
                                                           Double minCertificationScore,
                                                           Pageable pageable) {

        List<CandidateRankingResponse> candidates = new ArrayList<>();

        List<Application> applications =
                applicationRepository.findAll(
                        ApplicationSpecification.eligibleApplicationsForJob(job)
                );

//        List<Student> eligibleStudents =
//                studentRepository.findAll(
//                        StudentSpecification.eligibleForJob(job)
//                );
//
//        Set<Long> eligibleStudentIds = new HashSet<>();
//
//        for (Student student : eligibleStudents) {
//            eligibleStudentIds.add(student.getId());
//        }

        for (Application application : applications) {

            Student student = application.getStudent();

            EligibilityResult result =
                    placementEngine.evaluate(student, job);

            if (result.isEligible()) {

                CandidateScore score =
                        candidateScoringService.calculateScore(student, job);

                if ((minScore == null ||
                        score.getTotalScore() >= minScore)
                        && (minCgpa == null
                        || (student.getCgpa() != null
                        && student.getCgpa() >= minCgpa))
                        && (minSkillScore == null ||
                        score.getSkillScore() >= minSkillScore)
                        && (minProjectScore == null ||
                        score.getProjectScore() >= minProjectScore)
                        && (minCertificationScore == null ||
                        score.getCertificationScore() >= minCertificationScore)) {

                    candidates.add(
                            new CandidateRankingResponse(
                                    0,
                                    student.getId(),
                                    student.getName(),
                                    score.getSkillScore(),
                                    score.getCgpaScore(),
                                    score.getProjectScore(),
                                    score.getCertificationScore(),
                                    score.getTotalScore()
                            )
                    );
                }
            }
        }

        candidates.sort(
                Comparator.comparing(
                        CandidateRankingResponse::getTotalScore
                ).reversed()
        );

        // Assign global ranks
        for (int i = 0; i < candidates.size(); i++) {
            candidates.get(i).setRank(i + 1);
        }

        // Apply pagination after filtering and ranking
        int start = (int) pageable.getOffset();

        int end = Math.min(
                start + pageable.getPageSize(),
                candidates.size()
        );

        List<CandidateRankingResponse> pagedCandidates;

        if (start >= candidates.size()) {
            pagedCandidates = new ArrayList<>();
        } else {
            pagedCandidates = candidates.subList(start, end);
        }

        return new PageImpl<>(
                pagedCandidates,
                pageable,
                candidates.size()
        );
    }
}