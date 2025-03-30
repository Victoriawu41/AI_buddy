import React, { useState, useEffect } from 'react';
import './CourseInfoPage.css';
import { Markdown } from '../widgets/Markdown';

const CourseInfoPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all course IDs when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch course details when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseInfo(selectedCourse);
    }
  }, [selectedCourse]);

  // Function to fetch all course IDs
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/course_info/course-ids', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.course_ids || []);
      } else {
        setError(data.error || 'Failed to fetch course IDs');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch information about a specific course
  const fetchCourseInfo = async (courseId) => {
    setLoading(true);
    setCourseInfo(null);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/course_info/course-info/${courseId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course info: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourseInfo(data.data);
      } else {
        setError(data.error || 'Failed to fetch course information');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course info:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render course information sections
  const renderCourseInfo = () => {
    if (!courseInfo) return null;
    
    const { CourseInformation, LectureSections, Labs, OfficeHours, Lectures, Assignments, Tests } = courseInfo;

    return (
      <div className="course-details">
        {/* Basic Course Information */}
        {CourseInformation && (
          <section className="info-section">
            <h2>{CourseInformation.id}: {CourseInformation.title}</h2>
            <div className="info-card">
              <p><strong>Term:</strong> {CourseInformation.term}</p>
              <p><a href={CourseInformation.course_url} target="_blank" rel="noopener noreferrer">Course Website</a></p>
              
              {/* Textbooks */}
              {CourseInformation.textbooks && CourseInformation.textbooks.length > 0 && (
                <div>
                  <h3>Textbooks</h3>
                  <ul>
                    {CourseInformation.textbooks.map((book, index) => (
                      <li key={index}>{book}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Policies */}
              {CourseInformation.policies && (
                <div>
                  <h3>Course Policies</h3>
                  {CourseInformation.policies.academic_integrity && (
                    <div>
                      <h4>Academic Integrity</h4>
                      <Markdown content={CourseInformation.policies.academic_integrity} />
                    </div>
                  )}
                  {CourseInformation.policies.late_submission && (
                    <div>
                      <h4>Late Submission</h4>
                      <Markdown content={CourseInformation.policies.late_submission} />
                    </div>
                  )}
                  {CourseInformation.policies.ai_usage && (
                    <div>
                      <h4>AI Usage</h4>
                      <Markdown content={CourseInformation.policies.ai_usage} />
                    </div>
                  )}
                  {CourseInformation.policies.remark_requests && (
                    <div>
                      <h4>Remark Requests</h4>
                      <Markdown content={CourseInformation.policies.remark_requests} />
                    </div>
                  )}
                </div>
              )}
              
              {/* Communication Platforms */}
              {CourseInformation.communication?.platforms && (
                <div>
                  <h3>Communication Platforms</h3>
                  <ul>
                    {CourseInformation.communication.platforms.map((platform, index) => (
                      <li key={index}>
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">{platform.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Lecture Sections */}
        {LectureSections && LectureSections.lecture_sections && (
          <section className="info-section">
            <h2>Lecture Sections</h2>
            <div className="info-card">
              {LectureSections.lecture_sections.map((section, index) => (
                <div key={index} className="lecture-section">
                  <h3>Section {section.identifier}</h3>
                  <p><strong>Time:</strong> {section.time}</p>
                  <p><strong>Location:</strong> {section.location}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Lectures */}
        {Lectures && Lectures.lectures && (
          <section className="info-section">
            <h2>Lectures</h2>
            <div className="info-card">
              <div className="lectures-list">
                {Lectures.lectures.map((lecture, index) => (
                  <div key={index} className="lecture-item">
                    <h3>Lecture {lecture.number}: {lecture.topic}</h3>
                    {lecture.resources && (
                      <div>
                        <h4>Resources</h4>
                        <ul>
                          {lecture.resources.map((resource, i) => (
                            <li key={i}>
                              <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.name}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Assignments */}
        {Assignments && Assignments.assignments && (
          <section className="info-section">
            <h2>Assignments</h2>
            <div className="info-card">
              {Assignments.assignments.map((assignment, index) => (
                <div key={index} className="assignment-item">
                  <h3>{assignment.name}</h3>
                  <p><strong>Type:</strong> {assignment.type}</p>
                  <p><strong>Due Date:</strong> {assignment.due_date}</p>
                  <p><strong>Weight:</strong> {assignment.weight}%</p>
                  {assignment.team_size && <p><strong>Team Size:</strong> {assignment.team_size}</p>}
                  
                  {assignment.description && (
                    <div>
                      <h4>Description</h4>
                      <Markdown content={assignment.description} />
                    </div>
                  )}
                  
                  {assignment.resources && (
                    <div>
                      <h4>Resources</h4>
                      <ul>
                        {assignment.resources.map((resource, i) => (
                          <li key={i}>
                            <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Tests */}
        {Tests && Tests.tests && (
          <section className="info-section">
            <h2>Tests</h2>
            <div className="info-card">
              {Tests.tests.map((test, index) => (
                <div key={index} className="test-item">
                  <h3>{test.name}</h3>
                  <p><strong>Date:</strong> {test.test_date}</p>
                  <p><strong>Time:</strong> {test.time}</p>
                  <p><strong>Location:</strong> {test.location}</p>
                  <p><strong>Duration:</strong> {test.duration}</p>
                  <p><strong>Format:</strong> {test.format}</p>
                  <p><strong>Coverage:</strong> {test.coverage}</p>
                  <p><strong>Weight:</strong> {test.weight}%</p>
                  
                  {test.resources && (
                    <div>
                      <h4>Resources</h4>
                      <ul>
                        {test.resources.map((resource, i) => (
                          <li key={i}>
                            <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Labs */}
        {Labs && (
          <section className="info-section">
            <h2>Labs</h2>
            <div className="info-card">
              <p><strong>Start Week:</strong> Week {Labs.start_week}</p>
              
              {Labs.submission && (
                <div>
                  <h3>Submission Details</h3>
                  <p><strong>Platform:</strong> {Labs.submission.platform}</p>
                  <p><strong>Policy:</strong> {Labs.submission.policy}</p>
                </div>
              )}
              
              {Labs.schedule && Labs.schedule.length > 0 && (
                <div>
                  <h3>Lab Schedule</h3>
                  <table className="lab-schedule">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Date</th>
                        <th>Topic</th>
                        <th>Notes</th>
                        <th>Resources</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Labs.schedule.map((item, index) => (
                        <tr key={index}>
                          <td>{item.week}</td>
                          <td>{item.date}</td>
                          <td>{item.topic}</td>
                          <td>{item.notes}</td>
                          <td>
                            {item.resources && item.resources.map((resource, i) => (
                              <div key={i}>
                                <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.name}</a>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Office Hours */}
        {OfficeHours && OfficeHours.staff && (
          <section className="info-section">
            <h2>Office Hours</h2>
            <div className="info-card">
              {OfficeHours.staff.map((staff, index) => (
                <div key={index} className="staff-item">
                  <h3>{staff.name}</h3>
                  <p><strong>Role:</strong> {staff.role}</p>
                  
                  {staff.schedule && staff.schedule.length > 0 && (
                    <div>
                      <h4>Office Hours Schedule</h4>
                      <ul>
                        {staff.schedule.map((schedule, i) => (
                          <li key={i}>
                            <strong>{schedule.day}:</strong> {schedule.time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="course-info-page">
      <h1>Course Information</h1>
      
      {/* Course selection dropdown */}
      <div className="course-selector">
        <label htmlFor="course-select">Select a course:</label>
        <select 
          id="course-select" 
          value={selectedCourse || ''} 
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Select a course --</option>
          {courses.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => selectedCourse ? fetchCourseInfo(selectedCourse) : fetchCourses()}>
            Try Again
          </button>
        </div>
      )}
      
      {/* Course information display */}
      {!loading && !error && courseInfo && renderCourseInfo()}
      
      {/* Prompt to select a course if none selected */}
      {!loading && !error && !selectedCourse && courses.length > 0 && (
        <div className="select-prompt">
          <p>Please select a course from the dropdown above to view its information.</p>
        </div>
      )}
      
      {/* No courses available message */}
      {!loading && !error && courses.length === 0 && (
        <div className="no-courses">
          <p>No courses are currently available.</p>
          <button onClick={fetchCourses}>Refresh</button>
        </div>
      )}
    </div>
  );
};

export default CourseInfoPage;
