# OpenQ-CoinAPI

The OpenQ-CoinAPI provides realtime token prices from CoinGecko.

It uses a Redis cache to lower our API usage and provide faster results

## Getting Started

### Boot Redis

The easiest way to boot Redis locally is with Docker.

```bash
docker run --name redis -d -p 6379:6379 redis:6.2.6-alpine
```


### Update OpenQ-CoinAPI .env

Set the `REDIS_URL` environment variable to `localhost` in `.env`

```bash
REDIS_URL=localhost
```

### Boot OpenQ-CoinAPI

```bash
yarn start:dev
```