package com.portfolio.backend.service;

import com.portfolio.backend.entity.Employer;
import com.portfolio.backend.repository.EmployerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployerService {
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public EmployerService(EmployerRepository employerRepository) {
        this.employerRepository = employerRepository;
    }

    public Employer register(String name, String email, String rawPassword, String companyName) {
        String hashed = passwordEncoder.encode(rawPassword);
        Employer employer = new Employer();
        employer.setName(name);
        employer.setEmail(email);
        employer.setPasswordHash(hashed);
        employer.setCompanyName(companyName);
        return employerRepository.save(employer);
    }

    public Optional<Employer> login(String email, String rawPassword) {
        Optional<Employer> empOpt = employerRepository.findByEmail(email);
        if (empOpt.isPresent()) {
            Employer emp = empOpt.get();
            if (passwordEncoder.matches(rawPassword, emp.getPasswordHash())) {
                return Optional.of(emp);
            }
        }
        return Optional.empty();
    }

    public Optional<Employer> findByEmail(String email) {
        return employerRepository.findByEmail(email);
    }

    public boolean updatePassword(String email, String newPassword) {
        return employerRepository.findByEmail(email).map(emp -> {
            emp.setPasswordHash(passwordEncoder.encode(newPassword));
            employerRepository.save(emp);
            return true;
        }).orElse(false);
    }
}