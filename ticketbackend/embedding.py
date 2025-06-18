from sentence_transformers import SentenceTransformer
import lancedb
import os
from ticketbackend.database import get_connection

embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

LANCE_DB_PATH = os.getenv("LANCE_DB_PATH", "ticketbackend/lancedb_data")
TABLE_NAME = "tickets"

def get_lance_table():
    db = lancedb.connect(LANCE_DB_PATH)
    # DROP existing table if it exists
    if TABLE_NAME in db.table_names():
        db.drop_table(TABLE_NAME)
        print("🧹 Dropped existing LanceDB table.")

    # Create a fresh table with no data
    try:
        print(f"opening table {TABLE_NAME}")
        return db.open_table(TABLE_NAME)
    except:
        print("NEW TABLE CREATION!?!")
        return db.create_table(TABLE_NAME, schema={
            "ticket_id": "string",
            "content": "string",
            "embedding": "vector<float>",
        })

def build_embeddings_and_store():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.ticket_id, m.title, m.description, p.summary, p.solution, p.category
        FROM main_table m
        JOIN processed p ON m.ticket_id = p.ticket_id
    """)
    tickets = cursor.fetchall()

    docs = []
    for t in tickets:
        content = f"Title: {t[1]}\nDescription: {t[2]}\nSummary: {t[3]}\nSolution: {t[4]}\nCategory: {t[5]}"
        embedding = embedding_model.encode(content).tolist()
        docs.append({
            "ticket_id": t[0],
            "content": content,
            "embedding": embedding
        })

    table = get_lance_table()
    table.add(docs)

    cursor.close()
    conn.close()
