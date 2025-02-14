import React, { useState, useEffect } from "react";
import BigCalendar from '../Components/Calendar/BigCalendar'
import CsvUploader from '../Components/Calendar/CsvUploader'
import axios from "axios";
import ChatButton from "../Components/Calendar/ChatButton";
import AddEventButton from "../Components/Calendar/AddEventButton";
import '../App.css'
import NavBar from "../Components/Calendar/Navbar";

const Calendar = () => {
    const [events, setEvents] = useState([]);

    // for SQLite GET
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("http://localhost:8080/events");

                // Convert dates from string to Date objects
                const formattedEvents = response.data.map(event => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                }));

                setEvents(formattedEvents);
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

    const handleNewEvent = async (newEvent) => {
        try {
            console.log(newEvent);
            await axios.post("http://localhost:8080/events", newEvent);
            setEvents([...events, newEvent]);
            console.log("yeehaw");
        } catch (error) {
            console.error("Error adding new event:", error)
        }
    }

    return (
        <div>
            <ChatButton />
            <div style={{ height: "100vh", padding: "20px" }}>
                <h1>Big Calendar with little backend</h1>
                <CsvUploader onCSVUpload={handleCSVUpload} />
                <AddEventButton onNewEvent={handleNewEvent}/>
                <BigCalendar events={events} />
            </div>
        </div>
    )
}

export default Calendar
