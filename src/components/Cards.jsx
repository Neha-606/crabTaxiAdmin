export default function Cards() {
  return (
    <div className="cards">

      <div className="card welcome">
        <h3>Welcome Back!</h3>
        <p>Go Admin Dashboard</p>
        <button>Update Profile</button>
      </div>

      <div className="card">
        <h4>Bookings</h4>
        <p>17</p>
      </div>

      <div className="card">
        <h4>Revenue</h4>
        <p>$2365.12</p>
      </div>

      <div className="card">
        <h4>Customers</h4>
        <p>47</p>
      </div>

    </div>
  );
}