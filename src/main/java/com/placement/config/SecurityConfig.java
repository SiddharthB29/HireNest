package com.placement.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JWTAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                (request, response, authException) ->
                                        response.sendError(
                                                HttpStatus.UNAUTHORIZED.value(),
                                                "Unauthorized"
                                        )
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(
                                        HttpServletResponse.SC_FORBIDDEN,
                                        "Forbidden"
                                )
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/jobs/**")
                        .hasAnyRole("STUDENT", "RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/companies/**")
                        .hasAnyRole("STUDENT", "RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/applications/**")
                        .hasRole("STUDENT")

                        .requestMatchers(HttpMethod.GET, "/api/applications/**")
                        .hasAnyRole("STUDENT", "RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/jobs/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/companies/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/companies/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
