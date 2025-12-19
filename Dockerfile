# STUFE 1: Bauen (Build) mit vorinstalliertem Maven
# Wir nutzen ein Image, das Maven schon hat. Das löst das "mvnw"-Problem.
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Kopiere alles ins Image
COPY . .

# Bauen (nutzt das globale 'mvn' statt './mvnw')
RUN mvn clean package -DskipTests

# STUFE 2: Ausführen (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Wir holen uns die fertige .jar Datei aus Stufe 1
# Der Name der JAR kann variieren, wir nehmen einfach die erste, die wir finden
COPY --from=build /app/target/*.jar app.jar

# Port 8080 freigeben
EXPOSE 8080

# Startbefehl
ENTRYPOINT ["java","-jar","app.jar"]