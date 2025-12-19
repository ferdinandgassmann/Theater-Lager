package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Shoe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inventoryNumber;
    private String type;
    private String size;
    private String status; // "Verfügbar", "Ausgeliehen", "In Reparatur", "Ausgemustert"

    // Infos für den Verleih
    private String currentProduction;
    private LocalDate returnDate;

    // --- NEU: BILDER DATEN ---
    @Lob // Sagt der Datenbank: Das ist ein "Large Object" (große Datei)
    @Column(length = 10000000) // Reserviert genug Platz
    private byte[] imageData;

    private String imageType; // z.B. "image/jpeg" oder "image/png"

    public Shoe() {
    }

    // --- GETTERS & SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInventoryNumber() { return inventoryNumber; }
    public void setInventoryNumber(String inventoryNumber) { this.inventoryNumber = inventoryNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentProduction() { return currentProduction; }
    public void setCurrentProduction(String currentProduction) { this.currentProduction = currentProduction; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    // --- NEU: GETTER/SETTER FÜR BILDER ---
    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}