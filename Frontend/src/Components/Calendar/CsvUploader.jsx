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
                    onCSVUpload(parsedEvents);  // passing the data back to AddEventWindow.jsx.
                },
            });
        }
    };

    return (
        <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
        <label className="btn btn-light w-100 text-start mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '16px'}}></i>
            Upload CSV
            <input
                type="file"
                accept=".csv"
                className="d-none"
                onChange={handleFileUpload}
            />
        </label>
        </div>
    )
}

export default CsvUploader
