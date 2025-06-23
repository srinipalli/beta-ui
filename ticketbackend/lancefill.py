import os
import lancedb
import mysql.connector
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import numpy as np
from database import get_connection
load_dotenv()

# === LanceDB config ===
LANCE_DB_PATH = "ticketbackend/lancedb_data"
TABLE_NAME = "tickets"

# === Embedding model ===
embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# === Connect to MySQL ===
conn = get_connection()
cursor = conn.cursor()
cursor.execute("""
    SELECT p.ticket_id, m.title, p.summary, p.solution, p.category
    FROM processed AS p
    JOIN main_table AS m ON p.ticket_id = m.ticket_id
""")
rows = cursor.fetchall()

# === Connect to LanceDB ===
db = lancedb.connect(LANCE_DB_PATH)

# === Drop table if it exists (to prevent duplicates) ===
if TABLE_NAME in db.table_names():
    db.drop_table(TABLE_NAME)
    print("🧹 Dropped existing LanceDB table.")

# === Create new empty table ===
dummy_row = [{
    "ticket_id": "No ID",
    "title": "No title",
    "status": "No status",
    "reported_date": str("No date"),
    "summary": "No summary",
    "description": "No description",
    "triage": "No triage",
    "category": "No category",
    "solution": "No solution",
    "vector": embedding_model.encode("No summary").tolist(),
}]
table = db.create_table(TABLE_NAME, data=dummy_row)
# Remove dummy row immediately
table.delete("ticket_id = 'dummy'")
print("✅ Created fresh LanceDB table.")

# === Deduplicate and insert ===
seen_ids = set()
unique_data = []

cursor.execute("""
    SELECT m.ticket_id, m.title, m.status, m.reported_date, p.summary,
           m.description, p.triage, p.category, p.solution
    FROM main_table AS m
    JOIN processed AS p ON m.ticket_id = p.ticket_id
    JOIN assign AS a ON m.ticket_id = a.ticket_id
""")
rows = cursor.fetchall()

seen_ids = set()
unique_data = []

for row in rows:
    (ticket_id, title, status, reported_date, summary, 
     description, triage, category, solution) = row

    if ticket_id in seen_ids:
        continue
    seen_ids.add(ticket_id)

    # Embed relevant context
    embed_text = (
        f"Ticket ID: {ticket_id}\n"
        f"Title: {title}\n"
        f"Status: {status}\n"
        f"Reported Date: {reported_date}\n"
        f"Summary: {summary}\n"
        f"Description: {description}\n"
        f"Triage: {triage}\n"
        f"Category: {category}\n"
        f"Solution: {solution}"
    )   
    vector = embedding_model.encode(embed_text).tolist()

    unique_data.append({
        "ticket_id": ticket_id,
        "title": title,
        "status": status,
        "reported_date": str(reported_date),
        "summary": summary,
        "description": description,
        "triage": triage,
        "category": category,
        "solution": solution,
        "vector": vector
    })

if unique_data:
    table.add(unique_data)
    print(f"✅ Added {len(unique_data)} enriched tickets to LanceDB.")

cursor.close()
conn.close()
