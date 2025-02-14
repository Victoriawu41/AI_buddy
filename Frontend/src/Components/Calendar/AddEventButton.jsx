import React, { useState } from "react";

const AddEventButton = ({onNewEvent}) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    const createEvent = (event) => {
        event.preventDefault();
        console.log("yippee");
        if (startDate && endDate) {
            const ef = {
                title: "abc",
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
        <form onSubmit={createEvent}>
            <div style={{ marginBottom: "20px" }}>
                <label>
                    <input
                        type="datetime-local"
                        accept=".csv"
                        onChange={handleStartChange}
                        style={{marginRight: "10px"}}
                    />
                </label>
                <label>
                    <input
                        type="datetime-local"
                        accept=".csv"
                        onChange={handleEndChange}
                        style={{marginRight: "10px"}}
                    />
                </label>
                <input type="submit" />
            </div>
        </form>
    )
}

export default AddEventButton