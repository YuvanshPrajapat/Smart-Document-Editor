from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter(tags=["Real-Time Collaboration"])

# THE SWITCHBOARD OPERATOR
class ConnectionManager:
    def __init__(self):
        # Maps a Document ID to a list of active WebSockets (users)
        # Example: {"doc_123": [user1_socket, user2_socket]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, doc_id: str):
        """Accepts a new connection and adds them to the correct document room."""
        await websocket.accept()
        
        # If this is the first person opening the doc, create the room
        if doc_id not in self.active_connections:
            self.active_connections[doc_id] = []
            
        # Add the user to the room
        self.active_connections[doc_id].append(websocket)
        print(f"User connected to {doc_id}. Total users in room: {len(self.active_connections[doc_id])}")

    def disconnect(self, websocket: WebSocket, doc_id: str):
        """Removes a user when they close the browser tab."""
        if doc_id in self.active_connections:
            if websocket in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(websocket)
                print(f"User disconnected from {doc_id}. Remaining: {len(self.active_connections[doc_id])}")
            
            # If the room is empty, delete it to save memory
            if len(self.active_connections[doc_id]) == 0:
                del self.active_connections[doc_id]
                print(f"Room {doc_id} is empty and has been closed.")

    async def broadcast(self, message: bytes, doc_id: str, sender: WebSocket):
        """
        Sends the binary update to everyone in the room EXCEPT the person who typed it.
        Notice that 'message' is strictly of type 'bytes' now!
        """
        if doc_id in self.active_connections:
            for connection in self.active_connections[doc_id]:
                if connection != sender:
                    # CRITICAL FIX: Sending binary bytes, not text!
                    await connection.send_bytes(message)

# Create a single instance of our manager to run the whole app
manager = ConnectionManager()

# THE WEBSOCKET ENDPOINT

@router.websocket("/ws/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: str):
    # 1. User connects to the document room
    await manager.connect(websocket, doc_id)
    
    try:
        # 2. Keep the phone line open forever, listening for changes
        while True:
            # CRITICAL FIX: TipTap's Yjs sends compressed binary data.
            # We must use receive_bytes() instead of receive_text()!
            data = await websocket.receive_bytes()
            
            # Instantly broadcast those bytes to everyone else in the room
            await manager.broadcast(data, doc_id, websocket)
            
    except WebSocketDisconnect:
        # 3. If they close the tab, lose internet, or navigate away, disconnect them safely
        manager.disconnect(websocket, doc_id)
    except Exception as e:
        # Catch any other unexpected network drops gracefully
        print(f"WebSocket error in room {doc_id}: {str(e)}")
        manager.disconnect(websocket, doc_id)