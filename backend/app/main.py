from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import text

from app.api import seller, documents, chat
from app.database import engine, Base

app = FastAPI(title="shop-rag API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seller.router, prefix="/api/seller", tags=["seller"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/widget.js")
async def widget_js():
    return FileResponse("static/widget.js", media_type="application/javascript")


@app.get("/demo.html")
async def demo_html():
    return FileResponse("static/demo.html", media_type="text/html")
