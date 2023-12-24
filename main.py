
# Main Libraries
import ipdb
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.gzip import GZipMiddleware
from config import get_settings

# Rutas
from routers import conteo_rapido

templates = Jinja2Templates(directory="templates")

# Configura tu conexión a la base de datos MySQL
settings = get_settings()
db_config = {
    "host": settings.db_host,
    "user": settings.db_user,
    "port": settings.db_port,
    "password": settings.db_password,
    "database": settings.db_database,
}


app = FastAPI()

# Habilitar la compresión de contenido
app.add_middleware(GZipMiddleware, minimum_size=15400)

# Mount the "static" folder to serve static files.
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/img", StaticFiles(directory="static/img"), name="static")
app.mount("/css", StaticFiles(directory="static/css"), name="static")
app.mount("/js", StaticFiles(directory="static/js"), name="static")

# Rutas
# Ruta de Pagina Conteo Rápido
app.include_router(conteo_rapido.router)


# Configuración CORS para permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
