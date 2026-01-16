@echo off
echo Starting Hyper AI News...
cd /d D:\antigravity_projects\playground\hyper-ai-news
echo.
echo Please ensure your phone is connected to the same Wi-Fi.
echo Local Address: http://localhost:3000
echo Network Address (for phone): http://192.168.8.140:3000
echo.
npm run dev -- -p 3000
pause
