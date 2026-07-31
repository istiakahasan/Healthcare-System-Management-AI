import openai
from datetime import datetime
import json
import os
from dotenv import load_dotenv
load_dotenv()

class ShiftReportGenerator:
    """
    AI-powered generator for shift summaries and incident reports
    using OpenAI API
    """
    
    def __init__(self, api_key):
        """
        Initialize the generator with OpenAI API key
        
        Args:
            api_key (str): Your OpenAI API key
        """
        openai.api_key = api_key
        self.model = "gpt-4"  # Use gpt-3.5-turbo for faster/cheaper option
    
    def generate_shift_summary(self, raw_notes, participant_name=None, staff_name=None):
        """
        Generate a professional shift summary from raw notes
        
        Args:
            raw_notes (str): Raw notes entered by staff
            participant_name (str, optional): Name of the participant
            staff_name (str, optional): Name of the staff member
            
        Returns:
            dict: Contains summary, timestamp, and metadata
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

Raw Notes: {raw_notes}
"""
        
        if participant_name:
            user_prompt += f"\nParticipant Name: {participant_name}"
        if staff_name:
            user_prompt += f"\nStaff Member: {staff_name}"
        
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
            
            return {
                "type": "shift_summary",
                "summary": summary,
                "raw_notes": raw_notes,
                "participant_name": participant_name,
                "staff_name": staff_name,
                "timestamp": datetime.now().isoformat(),
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "type": "shift_summary",
                "raw_notes": raw_notes
            }
    
    def generate_incident_report(self, raw_notes, participant_name=None, 
                                 staff_name=None, incident_type=None):
        """
        Generate a professional incident report from raw notes
        
        Args:
            raw_notes (str): Raw notes about the incident
            participant_name (str, optional): Name of the participant
            staff_name (str, optional): Name of the staff member
            incident_type (str, optional): Type of incident (fall, behavioral, medical, etc.)
            
        Returns:
            dict: Contains incident report, timestamp, and metadata
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

Raw Notes: {raw_notes}
"""
        
        if participant_name:
            user_prompt += f"\nParticipant Name: {participant_name}"
        if staff_name:
            user_prompt += f"\nReporting Staff: {staff_name}"
        if incident_type:
            user_prompt += f"\nIncident Type: {incident_type}"
        
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
            
            return {
                "type": "incident_report",
                "report": report,
                "raw_notes": raw_notes,
                "participant_name": participant_name,
                "staff_name": staff_name,
                "incident_type": incident_type,
                "timestamp": datetime.now().isoformat(),
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "type": "incident_report",
                "raw_notes": raw_notes
            }
    
    def save_to_file(self, report_data, filename=None):
        """
        Save the generated report to a JSON file
        
        Args:
            report_data (dict): The report data to save
            filename (str, optional): Custom filename
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_type = report_data.get("type", "report")
            filename = f"{report_type}_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        return filename


# Example Usage
if __name__ == "__main__":
    # Initialize the generator with your API key
    API_KEY = os.getenv("OPENAI_API_KEY")
    generator = ShiftReportGenerator(API_KEY)
    
    # Example 1: Generate Shift Summary
    print("=" * 60)
    print("EXAMPLE 1: SHIFT SUMMARY")
    print("=" * 60)
    
    raw_shift_notes = """Helped John with breakfast at 8am, he was upset about 
    missing family, walked in park for 30min, no falls. Lunch at 12:30, 
    ate well. Afternoon activities - painting, seemed happy. 
    Medication given at 2pm. Dinner at 6pm."""
    
    shift_summary = generator.generate_shift_summary(
        raw_notes=raw_shift_notes,
        participant_name="John Smith",
        staff_name="Sarah Johnson"
    )
    
    if "error" not in shift_summary:
        print(f"\nRaw Notes:\n{raw_shift_notes}\n")
        print(f"Generated Summary:\n{shift_summary['summary']}\n")
        print(f"Tokens Used: {shift_summary['tokens_used']}")
        
        # Save to file
        filename = generator.save_to_file(shift_summary)
        print(f"Saved to: {filename}")
    else:
        print(f"Error: {shift_summary['error']}")
    
    # Example 2: Generate Incident Report
    print("\n" + "=" * 60)
    print("EXAMPLE 2: INCIDENT REPORT")
    print("=" * 60)
    
    raw_incident_notes = """Around 3pm Mary slipped in bathroom, fell on her side. 
    No visible injuries but complained of hip pain. Helped her up, she could walk. 
    Applied ice pack for 15 mins. Called nurse supervisor. 
    Mary resting comfortably now, will monitor overnight."""
    
    incident_report = generator.generate_incident_report(
        raw_notes=raw_incident_notes,
        participant_name="Mary Wilson",
        staff_name="Sarah Johnson",
        incident_type="Fall"
    )
    
    if "error" not in incident_report:
        print(f"\nRaw Notes:\n{raw_incident_notes}\n")
        print(f"Generated Report:\n{incident_report['report']}\n")
        print(f"Tokens Used: {incident_report['tokens_used']}")
        
        # Save to file
        filename = generator.save_to_file(incident_report)
        print(f"Saved to: {filename}")
    else:
        print(f"Error: {incident_report['error']}")
    
    print("\n" + "=" * 60)