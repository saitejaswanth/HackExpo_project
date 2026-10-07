# CampusHub (React + Spring Boot + JDBC)

## Backend (Java 17, Maven)
    cd backend
    mvn spring-boot:run
API runs on http://localhost:8080/api. Tables and demo data are created from schema.sql / data.sql (H2 file DB, console at /h2-console).
To use MySQL: add the mysql-connector-j dependency in pom.xml and edit application.properties.

## Frontend (Node 18+)
    cd frontend
    npm install
    npm run dev
Open the URL Vite prints. API URL is set in frontend/.env (VITE_API).
For Netlify, set VITE_API to your deployed backend URL (https) before `npm run build`.

## Demo logins
faculty / faculty123 · management / admin123 · student A101 / student123
