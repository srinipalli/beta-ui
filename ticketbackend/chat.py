from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import mysql.connector
from datetime import datetime
from ticketbackend.lang import get_ticket_qa_chain 
import os
from ticketbackend.database import get_connection
router = APIRouter()


@router.get("/chat")
def chat(user_query: str, session_id: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # === Fetch prior history ===
    cursor.execute("""
        SELECT sender, content FROM chat_history
        WHERE session_id = %s
        ORDER BY message_index ASC
    """, (session_id,))
    history_rows = cursor.fetchall()

    # === Format history context ===
    context = ""
    for row in history_rows:
        context += f"{row['sender'].capitalize()}: {row['content']}\n"

    # === Generate LLM response with history + current ===
    full_prompt = f"{context}User: {user_query}"
    result = get_ticket_qa_chain(full_prompt)

    # === Store user + bot messages ===
    cursor.execute("""
        SELECT MAX(message_index) FROM chat_history WHERE session_id = %s
    """, (session_id,))
    max_index = cursor.fetchone()['MAX(message_index)'] or 0

    now = datetime.now()
    cursor.execute("""
        INSERT INTO chat_history (session_id, message_index, sender, content, timestamp)
        VALUES (%s, %s, %s, %s, %s)
    """, (session_id, max_index + 1, 'user', user_query, now))

    cursor.execute("""
        INSERT INTO chat_history (session_id, message_index, sender, content, timestamp)
        VALUES (%s, %s, %s, %s, %s)
    """, (session_id, max_index + 2, 'bot', result['response'], now))

    conn.commit()
    cursor.close()

    return JSONResponse({"response": result['response']})
