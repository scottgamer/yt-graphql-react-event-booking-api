import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import EmployeeList from "../components/Employees/EmployeeList/EmployeeList";
import Spinner from "../components/Spinner/Spinner";
import AuthContext from "../context/auth-context";
import "./Events.css";

class EmployeesPage extends Component {
  state = {
    creating: false,
    employees: [],
    isLoading: false,
    selectedEmployee: null
  };
  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.firstnameElRef = React.createRef();
    this.lastnameElRef = React.createRef();
    this.line1ElRef = React.createRef();
    this.line2ElRef = React.createRef();
    this.cityElRef = React.createRef();
    this.stateElRef = React.createRef();
    this.zipcodeElRef = React.createRef();
    this.skillElRef = React.createRef();
    // this.addressElRef = React.createRef();
    // this.skillElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEmployees();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const firstname = this.firstnameElRef.current.value;
    const lastname = this.lastnameElRef.current.value;
    const line1 = this.line1ElRef.current.value;
    const line2 = this.line2ElRef.current.value;
    const city = this.cityElRef.current.value;
    const state = this.stateElRef.current.value;
    const zipCode = this.zipcodeElRef.current.value;
    const skill = this.skillElRef.current.value;
    // const address = this.addressElRef.current.value;
    // const skill = this.skillElRef.current.value;

    if (
      firstname.trim().length === 0 ||
      lastname.trim().length === 0 ||
      line1.trim().length === 0 ||
      line2.trim().length === 0 ||
      city.trim().length === 0 ||
      state.trim().length === 0 ||
      zipCode.trim().length === 0 ||
      skill.trim().length === 0
    ) {
      return;
    }

    const address = {
      line1,
      line2,
      city,
      state,
      zipCode
    };

    const requestBody = {
      query: `
          mutation {
            createEmployee(employeeInput: {firstname: "${firstname}", lastname: "${lastname}", addresses: [${address}], skills: [${skill}]}) {
              _id
              firstname
              lastname
            }
          }
        `
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEmployees = [...prevState.employees];
          updatedEmployees.push({
            _id: resData.data.createEmployee._id,
            firstname: resData.data.createEmployee.firstname,
            lastname: resData.data.createEmployee.lastname
          });
          return { employees: updatedEmployees };
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEmployee: null });
  };

  fetchEmployees() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            employees {
              _id
              firstname
              lastname 
              addresses {
                _id
                line1
                line2
                city
                state
              }
              skills {
                _id
                name
              }
            }
          }
        `
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        const employees = resData.data.employees;
        console.log(employees);
        if (this.isActive) {
          this.setState({ employees: employees, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = employeeId => {
    this.setState(prevState => {
      const selectedEmployee = prevState.employees.find(e => e._id === employeeId);
      return { selectedEmployee: selectedEmployee };
    });
  };

  deleteEmployeeHandler = employeeId => {
    this.setState({ isLoading: true });

    const requestBody = {
      query: `
          mutation {
            deleteEmployee(employeeId: "${employeeId}") {
              _id
              firstname
              lastname 
            }
          }
        `
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        const employees = resData.data.employees;
        console.log(employees);
        if (this.isActive) {
          this.setState({ employees: employees, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEmployee: null });
      return;
    }
    const requestBody = {
      query: `
          mutation {
            bookEvent(eventId: "${this.state.selectedEmployee._id}") {
              _id
             createdAt
             updatedAt
            }
          }
        `
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState({ selectedEmployee: null });
      })
      .catch(err => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEmployee) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Employee"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="firstname">First Name</label>
                <input type="text" id="firstname" ref={this.firstnameElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="lastname">Last Name</label>
                <input type="text" id="lastname" ref={this.lastnameElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="line1">Line 1</label>
                <input type="text" id="line1" ref={this.line1ElRef} />
              </div>
              {/* <div className="form-control">
                <label htmlFor="line2">Line 2</label>
                <input type="text" id="line2" ref={this.line2ElRef} />
              </div> */}
              <div className="form-control">
                <label htmlFor="city">City</label>
                <input type="text" id="city" ref={this.cityElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="state">State</label>
                <input type="text" id="state" ref={this.stateElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="zipcode">Zip Code</label>
                <input type="text" id="zipcode" ref={this.zipcodeElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="skill">Skill</label>
                <input type="text" id="skill" ref={this.skillElRef} />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEmployee && (
          <Modal
            title={this.state.selectedEmployee.firstname}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h1>{this.state.selectedEmployee.title}</h1>
            <h2>{new Date(this.state.selectedEmployee.date).toLocaleDateString()}</h2>
            <p>{this.state.selectedEmployee.description}</p>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>List of Employees</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Add an Employee
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EmployeeList
            employees={this.state.employees}
            authUserId={this.context.userId}
            onDelete={this.deleteEmployeeHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default EmployeesPage;
