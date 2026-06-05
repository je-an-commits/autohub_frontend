import React, { useEffect, useState } from 'react';
import EditCarModal from './EditCarModal';
import api from "../api/axios"

function CarTable({ filter }) {
  const [localCars, setLocalCars] = useState([]);
  useEffect(() => {
    setLocalCars(Array.isArray(filter) ? filter : []);
  }, [filter]);
  const [editingCar, setEditingCar] = useState(null);

  const exportCSV = () => {
    const headers = ['ID', 'Car Model', 'Brand', 'Price', 'Year', 'Status'];
    const rows = localCars.map(car => [
      car.id, car.name, car.brand, car.price, car.year, car.status
    ]);
    const toCsvField = val => `"${String(val).replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(toCsvField).join(','),
      ...rows.map(row => row.map(toCsvField).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventory.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handlePrint = () => window.print();

  const onDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this car?")
    if(confirmed){
      try {
        await api.delete(`/cars/delete/${id}`);
        setLocalCars(prev => prev.filter(car => car.id !== id));
        alert('Car removed from inventory successfully!');
      } catch (err) {
        console.error("Failed to delete car from database:", err);
        alert('Could not delete car. Please try again.');
      }
    }
  };

  const onEdit = async (updatedCar) => {
    try {
      const { id, name, brand, price, year, status } = updatedCar;
      await api.put(`/cars/update/${id}`, { name, brand, price, year, status });
      setLocalCars(prev => prev.map(car => car.id === id ? updatedCar : car));
      alert('Car updated successfully!');
    } catch (err) {
      console.error("Failed to update car:", err);
      alert('Could not update car. Please try again.');
    }
  };

  return (
    <div className="table-container">
      <div className="action-buttons">
        <button className="action-btn" onClick={exportCSV}>📎 Export List</button>
        <button className="action-btn" onClick={handlePrint}>🖨️ Print</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Car Model</th><th>Brand</th><th>Price</th><th>Year</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {localCars.length > 0 ? (
            localCars.map((car, index) => (
              <tr key={car.id || car._id || index}>
                <td>{car.name}</td><td>{car.brand}</td><td>${parseInt(car.price).toLocaleString()}</td><td>{car.year}</td>
                <td><span className={`status-badge status-${car.status === 'Available' ? 'available' : 'sold'}`}>{car.status}</span></td>
                <td>
                  <button className="edit-btn" onClick={() => setEditingCar(car)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => onDelete(car.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>🚫 No cars found matching your search</td></tr>
          )}
        </tbody>
      </table>

      {editingCar && (
        <EditCarModal
          car={editingCar}
          onSave={(updated) => { onEdit(updated); setEditingCar(null); }}
          onClose={() => setEditingCar(null)}
        />
      )}
    </div>
  );
}

export default CarTable;
