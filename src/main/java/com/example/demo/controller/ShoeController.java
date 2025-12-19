package com.example.demo.controller;

import com.example.demo.model.Shoe;
import com.example.demo.repository.ShoeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shoes")
public class ShoeController {

    @Autowired
    private ShoeRepository shoeRepository;

    // 1. Alle holen
    @GetMapping
    public List<Shoe> getAllShoes() {
        return shoeRepository.findAll();
    }

    // 2. Anlegen
    @PostMapping
    public Shoe createShoe(@RequestBody Shoe shoe) {
        return shoeRepository.save(shoe);
    }

    // 3. Einzeln holen
    @GetMapping("/{id}")
    public ResponseEntity<Shoe> getShoeById(@PathVariable Long id) {
        Optional<Shoe> shoe = shoeRepository.findById(id);
        return shoe.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 4. NEU: Bearbeiten (z.B. Status ändern)
    @PutMapping("/{id}")
    public ResponseEntity<Shoe> updateShoe(@PathVariable Long id, @RequestBody Shoe shoeDetails) {
        Optional<Shoe> optionalShoe = shoeRepository.findById(id);

        if (optionalShoe.isPresent()) {
            Shoe existingShoe = optionalShoe.get();
            // Wir aktualisieren die Werte
            existingShoe.setInventoryNumber(shoeDetails.getInventoryNumber());
            existingShoe.setType(shoeDetails.getType());
            existingShoe.setSize(shoeDetails.getSize());
            existingShoe.setStatus(shoeDetails.getStatus());
            existingShoe.setCondition(shoeDetails.getCondition());
            // Speichern
            Shoe updatedShoe = shoeRepository.save(existingShoe);
            return ResponseEntity.ok(updatedShoe);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Löschen
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShoe(@PathVariable Long id) {
        if (shoeRepository.existsById(id)) {
            shoeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}