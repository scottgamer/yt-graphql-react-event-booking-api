import React from "react";

import EmployeeItem from "./EmployeeItem/EmployeeItem";
import "./EmployeeList.css";

const employeeList = props => {
  let employees;

  if (props.employees.length === 0) {
    return null;
  }

  employees = props.employees.map(employee => {
    return (
      <EmployeeItem
        key={employee._id}
        employeeId={employee._id}
        firstname={employee.firstname}
        lastname={employee.lastname}
        addresses={employee.addresses}
        skills={employee.skills}
        onDelete={props.onDelete}
      />
    );
  });

  return <ul className="event__list">{employees}</ul>;
};

export default employeeList;
