#!/bin/bash
cd "$(dirname "$0")"
mvn clean compile -q && mvn exec:java -Dexec.mainClass="com.portfolio.backend.util.GeminiHealthCheck" -q
