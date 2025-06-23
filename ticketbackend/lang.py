# import os
# import lancedb
# from sentence_transformers import SentenceTransformer
# from langchain_google_genai import ChatGoogleGenerativeAI
# from dotenv import load_dotenv
# import numpy as np
# try:
#     from database import get_connection
# except ImportError:
#     from ticketbackend.database import get_connection
# load_dotenv()
# import re

# # === CONFIG ===
# LANCE_DB_PATH = "ticketbackend/lancedb_data"
# TABLE_NAME = "tickets"
# TOP_K = 3

# def extract_ticket_id(text):
#     match = re.search(r"\bdef-\d{4}\b", text.lower())
#     return match.group(0) if match else None

# # === Instantiate embedding model ===
# embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# # === Connect or create LanceDB table ===
# db = lancedb.connect(LANCE_DB_PATH)
# try:
#     table = db.open_table(TABLE_NAME)
# except:
#     print("⚠️ Table not found — creating new 'tickets' table.")
#     table = db.create_table(
#         TABLE_NAME,
#         data=[
#             {
#                 "ticket_id": "dummy",
#                 "title": "dummy title",
#                 "summary": "dummy summary",
#                 "solution": "dummy solution",
#                 "category": "dummy category",
#                 "vector": embedding_model.encode("This is a summary.").tolist(),
#             }
#         ]
#     )

# # === Gemini model ===
# llm = ChatGoogleGenerativeAI(
#     model="models/gemini-2.0-flash",
#     temperature=0.3,
#     google_api_key=os.getenv("KEY")
# )

# def get_recent_chat_history(session_id, limit=5):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("""
#         SELECT sender, content, timestamp
#         FROM chat_history
#         WHERE session_id = %s
#         ORDER BY message_index DESC
#         LIMIT %s
#     """, (session_id, limit))
    
#     rows = cursor.fetchall()
#     rows.reverse()  # oldest first
#     history = ""
#     for row in rows:
#         sender, content, _ = row  # unpack the tuple
#         who = "User" if sender == "user" else "Assistant"
#         history += f"{who}: {content}\n"
#     return history


# # === RAG function ===
# import re

# def get_ticket_qa_chain(user_query, session_id, table_ref=table):
#     chat_context = get_recent_chat_history(session_id=session_id, limit=5)

#     # ✅ Step 1: Try to extract ticket ID using flexible regex
#     match = re.search(r"(?:ticket[\s#:]*)([a-zA-Z0-9_-]+)", user_query.lower())
#     ticket_id_requested = match.group(1).strip() if match else None

#     if ticket_id_requested:
#         try:
#             df = table_ref.to_arrow().to_pandas()
#             df["ticket_id_normalized"] = df["ticket_id"].astype(str).str.lower().str.strip()

#             print("🔍 Extracted Ticket ID from query:", ticket_id_requested)
#             print("📋 All ticket IDs in LanceDB:", df["ticket_id_normalized"].unique().tolist())

#             match_row = df[df["ticket_id_normalized"] == ticket_id_requested.lower()]
#             print("🔎 Normalized ticket IDs:", df["ticket_id_normalized"].tolist())
#             print("🔎 Looking for:", ticket_id_requested.lower())

#             if not match_row.empty:
#                 row = match_row.iloc[0]
#                 ticket_context = (
#                     f"- Ticket ID: {row['ticket_id']}\n"
#                     f"Title: {row['title']}\n"
#                     f"Status: {row.get('status')}\n"
#                     f"Reported Date: {row.get('reported_date')}\n"
#                     f"Summary: {row['summary']}\n"
#                     f"Description: {row.get('description')}\n"
#                     f"Triage: {row.get('triage')}\n"
#                     f"Category: {row['category']}\n"
#                     f"Solution: {row['solution']}\n"
#                 )

#                 prompt = (
#                     f"You are an expert IT support assistant.\n\n"
#                     f"--- Recent Chat ---\n"
#                     f"{chat_context or '[No prior chat]'}\n\n"
#                     f"--- Requested Ticket ---\n"
#                     f"{ticket_context}\n\n"
#                     f"Now answer this user query:\n\"{user_query}\"\n\n"
#                     f"Use only plain English. No markdown, formatting, or guessing. If you don't know, say you don't know."
#                 )
#                 print(f"🧪 Prompt:\n{prompt}")

#                 # ✅ Call Gemini
#                 response = llm.invoke(prompt)

#                 if not response or not hasattr(response, "content"):
#                     return {
#                         "response": "⚠️ Gemini model failed to respond.",
#                         "source_tickets": [],
#                         "chat_used": chat_context,
#                         "mode": "ticket_id_match"
#                     }

#                 return {
#                     "response": response.content.strip(),
#                     "source_tickets": [row.to_dict()],
#                     "chat_used": chat_context,
#                     "mode": "ticket_id_match"
#                 }

#         except Exception as e:
#             print("⚠️ Ticket ID match failed, falling back to RAG:", e)

#     # ✅ Step 2: Fall back to RAG similarity search
#     try:
#         query_vector = embedding_model.encode(user_query).tolist()
#         results = (
#             table_ref.search(query_vector)
#             .distance_type("cosine")
#             .limit(TOP_K)
#             .to_list()
#         )

#         if not results:
#             return {"response": "No relevant tickets found."}

#         ticket_context = ""
#         for doc in results:
#             ticket_context += (
#                 f"- Ticket ID: {doc['ticket_id']}\n"
#                 f"Title: {doc['title']}\n"
#                 f"Status: {doc.get('status')}\n"
#                 f"Reported Date: {doc.get('reported_date')}\n"
#                 f"Summary: {doc['summary']}\n"
#                 f"Description: {doc.get('description')}\n"
#                 f"Triage: {doc.get('triage')}\n"
#                 f"Category: {doc['category']}\n"
#                 f"Solution: {doc['solution']}\n\n"
#             )

#         prompt = (
#             f"You are an expert IT support assistant.\n\n"
#             f"--- Recent Chat ---\n"
#             f"{chat_context or '[No prior chat]'}\n\n"
#             f"--- Historical Ticket Matches ---\n"
#             f"{ticket_context}\n\n"
#             f"Now answer this user query:\n\"{user_query}\"\n\n"
#             f"Use only plain English. No markdown, formatting, or hallucination."
#         )
#         print("🧠 Prompt (RAG fallback):\n", prompt)

#         response = llm.invoke(prompt)

#         if not response or not hasattr(response, "content"):
#             return {
#                 "response": "⚠️ Gemini model failed to respond.",
#                 "source_tickets": results,
#                 "chat_used": chat_context,
#                 "mode": "rag_fallback"
#             }

#         return {
#             "response": response.content.strip(),
#             "source_tickets": results,
#             "chat_used": chat_context,
#             "mode": "rag_fallback"
#         }

#     except Exception as e:
#         print("❌ Final fallback error:", e)
#         return {
#             "response": f"❌ Unexpected error: {str(e)}",
#             "source_tickets": [],
#             "chat_used": chat_context,
#             "mode": "error"
#         }

# def log_chat_message(session_id, sender, content):
#     conn = get_connection()
#     cursor = conn.cursor()

#     cursor.execute("""
#         SELECT COALESCE(MAX(message_index), -1) FROM chat_history WHERE session_id = %s
#     """, (session_id,))
#     max_index = cursor.fetchone()[0] or -1

#     cursor.execute("""
#         INSERT INTO chat_history (session_id, message_index, sender, content, timestamp)
#         VALUES (%s, %s, %s, %s, NOW())
#     """, (session_id, max_index + 1, sender, content))
#     conn.commit()



import os
import re
import lancedb
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI

# === Internal Imports ===
try:
    from database import get_connection
except ImportError:
    from ticketbackend.database import get_connection

# === Load Environment Variables ===
load_dotenv()

# === Config ===
LANCE_DB_PATH = "ticketbackend/lancedb_data"
TABLE_NAME = "tickets"
TOP_K = 3

# === Initialize Models ===
embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.0-flash",
    temperature=0.3,
    google_api_key=os.getenv("KEY")
)

# === LanceDB Setup ===
db = lancedb.connect(LANCE_DB_PATH)
try:
    table = db.open_table(TABLE_NAME)
except:
    print("⚠️ Table not found — creating new 'tickets' table.")
    table = db.create_table(
        TABLE_NAME,
        data=[{
            "ticket_id": "dummy",
            "title": "dummy title",
            "summary": "dummy summary",
            "solution": "dummy solution",
            "category": "dummy category",
            "vector": embedding_model.encode("This is a summary.").tolist(),
        }]
    )


# === Utility: Fetch Chat History ===
def get_recent_chat_history(session_id, limit=5):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sender, content, timestamp
        FROM chat_history
        WHERE session_id = %s
        ORDER BY message_index DESC
        LIMIT %s
    """, (session_id, limit))
    rows = cursor.fetchall()
    rows.reverse()
    history = ""
    for sender, content, _ in rows:
        who = "User" if sender == "user" else "Assistant"
        history += f"{who}: {content}\n"
    return history


# === Utility: Log Chat Message ===
def log_chat_message(session_id, sender, content):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COALESCE(MAX(message_index), -1) FROM chat_history WHERE session_id = %s
    """, (session_id,))
    max_index = cursor.fetchone()[0] or -1
    cursor.execute("""
        INSERT INTO chat_history (session_id, message_index, sender, content, timestamp)
        VALUES (%s, %s, %s, %s, NOW())
    """, (session_id, max_index + 1, sender, content))
    conn.commit()

def extract_ticket_id(text):
    # Match things like "def-1234" or "ticket: def-1234"
    match = re.search(r"\b(?:ticket[\s#:]*)?(def-\d{4})\b", text.lower())
    return match.group(1).strip() if match else None

# === Main Function: Answer Ticket Query ===
def get_ticket_qa_chain(user_query, session_id, table_ref=table):
    chat_context = get_recent_chat_history(session_id=session_id, limit=5)

    # === Step 1: Try ticket ID matching ===
    ticket_id_requested = extract_ticket_id(user_query)
    if ticket_id_requested:
        try:
            df = table_ref.to_arrow().to_pandas()
            df["ticket_id_normalized"] = df["ticket_id"].astype(str).str.lower().str.strip()
            print("📋 All normalized ticket IDs:", df["ticket_id_normalized"].tolist())

            ticket_id_requested = ticket_id_requested.lower()

            match_row = df[df["ticket_id_normalized"] == ticket_id_requested]
            if not match_row.empty:
                row = match_row.iloc[0]
                ticket_context = (
                    f"- Ticket ID: {row['ticket_id']}\n"
                    f"Title: {row['title']}\n"
                    f"Status: {row.get('status')}\n"
                    f"Reported Date: {row.get('reported_date')}\n"
                    f"Summary: {row['summary']}\n"
                    f"Description: {row.get('description')}\n"
                    f"Triage: {row.get('triage')}\n"
                    f"Category: {row['category']}\n"
                    f"Solution: {row['solution']}\n"
                )

                prompt = (
                    f"You are an expert IT support assistant.\n\n"
                    f"--- Recent Chat ---\n{chat_context or '[No prior chat]'}\n\n"
                    f"--- Requested Ticket ---\n{ticket_context}\n\n"
                    f"Now answer this user query:\n\"{user_query}\"\n\n"
                    f"Use only plain English. No markdown or hallucinations."
                )

                response = llm.invoke(prompt)
                return {
                    "response": response.content.strip(),
                    "source_tickets": [row.to_dict()],
                    "chat_used": chat_context,
                    "mode": "ticket_id_match"
                }

        except Exception as e:
            print("⚠️ Ticket ID match failed, falling back to RAG:", e)

    # === Step 2: RAG fallback ===
    try:
        query_vector = embedding_model.encode(user_query).tolist()
        results = (
            table_ref.search(query_vector)
            .distance_type("cosine")
            .limit(TOP_K)
            .to_list()
        )

        if not results:
            return {"response": "No relevant tickets found."}

        ticket_context = ""
        for doc in results:
            ticket_context += (
                f"- Ticket ID: {doc['ticket_id']}\n"
                f"Title: {doc['title']}\n"
                f"Status: {doc.get('status')}\n"
                f"Reported Date: {doc.get('reported_date')}\n"
                f"Summary: {doc['summary']}\n"
                f"Description: {doc.get('description')}\n"
                f"Triage: {doc.get('triage')}\n"
                f"Category: {doc['category']}\n"
                f"Solution: {doc['solution']}\n\n"
            )

        prompt = (
            f"You are an expert IT support assistant.\n\n"
            f"--- Recent Chat ---\n{chat_context or '[No prior chat]'}\n\n"
            f"--- Relevant Ticket Matches ---\n{ticket_context}\n\n"
            f"Now answer this user query:\n\"{user_query}\"\n\n"
            f"Use only plain English. Be concise, no markdown, no guessing."
        )

        response = llm.invoke(prompt)
        return {
            "response": response.content.strip(),
            "source_tickets": results,
            "chat_used": chat_context,
            "mode": "rag_fallback"
        }

    except Exception as e:
        print("❌ RAG fallback failed:", e)
        return {
            "response": f"❌ Unexpected error: {str(e)}",
            "source_tickets": [],
            "chat_used": chat_context,
            "mode": "error"
        }
