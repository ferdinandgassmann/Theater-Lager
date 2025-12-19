package com.example.demo.config;

import com.example.demo.model.Shoe;
import com.example.demo.repository.ShoeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ShoeRepository shoeRepository;

    public DataSeeder(ShoeRepository shoeRepository) {
        this.shoeRepository = shoeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Nur generieren, wenn weniger als 10 Schuhe da sind (damit wir nicht alles doppelt machen)
        if (shoeRepository.count() < 10) {
            System.out.println("🌱 Datenbank ist leer. Generiere Test-Daten...");
            generateDummyShoes();
            System.out.println("✅ 50 Test-Schuhe wurden angelegt!");
        }
    }

    private void generateDummyShoes() {
        List<String> types = Arrays.asList(
                "Marschstiefel", "Pumps", "Barockschuhe", "Römersandalen",
                "Sneakers", "Ballettschuhe", "Reitstiefel", "Gamaschen"
        );

        List<String> productions = Arrays.asList(
                "Zauberflöte", "Jedermann", "Hänsel und Gretel", "Faust", "Romeo & Julia"
        );

        Random random = new Random();

        for (int i = 1; i <= 50; i++) {
            Shoe shoe = new Shoe();

            // Inventarnummer hochzählen (T-101, T-102...)
            shoe.setInventoryNumber("T-" + (1000 + i));

            // Zufälliger Typ
            shoe.setType(types.get(random.nextInt(types.size())));

            // Zufällige Größe (36 - 46)
            shoe.setSize(String.valueOf(36 + random.nextInt(11)));

            // Zufälliger Status
            int statusRoll = random.nextInt(100);
            if (statusRoll < 60) {
                // 60% Verfügbar
                shoe.setStatus("Verfügbar");
            } else if (statusRoll < 85) {
                // 25% Verliehen
                shoe.setStatus("Ausgeliehen");
                shoe.setCurrentProduction(productions.get(random.nextInt(productions.size())));
                shoe.setReturnDate(LocalDate.now().plusDays(random.nextInt(30) + 5));
            } else if (statusRoll < 95) {
                // 10% Reparatur
                shoe.setStatus("In Reparatur");
            } else {
                // 5% Ausgemustert
                shoe.setStatus("Ausgemustert");
            }

            shoeRepository.save(shoe);
        }
    }
}