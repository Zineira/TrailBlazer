import React from "react";
import MapComponent from "./components/map";
import Chat from "./components/chat";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <MapComponent />
      <Chat />
    </div>
  );
}

export default App;
