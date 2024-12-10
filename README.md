# A simple Shop API

This is a simple Shop API. The core features are:

-   authorization by email and password;
-   implemented Postmark email service for user verification;
-   using access and refresh tokens;
-   implemented RoleGuard;
-   implemented ExeptionFilter;
-   implemented IsExisMiddleware;
-   created 4 main tables: Users, Products, Orders, Order Details;
-   allowed CRUD operations with Products, pagination, filter Products by name, sorting Products from Low to Heigh and from Heigh to Low;
-   allowed CRUD operartions with Orders, pagination, filter orders by users email.

## Technologies

NestJS, Prisma ORM, Postmark, Postgresql, Docker.

## Base URL

http://localhost:3030/

## Run instructios

Install dependencies

```bash
  yarn
```

Run Docker

```bash
  docker-compose up -d
```

Run local server

```bash
  yarn start:dev
```
