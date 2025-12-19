# STUFE 1: Bauen (Build)
# Wir nutzen ein Image mit Java 17 und Maven
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Wir kopieren erst nur die Projekt-Dateien
COPY . .

# Wir geben dem Maven-Wrapper Ausführrechte (wichtig für Linux/Cloud)
RUN chmod +x mvnw

# Wir bauen das Projekt (und überspringen Tests, damit es schneller geht)
RUN ./mvnw clean package -DskipTests

# STUFE 2: Ausführen (Run)
# Wir nehmen ein schlankes Image nur zum Ausführen
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Wir holen uns die fertige .jar Datei aus Stufe 1
COPY --from=build /app/target/*.jar app.jar

# Port 8080 freigeben
EXPOSE 8080

# Startbefehl
ENTRYPOINT ["java","-jar","app.jar"]