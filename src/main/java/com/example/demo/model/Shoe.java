package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty; // Wichtig für explizite Benennung

@Entity
public class Shoe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inventoryNumber;
    private String type;
    private String size;
    private String status;
    private String shelfLocation;

    private String currentProduction;
    private LocalDate returnDate;

    // --- BILDER DATEN ---
    @Lob
    @Column(length = 10000000)
    private byte[] imageData; // Hier KEIN @JsonIgnore mehr, wir machen es unten am Getter

    private String imageType;

    @Column(length = 2000)
    private String description;

    public Shoe() {
    }

    // --- GETTERS & SETTERS ---

    // --- WICHTIG: Das "virtuelle" Feld für das Frontend ---
    @JsonProperty("hasImage") // Erzwingt, dass das Feld im JSON "hasImage" heißt
    public boolean getHasImage() {
        return imageData != null && imageData.length > 0;
    }

    // --- WICHTIG: Hier das @JsonIgnore hin! ---
    // Damit verhindern wir sicher, dass das riesige Bild in der Liste landet
    @JsonIgnore
    public byte[] getImageData() { return imageData; }

    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    // ... Restliche Getter/Setter (unverändert) ...
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getShelfLocation() { return shelfLocation; }
    public void setShelfLocation(String shelfLocation) { this.shelfLocation = shelfLocation; }
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
    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}