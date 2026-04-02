from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter(tags=["Real-Time Collaboration"])

# The Switchboard Operator
class ConnectionManager:
    def __init__(self):
        # This dictionary maps a Document ID to a list of active WebSockets (users)
        # Example: {"doc_123": [user1_socket, user2_socket]}
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, doc_id: str):
        await websocket.accept()
        # If this is the first person opening the doc, create the room
        if doc_id not in self.active_connections:
            self.active_connections[doc_id] = []
        # Add the user to the room
        self.active_connections[doc_id].append(websocket)

    def disconnect(self, websocket: WebSocket, doc_id: str):
        # Remove the user when they close the browser tab
        if doc_id in self.active_connections:
            self.active_connections[doc_id].remove(websocket)
            # If the room is empty, delete it to save memory
            if len(self.active_connections[doc_id]) == 0:
                del self.active_connections[doc_id]

    async def broadcast(self, message: str, doc_id: str, sender: WebSocket):
        # Send the update to everyone in the room EXCEPT the person who just typed it
        if doc_id in self.active_connections:
            for connection in self.active_connections[doc_id]:
                if connection != sender:
                    await connection.send_text(message)

# Create a single instance of our manager to run the whole app
manager = ConnectionManager()

# ---------------------------------------------------------
# THE WEBSOCKET ENDPOINT
# ---------------------------------------------------------
@router.websocket("/ws/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: str):
    # 1. User connects to the document room
    await manager.connect(websocket, doc_id)
    try:
        # 2. Keep the phone line open forever, listening for changes
        while True:
            # Wait for TipTap data from the frontend
            data = await websocket.receive_text()
            
            # Instantly broadcast that data to everyone else in the room
            await manager.broadcast(data, doc_id, websocket)
            
    except WebSocketDisconnect:
        # 3. If they close the tab or lose internet, disconnect them safely
        manager.disconnect(websocket, doc_id)