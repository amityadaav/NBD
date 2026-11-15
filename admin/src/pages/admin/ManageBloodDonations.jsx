// src/pages/admin/ManageBloodDonations.jsx
import { useState, useEffect } from "react";
import { Droplet, Search, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import "./ManageBloodDonations.css";

const ManageBloodDonations = () => {
  const [donations, setDonations] = useState([
    { id: 1, donorName: "Rahul Sharma", bloodGroup: "O+", units: 1, date: "2023-10-25", status: "Completed", hospital: "City Hospital" },
    { id: 2, donorName: "Priya Patel", bloodGroup: "A-", units: 2, date: "2023-10-26", status: "Pending", hospital: "Apollo Clinic" },
    { id: 3, donorName: "Amit Kumar", bloodGroup: "B+", units: 1, date: "2023-10-27", status: "Completed", hospital: "City Hospital" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic for search
  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-blood-page">
      <div className="page-header">
        <div>
          <h1><Droplet className="header-icon" /> Manage Blood Donations</h1>
          <p>Track, update, and manage all blood donation records.</p>
        </div>
        <button className="btn-primary">+ Add Donation Record</button>
      </div>

      <div className="table-controls">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by donor name or blood group..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Hospital</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.map((donation) => (
              <tr key={donation.id}>
                <td className="font-semibold">{donation.donorName}</td>
                <td>
                  <span className="blood-badge">{donation.bloodGroup}</span>
                </td>
                <td>{donation.units}</td>
                <td>{donation.hospital}</td>
                <td>{donation.date}</td>
                <td>
                  <span className={`status-badge ${donation.status.toLowerCase()}`}>
                    {donation.status === "Completed" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {donation.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="icon-btn edit"><Edit size={16} /></button>
                  <button className="icon-btn delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDonations.length === 0 && (
          <div className="empty-state">No donation records found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageBloodDonations;