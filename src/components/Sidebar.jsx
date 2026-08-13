import {
  FaUsers,
  FaUserTie,
  FaCar,
  FaExclamationCircle,
  FaCarSide,
  FaMoneyBill,
  FaRoute,
  FaMapMarkerAlt,
  FaBullhorn,
  FaTicketAlt,
  FaChartBar,
  FaUserShield,
  FaCog,
  FaChevronRight,
  FaTachometerAlt
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

import "./Sidebar.css";

export default function Sidebar() {

  const [dispatcherOpen, setDispatcherOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <ul className="menu">

        <li className={isActive("/") ? "active" : ""}>
          <Link to="/" className="menu-link">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>
        </li>

        <li className={isActive("/customers") ? "active" : ""}>
          <Link to="/customers" className="menu-link">
            <FaUsers />
            <span>Customers</span>
          </Link>
        </li>

        <li className={isActive("/Drivers") ? "active" : ""}>
        <Link to="/Drivers" className="menu-link">
          <FaUserTie />
          <span>Drivers</span>
          </Link>
        </li>

        <>
  <li onClick={() => setDispatcherOpen(!dispatcherOpen)}>
    <FaCar />
    <span>Dispatcher</span>
    <FaChevronRight
      className="arrow"
      style={{
        transform: dispatcherOpen ? "rotate(90deg)" : "rotate(0deg)",
        transition: "0.3s"
      }}
    />
  </li>

  {dispatcherOpen && (
    <ul className="submenu">
      <li className={isActive("/dispatcher/book-ride") ? "active" : ""}>
        <Link to="/dispatcher/book-ride" className="menu-link">
          <span className="submenu-text">Book Ride</span>
        </Link>
      </li>
      <li className={isActive("/dispatcher/requestedrides") ? "active" : ""}>
        <Link to="/dispatcher/requestedrides" className="menu-link">
          <span className="submenu-text">Requested Rides</span>
        </Link>
      </li>
    </ul>
  )}
</>

        <li>
          <FaExclamationCircle />
          <span>Dispute</span>
        </li>

        <li>
          <FaCarSide />
          <span>Vehicle Types</span>
        </li>

        <li>
          <FaMoneyBill />
          <span>Transactions</span>
        </li>

        <li>
          <FaRoute />
          <span>Trips</span>
        </li>

        <li>
          <FaMapMarkerAlt />
          <span>Bird Eye View</span>
        </li>

        <li>
          <FaBullhorn />
          <span>Promotions</span>
        </li>

        <li>
          <FaTicketAlt />
          <span>Promo Codes</span>
        </li>

        <li>
          <FaChartBar />
          <span>Reports</span>
          <FaChevronRight className="arrow" />
        </li>

        <li>
          <FaUserShield />
          <span>System Access</span>
          <FaChevronRight className="arrow" />
        </li>

        <li>
          <FaCog />
          <span>Marketing</span>
          <FaChevronRight className="arrow" />
        </li>

      </ul>
    </div>
  );
}