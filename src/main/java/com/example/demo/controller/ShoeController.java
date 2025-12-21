package com.example.demo.controller;

import com.example.demo.model.Shoe;
import com.example.demo.model.ShoeHistory;
import com.example.demo.repository.ShoeRepository;
import com.example.demo.repository.ShoeHistoryRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shoes")
public class ShoeController {

    private final ShoeRepository shoeRepository;
    private final ShoeHistoryRepository historyRepository;

    public ShoeController(ShoeRepository shoeRepository, ShoeHistoryRepository historyRepository) {
        this.shoeRepository = shoeRepository;
        this.historyRepository = historyRepository;
    }

    @GetMapping
    public List<Shoe> getAllShoes() {
        return shoeRepository.findAll();
    }

    // --- WICHTIG FÜR DAS DROPDOWN MENÜ ---
    @GetMapping("/types")
    public List<String> getShoeTypes() {
        return shoeRepository.findDistinctTypes();
    }

    @PostMapping
    public Shoe createShoe(@RequestBody Shoe shoe) {
        return shoeRepository.save(shoe);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shoe> getShoe(@PathVariable Long id) {
        return shoeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- WICHTIG FÜR DAS HISTORY MODAL ---
    @GetMapping("/{id}/history")
    public List<ShoeHistory> getShoeHistory(@PathVariable Long id) {
        return historyRepository.findByShoeIdOrderByRentedAtDesc(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shoe> updateShoe(@PathVariable Long id, @RequestBody Shoe shoeDetails) {
        return shoeRepository.findById(id).map(shoe -> {
            String oldStatus = shoe.getStatus();
            String newStatus = shoeDetails.getStatus();

            // 1. Wenn Schuh neu verliehen wird -> Historie starten
            if (!"Ausgeliehen".equals(oldStatus) && "Ausgeliehen".equals(newStatus)) {
                ShoeHistory history = new ShoeHistory(shoe, shoeDetails.getCurrentProduction(), LocalDate.now());
                historyRepository.save(history);
            }

            // 2. Wenn Schuh zurückgegeben wird -> Historie abschließen
            if ("Ausgeliehen".equals(oldStatus) && !"Ausgeliehen".equals(newStatus)) {
                closeHistory(shoe);
                // Produktion im Schuh leeren, da er ja zurück ist
                shoe.setCurrentProduction(null);
                shoe.setReturnDate(null);
            } else {
                // Sonst normale Daten Updates (z.B. Produktion ändern während Verleih)
                shoe.setCurrentProduction(shoeDetails.getCurrentProduction());
                shoe.setReturnDate(shoeDetails.getReturnDate());
            }

            // Stammdaten aktualisieren
            shoe.setShelfLocation(shoeDetails.getShelfLocation());
            shoe.setDescription(shoeDetails.getDescription()); // <--- BESCHREIBUNG
            shoe.setInventoryNumber(shoeDetails.getInventoryNumber());
            shoe.setType(shoeDetails.getType());
            shoe.setSize(shoeDetails.getSize());
            shoe.setStatus(newStatus);

            return ResponseEntity.ok(shoeRepository.save(shoe));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShoe(@PathVariable Long id) {
        return shoeRepository.findById(id).map(shoe -> {
            // 1. Zuerst die Historie löschen (Fix für Fehler 500)
            List<ShoeHistory> historyEntries = historyRepository.findByShoeIdOrderByRentedAtDesc(id);
            historyRepository.deleteAll(historyEntries);

            // 2. Dann den Schuh löschen
            shoeRepository.delete(shoe);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- BULK ACTIONS (Erweitert um Historie) ---

    @PostMapping("/bulk-rent")
    public ResponseEntity<?> bulkRent(@RequestBody Map<String, Object> payload) {
        List<Integer> ids = (List<Integer>) payload.get("shoeIds");
        String production = (String) payload.get("production");
        String dateStr = (String) payload.get("returnDate");
        LocalDate returnDate = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : null;

        for (Integer id : ids) {
            shoeRepository.findById(Long.valueOf(id)).ifPresent(shoe -> {
                // Nur wenn er noch nicht verliehen war, Historie schreiben
                if (!"Ausgeliehen".equals(shoe.getStatus())) {
                    ShoeHistory history = new ShoeHistory(shoe, production, LocalDate.now());
                    historyRepository.save(history);
                }

                shoe.setStatus("Ausgeliehen");
                shoe.setCurrentProduction(production);
                shoe.setReturnDate(returnDate);
                shoeRepository.save(shoe);
            });
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-return")
    public ResponseEntity<?> bulkReturn(@RequestBody List<Integer> ids) {
        for (Integer id : ids) {
            shoeRepository.findById(Long.valueOf(id)).ifPresent(shoe -> {
                if ("Ausgeliehen".equals(shoe.getStatus())) {
                    closeHistory(shoe);
                }
                shoe.setStatus("Verfügbar");
                shoe.setCurrentProduction(null);
                shoe.setReturnDate(null);
                shoeRepository.save(shoe);
            });
        }
        return ResponseEntity.ok().build();
    }

    // --- Helper Methode zum Schließen der Historie ---
    private void closeHistory(Shoe shoe) {
        Optional<ShoeHistory> openEntry = historyRepository.findByShoeIdAndReturnedAtIsNull(shoe.getId());
        if (openEntry.isPresent()) {
            ShoeHistory h = openEntry.get();
            h.setReturnedAt(LocalDate.now());
            historyRepository.save(h);
        }
    }

    // --- BILDER UPLOAD ---
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Shoe shoe = shoeRepository.findById(id).orElseThrow(() -> new RuntimeException("Schuh nicht gefunden"));
            shoe.setImageData(file.getBytes());
            shoe.setImageType(file.getContentType());
            shoeRepository.save(shoe);
            return ResponseEntity.ok("Bild gespeichert");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Fehler beim Upload");
        }
    }

    @GetMapping(value = "/{id}/image")
    public ResponseEntity<?> getImage(@PathVariable Long id) {
        return shoeRepository.findById(id)
                .map(shoe -> {
                    if (shoe.getImageData() == null) {
                        return ResponseEntity.notFound().build();
                    }
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(shoe.getImageType()))
                            .body(shoe.getImageData());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}