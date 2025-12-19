# STUFE 1: Bauen (Build)
# WICHTIG: Wir nutzen jetzt das Image für Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Kopiere alles ins Image
COPY . .

# Bauen
RUN mvn clean package -DskipTests

# STUFE 2: Ausführen (Run)
# Auch hier brauchen wir die Laufzeitumgebung für Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Wir holen uns die fertige .jar Datei aus Stufe 1
COPY --from=build /app/target/*.jar app.jar

# Port 8080 freigeben
EXPOSE 8080

# Startbefehl
ENTRYPOINT ["java","-jar","app.jar"]