this is a react code for the front end of team beta- ticket summarizer

The frontend uses React.js to display everything

For the backend, FastAPI is used which gets information from the MySQL database and feeds it to the frontend using axios

to run it, open two terminals:
1. npm run dev
2. uvicorn ticketbackend.main:app --reload