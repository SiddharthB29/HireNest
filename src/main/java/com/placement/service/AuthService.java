package com.placement.service;

import com.placement.dto.LoginRequest;
import com.placement.dto.RegisterRequest;
import com.placement.entity.User;
import com.placement.exception.DuplicateApplicationException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    public User register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUserName())) {
            throw new DuplicateApplicationException("Username already exists");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getUserName(),
                encodedPassword,
                request.getRole()
        );

        return userRepository.save(user);
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadCredentialsException("Invalid username or password");
        }

        return jwtService.generateToken(user.getUsername());
    }
}
