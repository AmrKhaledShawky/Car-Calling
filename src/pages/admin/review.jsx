import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import "./review.css";
import { FaEye, FaStar } from "react-icons/fa";

const renderStars = (rating) => {
  const stars = [];
  for (let index = 1; index <= 5; index += 1) {
    stars.push(<FaStar key={index} color={index <= rating ? "#FFD700" : "#ccc"} />);
  }
  return stars;
};

const AdminReviews = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [reviewGroups, setReviewGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/bookings");
        const bookings = response.data || [];
        const grouped = new Map();

        bookings.forEach((booking) => {
          const reviews = [];

          if (booking.customerReview) {
            reviews.push({
              id: `${booking._id}-customer`,
              text: booking.customerReview,
              date: booking.createdAt,
              rating: booking.customerRating || 0,
              source: "Customer"
            });
          }

          if (booking.ownerReview) {
            reviews.push({
              id: `${booking._id}-owner`,
              text: booking.ownerReview,
              date: booking.createdAt,
              rating: booking.ownerRating || 0,
              source: "Owner"
            });
          }

          if (reviews.length === 0) {
            return;
          }

          const userId = booking.customer?._id || booking.customer?.id || booking.customer?.email;
          const current = grouped.get(userId) || {
            id: userId,
            name: booking.customer?.name || "Unknown user",
            email: booking.customer?.email || "N/A",
            phone: booking.customer?.phone || "N/A",
            reviews: []
          };

          current.reviews.push(...reviews);
          grouped.set(userId, current);
        });

        setReviewGroups(Array.from(grouped.values()));
      } catch (loadError) {
        setError(loadError.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const selectedReviews = useMemo(() => selectedUser?.reviews || [], [selectedUser]);

  return (
    <AdminLayout>
      <div className="reviews-container">
        {loading ? <p>Loading reviews...</p> : null}
        {error ? <p>{error}</p> : null}

        {!loading && !error ? (
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
              {reviewGroups.map((user) => (
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
              {reviewGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>No reviews found in the database.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}

        {selectedUser ? (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Reviews for {selectedUser.name}</h3>

              <table className="reviews-details">
                <thead>
                  <tr>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Rating</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.text}</td>
                      <td>{review.date ? new Date(review.date).toLocaleDateString() : "N/A"}</td>
                      <td>{renderStars(review.rating)}</td>
                      <td>{review.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="close-btn" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
