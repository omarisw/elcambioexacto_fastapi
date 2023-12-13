
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates

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


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/fast_consumption")
async def fast_consumption():
    return FileResponse("templates/pages/conteo_rapido/fast_consumption.html")


@app.get("/cargar_tabla", response_class=HTMLResponse)
def cargar_tabla(request: Request):
    return templates.TemplateResponse(conteo_rapido + "table_partial.html", {"request": request})


@app.post("/tablita", response_class=HTMLResponse)
def carga_tablita(request: Request):
    return templates.TemplateResponse(conteo_rapido + "colores.html", {"request": request})


@app.post("/tablita2", response_class=HTMLResponse)
def carga_tablita2(request: Request):
    return templates.TemplateResponse(conteo_rapido + "colores2.html", {"request": request})
