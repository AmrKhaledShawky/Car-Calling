import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import "./mycars.css";

export default function MyCars() {
  const initialCars = [
    { id: 1, name: "BMW X5", type: "SUV", price: 120, status: "Ready", revenue: 2400 },
    { id: 2, name: "Toyota Corolla", type: "Sedan", price: 75, status: "Rented", revenue: 900 },
    { id: 3, name: "Audi A6", type: "Sedan", price: 140, status: "Maintenance", revenue: 1800 }
  ];

  const [cars, setCars] = useState(initialCars);
  const [editingCar, setEditingCar] = useState(null);
  const [carToDelete, setCarToDelete] = useState(null);
  const [addingCar, setAddingCar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Sedan",
    price: "",
    status: "Ready"
  });

  const carTypes = ["Sedan", "SUV", "Hatchback", "Convertible", "Truck", "Electric"];

  // Lock scroll
  useEffect(() => {
    if (editingCar || carToDelete || addingCar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [editingCar, carToDelete, addingCar]);

  // ================= EDIT =================
  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      type: car.type,
      price: car.price,
      status: car.status
    });
  };

  const handleSave = () => {
    setCars(
      cars.map((car) =>
        car.id === editingCar.id
          ? { ...car, ...formData, price: Number(formData.price) }
          : car
      )
    );

    setEditingCar(null);
    toast.success("Car updated successfully ✏️");
  };

  // ================= DELETE =================
  const confirmDelete = () => {
    setCars(cars.filter((car) => car.id !== carToDelete.id));
    setCarToDelete(null);
    toast.success("Car deleted successfully 🗑️");
  };

  // ================= ADD =================
  const handleAddSave = () => {
    const newCar = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      price: Number(formData.price),
      status: formData.status,
      revenue: 0
    };

    setCars([...cars, newCar]);
    setAddingCar(false);
    toast.success("Car added successfully 🚗");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setEditingCar(null);
      setCarToDelete(null);
      setAddingCar(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mycars-header">
        <h2>My Cars</h2>
        <button
          className="add-car-btn"
          onClick={() => {
            setFormData({
              name: "",
              type: "Sedan",
              price: "",
              status: "Ready"
            });
            setAddingCar(true);
          }}
        >
          <Plus size={18} /> Add Car
        </button>
      </div>

      <div className="cars-table-wrapper">
        <table className="cars-table">
          <thead>
            <tr>
              <th>Car Name</th>
              <th>Type</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td>{car.name}</td>
                <td>{car.type}</td>
                <td>${car.price}</td>
                <td>
                  <span className={`status ${car.status.toLowerCase()}`}>
                    {car.status}
                  </span>
                </td>
                <td>${car.revenue}</td>
                <td className="actions">
                  <Pencil size={18} className="edit-icon" onClick={() => handleEdit(car)} />
                  <Trash2 size={18} className="delete-icon" onClick={() => setCarToDelete(car)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingCar && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Car</h3>
              <button className="close-btn" onClick={() => setEditingCar(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Car Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Car Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price / Day</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Ready">Ready</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditingCar(null)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {carToDelete && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-card delete-modal">
            <div className="modal-header">
              <h3>Delete Car</h3>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{carToDelete.name}</strong>?</p>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setCarToDelete(null)}>Cancel</button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {addingCar && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Car</h3>
              <button className="close-btn" onClick={() => setAddingCar(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Car Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Car Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price / Day</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Ready">Ready</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setAddingCar(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddSave}>Add Car</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}