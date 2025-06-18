from pydantic import BaseModel
class TicketUpdate(BaseModel):
    triage: str
    status: str
    category: str