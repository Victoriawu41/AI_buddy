import React, { useState, Link } from 'react';
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import AddEventButton from './AddEventButton';
import CsvUploader from './CsvUploader';
import { ThemeContext } from '../../ThemeContext';
import { useContext } from 'react';

const EventCreator = ({ onEventAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    // for SQLite POST
    const handleCSVUpload = async (csvEvents) => {
        try {
            // Loop through CSV events and save them
            for (const event of csvEvents) {
                await axios.post(`http://localhost:8000/calendar/events`, event, {withCredentials:true});
            }
            onEventAdded(); // Notify parent to refresh events
            setIsOpen(false); // Close the window after successful addition
        } catch (error) {
            console.error("Error uploading CSV events:", error);
        }
    };

    // for SQLite POST
    const handleNewEvent = async (newEvent) => {
        try {
            console.log(newEvent);
            await axios.post(`http://localhost:8000/calendar/events`, newEvent, {withCredentials:true});
            onEventAdded(); // Notify parent to refresh events
            setIsOpen(false); // Close the window after successful addition
            // console.log("yeehaw");
        } catch (error) {
            console.error("Error adding new event:", error)
        }
    }

    const backgroundColor = theme === 'light' ? '#ffffff' : '#141414';
    
    return (
        <div className='position-relative'>
            {/* Plus Button */}
            <button className="btn btn-light btn-sm bi bi-plus" onClick={() => setIsOpen(!isOpen)}>
                <span className="ms-2 d-none d-sm-inline">New Event</span>
            </button>

            {/* Popup*/} 
            {isOpen && (
                <div className="position-absolute shadow rounded mt-1" style={{ width: '320px', zIndex: 1000, left: 0, top: '100%', backgroundColor: backgroundColor }} >
                    {/* Menu Items */}
                    <div className="p-2">
                        {/* Add Event Button */}
                        <AddEventButton onNewEvent={handleNewEvent} />
                    <hr />
                        {/* CSV Upload Button */}
                        <CsvUploader onCSVUpload={handleCSVUpload} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventCreator
