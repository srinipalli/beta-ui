from pydantic import BaseModel
class TicketUpdate(BaseModel):
    triage: str
    status: str
    category: str
    
class ChatQuery(BaseModel):
    session_id: str
    question: str
