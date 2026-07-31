from fastapi import APIRouter, HTTPException, status
from datetime import datetime


from com.mhire.app.services.summarizer.summarizer_schema import ShiftSummaryRequest, IncidentReportRequest, ShiftSummaryResponse, IncidentReportResponse, ErrorResponse
from com.mhire.app.services.summarizer.summarizer import ShiftReportGenerator

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"]
)

# Initialize the generator
generator = ShiftReportGenerator()

@router.post(
    "/shift-summary",
    response_model=ShiftSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Shift Summary",
    description="Transform raw shift notes into a professional shift summary"
)
async def create_shift_summary(request: ShiftSummaryRequest):
    """
    Generate a professional shift summary from raw notes.
    
    - **raw_notes**: Raw notes entered by staff (required)
    - **participant_name**: Name of the participant (optional)
    - **staff_name**: Name of the staff member (optional)
    """
    result = generator.generate_shift_summary(request)
    
    if isinstance(result, ErrorResponse):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error
        )
    
    return result

@router.post(
    "/incident-report",
    response_model=IncidentReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Incident Report",
    description="Transform raw incident notes into a professional incident report"
)
async def create_incident_report(request: IncidentReportRequest):
    """
    Generate a professional incident report from raw notes.
    
    - **raw_notes**: Raw incident notes (required)
    - **participant_name**: Name of the participant (optional)
    - **staff_name**: Name of the reporting staff (optional)
    - **incident_type**: Type of incident (fall, behavioral, medical, etc.) (optional)
    """
    result = generator.generate_incident_report(request)
    
    if isinstance(result, ErrorResponse):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error
        )
    
    return result

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check if the report generation service is running"
)
async def health_check():
    """
    Health check endpoint for the report generation service.
    """
    return {
        "status": "healthy",
        "service": "Shift Report Generator",
        "timestamp": datetime.now().isoformat()
    }
