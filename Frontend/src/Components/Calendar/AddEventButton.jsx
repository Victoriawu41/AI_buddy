import React, { useState } from "react";

const AddEventButton = ({ onNewEvent }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [title, setTitle] = useState("");

    const handleStartChange = (event) => {
        const b = new Date(event.target.value)
        console.log(b);
        setStartDate(b);
    }

    const handleEndChange = (event) => {
        const b = new Date(event.target.value)
        console.log(b);
        setEndDate(b);
    }

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    }

    const createEvent = (event) => {
        event.preventDefault();
        console.log("yippee");
        if (startDate && endDate && startDate <= endDate && title) {
            const ef = {
                title: title,
                start: startDate,
                end: endDate,
            };
            console.log("this is createEvent new event:", ef)
            onNewEvent(ef);
        } else {
            alert("Invalid or missing start/end date(s).")
        }
    }

    return (
        <form onSubmit={createEvent} style={{  paddingLeft: "20px", paddingRight: "20px", paddingTop: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                    Event Title:
                    <input
                        type="text"
                        placeholder="Enter event title"
                        onChange={handleTitleChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                    Start Date and Time:
                    <input
                        type="datetime-local"
                        onChange={handleStartChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                    End Date and Time:
                    <input
                        type="datetime-local"
                        onChange={handleEndChange}
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
                    />
                </label>
            </div>
            <div>
                <input
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                    }}
                />
            </div>
        </form>
    )
}

export default AddEventButton