#!/bin/bash

# Tell user we're starting the servers
echo "Starting React and Phoenix servers..."

gnome-terminal \
    --window -- bash -c "npm run dev --prefix frontend"
    
gnome-terminal \
    --window -- bash -c "cd backend && mix phx.server"

echo "Servers started, go to localhost:5173 to view the app"