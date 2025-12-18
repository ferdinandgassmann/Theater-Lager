# Aufgabenstellung: Web-Inventar für Theaterschuhe

## 1. Einleitung & Hintergrund

### Ausgangssituation
> „Und zwar habe ich folgende Situation. Meine Freundin arbeitet im Theater als Marschschuhmacherin und die haben da ein relativ großes Lager mit ganz vielen Schuhen, die aus alten Theaterstücken sind und Zeug, was man natürlich auch wiederverwerten kann. Und die hat mich heute gefragt, meine Freundin, was man da machen könnte, ob man irgendwie ein System dafür macht, wo man das Ganze protokollieren kann, aufnehmen kann, kategorisieren kann, um das irgendwie übersichtlich zu gestalten. Und ich wollte dich mal fragen, was da so die smarteste Weg wäre, da irgendwie was aufzubauen oder was es da gibt.“

### Problembeschreibung
In einem Theater existiert ein umfangreiches Lager mit Schuhen aus vergangenen Produktionen. Diese Schuhe unterscheiden sich in Größe, Typ, Material, Epoche, Zustand und Verwendungszweck. Aktuell existiert kein zentrales digitales System zur Erfassung, Verwaltung und Wiederauffindung dieser Bestände.

### Projektziel
Entwicklung eines internen webbasierten Systems zur strukturierten Verwaltung dieses Schuhlagers. Das System wird primär von einer einzelnen Schuhmacherin genutzt und soll den Arbeitsalltag vereinfachen.

**Das System soll:**
* Den gesamten Schuhbestand digital abbilden.
* Eine schnelle Suche nach passenden Schuhen ermöglichen.
* Den aktuellen Status einzelner Schuhe transparent machen.
* Die Wiederverwendung von Schuhen in neuen Produktionen unterstützen.

*Hinweis: Es handelt sich nicht um ein kaufmännisches oder öffentliches System, sondern um ein internes Arbeitswerkzeug.*

---

## 2. Systemgrenzen & Benutzer

### Das System umfasst ausschließlich:
* Verwaltung von Schuhen
* Verwaltung einfacher Benutzerzugänge
* Dokumentation von Status und Nutzung

### Nicht Bestandteil des Systems sind:
* Finanz- oder Abrechnungssysteme
* Automatische Bestellprozesse
* Externe Schnittstellen
* Mobile Apps

### Benutzerrollen

**1. Schuhmacherin**
* Schuhe anlegen, bearbeiten und löschen
* Fotos hochladen
* Status ändern
* Schuhe Produktionen zuordnen

**2. Administrator**
* Alle Rechte der Schuhmacherin
* Benutzer verwalten
* Kategorien pflegen
* Systemweite Einstellungen ändern

---

## 3. Funktionale Anforderungen

### Benutzerverwaltung
Das System muss einen geschützten Zugang besitzen.
* Anmeldung via Benutzername und Passwort.
* Passwörter dürfen **nicht** im Klartext gespeichert werden (Hashing).
* Nicht eingeloggte Nutzer haben keinen Zugriff.
* Mindestens eine Rolle mit administrativen Rechten.

### Inventarobjekt: Schuh
Ein Schuh (oder Paar) ist das zentrale Objekt.

**Pflicht-Attribute:**
* Eindeutige Inventarnummer
* Schuhart
* Größe (sinnvoll eingeschränkt)
* Farbe
* Material
* Epoche oder Stil
* Zustand
* Lagerort
* Freitext Beschreibung

**Optionale Attribute:**
* Geschlecht (oder neutral)
* Besondere Anpassungen
* Anmerkungen

### Anlegen und Bearbeiten
* CRUD-Operationen (Create, Read, Update, Delete) für Schuhe.
* Validierung der Eingaben (Pflichtfelder nicht leer).

### Fotoverwaltung
* Upload von einer oder mehreren Bilddateien pro Schuh.
* Anzeige in der Detailansicht.
* Technische Trennung von Bilddaten und Metadaten.

### Statusverwaltung
Jeder Schuh hat einen sichtbaren Status. Änderungen sollen nachvollziehbar sein.

**Statuswerte:**
1.  Verfügbar
2.  Ausgeliehen
3.  In Reparatur
4.  Ausgemustert

*(Optional: Speicherung einer Status-Historie)*

### Produktions- und Ausleihverwaltung
Zuordnung von Schuhen zu einer Produktion. Ein Schuh kann nicht mehrfach gleichzeitig ausgeliehen sein.

**Gespeicherte Daten:**
* Name der Produktion
* Verantwortliche Person
* Ausleihdatum
* Geplantes Rückgabedatum

### Suche und Filter
Effiziente Suche und Filterung, auch bei wachsendem Bestand.
* Freitextsuche
* Filter nach: Größe, Farbe, Epoche, Zustand
* Kombination mehrerer Filter
* Sortierung der Ergebnisse

### Ansichten
1.  **Übersicht:** Liste aller Schuhe, Filter/Suche, Statusanzeige.
2.  **Detailansicht:** Alle Attribute, Fotos, Status, zugeordnete Produktion.

---

## 4. Nicht-funktionale Anforderungen

* **Benutzbarkeit:** Intuitive Oberfläche, keine technische Schulung notwendig.
* **Performance:** Schnelle Suche und Ladezeiten.
* **Zuverlässigkeit:** Persistente Datenspeicherung, Fehlertoleranz bei Eingaben.
* **Wartbarkeit:** Modularer Code, einfache Erweiterbarkeit.
* **Sicherheit:** Autorisierter Zugriff, Schutz vor einfachen Angriffen, Eingabevalidierung.
* **Architektur:** Client-Server, Trennung von Frontend/Backend/DB, HTTP-Schnittstelle.

### Optionale Erweiterungen (Zukunftsmusik)
* Statistische Auswertungen (z. B. häufig genutzte Größen).
* QR-Code Anbindung (Scannen der Inventarnummer).
* Mehrsprachigkeit.
* Audit Log.

---

## 5. Umsetzung Version 1 (MVP)

Dies dient als Lernprojekt und Experimentierumgebung.

### Backend (Spring Boot + PostgreSQL)
* **User Management:** Login/Logout, Passwort-Hashing, Rollen (Admin/User).
* **Schuh Inventar:** CRUD-Operationen mit allen Pflichtfeldern.
* **Statusverwaltung:** Änderung der 4 Statuswerte.
* **Fotoverwaltung:** Upload, Pfad-Speicherung in DB, Anzeige.
* **Suche & Filter:** Freitext + Attribut-Filter (kombinierbar).
* **API:** REST Endpoints für alle Aktionen.

### Frontend (React)
* **Login Seite:** Formular für Auth.
* **Übersichtsseite:** Liste, Filter, Suche, Statusanzeige.
* **Detailseite:** Alle Infos, Fotos, Statusänderung, Leih-Info.
* **Formulare:** Anlegen/Bearbeiten, Foto-Upload.
* **Layout:** Responsive (Mobile First).

### Projektstruktur V1

```text
theater-shoe-backend/
├── src/main/java/com/theatershoe/
│   ├── controller/          # REST Controller
│   ├── service/             # Geschäftslogik
│   ├── repository/          # Datenbankzugriff (JPA Repositories)
│   ├── model/               # Entities (Schuh, User, Status)
│   ├── security/            # Authentifizierung / JWT oder Session
│   └── TheaterShoeApplication.java  # Main Klasse
├── src/main/resources/
│   ├── application.properties  # DB Verbindung, Port etc.
│   └── static/                 # optional statische Ressourcen
└── pom.xml                     # Maven Dependencies

theater-shoe-frontend/
├── public/                # index.html, favicon, statische Dateien
├── src/
│   ├── components/        # Wiederverwendbare UI Komponenten
│   │   ├── ShoeList.js
│   │   ├── ShoeDetail.js
│   │   ├── ShoeForm.js
│   │   └── LoginForm.js
│   ├── pages/             # Seiten / Routen
│   │   ├── Dashboard.js
│   │   ├── ShoePage.js
│   │   └── LoginPage.js
│   ├── services/          # API Calls (fetch/axios)
│   ├── App.js             # Hauptkomponente, Router
│   └── index.js           # Einstiegspunkt React
├── package.json
└── tailwind.config.js     # falls Tailwind CSS verwendet wird