from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from ticketbackend.database import get_connection
except ImportError:
    from database import get_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ticket_count():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT count(ticket_id) FROM processed;")
    ticketcount = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return ticketcount


@app.get("/ticket_data")
def get_ticket_data():
    conn = get_connection()
    cursor = conn.cursor()

    # Get ticket count and ticket_ids (if you still want them separately)
    cursor.execute("SELECT ticket_id FROM processed;")
    result = cursor.fetchall()
    ticket_ids = [row[0] for row in result]

    # Get ticket details
    cursor.execute("""
        SELECT M.ticket_id, M.title, M.status, M.source, P.summary, P.priority, 
               P.category, P.solution, E.employee_name
        FROM main_table AS M, processed AS P, employee AS E, assign AS A
        WHERE M.ticket_id = P.ticket_id
        AND M.ticket_id = A.ticket_id
        AND A.assigned_id = E.employee_ID;
    """)
    rows = cursor.fetchall()

    final_table = []
    for row in rows:
        final_table.append({
            "ticket_id": row[0],
            "title": row[1],
            "priority": row[5],
            "category": row[6],
            "status": row[2],
            "employee_name": row[8],
            "source": row[3]
        })
    # ticket_id from main_table
    # title from main_table
    # status from main_table
    # reported_date from main_table
    # summary from processed
    # description from main_table
    # priority from processed
    # priority_reason (no reason right now, will add later. use placeholder till then)
    # category from processed
    # category_reason (use placeholder)
    # assigned employee from assign
    # solution from processed
    cursor.execute("""select m.ticket_id, m.title, m.status, m.reported_date, p.summary, m.description, p.priority, p.category, e.employee_name, p.solution
from main_table as m, processed as p, employee as e, assign as a
where m.ticket_id = p.ticket_id
and m.ticket_id = a.ticket_id
and a.assigned_id = e.employee_id;""")
    datas = cursor.fetchall()
    details = []
    for r in datas:
        details.append({
            "ticket_id":r[0],
            "ticket_title":r[1],
            "ticket_status":r[2],
            "ticket_reported_date":r[3],
            "ticket_summary":r[4],
            "ticket_description":r[5],
            "ticket_priority":r[6],
            "ticket_priority_reason":"No reason for priority yet",
            "ticket_category":r[7],
            "ticket_category_reason":"No reason for category yet",
            "ticket_assigned_employee":r[8],
            "ticket_solution":r[9]
        })
    cursor.execute("select distinct category from processed;")
    c = cursor.fetchall()
    clist = []
    for row in c:
        clist.append(row[0])
    cursor.execute("select distinct status from main_table;")
    c = cursor.fetchall()
    slist = []
    for row in c:
        slist.append(row[0])
    cursor.execute("select distinct e.employee_name from assign a, employee e where a.assigned_id = e.employee_id;")
    elist = []
    c = cursor.fetchall()
    for row in c:
        elist.append(row[0])
    cursor.execute("select distinct source from main_table;")
    sourcelist = []
    c = cursor.fetchall()
    for row in c:
        sourcelist.append(row[0])
        
    return {
        "ticket_ids": ticket_ids,
        "ticket_count": len(ticket_ids),
        "table_contents": final_table,
        "details":details,
        "distinct_categories":clist,
        "distinct_status":slist,
        "distinct_assigned_to":elist,
        "distinct_sources":sourcelist
    }