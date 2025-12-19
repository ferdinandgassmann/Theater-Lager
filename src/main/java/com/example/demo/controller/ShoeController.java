package com.example.demo.controller;

import com.example.demo.model.Shoe;
import com.example.demo.repository.ShoeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

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


    // 6. Bild hochladen (POST /api/shoes/{id}/image)
    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Optional<Shoe> shoeOptional = shoeRepository.findById(id);
            if (shoeOptional.isPresent()) {
                Shoe shoe = shoeOptional.get();
                // Datei in Bytes umwandeln und speichern
                shoe.setImage(file.getBytes());
                shoeRepository.save(shoe);
                return ResponseEntity.ok("Bild gespeichert!");
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Fehler beim Upload");
        }
    }


    // 7. Bild anzeigen (GET /api/shoes/{id}/image)
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        Optional<Shoe> shoeOptional = shoeRepository.findById(id);
        if (shoeOptional.isPresent() && shoeOptional.get().getImage() != null) {
            Shoe shoe = shoeOptional.get();
            return ResponseEntity.ok()
                    // Wir sagen dem Browser: Das hier ist ein Bild (JPEG/PNG)
                    .header("Content-Type", "image/jpeg")
                    .body(shoe.getImage());
        }
        return ResponseEntity.notFound().build();
    }
    // ... (deine bisherigen Methoden) ...

    // 8. MASSEN-AUSLEIHE (Bulk Rent)
    @PostMapping("/bulk-rent")
    public ResponseEntity<String> bulkRent(@RequestBody BulkRentRequest request) {
        List<Shoe> shoes = shoeRepository.findAllById(request.getShoeIds());

        for (Shoe shoe : shoes) {
            shoe.setStatus("Ausgeliehen");
            shoe.setCurrentProduction(request.getProduction());
            shoe.setReturnDate(request.getReturnDate());
        }

        shoeRepository.saveAll(shoes);
        return ResponseEntity.ok(shoes.size() + " Schuhe an " + request.getProduction() + " verliehen.");
    }

    // 9. MASSEN-RÜCKGABE (Bulk Return)
    @PostMapping("/bulk-return")
    public ResponseEntity<String> bulkReturn(@RequestBody List<Long> shoeIds) {
        List<Shoe> shoes = shoeRepository.findAllById(shoeIds);

        for (Shoe shoe : shoes) {
            shoe.setStatus("Verfügbar");
            shoe.setCurrentProduction(null);
            shoe.setReturnDate(null);
        }

        shoeRepository.saveAll(shoes);
        return ResponseEntity.ok(shoes.size() + " Schuhe zurückgegeben.");
    }

    // --- HILFSKLASSE FÜR DIE ANFRAGE ---
    // (Füge das einfach innerhalb der ShoeController-Klammern ganz unten ein)
    public static class BulkRentRequest {
        private List<Long> shoeIds;
        private String production;
        private java.time.LocalDate returnDate;

        // Getter und Setter
        public List<Long> getShoeIds() { return shoeIds; }
        public void setShoeIds(List<Long> shoeIds) { this.shoeIds = shoeIds; }
        public String getProduction() { return production; }
        public void setProduction(String production) { this.production = production; }
        public java.time.LocalDate getReturnDate() { return returnDate; }
        public void setReturnDate(java.time.LocalDate returnDate) { this.returnDate = returnDate; }
    }
}
