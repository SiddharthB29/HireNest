package com.placement.service;

import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.UserRepository;
import org.apache.tika.exception.TikaException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.placement.entity.Student;
import com.placement.repository.StudentRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ResumeTextExtractor resumeTextExtractor;
    private final ResumeCacheService resumeCacheService;
    private final ResumeStorageService resumeStorageService;

    public StudentService(StudentRepository studentRepository,
                          ResumeCacheService resumeCacheService,
                          ResumeTextExtractor resumeTextExtractor,
                          ResumeStorageService resumeStorageService,
                          UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.resumeTextExtractor = resumeTextExtractor;
        this.resumeCacheService = resumeCacheService;
        this.resumeStorageService = resumeStorageService;
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

    public Student createStudent(Student student) {

        User user = getAuthenticatedUser();

        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can create student profiles"
            );
        }

        if (user.getStudent() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student profile already exists"
            );
        }

        Student savedStudent = studentRepository.save(student);

        user.setStudent(savedStudent);
        userRepository.save(user);

        return savedStudent;
    }

    public List<Student> getAllStudents() {
        User user = getAuthenticatedUser();

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.RECRUITER) {
            return studentRepository.findAll();
        }

        if (user.getRole() == Role.STUDENT && user.getStudent() != null) {
            return List.of(user.getStudent());
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to access student profiles"
        );
    }

    public Student getStudentById(Long id) {
        User user = getAuthenticatedUser();

        if (user.getRole() == Role.ADMIN) {
            return studentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id " + id));
        }

        if (user.getRole() != Role.STUDENT || user.getStudent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this student profile"
            );
        }

        if (!user.getStudent().getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this student profile"
            );
        }

        return user.getStudent();
    }

    public Student updateStudent(Long id, Student student) {
        User user = getAuthenticatedUser();

        if (user.getRole() == Role.ADMIN) {
            Student existingStudent = studentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id " + id));

            existingStudent.setName(student.getName());
            existingStudent.setEmail(student.getEmail());
            existingStudent.setPhone(student.getPhone());
            existingStudent.setBranch(student.getBranch());
            existingStudent.setCgpa(student.getCgpa());
            existingStudent.setGraduationYear(student.getGraduationYear());
            existingStudent.setBacklogs(student.getBacklogs());
            existingStudent.setSkills(student.getSkills());
            existingStudent.setProjectCount(student.getProjectCount());
            existingStudent.setCertificationCount(student.getCertificationCount());
            existingStudent.setResumePath(student.getResumePath());
            existingStudent.setPortfolioUrl(student.getPortfolioUrl());
            existingStudent.setGithubUrl(student.getGithubUrl());
            existingStudent.setLinkedinUrl(student.getLinkedinUrl());
            existingStudent.setCertificationsUrl(student.getCertificationsUrl());

            return studentRepository.save(existingStudent);
        }

        if (user.getRole() != Role.STUDENT || user.getStudent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this student profile"
            );
        }

        if (!user.getStudent().getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this student profile"
            );
        }

        Student existingStudent = user.getStudent();

        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPhone(student.getPhone());
        existingStudent.setBranch(student.getBranch());
        existingStudent.setCgpa(student.getCgpa());
        existingStudent.setGraduationYear(student.getGraduationYear());
        existingStudent.setBacklogs(student.getBacklogs());
        existingStudent.setSkills(student.getSkills());
        existingStudent.setProjectCount(student.getProjectCount());
        existingStudent.setCertificationCount(student.getCertificationCount());
        existingStudent.setResumePath(student.getResumePath());
        existingStudent.setPortfolioUrl(student.getPortfolioUrl());
        existingStudent.setGithubUrl(student.getGithubUrl());
        existingStudent.setLinkedinUrl(student.getLinkedinUrl());
        existingStudent.setCertificationsUrl(student.getCertificationsUrl());

        return studentRepository.save(existingStudent);
    }

    public void deleteStudent(Long id) {
        User user = getAuthenticatedUser();

        if (user.getRole() == Role.ADMIN) {
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student not found with id " + id));

            User linkedUser = userRepository.findByStudentId(id)
                    .orElse(null);

            if (linkedUser != null) {
                linkedUser.setStudent(null);
                userRepository.save(linkedUser);
            }

            studentRepository.delete(student);
            return;
        }

        if (user.getRole() != Role.STUDENT || user.getStudent() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this student profile"
            );
        }

        if (!user.getStudent().getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this student profile"
            );
        }

        Student student = user.getStudent();

        user.setStudent(null);
        userRepository.save(user);

        studentRepository.delete(student);
    }


    public String uploadResume(Long studentId, MultipartFile file) {

        User user = getAuthenticatedUser();

        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can upload resumes"
            );
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + studentId
                ));

        if (user.getStudent() == null
                || !user.getStudent().getId().equals(studentId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only upload your own resume"
            );
        }

        // 1. Upload the original file to private Supabase Storage.
        String storagePath =
                resumeStorageService.uploadResume(studentId, file);

        // 2. Save the path against the student.
        // We will consider renaming resumeUrl after checking
        // all existing references and database implications.
        student.setResumePath(storagePath);
        studentRepository.save(student);

        // 3. Extract the resume text.
        String resumeText;

        try {
            resumeText = resumeTextExtractor.extractText(file);
        } catch (IOException | TikaException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Resume was stored, but text extraction failed"
            );
        } catch (IllegalArgumentException e) {
            throw e;
        }

        // 4. Cache the extracted text for 24 hours.
        resumeCacheService.cacheResumeText(studentId, resumeText);

        return "Resume uploaded and processed successfully";
    }

}
