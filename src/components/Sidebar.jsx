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

import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      
      <ul className="menu">

        <li>
          <FaTachometerAlt />
          <span>Dashboard</span>
        </li>

        <li>
          <FaUsers />
          <span>Customers</span>
        </li>

        <li>
          <FaUserTie />
          <span>Drivers</span>
        </li>

        <li>
          <FaCar />
          <span>Dispatcher</span>
          <FaChevronRight className="arrow" />
        </li>

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