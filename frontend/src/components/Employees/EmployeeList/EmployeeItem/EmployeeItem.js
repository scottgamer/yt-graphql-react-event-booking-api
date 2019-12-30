import React from 'react';

import './EmployeeItem.css';

const employeeItem = props => (
  <li key={props.employeeId} className="events__list-item">
    <div>
      <h1>{props.firstname} {props.lastname}</h1>
      <h2>
        ${props.price} - {new Date(props.date).toLocaleDateString()}
      </h2>
    </div>
    <div>
      {props.userId === props.creatorId ? (
        <p>Your the owner of this event.</p>
      ) : (
        <button className="btn" onClick={props.onDetail.bind(this, props.employeeId)}>
          View Details
        </button>
      )}
    </div>
  </li>
);

export default employeeItem;
