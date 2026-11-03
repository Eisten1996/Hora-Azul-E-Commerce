# =============================================================================
# Hora Azul Backend — imagen para Render / Koyeb (compila y ejecuta en JVM)
# Uso local: docker build -t hora-azul-api . && docker run -p 8080:8080 --env-file .env hora-azul-api
# =============================================================================

# --- Etapa 1: compilar con Maven ---------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

# Descargar dependencias en una capa propia para aprovechar la caché
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src src
RUN mvn -B -q package -DskipTests

# --- Etapa 2: imagen de ejecución --------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /deployments

COPY --from=build /build/target/quarkus-app/lib/ lib/
COPY --from=build /build/target/quarkus-app/*.jar ./
COPY --from=build /build/target/quarkus-app/app/ app/
COPY --from=build /build/target/quarkus-app/quarkus/ quarkus/

RUN useradd --system --uid 1001 quarkus
USER 1001

# Capa gratuita de 512 MB: limitar el heap al 70 % de la memoria del contenedor
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080

CMD ["sh", "-c", "exec java $JAVA_OPTS -Dquarkus.http.host=0.0.0.0 -jar /deployments/quarkus-run.jar"]
