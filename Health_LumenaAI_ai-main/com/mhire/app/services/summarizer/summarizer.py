import openai
from datetime import datetime
from typing import Union
from com.mhire.app.config.config import Config
from com.mhire.app.services.summarizer.summarizer_schema import (
    ShiftSummaryRequest,
    IncidentReportRequest,
    ShiftSummaryResponse,
    IncidentReportResponse,
    ErrorResponse
)

class ShiftReportGenerator:
    """
    AI-powered generator for shift summaries and incident reports
    using OpenAI API
    """
    
    def __init__(self):
        """
        Initialize the generator with OpenAI API key from config
        """
        config = Config()
        openai.api_key = config.openai_api_key
        self.model = config.model_name
    
    def generate_shift_summary(self, request: ShiftSummaryRequest) -> Union[ShiftSummaryResponse, ErrorResponse]:
        """
        Generate a professional shift summary from raw notes
        
        Args:
            request (ShiftSummaryRequest): Request containing raw notes and metadata
            
        Returns:
            Union[ShiftSummaryResponse, ErrorResponse]: Response with summary or error
        """
        
        # Create system prompt for shift summary
        system_prompt = """You are an AI assistant for disability care services. 
        Your task is to transform raw shift notes into clear, professional shift summaries.
        
        Guidelines:
        - Use professional, respectful language
        - Structure the summary chronologically
        - Include all important activities and observations
        - Note any emotional states, medical observations, or concerns
        - Be concise but complete
        - Use past tense
        - Format with clear sections if needed
        """
        
        # Create user prompt
        user_prompt = f"""Transform the following raw shift notes into a professional shift summary:

Raw Notes: {request.raw_notes}
"""
        
        if request.participant_name:
            user_prompt += f"\nParticipant Name: {request.participant_name}"
        if request.staff_name:
            user_prompt += f"\nStaff Member: {request.staff_name}"
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            summary = response.choices[0].message.content.strip()
            
            return ShiftSummaryResponse(
                type="shift_summary",
                summary=summary,
                raw_notes=request.raw_notes,
                participant_name=request.participant_name,
                staff_name=request.staff_name,
                timestamp=datetime.now().isoformat(),
                tokens_used=response.usage.total_tokens
            )
            
        except Exception as e:
            return ErrorResponse(
                error=str(e),
                type="shift_summary",
                raw_notes=request.raw_notes
            )
    
    def generate_incident_report(self, request: IncidentReportRequest) -> Union[IncidentReportResponse, ErrorResponse]:
        """
        Generate a professional incident report from raw notes
        
        Args:
            request (IncidentReportRequest): Request containing raw incident notes and metadata
            
        Returns:
            Union[IncidentReportResponse, ErrorResponse]: Response with report or error
        """
        
        # Create system prompt for incident report
        system_prompt = """You are an AI assistant for disability care services.
        Your task is to transform raw incident notes into clear, professional incident reports.
        
        Guidelines:
        - Use objective, factual language
        - Include: What happened, when, where, who was involved
        - Note immediate actions taken
        - Document any injuries or concerns
        - Mention follow-up actions if any
        - Use professional medical/care terminology where appropriate
        - Structure with clear sections: Incident Description, Actions Taken, Outcome
        - Be precise with times if available
        """
        
        # Create user prompt
        user_prompt = f"""Transform the following raw incident notes into a professional incident report:

Raw Notes: {request.raw_notes}
"""
        
        if request.participant_name:
            user_prompt += f"\nParticipant Name: {request.participant_name}"
        if request.staff_name:
            user_prompt += f"\nReporting Staff: {request.staff_name}"
        if request.incident_type:
            user_prompt += f"\nIncident Type: {request.incident_type}"
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,  # Lower temperature for more factual reports
                max_tokens=600
            )
            
            report = response.choices[0].message.content.strip()
            
            return IncidentReportResponse(
                type="incident_report",
                report=report,
                raw_notes=request.raw_notes,
                participant_name=request.participant_name,
                staff_name=request.staff_name,
                incident_type=request.incident_type,
                timestamp=datetime.now().isoformat(),
                tokens_used=response.usage.total_tokens
            )
            
        except Exception as e:
            return ErrorResponse(
                error=str(e),
                type="incident_report",
                raw_notes=request.raw_notes
            )