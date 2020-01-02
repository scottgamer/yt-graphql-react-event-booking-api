import React, { useState, useRef, useContext, useEffect } from "react";

import Modal from "../../components/Modal/Modal";
import Backdrop from "../../components/Backdrop/Backdrop";
import EmployeeList from "../../components/Employees/EmployeeList/EmployeeList";
import Spinner from "../../components/Spinner/Spinner";
import AuthContext from "../../context/auth-context";

import axios from "axios";

import "../Events.css";

const Employees = () => {
  const [employees, setEmployees] = useState({
    creating: false,
    updating: false,
    employees: [],
    selectedEmployee: null
  });

  const [isActive, setActive] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const contextType = useContext(AuthContext);

  // References to html form elements
  const firstnameElRef = useRef(null);
  const lastnameElRef = useRef(null);
  const line1ElRef = useRef(null);
  const line2ElRef = useRef(null);
  const cityElRef = useRef(null);
  const stateElRef = useRef(null);
  const zipcodeElRef = useRef(null);
  const skillElRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
    setActive(false);
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

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

      const response = await axios.post(
        `http://localhost:8000/graphql`,
        JSON.stringify(requestBody),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed!");
      }

      const employeesRes = response.data.data.employees;

      if (isActive) {
        setEmployees({ ...employees, employees: employeesRes });
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      if (isActive) {
        setLoading(false);
      }
    }
  };

  const startCreateEventHandler = () => {
    setEmployees({ creating: true });
  };

  const modalDeleteEmployeeHandler = employeeId => {
    const selectedEmployee = employees.employees.find(
      e => e._id === employeeId
    );

    setEmployees({ ...employees, selectedEmployee });
    setDeleting(true);
  };

  const modalConfirmHandler = async () => {
    try {
      setEmployees({ creating: false });

      const firstname = this.firstnameElRef.current.value;
      const lastname = this.lastnameElRef.current.value;
      const line1 = this.line1ElRef.current.value;
      const line2 = this.line2ElRef.current.value;
      const city = this.cityElRef.current.value;
      const state = this.stateElRef.current.value;
      const zipCode = this.zipcodeElRef.current.value;
      const skill = this.skillElRef.current.value;

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

      const requestBody = {
        query: `
          mutation {
            createEmployee(employeeInput: {firstname: "${firstname}", lastname: "${lastname}", addresses: [{
              line1: "${line1}",
              line2: "${line2}",
              city: "${city}",
              state: "${state}",
              zipcode: "${zipCode}"
            }], skills: [{
              name: "${skill}"
            }]}) {
              _id
              firstname
              lastname
            }
          }
        `
      };

      const token = contextType.token;

      const response = await axios.post(
        `http://localhost:8000/graphql`,
        JSON.stringify(requestBody),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          }
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed!");
      }

      const updatedEmployees = [...employees.employees];

      updatedEmployees.push({
        _id: response.data.data.createEmployee._id,
        firstname: response.data.data.createEmployee.firstname,
        lastname: response.data.data.createEmployee.lastname
      });

      return { employees: updatedEmployees };
    } catch (error) {
      console.log(error);
    }
  };

  const modalCancelHandler = () => {
    setEmployees({
      ...employees,
      creating: false,
      updating: false,
      selectedEmployee: null
    });
    setDeleting(false);
  };

  const showDetailHandler = employeeId => {
    const selectedEmployee = employees.employees.find(
      e => e._id === employeeId
    );

    return { selectedEmployee: selectedEmployee };
  };

  const updateEmployeeHandler = async () => {
    console.log(`update employee handler`);
  };

  const deleteEmployeeHandler = async employeeId => {
    try {
      setDeleting(false);
      setLoading(true);

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

      const response = await axios.post(
        `http://localhost:8000/graphql`,
        JSON.stringify(requestBody),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed!");
      }

      const deletedEmployeeId = response.data.data.deleteEmployee._id;
      const currentEmployees = employees.employees;

      const updatedEmployees = currentEmployees.filter(e => {
        return e._id !== deletedEmployeeId;
      });

      setEmployees({ ...employees, employees: updatedEmployees });
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (isActive) {
        setLoading(false);
      }
    }
  };

  return (
    <React.Fragment>
      {(employees.creating || isDeleting) && (
        <Backdrop clicked={modalCancelHandler} />
      )}

      {employees.creating && (
        <Modal
          title="Add Employee"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="firstname">First Name</label>
              <input type="text" id="firstname" ref={firstnameElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="lastname">Last Name</label>
              <input type="text" id="lastname" ref={lastnameElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="line1">Line 1</label>
              <input type="text" id="line1" ref={line1ElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="line2">Line 2</label>
              <input type="text" id="line2" ref={line2ElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="city">City</label>
              <input type="text" id="city" ref={cityElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="state">State</label>
              <input type="text" id="state" ref={stateElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="zipcode">Zip Code</label>
              <input type="text" id="zipcode" ref={zipcodeElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="skill">Skill</label>
              <input type="text" id="skill" ref={skillElRef} />
            </div>
          </form>
        </Modal>
      )}

      {isDeleting && employees.selectedEmployee && (
        <Modal
          title="Delete Employee"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={() =>
            deleteEmployeeHandler(employees.selectedEmployee._id)
          }
          confirmText={`Delete`}
        >
          <p>
            Are you sure you want to delete employee:{" "}
            {employees.selectedEmployee.firstname}{" "}
            {employees.selectedEmployee.lastname}
            {"?"}
          </p>
        </Modal>
      )}

      {employees.updating && employees.selectedEmployee && (
        <Modal
          title={employees.selectedEmployee.firstname}
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={updateEmployeeHandler}
          confirmText={`Update`}
        >
          <h1>{employees.selectedEmployee.firstname}</h1>
        </Modal>
      )}

      {/* {this.context.token && ( */}
      <div className="events-control">
        <h1>List of Employees</h1>
        <button className="btn" onClick={startCreateEventHandler}>
          Add an Employee
        </button>
      </div>
      {/* )} */}

      {isLoading ? (
        <Spinner />
      ) : (
        <EmployeeList
          employees={employees.employees}
          authUserId={contextType.userId}
          onDelete={modalDeleteEmployeeHandler}
        />
      )}
    </React.Fragment>
  );
};

export default Employees;
