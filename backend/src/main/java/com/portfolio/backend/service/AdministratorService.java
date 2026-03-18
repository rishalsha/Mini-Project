package com.portfolio.backend.service;

import com.portfolio.backend.entity.Administrator;
import com.portfolio.backend.repository.AdministratorRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdministratorService {
    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdministratorService(AdministratorRepository administratorRepository) {
        this.administratorRepository = administratorRepository;
    }

    public Administrator register(String name, String email, String rawPassword) {
        String hashed = passwordEncoder.encode(rawPassword);
        Administrator administrator = new Administrator();
        administrator.setName(name);
        administrator.setEmail(email);
        administrator.setPasswordHash(hashed);
        administrator.setRole("ADMIN");
        return administratorRepository.save(administrator);
    }

    public Optional<Administrator> login(String email, String rawPassword) {
        Optional<Administrator> adminOpt = administratorRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Administrator admin = adminOpt.get();
            if (passwordEncoder.matches(rawPassword, admin.getPasswordHash())) {
                return Optional.of(admin);
            }
        }
        return Optional.empty();
    }

    public Optional<Administrator> findByEmail(String email) {
        return administratorRepository.findByEmail(email);
    }

    public boolean updatePassword(String email, String newPassword) {
        return administratorRepository.findByEmail(email).map(admin -> {
            admin.setPasswordHash(passwordEncoder.encode(newPassword));
            administratorRepository.save(admin);
            return true;
        }).orElse(false);
    }
}