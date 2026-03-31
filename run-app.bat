@echo off
echo Starting Committees Management System...
echo Application will be available at: http://localhost:8080
echo Swagger UI will be available at: http://localhost:8080/swagger-ui.html
echo Press Ctrl+C to stop the application
echo.
.\mvnw.cmd spring-boot:run
echo.
echo Application has stopped.
pause