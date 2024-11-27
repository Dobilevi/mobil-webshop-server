
# Mongo DB server

## Create the server for the first time

sudo docker build -t mobil_webshop_mongo_image .

sudo docker run -it --name mobil_webshop_mongo_container -p 6000:27017 mobil_webshop_mongo_image

sudo docker start mobil_webshop_mongo_container

## Restart after stop

sudo docker restart mobil_webshop_mongo_container

# General

nvm use 18

# Server

cd server

npm install

npm run build

npm run start

### Admin access:

E-Mail: admin@mobilwebshop.com

Password: admin

### User access:

E-Mail: ivan@test.com

Password: password

# Registration

Password needs to be at least 8 characters long.
