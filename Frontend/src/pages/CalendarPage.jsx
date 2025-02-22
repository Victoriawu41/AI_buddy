import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatButton from "../Components/Calendar/ChatButton";
import BigCalendar from '../Components/Calendar/BigCalendar'
import EventCreator from "../Components/Calendar/EventCreator";

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const today = new Date();

    // for SQLite GET
    const fetchEvents = async () => {
        try {
            const response = await axios.get("http://localhost:8080/events");
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

    useEffect(() => {
        fetchEvents();
    }, []); // Run only on mount

    const handleEventAdded = () => {
        fetchEvents(); // Refresh events after adding new one
    };

    return (
        <div className='p-4'>
            <ChatButton />
            <div>
                <h1><b>{today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</b>, {today.getFullYear()}</h1>
                <EventCreator onEventAdded={handleEventAdded} />
                <hr className="w-100 border-2" />
                <BigCalendar events={events} onEventChange={handleEventAdded}/>
            </div>
        </div>
    )
}

export default CalendarPage
