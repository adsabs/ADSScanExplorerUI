# ADSScanExplorerUI

User interface for ADS Scan Explorer

## Configuration

Add a `.env.local` and add the following environment variables.

```
NEXT_PUBLIC_VARIANT=SCIX # SCIX or ADS
NEXT_PUBLIC_ADS_DEFAULT_URL=https://scixplorer.org # https://scixplorer.org or https://ui.adsabs.harvard.edu
```

Configure environment variables, ports and such in the `./docker/{environment}.yaml` files.

## Setup

Create the container and start the application by running docker compose with environment specific settings.

```
docker compose -f docker/docker-compose.yaml -f docker/{environment}.yaml up -d
```

## Tests

### Unit tests

Run unit tests

```
npm run test
```

Run unit test & get coverage report

```
npm run test:coverage
```

### End-to-end tests

Build and start the application

```
npm run build
npm run start:test
```

Run the tests

```
npm run test:e2e
```

## Pathing Mirador

When upgrading Mirador, please take note that we are applying a patch to remove some features that is not possible to remove by the configuration.
Upgrading Mirador may cause the patch to no longer function and will need to be re-created for the new version of Mirador.
