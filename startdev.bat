@echo off
:: TESTING ONLY!!
echo Starting React and Phoenix servers...

:: Install backend dependencies
cd backend
call mix deps.get
cd ..

:: Install frontend dependencies
cd frontend
call npm Install
cd ..

:: Launch Windows Terminal with two tabs
wt -d backend --title "Backend" cmd /k "mix phx.server" ; new-tab -d frontend --title "Frontend" cmd /k "npm run dev"

echo Servers started, go to http://localhost:5173 to view the app