package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import prüfen
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class ShoeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shoe_id")
    @JsonIgnore // <--- DAS IST ENTSCHEIDEND! Verhindert Endlosschleifen.
    private Shoe shoe;

    private String production;
    private LocalDate rentedAt;
    private LocalDate returnedAt;

    public ShoeHistory() {}

    public ShoeHistory(Shoe shoe, String production, LocalDate rentedAt) {
        this.shoe = shoe;
        this.production = production;
        this.rentedAt = rentedAt;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Shoe getShoe() { return shoe; }
    public void setShoe(Shoe shoe) { this.shoe = shoe; }
    public String getProduction() { return production; }
    public void setProduction(String production) { this.production = production; }
    public LocalDate getRentedAt() { return rentedAt; }
    public void setRentedAt(LocalDate rentedAt) { this.rentedAt = rentedAt; }
    public LocalDate getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDate returnedAt) { this.returnedAt = returnedAt; }
}