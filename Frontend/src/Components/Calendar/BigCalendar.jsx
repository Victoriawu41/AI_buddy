import React, { useState } from "react";
import { Calendar as ReactCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Popup.css";
import axios from "axios";

const BigCalendar = ({ events, onEventChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
  });

  const handleSelectEvent = (event) => {
    // Format dates for datetime-local input
    setEvent({
      ...event,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
    });
    setIsOpen(true);
  };

  // for SQLite UPDATE
  const updateEvent = async (e) => {
    e.preventDefault();

    // Validate input
    if (!event.title || !event.start || !event.end || event.start > event.end) {
      alert("Invalid or missing required fields.");
      return;
    }

    const updatedEvent = {
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.description
    };

    try {
      const response = await axios.put(
       `http://localhost:8000/calendar/events/${event.id}`, 
        updatedEvent, {withCredentials:true}
      );
      alert(response.data.message);  // Success message
      onEventChange(); // Notify parent to refresh events
      setIsOpen(false);
    } catch (error) {
      console.error("There was an error updating the event:", error);
    }

  }

  // for SQLite Delete
  const deleteEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.delete(
      `http://localhost:8000/calendar/events/${event.id}`, {withCredentials:true}
      );
      alert(response.data.message);  // Success message
      onEventChange(); // Notify parent to refresh events
      setIsOpen(false);
    } catch (error) {
      console.error("There was an error deleting the event:", error);
    }
  }

  return (
    <div className='position-relative'>
      {/* Big Calendar */}
      <ReactCalendar
        localizer={momentLocalizer(moment)}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh" }}
        onSelectEvent={handleSelectEvent}
      />

      {/* Overlay Editing Popup */}
      {isOpen && (
        <div className="popup-overlay" onClick={() => setIsOpen(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: "bold" }}>Edit Event</h3>
            <form onSubmit={updateEvent}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Event Title:
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                />
              </label>

              <label style={{ display: "block", marginBottom: "8px" }}>
                Start Date and Time:
                <input
                  type="datetime-local"
                  value={event.start}
                  onChange={(e) => setEvent({ ...event, start: e.target.value })}
                />
              </label>

              <label style={{ display: "block", marginBottom: "8px" }}>
                End Date and Time:
                <input
                  type="datetime-local"
                  value={event.end}
                  onChange={(e) => setEvent({ ...event, end: e.target.value })}
                />
              </label>

              <label style={{ display: "block", marginBottom: "8px" }}>
                Description:
                <input
                  type="text"
                  value={event.description || ""}  // Default to an empty string if null
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                />
              </label>

              <div className="popup-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={deleteEvent}>
                  Delete
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigCalendar
