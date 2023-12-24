import os

from pydantic_settings import BaseSettings
from dotenv import dotenv_values


class DevelopmentSettings(BaseSettings):
    app_name: str = "My App (dev)"
    db_port: int
    db_host: str
    db_user: str
    db_password: str
    db_database: str

    class Config:
        env_prefix = "APP"


class ProductionSettings(BaseSettings):
    app_name: str = "My App (prod)"
    db_port: int
    db_host: str
    db_user: str
    db_password: str
    db_database: str

    class Config:
        env_prefix = "APP"


def get_settings():
    env = os.getenv("APP_ENV")
    env_values = dotenv_values(".env")
    if env == "development":
        return DevelopmentSettings(
            db_host=env_values.get("DB_DEV_HOST"),
            db_user=env_values.get("DB_DEV_USER"),
            db_port=env_values.get("DB_DEV_PORT"),
            db_password=env_values.get("DB_DEV_PASSWORD"),
            db_database=env_values.get("DB_DEV_DATABASE"),
        )
    elif env == "production":
        return ProductionSettings(
            db_host=env_values.get("DB_PROD_HOST"),
            db_user=env_values.get("DB_PROD_USER"),
            db_port=env_values.get("DB_PROD_PORT"),
            db_password=env_values.get("DB_PROD_PASSWORD"),
            db_database=env_values.get("DB_PROD_DATABASE"),
        )
    else:
        raise ValueError(f"Entorno desconocido: {env}")
