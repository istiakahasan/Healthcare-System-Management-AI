from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from com.mhire.app.services.summarizer.summarizer_router import router as summarizer_router

# Create FastAPI app
app = FastAPI(
    title="AbleAI Shift Report Generator API",
    description="AI-powered API for generating professional shift summaries and incident reports",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(summarizer_router)

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "Welcome to AbleAI Shift Report Generator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/reports/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)