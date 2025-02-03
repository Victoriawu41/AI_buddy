import React, { useState, useEffect } from "react";
import BigCalendar from '../Components/Calendar/BigCalendar'
import CsvUploader from '../Components/Calendar/CsvUploader'
import axios from "axios";
import ChatButton from "../Components/Calendar/ChatButton";
import '../App.css'
import NavBar from "../Components/Calendar/Navbar";

const Calendar = () => {
    const [events, setEvents] = useState([]);  

    // for SQLite GET
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("http://localhost:8080/events");
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, []);

    // for SQLite POST
    const handleCSVUpload = async (csvEvents) => {
        try {
            // Loop through CSV events and save them
            for (const event of csvEvents) {
                await axios.post("http://localhost:8080/events", event);
            }
            setEvents(prevEvents => [...prevEvents, ...csvEvents]); // Update frontend state
        } catch (error) {
            console.error("Error uploading CSV events:", error);
        }
    };

    return (
        <div>
            <ChatButton /> 
            <div style={{ height: "100vh", padding: "20px" }}>
                <h1>Big Calendar with little backend</h1>
                <CsvUploader onCSVUpload={handleCSVUpload} />
                <BigCalendar events={events} />
            </div>
        </div>
    )
}

export default Calendar
