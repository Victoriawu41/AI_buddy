import React, { useState, useEffect } from "react";
import BigCalendar from '../Components/Calendar/BigCalendar'
import CsvUploader from '../Components/Calendar/CsvUploader'
import axios from "axios"; 


const Calendar = () => {
    const [events, setEvents] = useState([]);       // {title: , start: , end:} 

    // const addEvent = async () => {
    //     try {
    //         await axios.post("http://localhost:3000/calendar/event/add", events);
    //         alert("Data sent successfully!");
    //     } catch (error) {
    //         console.error("Error sending data:", error);
    //     }
    // };

    // useEffect(() => {
    //     const fetchEvents = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:3000/calendar/event/list');
    //             if (response.status === 200) {
    //                 setPartners(response.data.events);
    //             }
    //         } catch (error) {
    //             console.error("Error sending data:", error);
    //         }
    //     };
    //     fetchEvents();
    // }, []);
    
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
            <div style={{ height: "100vh", padding: "20px" }}>
                <h1>Big Calendar with little backend</h1>
                <CsvUploader onCSVUpload={handleCSVUpload} />
                {/* <button onClick={addEvent}>Add Event</button> */}
                <BigCalendar events={events} />
            </div>
        </div>
    )
}

export default Calendar
