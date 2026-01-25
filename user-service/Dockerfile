# --- Step 1: Build file JAR with Maven ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy all source code into container
COPY . .

# Run build (skip test to speed up)
RUN mvn clean package -DskipTests

# --- Step 2: Run ---
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy created JAR file from step 1 (build) to this step
# --from=build: Take from the step named "build" above
# target/*.jar: Take JAR file in the target directory
COPY --from=build /app/target/*.jar app.jar

# Run cmd
ENTRYPOINT ["java", "-jar", "app.jar"]