<!-- PROJECT LOGO -->
<br />
<p align="left">
  <img src="https://www.livescale.tv/wp-content/uploads/2020/11/Livescale-Horizontal-Logo-1.png" alt="Livescale Logo">
</p>

<!-- GETTING STARTED -->

## Getting Started

This repository is an example based on the [Livescale Shopping OpenAPI ](https://github.com/livescale/open-api) for SFCC Headless Commerce API.

The be able to run the server an **.env** file needs to be created with those credentials:

```plainText
NODE_ENV=staging
PORT=3444

# This should contain your MongoDB URL
DB_URL=mongodb://user:password@localhost:27017/db_name?authSource=admin

# This section should contain your SFCC API Credentials
CLIENT_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
CLIENT_PASSWORD=xxxxxxxxxxxxx
ORGANIZATION_ID=f_ecom_xxxx_001
TENANT=xxxx_001
SHORT_CODE=xxxxxxxx
SITE_ID=livescale-staging
```

## Usage

```sh
npm install
npm start
```
