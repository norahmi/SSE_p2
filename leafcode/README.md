# LeafCode

## Development Instructions

This directory contains the LeafCode application code. It is made with Next.js App Router and thus combines both server and client code (frontend and backend) in the same project. To develop the project locally, a PostgreSQL database is required. The `docker-compose.yml` of the parent directory can be used (`docker-compose -f ../docker-compose.yml up`) in a dedicated terminal to start a development database, with username `leafcode`, password `leafcode`, and database name `leafcode`. The Compose stack also includes Adminer, a web-based database management tool that can be accessed at [http://localhost:8080](http://localhost:8080) with the same credentials.

The `.env.example` file in this directory contains environment variables needed for the application. The file should be copied to `.env` and the values should be updated as needed. For local development, the default values should work fine, but it is recommended to update the `BETTER_AUTH_SECRET` variable to a random string for security reasons. **NEVER** commit the `.env` file to version control, or put sensitive values in `.env.example`.

Install the required dependencies by running:
```bash
npm install
```

Once the dependencies are installed, migrate the database and generate the Prisma client by running:
```bash
npx prisma migrate dev # or npm run prisma:migrate
npx prisma generate # or npm run prisma:generate
```

Finally, start the development server by running:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).