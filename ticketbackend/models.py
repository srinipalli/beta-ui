from pydantic import BaseModel
class TicketUpdate(BaseModel):
    priority: str
    status: str
    category: str