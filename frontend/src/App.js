import React, { useEffect, useState, useMemo } from "react";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API = "/api";

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/employees`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const addEmployee = async () => {
    if (!name || !department || !email) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department, email }),
      });

      if (response.ok) {
        alert("Employee Added Successfully");
        loadEmployees();
        setName("");
        setDepartment("");
        setEmail("");
      } else {
        alert("Failed to Add Employee");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const updateEmployee = async () => {
    if (!id || !name || !department || !email) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API}/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department, email }),
      });

      if (response.ok) {
        alert("Employee Updated Successfully");
      } else {
        alert("Employee Not Found");
      }

      loadEmployees();
      setId("");
      setName("");
      setDepartment("");
      setEmail("");
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const deleteEmployee = async () => {
    if (!id) {
      alert("Enter Employee ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/employees/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Employee Deleted Successfully");
      } else {
        alert("Employee Not Found");
      }

      loadEmployees();
      setId("");
      setName("");
      setDepartment("");
      setEmail("");
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const clearForm = () => {
    setId("");
    setName("");
    setDepartment("");
    setEmail("");
  };

  const departmentCount = [
    ...new Set(employees.map((emp) => emp.department)),
  ].length;

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(emp.id || "").includes(searchTerm)
    );
  }, [employees, searchTerm]);

  const handleSelectEmployee = (emp) => {
    setId(emp.id);
    setName(emp.name || "");
    setDepartment(emp.department || "");
    setEmail(emp.email || "");
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-content">
          <div className="brand">
            <div className="brand-icon">EM</div>
            <div className="brand-text">
              <h1>Employee Manager</h1>
              <p>Workforce Administration</p>
            </div>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>System Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Metric Cards */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-info">
              <p>Total Employees</p>
              <h2>{employees.length}</h2>
            </div>
            <div className="stat-icon-wrapper blue">👥</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Departments</p>
              <h2>{departmentCount}</h2>
            </div>
            <div className="stat-icon-wrapper purple">🏢</div>
          </div>
        </section>

        {/* Form and Table Section */}
        <div className="content-grid">
          {/* Form Side */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Employee Details</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label">Employee ID (For Edit/Delete)</label>
                  <input
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. 101"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="form-input"
                  />
                </div>

                <div className="button-grid">
                  <button type="button" onClick={addEmployee} className="btn btn-primary">
                    Add
                  </button>
                  <button type="button" onClick={updateEmployee} className="btn btn-secondary">
                    Update
                  </button>
                  <button type="button" onClick={deleteEmployee} className="btn btn-danger">
                    Delete
                  </button>
                  <button type="button" onClick={clearForm} className="btn btn-outline">
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table Side */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Records ({filteredEmployees.length})</h3>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="form-input search-box"
              />
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} onClick={() => handleSelectEmployee(emp)}>
                        <td>#{emp.id}</td>
                        <td>
                          <div className="emp-cell">
                            <div className="avatar">{getInitials(emp.name)}</div>
                            <span className="emp-name">{emp.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="dept-pill">{emp.department}</span>
                        </td>
                        <td>{emp.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No employee records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
