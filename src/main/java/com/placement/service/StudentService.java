package com.placement.service;

import com.placement.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import com.placement.entity.Student;
import com.placement.repository.StudentRepository;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
    }

    public Student updateStudent(Long id, Student student) {

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));

        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());
//        existingStudent.setCollege(student.getCollege());
        existingStudent.setBranch(student.getBranch());
        existingStudent.setCgpa(student.getCgpa());
        existingStudent.setPhone(student.getPhone());
        existingStudent.setGraduationYear(student.getGraduationYear());

        return studentRepository.save(existingStudent);
    }

    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found");
        }

        studentRepository.deleteById(id);
    }
}
