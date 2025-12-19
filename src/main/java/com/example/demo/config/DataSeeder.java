package com.example.demo.config;

import com.example.demo.repository.ShoeHistoryRepository;
import com.example.demo.repository.ShoeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ShoeRepository shoeRepository;
    private final ShoeHistoryRepository historyRepository;

    public DataSeeder(ShoeRepository shoeRepository, ShoeHistoryRepository historyRepository) {
        this.shoeRepository = shoeRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🧹 STARTE REINIGUNG...");

        // 1. Erst die Historie löschen (wegen Fremdschlüssel-Verknüpfungen!)
        historyRepository.deleteAll();

        // 2. Dann die Schuhe löschen
        shoeRepository.deleteAll();

        System.out.println("✨ Alles gelöscht! Die Datenbank ist leer.");
    }
}