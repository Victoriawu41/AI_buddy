import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatButton from "../Components/Calendar/ChatButton";
import BigCalendar from '../Components/Calendar/BigCalendar'
import EventCreator from "../Components/Calendar/EventCreator";

import { ThemeContext } from '../ThemeContext';
import { useContext } from 'react';
import "../Components/Calendar/ThemeButton.css"

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const today = new Date();
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    // for SQLite GET
    const fetchEvents = async () => {
        try {            
            const response = await axios.get("http://localhost:8000/calendar/events", {withCredentials: true});
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
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? 'Dark' : 'Light'}
            </button>
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
