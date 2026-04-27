@echo off
setlocal
cd /d "%~dp0"
"C:\Program Files\Java\jdk-21\bin\java.exe" -cp "server-bin" FrontendProxyServer
