import ipdb
from fastapi import APIRouter, Request, HTTPException, Depends, Form
from fastapi.templating import Jinja2Templates
from utils import build_template_path

router = APIRouter()

templates = Jinja2Templates(directory="templates")


@router.get("/start")
async def start_page(request: Request):
    template_path = build_template_path("start", "start.html")
    return templates.TemplateResponse(template_path, {"request": request})
