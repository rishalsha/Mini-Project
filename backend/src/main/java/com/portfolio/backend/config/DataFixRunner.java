package com.portfolio.backend.config;

import com.portfolio.backend.entity.User;
import com.portfolio.backend.entity.Employer;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.repository.EmployerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataFixRunner {

    private static final String DEFAULT_HASHED_PASSWORD = "$2a$10$7EqJtq98hPqEX7fNZaFWoO7KgeGumn4Wr9PX5xRoxI/GS4RFItC."; // "password"

    @Bean
    CommandLineRunner patchNullAuthFields(UserRepository userRepository, EmployerRepository employerRepository) {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        return args -> {
            // Fix users with null password or registeredAt
            userRepository.findAll().stream()
                    .filter(u -> u.getPasswordHash() == null || u.getPasswordHash().isEmpty()
                            || u.getRegisteredAt() == null)
                    .forEach(u -> {
                        if (u.getPasswordHash() == null || u.getPasswordHash().isEmpty()) {
                            u.setPasswordHash(DEFAULT_HASHED_PASSWORD);
                        }
                        if (u.getRegisteredAt() == null) {
                            u.setRegisteredAt(LocalDateTime.now());
                        }
                        userRepository.save(u);
                    });

            // Fix employers with null password (registeredAt not tracked there)
            employerRepository.findAll().stream()
                    .filter(e -> e.getPasswordHash() == null || e.getPasswordHash().isEmpty())
                    .forEach(e -> {
                        e.setPasswordHash(DEFAULT_HASHED_PASSWORD);
                        employerRepository.save(e);
                    });
        };
    }
}