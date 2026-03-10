#!/bin/bash

# Tell user we're starting the servers
echo "Starting React and Phoenix servers..."

# Install dependencies
cd backend
mix deps.get

cd ../frontend
npm install

cd ..

# Define the cleanup process
# This will run automatically when you exit the script (like pressing Ctrl+C)
trap 'echo -e "\nShutting down servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT SIGTERM EXIT

echo "Servers started, go to http://localhost:5173 to view the app"
echo "(Press Ctrl+C to stop both servers)"

# Start backend in the background and save its Process ID (PID)
cd backend
mix phx.server &
BACKEND_PID=$!

# Start frontend in the background and save its Process ID (PID)
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# The wait command keeps the script running and listening for the trap
wait