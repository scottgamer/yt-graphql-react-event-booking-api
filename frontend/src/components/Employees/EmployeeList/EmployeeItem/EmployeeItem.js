import React from "react";

import "./EmployeeItem.css";

const employeeItem = props => (
  <li key={props.employeeId} className="events__list-item">
    <div>
      <h1>
        {props.firstname} {props.lastname}
      </h1>

      {props.skills.map(skill => (
        <p key={skill._id}>{skill.name}</p>
      ))}

      {props.addresses.map(address => (
        <p key={address._id}>
          {address.line1} & {address.line2}, {address.city}, {address.state}
        </p>
      ))}
    </div>
    <div>
      <button
        className="btn"
        onClick={() => {
          props.onUpdate(props.employeeId);
        }}
      >
        Update 
      </button>
      <button
        className="btn"
        onClick={() => {
          props.onDelete(props.employeeId);
        }}
      >
        Delete 
      </button>
    </div>
  </li>
);

export default employeeItem;
