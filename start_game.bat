@echo off
cd /d "%~dp0"

REM Поднимаем сервер в отдельном окне
start "pigeon_game_server" cmd /c "npx serve . -l 3000"

REM Небольшая пауза, чтобы сервер успел стартовать
timeout /t 2 /nobreak >nul

REM Открываем сразу страницу игры
start "" "http://localhost:3000/main.html"