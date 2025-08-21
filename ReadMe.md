MC-Proxy-Allow-Http & Mirth Web App
This repository contains the necessary files and instructions to run the Mirth Connect web application with a proxy that allows HTTP traffic.

🚀 How to Run
There are two ways to launch the application.
Option 1: Run Both Simultaneously
This method runs both the server and the client concurrently.
Navigate to the project directory:
```
cd MC-Proxy-Allow-Http
./mcserver
cd ..
cd mirthWebApp
```

Start the application:
```
npm run dev
```
Option 2: Run Server and Client Separately
This method involves running the backend server and the frontend client in separate terminals.
Start the Server:
```
cd server
npm run dev
```
In a new terminal, start the Client:
```
cd client
npm run dev
```
🔑 Credentials
Use the following credentials to log in to the application:
```
Username: admin
Password: admin
```
🛠️ Troubleshooting
If the application crashes or the port is already in use, you may need to manually free it up.
Find the process ID (PID) using port 8080:
```
sudo lsof -nP -iTCP:8080 -sTCP:LISTEN
```
Terminate the process using its PID (replace PID with the number you found in the previous step):
``` 
sudo kill -9 <PID>
```
⚙️ Configuration & Prerequisites
Mirth Admin Launcher
You will need the Mirth Connect Administrator Launcher, which is a Java GUI Desktop App, to manage the Mirth Connect server.
Download Here
```
https://github.com/nextgenhealthcare/connect/releases
```
Enabling HTTP API Access
To allow the proxy to communicate with the Mirth Connect server via HTTP, you must modify the configuration file.
Locate the configuration file at 
"Mirth Connect/conf/mirth.properties"

Change the following property to true:
```
server.api.allowhttp = true
```
Note: A customized version of this file is already included in this repository.
📡 Network Analysis with Wireshark
To monitor and analyze the HTTP traffic between the proxy and the Mirth Connect server, you can use Wireshark.
Host: localhost:8000
Wireshark Filter: Use the following filter to capture relevant packets on port 8080.
```
tcp.port == 8080 or udp.port == 8080
```
