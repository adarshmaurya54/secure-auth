import Redis from "ioredis";

export const redis =
  new Redis(
    process.env.REDIS_URL!
  );

redis.on(
  "connect",
  () => {
    console.log(
      "Connected to Redis successfully"
    );
  }
);

redis.on(
  "error",
  (err) => {
    console.error(
      "Redis Client Error:",
      err
    );
  }
);