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

    return (
        <div>
            <div style={{ height: "100vh", padding: "20px" }}>
                <h1>Big Calendar with CSV Uploader</h1>
                <CsvUploader onCSVUpload={setEvents} />
                {/* <button onClick={addEvent}>Add Event</button> */}
                <BigCalendar events={events} />
            </div>
        </div>
    )
}

export default Calendar
