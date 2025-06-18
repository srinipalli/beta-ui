import os
import lancedb
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import numpy as np

load_dotenv()

# === CONFIG ===
LANCE_DB_PATH = "ticketbackend/lancedb_data"
TABLE_NAME = "tickets"
TOP_K = 3

# === Instantiate embedding model ===
embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# === Connect or create LanceDB table ===
db = lancedb.connect(LANCE_DB_PATH)
try:
    table = db.open_table(TABLE_NAME)
except:
    print("⚠️ Table not found — creating new 'tickets' table.")
    table = db.create_table(
        TABLE_NAME,
        data=[
            {
                "ticket_id": "dummy",
                "title": "dummy title",
                "summary": "dummy summary",
                "solution": "dummy solution",
                "category": "dummy category",
                "vector": embedding_model.encode("This is a summary.").tolist(),
            }
        ]
    )

# === Gemini model ===
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.0-flash",
    temperature=0.3,
    google_api_key=os.getenv("KEY")
)

# === RAG function ===
def get_ticket_qa_chain(user_query, table_ref=table):
    query_vector = embedding_model.encode(user_query).tolist()
    results = (
        table_ref.search(query_vector)
        .distance_type("cosine")
        .limit(TOP_K)
        .to_list()
    )
    
    if not results:
        return {"response": "No relevant tickets found."}
    
    context = ""
    for doc in results:
        context += f"- Ticket ID: {doc['ticket_id']}\nTitle: {doc['title']}\nSummary: {doc['summary']}\nSolution: {doc['solution']}\n\n"
    
    prompt = (
        f"You are an IT support assistant. You recieve IT support tickets everyday.\n"
        f"Based on the following tickets:\n{context}\n"
        f"Answer the user query:\n{user_query}"
        f"DO NOT USE ANY KIND OF FORMATTING. Only use english alphabets, numbers, commas, question marks, exclamation points"
    )
    
    response = llm.invoke(prompt)
    return {"response": response.content.strip()}

