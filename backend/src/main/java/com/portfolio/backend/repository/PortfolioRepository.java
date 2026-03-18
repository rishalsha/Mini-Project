package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Optional<Portfolio> findByEmail(String email);

    Optional<Portfolio> findByEmailIgnoreCase(String email);

    // Returns the most recently updated/created portfolio for an email
    Optional<Portfolio> findFirstByEmailIgnoreCaseOrderByUpdatedAtDesc(String email);

    // Returns the latest portfolio with non-null, non-blank full name (avoid empty
    // templates)
    @Query(value = "SELECT * FROM portfolios WHERE LOWER(email) = LOWER(:email) AND full_name IS NOT NULL AND TRIM(full_name) <> '' ORDER BY updated_at DESC LIMIT 1", nativeQuery = true)
    Optional<Portfolio> findLatestNonEmptyByEmail(@Param("email") String email);

    List<Portfolio> findByFullNameContainingIgnoreCase(String name);
}
