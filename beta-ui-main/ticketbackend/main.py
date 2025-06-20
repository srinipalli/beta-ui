from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    from database import get_connection
except ImportError:
    from database import get_connection
from fastapi import FastAPI, Request
from pydantic import BaseModel
try:
    from models import ChatQuery
except ImportError:
    from models import ChatQuery
# from ticketbackend.lang import get_qa_chain
from lang import get_ticket_qa_chain


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ticket_count():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(ticket_id) FROM processed;")
        ticketcount = cursor.fetchone()[0]
        return ticketcount
    except Exception as e:
        print(f"Error getting ticket count: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting ticket count: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.get("/ticket_data")
def get_ticket_data():
    conn = None
    try:
        conn = get_connection()

        # --- Fetch ticket_ids ---
        cursor_ids = conn.cursor() # New cursor for this query
        cursor_ids.execute("SELECT ticket_id FROM processed;")
        result_ids = cursor_ids.fetchall()
        ticket_ids = [row[0] for row in result_ids]
        cursor_ids.close() # Close cursor after fetching all results

        print(f"Fetched {len(ticket_ids)} ticket_ids from processed.")

        # --- Fetch main table contents ---
        cursor_final_table = conn.cursor() # New cursor for this query
        ticket_details_query = """
            SELECT M.ticket_id, M.title, M.status, M.source, P.summary, P.triage,
                   P.category, P.solution, E.employee_name
            FROM main_table AS M
            JOIN processed AS P ON M.ticket_id = P.ticket_id
            JOIN assign AS A ON M.ticket_id = A.ticket_id
            JOIN employee AS E ON A.assigned_id = E.employee_ID;
        """
        cursor_final_table.execute(ticket_details_query)
        rows_final_table = cursor_final_table.fetchall()
        cursor_final_table.close() # Close cursor

        print(f"Fetched {len(rows_final_table)} rows for final_table.")

        final_table = []
        for row in rows_final_table:
            final_table.append({
                "ticket_id": row[0],
                "title": row[1],
                "triage": row[5],
                "category": row[6],
                "status": row[2],
                "employee_name": row[8],
                "source": row[3]
            })

        # --- Fetch detailed ticket information ---
        cursor_details = conn.cursor() # New cursor for this query
        details_query = """
            SELECT m.ticket_id, m.title, m.status, m.reported_date, p.summary,
                   m.description, p.triage, p.category, e.employee_name, p.solution,
                   r.triage_reason, r.category_reason
            FROM main_table AS m
            JOIN processed AS p ON m.ticket_id = p.ticket_id
            JOIN assign AS a ON m.ticket_id = a.ticket_id
            JOIN employee AS e ON a.assigned_id = e.employee_id
            LEFT JOIN reasons AS r ON m.ticket_id = r.ticket_id;
        """
        cursor_details.execute(details_query)
        datas_details = cursor_details.fetchall()
        cursor_details.close() # Close cursor

        print(f"Fetched {len(datas_details)} rows for details.")

        details = []
        for r in datas_details:
            details.append({
                "ticket_id":r[0],
                "ticket_title":r[1],
                "ticket_status":r[2],
                "ticket_reported_date":r[3],
                "ticket_summary":r[4],
                "ticket_description":r[5],
                "ticket_triage":r[6],
                "ticket_triage_reason":r[10],
                "ticket_category":r[7],
                "ticket_category_reason":r[11],
                "ticket_assigned_employee":r[8],
                "ticket_solution":r[9]
            })

        # --- Fetch distinct categories ---
        cursor_categories = conn.cursor() # New cursor
        cursor_categories.execute("select distinct category from processed;")
        clist = [row[0] for row in cursor_categories.fetchall()]
        cursor_categories.close() # Close cursor
        print(f"Distinct categories: {clist}")

        # --- Fetch distinct statuses ---
        cursor_status = conn.cursor() # New cursor
        cursor_status.execute("select distinct status from main_table;")
        slist = [row[0] for row in cursor_status.fetchall()]
        cursor_status.close() # Close cursor
        print(f"Distinct statuses: {slist}")

        # --- Fetch distinct assigned employees ---
        cursor_employees = conn.cursor() # New cursor
        cursor_employees.execute("select distinct e.employee_name from assign a JOIN employee e ON a.assigned_id = e.employee_id;")
        elist = [row[0] for row in cursor_employees.fetchall()]
        cursor_employees.close() # Close cursor
        print(f"Distinct employees: {elist}")

        # --- Fetch distinct sources ---
        cursor_sources = conn.cursor() # New cursor
        cursor_sources.execute("select distinct source from main_table order by source;")
        sourcelist = [row[0] for row in cursor_sources.fetchall()]
        cursor_sources.close() # Close cursor
        print(f"Distinct sources: {sourcelist}")

        return {
            "ticket_ids": ticket_ids,
            "ticket_count": len(ticket_ids),
            "table_contents": final_table,
            "details":details,
            "distinct_triages":[f"L{i}" for i in range(1,6)],
            "distinct_categories":clist,
            "distinct_status":slist,
            "distinct_assigned_to":elist,
            "distinct_sources":sourcelist
        }
    except Exception as e:
        print(f"❌ Error fetching ticket data: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {e}")
    finally:
        # Ensure the connection is closed in the end
        if conn:
            conn.close()

# The rest of your code (update_ticket, chat_query, etc.) remains the same
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection
from assign import assign_ticket
router = APIRouter()
from models import TicketUpdate


@app.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, update: TicketUpdate):
    print("=== Update Request ===")
    print("Ticket ID:", ticket_id)
    print("Payload:", update)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        print("ABOUT TO DO SQL CHANGE 🤢")
        cursor.execute("""
            UPDATE processed
            SET triage = %s,
                category = %s
            WHERE ticket_id = %s
        """, (update.triage, update.category, ticket_id))
        conn.commit()
        # The assign_ticket function might open its own cursor or use the passed conn
        # Ensure it properly closes its cursors if it opens new ones
        assign_ticket(ticket_id,conn) # Pass the connection to assign_ticket
        
        # Ensure commit for main_table update as well
        cursor.execute("""UPDATE main_table
        SET status = %s
        WHERE ticket_id = %s
        """, (update.status, ticket_id))
        conn.commit() # Commit this update too

        print(f"Updated ticket {ticket_id} with triage={update.triage}, status={update.status}, category={update.category}")

        return {"message": "Ticket updated successfully"}
    except Exception as e:
        print(f"Error updating ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.get("/chat")
def chat_query(user_query: str = Query(...)):
    print(f"Received query: {user_query}")
    try:
        response = get_ticket_qa_chain(user_query)
        print("Response:", response)
        return response
    except Exception as e:
        print("❌ Internal error:", e)
        return {"error": str(e)}