# utils.py

import aioredis

REDIS_URL = "redis://localhost:6379/0"


async def get_redis():
    redis = await aioredis.create_redis_pool(REDIS_URL)
    yield redis
    redis.close()
    await redis.wait_closed()


def build_template_path(category: str, template_name: str) -> str:
    return f"pages/{category}/{template_name}"


# Database
