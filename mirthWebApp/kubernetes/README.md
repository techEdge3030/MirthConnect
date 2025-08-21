# Local Environment (MacOS)
## 1. Docker Setup

Install Docker Desktop on MacOS

    https://docs.docker.com/desktop/install/mac-install/

Enable Kubernetes Cluster on Docker Desktop (Optional)
  - Open the Docker Dashboard and select "Settings."
  - Choose "Kubernetes" from the left sidebar.
  - Check the "Enable Kubernetes" checkbox.
  - Click "Apply & Restart" to save the settings and then select "Install" to confirm

## 2. Minikube Setup

1. Install Minikube via Homebrew by running the following commands in the Terminal:

        brew install minikube

2. Start your Minikube cluster with the following command:

        minikube start

3. Validate the setup by running:

        kubectl get nodes

4. Get Minikube IP address

        minikube ip # e.g. 192.168.49.2

5. Troubleshooting

    While using Docker Desktop, minikube ip address might not be reachable from the host.

    (Please note that `192.168.49.2` is still accessible inside pods but not reachable from the host.)

    This can even make the Kubernetes ingress controller not work.

    Run the below command to create a network route on the host to the service using the Minikube IP address as a gateway.

        minikube tunnel
    
    Now we can use `127.0.0.1` instead of `192.168.49.2` to access the cluster.

# Deployment

## 1. Environment Variables

API environment variables are defined in `client/Dockerfile` and `server/Dockerfile` for internal communication on Minikube.

  ```
  VITE_API_URL="http://mirth-api.saga-it.com"
  MIRTH_API_URL="https://nextgen-connect.saga-it.com"
  ```

By default, for local development (without Docker), use these environment variables in `.env` file.

  ```
  VITE_API_URL=http://localhost:8081 # custom backend server
  MIRTH_API_URL=http://localhost:8080 # mirthconnect server
  ```

## 2. Deploy Kubernetes Resources

Creates docker images for the React frontend app and the Node.js backend app.

  ```
  # bash
  cd ./client
  docker build -t mirth-webapp-frontend:<tag> .

  # bash
  cd ./server
  docker build -t mirth-webapp-backend:<tag> .
  ```

If the Docker image is in a local directory and you are using Minikube, you will have to load the image into Minikube like this:

  ```
  minikube image load mirth-webapp-frontend:<tag>
  minikube image load mirth-webapp-backend:<tag>
  ```

Note that MirthConnect server is running in HTTPS mode and we need to create local SSL certificates. React and Node.js apps are running in HTTP.

  ```
  openssl genrsa -out nextgen-connect-tls.key 2048
  openssl req -new -key nextgen-connect-tls.key -out nextgen-connect-tls.csr
  openssl x509 -req -in nextgen-connect-tls.csr -signkey nextgen-connect-tls.key -out nextgen-connect-tls.crt
  kubectl create secret tls nextgen-tls-secret --cert=nextgen-connect-tls.crt --key=nextgen-connect-tls.key
  ```

Run the below commands to deploy resources (deployment, ingress, service, etc.) on the cluster.

  ```
  # Deploys MirthConnect PostgreSQL DB resources
  kubectl apply -f nextgen-connect-db-pvc-box.yaml
  kubectl apply -f nextgen-connect-db-deployment.yaml
  kubectl apply -f nextgen-connect-db-service.yaml

  # Deploys MirthConnect server resources
  kubectl apply -f nextgen-connect-deployment.yaml
  kubectl apply -f nextgen-connect-service.yaml
  kubectl apply -f nextgen-connect-ingress.yaml

  # Deploys React frontend app resources
  kubectl apply -f frontend-deployment.yaml
  kubectl apply -f frontend-service.yaml
  kubectl apply -f frontend-ingress.yaml

  # Deploys Node.js backend app resources
  kubectl apply -f backend-deployment.yaml
  kubectl apply -f backend-service.yaml
  kubectl apply -f backend-ingress.yaml
  ```

Add the following entries to /etc/hosts for Kubernetes Ingress working.

  ```
  127.0.0.1       mirth.saga-it.com             # Frontend app
  127.0.0.1       mirth-api.saga-it.com         # Backend app
  192.168.49.2    nextgen-connect.saga-it.com   # MirthConnect server
  ```

  Since `192.168.49.2` is not directly reachable from the host, we used `minikube tunnel` command and added `127.0.0.1` to the hosts file instead.

  However, we're still using `192.168.49.2` for `nextgen-connect.saga-it.com` because it's called inside Kubernetes pod from the backend app.

  To summarize,
  - `http://mirth.saga-it.com` is accessed using the web browser.
  - `http://mirth-api.saga-it.com` is called from the web browser
  - `https://nextgen-connect.saga-it.com` is called from the Kubernetes pod

Finally, you can see the MirthConnect web application by visiting http://mirth.saga-it.com on your browser.

  ```
    Username: admin
    Password: admin
  ```