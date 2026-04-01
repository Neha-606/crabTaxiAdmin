import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Cards from "./components/Cards";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="content">
          <h2>Last 7 Days</h2>

          <Cards />

          <div className="charts">
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;