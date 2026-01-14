"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import products, boxes, locations, events, exceptions, inventory, stats

app = FastAPI(title="Phone Inventory Location API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(boxes.router)
app.include_router(locations.router)
app.include_router(events.router)
app.include_router(exceptions.router)
app.include_router(inventory.router)
app.include_router(stats.router)


@app.get("/")
async def root():
    return {"message": "Phone Inventory Location API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
