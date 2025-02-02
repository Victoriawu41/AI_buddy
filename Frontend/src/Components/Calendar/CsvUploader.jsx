import React from 'react'
import Papa from "papaparse";

const CsvUploader = ({ onCSVUpload }) => {

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const parsedEvents = result.data.map((row) => ({
                        title: row.title,
                        start: new Date(row.start),
                        end: new Date(row.end),
                    }));
                    onCSVUpload(parsedEvents);  // passing the data back to Calendar.js.
                },
            });
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>
        <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ marginBottom: "10px" }}
        />
        </div>
    )
}

export default CsvUploader
