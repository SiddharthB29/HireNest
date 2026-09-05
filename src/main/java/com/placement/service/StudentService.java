package com.placement.service;

import com.placement.entity.Role;
import com.placement.entity.User;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.placement.entity.Student;
import com.placement.repository.StudentRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository,
                          UserRepository userRepository) {
        this.studentRepository = studentRepository;
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
}
