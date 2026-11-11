# NextJSHeating-Community
NextJS heating solution with mqtt, Zigbee2mqtt, mariadb, caddy, docker, raspberry 

A modern web application for monitoring and managing heating systems, built with Next.js, mqtt, Zigbee2mqtt, mariadb, caddy, docker, raspberry.

## Features

- Modern responsive web interface
- Almost Real-time heating data visualization
- Configuration management
- REST API backend integration
- User authentication and authorization
- Mobile-friendly design
- utilising raspberry pi 5 as server and controller of the heating strangs

## Technology Stack

- Next.js
- React
- TypeScript
- Node.js
- Tailwind CSS
- REST APIs
- MQTT
- Docker
- JWT
- Mariadb
- Caddy
- Zigbee2mqtt

## Getting Started
on a frech installed Ubuntu 24 on a Raspberry PI 5 and 
a Zigbee adapter (SONOFF Zigbee 3.0 USB Dongle Plus | ZBDongle-E × 1) 
plus SONOFF SNZB-02D Zigbee Temperature and Humidity Sensor,

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Docker

### Installation

install ssh on ubuntu

```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo ufw allow 22/tcp
```
install Docker

```bash
// get curl to download something
sudo apt install curl
// get docker
curl -fsSL https://get.docker.com -o get-docker.sh
// execute install script
sudo sh get-docker.sh
// give docker root priviledges 
sudo usermod -aG docker $USER
// just update
sudo apt update
sudo apt upgrade
```
Clone the repository:

```bash
git clone https://github.com/logmytop-collab/NextJSHeating-Community.git
cd NextJSHeating-Community
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

Open your browser:

```
http://localhost:3000
```

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

The application can be deployed on:

- Docker on Ubuntu Server

Example Docker build:

```bash
docker build -t nextjsheating .
docker run -p 3000:3000 nextjsheating
```

## Configuration

Application settings are managed using environment variables.

Example:

```env
API_URL=https://api.example.com
JWT_SECRET=your-secret
```

## Project Structure

```text
./
├── caddy/
├── frontendjs/
├── mariadb_conf/
├── mqtt/
├── server_api/
└── zigbee2mqtt/
docker-compose.myl
```
## Support the Project

If you find this project useful, please consider:

- Starring the repository
- Reporting bugs and suggesting improvements
- Contributing code or documentation
- Supporting ongoing development with a donation

☕ Buy me a coffee: https://buymeacoffee.com/yourname

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## Issues

If you find a bug or have a feature request, please open an Issue in GitHub.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk.
