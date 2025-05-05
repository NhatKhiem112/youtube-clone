@echo off
echo Khoi dong ung dung Youtube Clone (phien ban sua loi OpenSSL)...
echo.

REM Cac bien moi truong cua Node.js
REM Sau phien ban Node.js 17, cac thu vien duong cu duoc tat
REM OpenSSL la thu vien ma hoa, rat quan trong cho npm/SSL
REM Bat che do su dung thu vien cu, nhu Node 16
set NODE_OPTIONS=--max-old-space-size=4096 --openssl-legacy-provider

REM Tat source map de giam tieu thu bo nho
set GENERATE_SOURCEMAP=false

REM Su dung polling thay vi theo doi file truc tiep
set CHOKIDAR_USEPOLLING=true
set CHOKIDAR_IGNOREINITIAL=true

echo Khoi dong frontend...
node ./start.js

REM Neu van bi loi, ban co the them dong sau vao bat dau cua file .env (hoac tao moi):
REM OPENSSL_CONF=openssl_fix

pause 