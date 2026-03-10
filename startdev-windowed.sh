#!/bin/bash

# Tell user we're starting the servers
echo "Starting React and Phoenix servers..."

cd backend
mix deps.get

cd ../frontend
npm install

cd ..

# gnome-terminal no longer reliably supports "different command per tab"
# without using deprecated flags in some versions/distros. The most reliable
# non-deprecated approach is opening two windows.
#
# '; exec bash' keeps each window open if the server stops or crashes.
gnome-terminal --title="Frontend" -- bash -c 'cd frontend && npm run dev; exec bash' &
gnome-terminal --title="Backend"  -- bash -c 'cd backend && mix phx.server; exec bash' &

echo "Servers started, go to http://localhost:5173 to view the app"