import { useEffect, useRef, useState } from "react";

function App() {
  const [wss, setWss] = useState<WebSocket>();
  const [socketId, setSocketId] = useState<string | null>(null); // To store the client’s unique ID
  //@ts-ignore
  const [msg, setMsg] = useState<>([])
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setWss(ws);
    ws.onopen = () => {
      console.log("connection");
    }

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      console.log("Message received from server:", parsedMessage);

      // // Append new message to the state
     
      if (parsedMessage.type === "connection_ack") {
        // Store the socketId received from the server

        setSocketId(parsedMessage.socketId);
        console.log("Received socketId:", parsedMessage.socketId);
      } else {
        // Append new messages to the state
         //@ts-ignore
        setMsg((prev) => [...prev, parsedMessage]);
      }
    }
  }, []);

  const ConnectToServer = () => {
    wss?.send('{"type":"Join" , "payload":{ "message":"123" }}')
  }

  const sendMessage = () => {
    if (ref.current) {
      const message = ref.current.value;

      wss?.send(`{"type":"Chat" , "payload": {"message":"${message}"}}`);
    } else {
      console.error('Cant send empty msg');
    }
  }



  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100vw',
        minHeight: '100vh',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
          color: '#333',
        }}
      >
        Chat App
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'black',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: '400px',
            overflowY: 'auto',
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#888',
              fontStyle: 'italic',
            }}
          >
            {msg && msg.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {msg.map((ev, index) => (
                  
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      //@ts-ignore
                      justifyContent: ev.socketId === socketId? 'flex-start' : 'flex-end',
                    }}
                  >
                    
                    <p
                      style={{
                        maxWidth: '60%',
                        padding: '10px',
                        borderRadius: '10px',
                      //@ts-ignore
                        backgroundColor:ev.socketId === socketId? '#d1e7dd' : '#cfe2ff',
                        color: '#000',
                        textAlign: 'left',
                      }}
                      
                    >
                      
                      {
                        //@ts-ignore
                      ev?.msg} 
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              'No messages yet'
            )}
          </div>

        </div>

        <div
          style={{
            display: 'flex',
            padding: '20px',
            gap: '10px',
          }}
        >
          <input
            type="text"
            placeholder="Type your message"
            style={{
              flex: '1',
              padding: '10px',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '5px',
              outline: 'none',
            }}
            ref={ref}
          />
          <button
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onClick={sendMessage}
          >
            Send
          </button>
          <button onClick={ConnectToServer} style={{ borderRadius: '50px', fontSize: '12px' }}>Connect</button>
        </div>
      </div>
    </div>
  );
}

export default App;