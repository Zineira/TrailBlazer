import React from "react";
import MapComponent from "./components/map";
import Chat from "./components/chat";
import "./App.css";

function App() {
  const [markers, setMarkers] = React.useState([]);

  return (
    <div className="app-container">
      <MapComponent markers={markers} />
      <Chat setMarkers={setMarkers} />
    </div>
  );
}

export default App;
