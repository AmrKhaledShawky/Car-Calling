import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import "./mycars.css";

export default function MyCars() {

  const initialCars = [
    {
      id: 1,
      name: "BMW X5",
      type: "SUV",
      price: 120,
      status: "Ready",
      seats: 5,
      year: 2021,
      mileage: "15000 km",
      fuel: "Petrol",
      engine: "3.0L V6",
      description: "Luxury SUV with strong performance",
      image: "",
      revenue: 2400
    },
    {
      id: 2,
      name: "Toyota Corolla",
      type: "Sedan",
      price: 75,
      status: "Rented",
      seats: 5,
      year: 2020,
      mileage: "28000 km",
      fuel: "Petrol",
      engine: "1.8L",
      description: "Reliable and fuel efficient sedan",
      image: "",
      revenue: 900
    },
    {
      id: 3,
      name: "Audi A6",
      type: "Sedan",
      price: 140,
      status: "Maintenance",
      seats: 5,
      year: 2022,
      mileage: "9000 km",
      fuel: "Hybrid",
      engine: "2.0L Turbo",
      description: "Premium luxury sedan",
      image: "",
      revenue: 1800
    }
  ];

  const [cars, setCars] = useState(initialCars);
  const [editingCar, setEditingCar] = useState(null);
  const [carToDelete, setCarToDelete] = useState(null);
  const [addingCar, setAddingCar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Sedan",
    price: "",
    status: "Ready",
    seats: "",
    year: "",
    mileage: "",
    fuel: "Petrol",
    engine: "",
    description: "",
    image: ""
  });

  const carTypes = ["Sedan", "SUV", "Hatchback", "Convertible", "Truck", "Electric"];

  useEffect(() => {
    if (editingCar || carToDelete || addingCar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [editingCar, carToDelete, addingCar]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setFormData({
      ...formData,
      image: preview
    });
  };

  const handleEdit = (car) => {
    setEditingCar(car);

    setFormData({
      name: car.name,
      type: car.type,
      price: car.price,
      status: car.status,
      seats: car.seats,
      year: car.year,
      mileage: car.mileage,
      fuel: car.fuel,
      engine: car.engine,
      description: car.description,
      image: car.image
    });
  };

  const isFormValid = () => {
    // ensure all fields except description and image are filled
    const {
      name,
      type,
      price,
      status,
      seats,
      year,
      mileage,
      fuel,
      engine
    } = formData;
    return (
      name &&
      type &&
      price !== "" &&
      status &&
      seats !== "" &&
      year !== "" &&
      mileage &&
      fuel &&
      engine
    );
  };

  const handleSave = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    setCars(
      cars.map((car) =>
        car.id === editingCar.id
          ? {
              ...car,
              ...formData,
              price: Number(formData.price),
              seats: Number(formData.seats)
            }
          : car
      )
    );

    setEditingCar(null);
    toast.success("Car updated successfully ✏️");
  };

  const confirmDelete = () => {
    setCars(cars.filter((car) => car.id !== carToDelete.id));
    setCarToDelete(null);
    toast.success("Car deleted successfully 🗑️");
  };

  const handleAddSave = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields to add a new car.");
      return;
    }

    const newCar = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      price: Number(formData.price),
      status: formData.status,
      seats: Number(formData.seats),
      year: formData.year,
      mileage: formData.mileage,
      fuel: formData.fuel,
      engine: formData.engine,
      description: formData.description,
      image: formData.image,
      revenue: 0
    };

    setCars([...cars, newCar]);
    setAddingCar(false);

    toast.success("Car added successfully 🚗");
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
              status: "Ready",
              seats: "",
              year: "",
              mileage: "",
              fuel: "Petrol",
              engine: "",
              description: "",
              image: ""
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
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Year</th>
              <th>Seats</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th>Mileage</th>
              <th>Fuel</th>
              <th>Engine</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {cars.map((car) => (

              <tr key={car.id}>

                <td>
                  {car.image && (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="car-thumb"
                    />
                  )}
                </td>

                <td>{car.name}</td>
                <td>{car.type}</td>
                <td>{car.year}</td>
                <td>{car.seats}</td>
                <td>${car.price}</td>

                <td>
                  <span className={`status ${car.status.toLowerCase()}`}>
                    {car.status}
                  </span>
                </td>

                <td>{car.mileage}</td>
                <td>{car.fuel}</td>
                <td>{car.engine}</td>

                <td>${car.revenue}</td>

                <td className="actions">

                  <Pencil
                    size={18}
                    className="edit-icon"
                    onClick={() => handleEdit(car)}
                  />

                  <Trash2
                    size={18}
                    className="delete-icon"
                    onClick={() => setCarToDelete(car)}
                  />

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
                <label>Car Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  style={{ width: "100%", marginTop: "10px", borderRadius: "10px" }}
                />
              )}

              <div className="form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option>Ready</option>
                  <option>Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Seats</label>
                <input type="number" name="seats" value={formData.seats} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Mileage</label>
                <input name="mileage" value={formData.mileage} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fuel</label>
                <select name="fuel" value={formData.fuel} onChange={handleChange} required>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label>Engine</label>
                <input name="engine" value={formData.engine} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
              </div>

            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditingCar(null)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
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
                <label>Car Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  style={{ width: "100%", marginTop: "10px", borderRadius: "10px" }}
                />
              )}

              <div className="form-group">
                <label>Car Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Car Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option>Ready</option>
                  <option>Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Seats</label>
                <input type="number" name="seats" value={formData.seats} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Mileage</label>
                <input name="mileage" value={formData.mileage} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fuel</label>
                <select name="fuel" value={formData.fuel} onChange={handleChange} required>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label>Engine</label>
                <input name="engine" value={formData.engine} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
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