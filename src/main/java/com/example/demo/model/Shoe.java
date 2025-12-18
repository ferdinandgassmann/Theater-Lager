package com.example.demo.model; // oder com.theatershoe.model

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "shoes")
public class Shoe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Eindeutige Nummer im Lager
    @Column(unique = true, nullable = false)
    private String inventoryNumber;

    private String type;        // z.B. Marschschuh, Stiefel
    private String size;        // String, da manchmal "42.5" oder "S/M"
    private String color;
    private String material;
    private String era;         // Epoche
    private String condition;   // Neu, Gebraucht, Kaputt

    // Das Bild wird direkt in der DB gespeichert
    @Lob
    private byte[] image;

    // Status: VERFÜGBAR, AUSGELIEHEN, etc.
    private String status;

    // Für Ausleihe
    private String currentProduction;
    private LocalDate returnDate;

    // Leerer Konstruktor (braucht JPA)
    public Shoe() {
    }

    // Konstruktor für einfaches Anlegen
    public Shoe(String inventoryNumber, String type, String size, String status) {
        this.inventoryNumber = inventoryNumber;
        this.type = type;
        this.size = size;
        this.status = status;
    }

    // --- Getter und Setter ---
    // (In IntelliJ: Rechtsklick -> Generate -> Getter and Setter -> Alle auswählen)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInventoryNumber() { return inventoryNumber; }
    public void setInventoryNumber(String inventoryNumber) { this.inventoryNumber = inventoryNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public byte[] getImage() { return image; }
    public void setImage(byte[] image) { this.image = image; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentProduction() { return currentProduction; }
    public void setCurrentProduction(String currentProduction) { this.currentProduction = currentProduction; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
}