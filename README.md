# Social Distance Workouts - Find places to workout away from people

This app's idea looks towards a bittersweet future where we might still need to distnce ourselves from other people during our free time. And that includes when we work out. Imagine going out for a jog and having to come into close contact with other people who had the same idea, and unfortunately went to the same nice park at the same time as you. If only you could have known!

This is where SDW comes into play. Be able to take a quick glance of your city and know exactly where people are planning to go cycling, jogging, swimming. And avoid those areas! Want to contribute to the platform and mark an area where you're going to be minding your business? You can do that aswell. Bonus points, people will also avoid you now that they know wherein you plan to workout. Everyone wins.

Follow our development closely, we plan to participate in the EUvsVirus hackathon.

## Architecture Overview

The host's apache acts as an **SSL termination**, and all intra-host communication is performed safe from outside interference and with unencrypted HTTP sockets.

All configuration parameters can be adapted using the provided `.env.sample file`.

# Deployment Instructions

## Step by Step

To deploy the platform to a new server, first make sure you have installed all of the required software in the section `Required software on Host`.

1. Clone the repository to a folder. It is suggested to use `/opt/docker/<folder>` for this purpose.
1. Copy the `.env.sample` file at the root of the folder to `.env`. Ignore other `.env.sample` files inside `vuetify` folder.
1. Configure the new `.env` file to your needs.
1. Create a new Apache2 VirtualHost based off the `apache.vhost.conf` file in the root folder. Configure this host with proper SSL certificates and adapt to your needs. Make sure the domains and ports in the virtualhost configuration match with the `.env` file you previously configured.
1. Enable apache modules listed below and restart Apache service.
1. Open port `80` and `443` on the server's firewall.
1. At the root folder. run the command `docker-compose up`
1. The Vuetify container will build the compiled files into `./dist`, this folder can now be served by the host's apache.
1. The setup is complete. The container will autohalt.

### Required software on Host

Recomended deployment platform is any VPS with a preinstalled and managed deployment of DockerCE (For example DigitalOcean's `Docker` Droplet)

1. Docker-CE
2. Docker-Composer
3. Apache2 (mod_headers + mod_proxy + mod_ssl + mod_rewrite)
    1. `a2enmod proxy`
    2. `a2enmod rewrite`
    3. `a2enmod ssl`
    4. `a2enmod proxy_http`

HTTPS Certificates can be obtained throuh letsencrypt `certbot-auto` software.

## Development Instructions

### For frontend development

**Requirements**
- NodeJS 10 LTS

**Setup steps**
1. Open `vuetify` folder in VSCode.
1. Copy `.env.sample` to `.env`
1. Edit values in `.env` file to point to a server that is running the backend service.
1. Run `npm run serve` to start the local testing environment in order to start development of the frontend. HMR is enabled so there is no need to refresh the browser on code changes.
