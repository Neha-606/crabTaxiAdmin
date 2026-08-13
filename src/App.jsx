import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Cards from "./components/Cards";
import Customers from "./pages/Customer";
import AddCustomer from "./pages/AddCustomer";
import Drivers from "./pages/Drivers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DriverProfile from "./pages/DriverProfile";
import RiderProfile from "./pages/RiderProfile";
import ResetPassword from "./pages/ResetPassword";
import BookRide from "./pages/BookRide";
import RequestedRides from "./pages/RequestedRides";

import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

//  PROTECTED ROUTE
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/*  Default route */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/*  Protected Admin Panel */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <h2>Last 7 Days</h2>
                  <Cards />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/drivers"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <Drivers />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <Customers />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/customers/add"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <AddCustomer />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/driver-profile"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <DriverProfile />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/rider-profile"
        element={
          <PrivateRoute>
            <div className="app">
              <Sidebar />
              <div className="main">
                <Header />
                <div className="content">
                  <RiderProfile />
                </div>
              </div>
            </div>
          </PrivateRoute>
        }
      />

      <Route
  path="/dispatcher/book-ride"
  element={
    <PrivateRoute>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Header />
          <div className="content">
            <BookRide />
          </div>
        </div>
      </div>
    </PrivateRoute>
  }
/>

<Route
  path="/dispatcher/requestedrides"
  element={
    <PrivateRoute>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Header />
          <div className="content">
            <RequestedRides />
          </div>
        </div>
      </div>
    </PrivateRoute>
  }
/>
    </Routes>
  );
}

export default App;
