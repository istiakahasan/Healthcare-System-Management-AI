from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ShiftSummaryRequest(BaseModel):
    raw_notes: str = Field(..., description="Raw shift notes entered by staff")
    participant_name: Optional[str] = Field(None, description="Name of the participant")
    staff_name: Optional[str] = Field(None, description="Name of the staff member")
    
    class Config:
        json_schema_extra = {
            "example": {
                "raw_notes": "Helped John with breakfast at 8am, he was upset about missing family, walked in park for 30min, no falls.",
                "participant_name": "John Smith",
                "staff_name": "Sarah Johnson"
            }
        }

class IncidentReportRequest(BaseModel):
    raw_notes: str = Field(..., description="Raw incident notes")
    participant_name: Optional[str] = Field(None, description="Name of the participant")
    staff_name: Optional[str] = Field(None, description="Name of the reporting staff")
    incident_type: Optional[str] = Field(None, description="Type of incident (fall, behavioral, medical, etc.)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "raw_notes": "Around 3pm Mary slipped in bathroom, fell on her side. No visible injuries but complained of hip pain.",
                "participant_name": "Mary Wilson",
                "staff_name": "Sarah Johnson",
                "incident_type": "Fall"
            }
        }

class ShiftSummaryResponse(BaseModel):
    type: str
    summary: str
    raw_notes: str
    participant_name: Optional[str]
    staff_name: Optional[str]
    timestamp: str
    tokens_used: int

class IncidentReportResponse(BaseModel):
    type: str
    report: str
    raw_notes: str
    participant_name: Optional[str]
    staff_name: Optional[str]
    incident_type: Optional[str]
    timestamp: str
    tokens_used: int

class ErrorResponse(BaseModel):
    error: str
    type: str
    raw_notes: str
