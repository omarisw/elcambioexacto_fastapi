
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel


class ValorModel(BaseModel):
    valor: int


app = FastAPI()

# Configuración CORS para permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
conteo_rapido = "pages/conteo_rapido/"
# Configuración de Jinja2
# Asegúrate de tener un directorio 'templates' en tu proyecto
templates = Jinja2Templates(directory="templates")


# Datos de ejemplo
colores = [
    {"nombre": "Lácteos", "valor": 1},
    {"nombre": "Verduras", "valor": 2},
    {"nombre": "Frutas", "valor": 3},
    {"nombre": "Granos y Cereales", "valor": 4},
    {"nombre": "Carnes", "valor": 5},
    {"nombre": "Grasas", "valor": 6},
    {"nombre": "Libres", "valor": 7},
    {"nombre": "Agua", "valor": 8},
    {"nombre": "Puntos extras", "valor": 9},
]


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/fast_consumption")
async def fast_consumption():
    return FileResponse("templates/pages/conteo_rapido/fast_consumption.html")


@app.get("/cargar_tabla", response_class=HTMLResponse)
def cargar_tabla(request: Request):
    return templates.TemplateResponse(conteo_rapido + "table_partial.html", {"request": request})


@app.get("/tablita/{valor_id}", response_class=HTMLResponse)
def carga_tablita(request: Request, valor_id: int):
    # Filtrar colores
    colores_filtrados = [
        color for color in colores if color["valor"] == valor_id]
    return templates.TemplateResponse(conteo_rapido + "colores.html", {"request": request, "colores": colores_filtrados})
