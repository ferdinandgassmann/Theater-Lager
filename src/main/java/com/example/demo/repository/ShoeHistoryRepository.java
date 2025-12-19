package com.example.demo.repository;

import com.example.demo.model.ShoeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShoeHistoryRepository extends JpaRepository<ShoeHistory, Long> {
    // Finde alle Einträge zu einem Schuh, sortiert (neueste zuerst)
    List<ShoeHistory> findByShoeIdOrderByRentedAtDesc(Long shoeId);

    // Finde den aktuell offenen Verleih (wo noch kein Rückgabedatum steht)
    Optional<ShoeHistory> findByShoeIdAndReturnedAtIsNull(Long shoeId);
}