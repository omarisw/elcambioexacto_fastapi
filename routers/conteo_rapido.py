import ipdb
from fastapi import APIRouter, Request, HTTPException, Depends, Form
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates

# from decouple import config
import mysql.connector
import logging
import json

# utils
from utils import build_template_path
from utils import get_redis
import aioredis

from config import get_settings

router = APIRouter()

REDIS_URL = "redis://localhost:6379/0"

templates = Jinja2Templates(directory="templates")

settings = get_settings()
db_config = {
    "host": settings.db_host,
    "user": settings.db_user,
    "port": settings.db_port,
    "password": settings.db_password,
    "database": settings.db_database,
}

CATEGORIES = [
    {"id": 1, "name": "Lácteos", "color": "0489B1", "color_class": "blue"},
    {"id": 2, "name": "Verduras", "color": "04B404", "color_class": "green"},
    {"id": 3, "name": "Frutas", "color": "B40404", "color_class": "red"},
    {"id": 4, "name": "Granos y cereales",
        "color": "DF7401", "color_class": "orange"},
    {"id": 5, "name": "Carnes", "color": "8904B1", "color_class": "purple"},
    {"id": 6, "name": "Grasas", "color": "FFEB00", "color_class": "yellow"},
    {"id": 7, "name": "Lista de puntos extra",
        "color": "000000", "color_class": "black"},
    {"id": 8, "name": "Libres", "color": "CE802D", "color_class": "brown"},
    {"id": 9, "name": "Agua", "color": "9AA3AD", "color_class": "gray"},
]


@router.get("/fast_consumption")
async def fast_consumption():
    return FileResponse("templates/pages/conteo_rapido/fast_consumption.html")


@router.post("/portion_save/{id}")
async def portion_save(id: int, portion=Form(...)):
    # Pasamos el JSON de texto y lo cargamos con loads para convertirlo en diccionario
    # ipdb.set_trace()
    portion_data = json.loads(portion)
    message = "error"
    if portion_data:
        message = "Porcion guardada"
    return {"title": "Porcion guardada", "message": message}


# Codigo para obtener las categorias
@router.get("/portions_get_all/{category_id}")
async def portionsGetAll(request: Request, category_id: int, redis: aioredis.Redis = Depends(get_redis)):
    template_path = build_template_path("conteo_rapido", "table_partial.html")
    connection = None
    try:
        # Obtener datos de redis
        cached_data = await redis.get(f"portions:{category_id}")
        if cached_data:
            # Decodificar los bytes y cargar en formato JSON
            cached_data_str = cached_data.decode("utf-8")
            cached_data_dict = json.loads(cached_data_str)
            filtered_data = [
                item for item in CATEGORIES if item['id'] == category_id]
            return templates.TemplateResponse(template_path,
                                              {
                                                  "request": request,
                                                  "id": category_id,
                                                  "table": cached_data_dict['results'][f"{category_id}"],
                                                  "data": filtered_data
                                              })
        connection = mysql.connector.connect(**db_config)

        with connection.cursor() as cursor:
            query = """
                SELECT p.`id`, p.`description`, p.`amount`, p.`extra_points`, p.`id_category`,
                e.`id` AS `equivalence_id`, e.`amount` AS `equivalence_amount`,
                c.`id` AS `category_id`, c.`name` AS `category_name`
                FROM `portions` p
                LEFT JOIN `portion_equivalences` e ON p.`id` = e.`id_portion`
                LEFT JOIN `categories` c ON e.`id_category` = c.`id`
                WHERE p.`id_category`= %s
                ORDER BY p.`description` ASC
            """
            cursor.execute(query, (category_id, ))

            results = cursor.fetchall()

            if results:
                data_return = {'errors': False, 'results': {}}
                for row in results:
                    portion_data = {
                        "id": row[0],
                        "description": row[1],
                        "amount": row[2],
                        "extra_points": f"{row[3]:.2f}",
                        "id_category": row[4],
                        "equivalences": []
                    }
                    if row[5] is not None:
                        portion_data["equivalences"].append({
                            "id": row[5],
                            "amount": row[6],
                            "id_category": row[7],
                            "name_category": row[8]
                        })

                    category_id = row[4]

                    # Verificar si la categoría ya existe en el diccionario
                    if category_id not in data_return["results"]:
                        data_return["results"][category_id] = []

                    # Verificar si p.id ya existe en la lista de porciones de esa categoría
                    if portion_data["id"] not in [p["id"] for p in data_return["results"][category_id]]:
                        data_return["results"][category_id].append(
                            portion_data)

                # Transforma tus datos en formato JSON
                data_return_json = json.dumps(data_return)

                # Almacena los datos en Redis con un tiempo de vida (TTL)
                await redis.setex(f"portions:{category_id}", 3600, data_return_json)
            else:
                raise HTTPException(
                    status_code=404, detail="No se encontraron alimentos para el grupo y subgrupo de alimentos seleccionados.")

    except mysql.connector.Error as e:
        message_error = f"Error de base de datos: {str(e)}"
        logging.error(message_error)
        raise HTTPException(status_code=500, detail=message_error)
        logging.error(f"Error de base de datos: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error de base de datos: {str(e)}")
    finally:
        if connection:
            connection.close()

    filtered_data = [
        item for item in CATEGORIES if item['id'] == category_id]
    return templates.TemplateResponse(template_path, {"request": request, "table": data_return['results'][category_id], "id": category_id, "data": filtered_data})
