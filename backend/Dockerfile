FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -g 10001 -S ricebowl \
    && adduser -u 10001 -S ricebowl -G ricebowl \
    && mkdir -p /data/uploads \
    && chown -R ricebowl:ricebowl /data/uploads
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
USER ricebowl
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
