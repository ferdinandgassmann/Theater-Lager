package com.example.demo.repository;

import com.example.demo.model.Shoe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query; // WICHTIG

import java.util.List;

@Repository
public interface ShoeRepository extends JpaRepository<Shoe, Long> {
    @Query("SELECT DISTINCT s.type FROM Shoe s WHERE s.type IS NOT NULL ORDER BY s.type")
    List<String> findDistinctTypes();

    // Hier können wir später Suchfunktionen definieren
    // Spring Boot baut den SQL Code dafür automatisch!

    // Sucht Schuhe, wo die Inventarnummer übereinstimmt
    Shoe findByInventoryNumber(String inventoryNumber);

    // Sucht Schuhe nach Status (z.B. alle "Verfügbar")
    List<Shoe> findByStatus(String status);

    // Suche nach Größe
    List<Shoe> findBySize(String size);
}