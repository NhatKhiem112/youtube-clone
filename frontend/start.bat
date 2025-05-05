@echo off
echo Khoi dong ung dung YouTube Clone Frontend...

REM Fix OpenSSL error and increase memory allocation
set NODE_OPTIONS=--max-old-space-size=4096 --openssl-legacy-provider

REM Check for .env file
if not exist .env (
  echo WARNING: .env file not found, creating with default settings...
  echo REACT_APP_API_URL=http://localhost:8080 > .env
  echo GENERATE_SOURCEMAP=false >> .env
  echo OPENSSL_CONF=openssl_fix >> .env
)

REM Start the application
REM For Windows 8.1+
echo Khoi dong server...
npx react-scripts start

pause 