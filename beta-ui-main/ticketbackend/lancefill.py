import os
import lancedb
import mysql.connector
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import numpy as np

load_dotenv()

# === LanceDB config ===
LANCE_DB_PATH = "ticketbackend/lancedb_data"
TABLE_NAME = "tickets"

# === Embedding model ===
embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# === Connect to MySQL ===
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DB")
)
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
    "ticket_id": "dummy",
    "title": "dummy title",
    "summary": "dummy summary",
    "solution": "dummy solution",
    "category": "dummy category",
    "vector": embedding_model.encode("dummy summary").tolist(),
}]
table = db.create_table(TABLE_NAME, data=dummy_row)
# Remove dummy row immediately
table.delete("ticket_id = 'dummy'")
print("✅ Created fresh LanceDB table.")

# === Deduplicate and insert ===
seen_ids = set()
unique_data = []

for ticket_id, title, summary, solution, category in rows:
    if ticket_id in seen_ids:
        continue
    seen_ids.add(ticket_id)

    summary_text = summary or ""
    vector = embedding_model.encode(summary_text).tolist()

    unique_data.append({
        "ticket_id": ticket_id,
        "title": title or "",
        "summary": summary_text,
        "solution": solution or "",
        "category": category or "",
        "vector": vector
    })

# === Add to LanceDB ===
if unique_data:
    table.add(unique_data)
    print(f"✅ Added {len(unique_data)} unique tickets to LanceDB.")
else:
    print("⚠️ No unique ticket data found.")

cursor.close()
conn.close()
