from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter()

@router.post("/upload-front-cube")
async def upload_image(file: UploadFile = File(...)):
    return {"message": "Image uploaded successfully"}

@router.post("/upload-back-cube")
async def upload_image(file: UploadFile = File(...)):
    return {"message": "Image uploaded successfully"}

@router.post("/solve/{cube_id}/{algorithm}")
async def solve_cube(cube_id: str, algorithm: str):
    return {"message": "Cube solved successfully"}
