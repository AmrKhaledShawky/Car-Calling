import { useState, useMemo } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import "./review.css";
import { FaEye, FaThumbsUp, FaStar } from "react-icons/fa";

const AdminReviews = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersData, setUsersData] = useState(useMemo(() => [
    {
      id: 1,
      name: "Ahmed Ali",
      email: "ahmed@gmail.com",
      phone: "01012345678",
      reviews: [
        { id: 1, text: "Great service!", date: "2026-03-01", rating: 5 },
        { id: 2, text: "Car was dirty", date: "2026-03-05", rating: 3 }
      ]
    },
    {
      id: 2,
      name: "Sara Mohamed",
      email: "sara@gmail.com",
      phone: "01198765432",
      reviews: [
        { id: 1, text: "Very polite driver", date: "2026-02-10", rating: 4 }
      ]
    }
  ], []));

  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handler: React & remove review
  const handleReact = (userId, reviewId) => {
    const user = usersData.find(u => u.id === userId);
    const review = user.reviews.find(r => r.id === reviewId);

    // Simulate notifying the user (could be replaced with API call)
    alert(`Notification sent to ${user.name}: Your review "${review.text}" received a reaction!`);

    // Remove review & notify admin
    setUsersData(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, reviews: u.reviews.filter(r => r.id !== reviewId) };
      }
      return u;
    }));

    showNotification(`You reacted to review: "${review.text}"`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<FaStar key={i} color={i <= rating ? "#FFD700" : "#ccc"} />);
    }
    return stars;
  };

  return (
    <AdminLayout>
      <div className="reviews-container">

        {notification && <div className="notification">{notification}</div>}

        <table className="reviews-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Reviews</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.reviews.length}</td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedUser(user)}>
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for Reviews */}
        {selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Reviews for {selectedUser.name}</h3>

              <table className="reviews-details">
                <thead>
                  <tr>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Rating</th>
                    <th>React</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.reviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.text}</td>
                      <td>{review.date}</td>
                      <td>{renderStars(review.rating)}</td>
                      <td>
                        <button
                          className="react-btn"
                          onClick={() => handleReact(selectedUser.id, review.id)}
                        >
                          <FaThumbsUp />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedUser.reviews.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>No reviews left</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button className="close-btn" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminReviews;