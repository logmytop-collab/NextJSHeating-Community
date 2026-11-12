FROM node:25.9.0-slim 

RUN apt update 
RUN apt install python3 -y
RUN apt install python3-libgpiod -y

RUN apt-get update 
RUN apt-get install -y docker.io

RUN mkdir -p /app/logs/express

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# RUN chmod +x ./scripts/deploy.sh

# RUN chmod +x ~/pin.sh
# ENV PATH="$PATH"

# USER root

CMD ["npm", "run", "start"]


