from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Table
# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from typing import List, Optional, Dict, Any, Union
import json
import os
from pathlib import Path

# Import the Pydantic models
from course_model import (
    CourseInformation, LectureSections, Labs, OfficeHours,
    Lectures, Assignments, Tests, Resource, LectureSection,
    Platform, LabScheduleItem, StaffItem, StaffScheduleItem,
    Lecture as PydanticLecture, Assignment as PydanticAssignment,
    Test as PydanticTest, Policy, Submission, Communication
)

# Create the base class for SQLAlchemy models
Base = declarative_base()

# Association tables for many-to-many relationships
resource_lecture_association = Table(
    'resource_lecture_association', Base.metadata,
    Column('resource_id', Integer, ForeignKey('resources.id')),
    Column('lecture_id', Integer, ForeignKey('lectures.id'))
)

resource_assignment_association = Table(
    'resource_assignment_association', Base.metadata,
    Column('resource_id', Integer, ForeignKey('resources.id')),
    Column('assignment_id', Integer, ForeignKey('assignments.id'))
)

resource_test_association = Table(
    'resource_test_association', Base.metadata,
    Column('resource_id', Integer, ForeignKey('resources.id')),
    Column('test_id', Integer, ForeignKey('tests.id'))
)

resource_lab_association = Table(
    'resource_lab_association', Base.metadata,
    Column('resource_id', Integer, ForeignKey('resources.id')),
    Column('lab_id', Integer, ForeignKey('lab_schedule_items.id'))
)

# Define SQLAlchemy models
class ResourceModel(Base):
    __tablename__ = 'resources'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    link = Column(String)

class PolicyModel(Base):
    __tablename__ = 'policies'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    academic_integrity = Column(String)
    late_submission = Column(String)
    ai_usage = Column(String)
    remark_requests = Column(String)

class PlatformModel(Base):
    __tablename__ = 'platforms'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    name = Column(String)
    url = Column(String)

class LectureSectionModel(Base):
    __tablename__ = 'lecture_sections'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    identifier = Column(String)
    time = Column(String)
    location = Column(String)

class SubmissionModel(Base):
    __tablename__ = 'submissions'
    
    id = Column(Integer, primary_key=True)
    lab_id = Column(Integer, ForeignKey('labs.id'))
    platform = Column(String)
    policy = Column(String)

class LabScheduleItemModel(Base):
    __tablename__ = 'lab_schedule_items'
    
    id = Column(Integer, primary_key=True)
    lab_id = Column(Integer, ForeignKey('labs.id'))
    week = Column(Integer)
    date = Column(String)
    topic = Column(String)
    notes = Column(String)
    resources = relationship('ResourceModel', secondary=resource_lab_association)

class StaffScheduleItemModel(Base):
    __tablename__ = 'staff_schedule_items'
    
    id = Column(Integer, primary_key=True)
    staff_id = Column(Integer, ForeignKey('staff_items.id'))
    day = Column(String)
    time = Column(String)

class StaffItemModel(Base):
    __tablename__ = 'staff_items'
    
    id = Column(Integer, primary_key=True)
    office_hours_id = Column(Integer, ForeignKey('office_hours.id'))
    name = Column(String)
    role = Column(String)
    schedule = relationship('StaffScheduleItemModel', cascade='all, delete-orphan')

class LectureModel(Base):
    __tablename__ = 'lectures'
    
    id = Column(Integer, primary_key=True)
    lectures_id = Column(Integer, ForeignKey('lectures_collection.id'))
    number = Column(Integer)
    topic = Column(String)
    resources = relationship('ResourceModel', secondary=resource_lecture_association)

class AssignmentModel(Base):
    __tablename__ = 'assignments'
    
    id = Column(Integer, primary_key=True)
    assignments_id = Column(Integer, ForeignKey('assignments_collection.id'))
    type = Column(String)
    name = Column(String)
    due_date = Column(String)
    weight = Column(Float)
    team_size = Column(String)
    description = Column(String)
    resources = relationship('ResourceModel', secondary=resource_assignment_association)

class TestModel(Base):
    __tablename__ = 'tests'
    
    id = Column(Integer, primary_key=True)
    tests_id = Column(Integer, ForeignKey('tests_collection.id'))
    name = Column(String)
    test_date = Column(String)
    time = Column(String)
    location = Column(String)
    duration = Column(String)
    format = Column(String)
    coverage = Column(String)
    weight = Column(Float)
    resources = relationship('ResourceModel', secondary=resource_test_association)

class CourseInformationModel(Base):
    __tablename__ = 'course_information'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(String, unique=True)  # e.g., CSC301H5S
    title = Column(String)
    course_url = Column(String)
    term = Column(String)
    textbooks = Column(String)  # Stored as JSON string
    
    # Relationships
    policies = relationship('PolicyModel', uselist=False, cascade='all, delete-orphan')
    platforms = relationship('PlatformModel', cascade='all, delete-orphan')
    lecture_sections = relationship('LectureSectionModel', cascade='all, delete-orphan')

class LabsModel(Base):
    __tablename__ = 'labs'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    start_week = Column(Integer)
    
    # Relationships
    submission = relationship('SubmissionModel', uselist=False, cascade='all, delete-orphan')
    schedule = relationship('LabScheduleItemModel', cascade='all, delete-orphan')

class OfficeHoursModel(Base):
    __tablename__ = 'office_hours'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    
    # Relationships
    staff = relationship('StaffItemModel', cascade='all, delete-orphan')

class LecturesCollectionModel(Base):
    __tablename__ = 'lectures_collection'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    
    # Relationships
    lectures = relationship('LectureModel', cascade='all, delete-orphan')

class AssignmentsCollectionModel(Base):
    __tablename__ = 'assignments_collection'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    
    # Relationships
    assignments = relationship('AssignmentModel', cascade='all, delete-orphan')

class TestsCollectionModel(Base):
    __tablename__ = 'tests_collection'
    
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('course_information.id'))
    
    # Relationships
    tests = relationship('TestModel', cascade='all, delete-orphan')

# Database connection and session management
def get_database_path():
    """Get the database file path"""
    return str("course_info.db")

def get_engine():
    """Create and return a database engine"""
    db_path = get_database_path()
    return create_engine(f"sqlite:///{db_path}")

def init_db():
    """Initialize the database by creating all tables"""
    engine = get_engine()
    Base.metadata.create_all(engine)
    return engine

def get_session():
    """Create and return a new database session"""
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()

# Helper functions for conversion between Pydantic and SQLAlchemy models
def create_resource_model(resource: Resource) -> ResourceModel:
    """Convert Resource Pydantic model to ResourceModel"""
    if not resource:
        return None
    return ResourceModel(
        name=resource.name,
        link=str(resource.link) if resource.link else None
    )

def save_course_info(course_info: Dict[str, Any]):
    """Save course information to the database"""
    session = get_session()
    
    try:
        # Extract course information
        course_info_data = course_info.get('course_information', {})
        
        # Check if course already exists
        course_id = course_info_data.get('id')
        existing_course = session.query(CourseInformationModel).filter_by(course_id=course_id).first()
        
        if (existing_course):
            # Update existing course
            course_model = existing_course
        else:
            # Create new course
            course_model = CourseInformationModel()
        
        # Update course information fields
        course_model.course_id = course_info_data.get('id')
        course_model.title = course_info_data.get('title')
        course_model.course_url = course_info_data.get('course_url')
        course_model.term = course_info_data.get('term')
        course_model.textbooks = json.dumps(course_info_data.get('textbooks', []))
        
        # Save to get ID for relationships
        if not existing_course:
            session.add(course_model)
            session.flush()
        
        # Process all related data
        # (This would involve processing each section of the course info)
        # For brevity, I'm showing a simplified version
        
        session.commit()
        return {"success": True, "course_id": course_model.course_id}
    
    except Exception as e:
        session.rollback()
        return {"success": False, "error": str(e)}
    
    finally:
        session.close()

def get_course_info(course_id: str) -> Dict[str, Any]:
    """Retrieve course information from the database"""
    session = get_session()
    
    try:
        course = session.query(CourseInformationModel).filter_by(course_id=course_id).first()
        
        if not course:
            return {"success": False, "error": f"Course {course_id} not found"}
        
        # This would involve retrieving all related data and constructing the response
        # For brevity, I'm showing a simplified version
        result = {
            "course_information": {
                "id": course.course_id,
                "title": course.title,
                "course_url": course.course_url,
                "term": course.term,
                "textbooks": json.loads(course.textbooks) if course.textbooks else []
            }
        }
        
        return {"success": True, "data": result}
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    
    finally:
        session.close()

def save_course_models(models_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save all course models from a dictionary to the database.
    
    Args:
        models_dict: Dictionary with model names as keys and model objects as values.
        Expected keys include: 'CourseInformation', 'LectureSections', 'Labs', 
        'OfficeHours', 'Lectures', 'Assignments', 'Tests'
    
    Returns:
        Dict with success status and course_id or error message
    """
    session = get_session()
    
    try:
        # Extract course information first as it's required
        course_info = models_dict.get("CourseInformation")
        if not course_info:
            return {"success": False, "error": "CourseInformation is required"}
        
        # Create or update course information
        course_id = course_info.id
        existing_course = session.query(CourseInformationModel).filter_by(course_id=course_id).first()
        
        if existing_course:
            course_model = existing_course
        else:
            course_model = CourseInformationModel()
        
        # Set course information fields
        course_model.course_id = course_info.id
        course_model.title = course_info.title
        course_model.course_url = course_info.course_url
        course_model.term = course_info.term
        course_model.textbooks = json.dumps([text for text in course_info.textbooks]) if course_info.textbooks else "[]"
        
        # Save policies if available
        if course_info.policies:
            if not hasattr(course_model, 'policies') or not course_model.policies:
                course_model.policies = PolicyModel(course_id=course_model.id)
            
            course_model.policies.academic_integrity = course_info.policies.academic_integrity
            course_model.policies.late_submission = course_info.policies.late_submission
            course_model.policies.ai_usage = course_info.policies.ai_usage
            course_model.policies.remark_requests = course_info.policies.remark_requests
        
        # Save communication platforms if available
        if course_info.communication and course_info.communication.platforms:
            # Remove existing platforms
            for platform in list(course_model.platforms):
                session.delete(platform)
            
            # Add new platforms
            for platform in course_info.communication.platforms:
                platform_model = PlatformModel(
                    course_id=course_model.id,
                    name=platform.name,
                    url=str(platform.url) if platform.url else None
                )
                session.add(platform_model)
        
        # Save to get ID for relationships
        if not existing_course:
            session.add(course_model)
            session.flush()
        
        # Process lecture sections
        lecture_sections = models_dict.get("LectureSections")
        if lecture_sections and lecture_sections.lecture_sections:
            # Remove existing lecture sections
            for section in list(course_model.lecture_sections):
                session.delete(section)
            
            # Add new lecture sections
            for section in lecture_sections.lecture_sections:
                section_model = LectureSectionModel(
                    course_id=course_model.id,
                    identifier=section.identifier,
                    time=section.time,
                    location=section.location
                )
                session.add(section_model)
        
        # Process labs
        labs = models_dict.get("Labs")
        if labs:
            # Check if labs already exist for this course
            existing_labs = session.query(LabsModel).filter_by(course_id=course_model.id).first()
            
            if existing_labs:
                labs_model = existing_labs
            else:
                labs_model = LabsModel(course_id=course_model.id)
                session.add(labs_model)
                session.flush()
            
            labs_model.start_week = labs.start_week
            
            # Handle submission details
            if labs.submission:
                if not labs_model.submission:
                    labs_model.submission = SubmissionModel(lab_id=labs_model.id)
                
                labs_model.submission.platform = labs.submission.platform
                labs_model.submission.policy = labs.submission.policy
            
            # Handle lab schedule
            if labs.schedule:
                # Clear existing schedule
                for item in list(labs_model.schedule):
                    session.delete(item)
                
                # Add new schedule items
                for item in labs.schedule:
                    lab_item = LabScheduleItemModel(
                        lab_id=labs_model.id,
                        week=item.week,
                        date=item.date,
                        topic=item.topic,
                        notes=item.notes
                    )
                    
                    # Add resources
                    if item.resources:
                        for resource in item.resources:
                            resource_model = create_resource_model(resource)
                            session.add(resource_model)
                            lab_item.resources.append(resource_model)
                    
                    session.add(lab_item)
        
        # Process office hours
        office_hours = models_dict.get("OfficeHours")
        if office_hours and office_hours.staff:
            # Check if office hours already exist
            existing_hours = session.query(OfficeHoursModel).filter_by(course_id=course_model.id).first()
            
            if existing_hours:
                hours_model = existing_hours
            else:
                hours_model = OfficeHoursModel(course_id=course_model.id)
                session.add(hours_model)
                session.flush()
            
            # Clear existing staff
            for staff in list(hours_model.staff):
                session.delete(staff)
            
            # Add new staff and their schedules
            for staff in office_hours.staff:
                staff_model = StaffItemModel(
                    office_hours_id=hours_model.id,
                    name=staff.name,
                    role=staff.role
                )
                
                if staff.schedule:
                    for schedule_item in staff.schedule:
                        staff_schedule = StaffScheduleItemModel(
                            day=schedule_item.day,
                            time=schedule_item.time
                        )
                        staff_model.schedule.append(staff_schedule)
                
                hours_model.staff.append(staff_model)
        
        # Process lectures
        lectures = models_dict.get("Lectures")
        if lectures and lectures.lectures:
            # Check if lectures collection exists
            existing_lectures = session.query(LecturesCollectionModel).filter_by(course_id=course_model.id).first()
            
            if existing_lectures:
                lectures_collection = existing_lectures
            else:
                lectures_collection = LecturesCollectionModel(course_id=course_model.id)
                session.add(lectures_collection)
                session.flush()
            
            # Clear existing lectures
            for lecture in list(lectures_collection.lectures):
                session.delete(lecture)
            
            # Add new lectures
            for lecture in lectures.lectures:
                lecture_model = LectureModel(
                    lectures_id=lectures_collection.id,
                    number=lecture.number,
                    topic=lecture.topic
                )
                
                if lecture.resources:
                    for resource in lecture.resources:
                        resource_model = create_resource_model(resource)
                        session.add(resource_model)
                        lecture_model.resources.append(resource_model)
                
                lectures_collection.lectures.append(lecture_model)
        
        # Process assignments
        assignments = models_dict.get("Assignments")
        if assignments and assignments.assignments:
            # Check if assignments collection exists
            existing_assignments = session.query(AssignmentsCollectionModel).filter_by(course_id=course_model.id).first()
            
            if existing_assignments:
                assignments_collection = existing_assignments
            else:
                assignments_collection = AssignmentsCollectionModel(course_id=course_model.id)
                session.add(assignments_collection)
                session.flush()
            
            # Clear existing assignments
            for assignment in list(assignments_collection.assignments):
                session.delete(assignment)
            
            # Add new assignments
            for assignment in assignments.assignments:
                assignment_model = AssignmentModel(
                    assignments_id=assignments_collection.id,
                    type=assignment.type,
                    name=assignment.name,
                    due_date=assignment.due_date,
                    weight=assignment.weight,
                    team_size=assignment.team_size,
                    description=assignment.description
                )
                
                if assignment.resources:
                    for resource in assignment.resources:
                        resource_model = create_resource_model(resource)
                        session.add(resource_model)
                        assignment_model.resources.append(resource_model)
                
                assignments_collection.assignments.append(assignment_model)
        
        # Process tests
        tests = models_dict.get("Tests")
        if tests and tests.tests:
            # Check if tests collection exists
            existing_tests = session.query(TestsCollectionModel).filter_by(course_id=course_model.id).first()
            
            if existing_tests:
                tests_collection = existing_tests
            else:
                tests_collection = TestsCollectionModel(course_id=course_model.id)
                session.add(tests_collection)
                session.flush()
            
            # Clear existing tests
            for test in list(tests_collection.tests):
                session.delete(test)
            
            # Add new tests
            for test in tests.tests:
                test_model = TestModel(
                    tests_id=tests_collection.id,
                    name=test.name,
                    test_date=test.test_date,
                    time=test.time,
                    location=test.location,
                    duration=test.duration,
                    format=test.format,
                    coverage=test.coverage,
                    weight=test.weight
                )
                
                if test.resources:
                    for resource in test.resources:
                        resource_model = create_resource_model(resource)
                        session.add(resource_model)
                        test_model.resources.append(resource_model)
                
                tests_collection.tests.append(test_model)
        
        # Commit all changes
        session.commit()
        return {"success": True, "course_id": course_model.course_id}
    
    except Exception as e:
        session.rollback()
        return {"success": False, "error": str(e)}
    
    finally:
        session.close()

def get_all_course_info(course_id: str) -> Dict[str, Any]:
    """
    Retrieve all high-level course information from the database and return as JSON.
    
    Args:
        course_id: The unique course identifier (e.g., 'CSC301H5S')
        
    Returns:
        Dictionary containing all high-level fields as JSON
    """
    session = get_session()
    result = {}
    
    try:
        # Get course information
        course = session.query(CourseInformationModel).filter_by(course_id=course_id).first()
        if not course:
            return {"success": False, "error": f"Course {course_id} not found"}
        
        # Convert CourseInformation
        policies = None
        if course.policies:
            policies = Policy(
                academic_integrity=course.policies.academic_integrity,
                late_submission=course.policies.late_submission,
                ai_usage=course.policies.ai_usage,
                remark_requests=course.policies.remark_requests
            )
        
        communication = None
        if course.platforms:
            platforms = []
            for platform in course.platforms:
                platforms.append(Platform(
                    name=platform.name,
                    url=platform.url
                ))
            communication = Communication(platforms=platforms)
        
        course_info = CourseInformation(
            id=course.course_id,
            title=course.title,
            course_url=course.course_url,
            term=course.term,
            policies=policies,
            communication=communication,
            textbooks=json.loads(course.textbooks) if course.textbooks else []
        )
        result["CourseInformation"] = course_info.dict(exclude_none=True)
        
        # Convert LectureSections
        lecture_sections = []
        for section in course.lecture_sections:
            lecture_sections.append(LectureSection(
                identifier=section.identifier,
                time=section.time,
                location=section.location
            ))
        if lecture_sections:
            result["LectureSections"] = LectureSections(
                lecture_sections=lecture_sections
            ).dict(exclude_none=True)
        
        # Get Labs
        labs_model = session.query(LabsModel).filter_by(course_id=course.id).first()
        if labs_model:
            submission = None
            if labs_model.submission:
                submission = Submission(
                    platform=labs_model.submission.platform,
                    policy=labs_model.submission.policy
                )
            
            schedule = []
            for item in labs_model.schedule:
                resources = []
                for resource in item.resources:
                    resources.append(Resource(
                        name=resource.name,
                        link=resource.link
                    ))
                
                schedule.append(LabScheduleItem(
                    week=item.week,
                    date=item.date,
                    topic=item.topic,
                    notes=item.notes,
                    resources=resources if resources else None
                ))
            
            labs = Labs(
                start_week=labs_model.start_week,
                submission=submission,
                schedule=schedule if schedule else None
            )
            result["Labs"] = labs.dict(exclude_none=True)
        
        # Get OfficeHours
        office_hours_model = session.query(OfficeHoursModel).filter_by(course_id=course.id).first()
        if office_hours_model:
            staff_items = []
            for staff in office_hours_model.staff:
                schedule = []
                for item in staff.schedule:
                    schedule.append(StaffScheduleItem(
                        day=item.day,
                        time=item.time
                    ))
                
                staff_items.append(StaffItem(
                    name=staff.name,
                    role=staff.role,
                    schedule=schedule if schedule else None
                ))
            
            office_hours = OfficeHours(staff=staff_items)
            result["OfficeHours"] = office_hours.dict(exclude_none=True)
        
        # Get Lectures
        lectures_model = session.query(LecturesCollectionModel).filter_by(course_id=course.id).first()
        if lectures_model:
            lecture_items = []
            for lecture in lectures_model.lectures:
                resources = []
                for resource in lecture.resources:
                    resources.append(Resource(
                        name=resource.name,
                        link=resource.link
                    ))
                
                lecture_items.append(PydanticLecture(
                    number=lecture.number,
                    topic=lecture.topic,
                    resources=resources if resources else None
                ))
            
            lectures = Lectures(lectures=lecture_items)
            result["Lectures"] = lectures.dict(exclude_none=True)
        
        # Get Assignments
        assignments_model = session.query(AssignmentsCollectionModel).filter_by(course_id=course.id).first()
        if assignments_model:
            assignment_items = []
            for assignment in assignments_model.assignments:
                resources = []
                for resource in assignment.resources:
                    resources.append(Resource(
                        name=resource.name,
                        link=resource.link
                    ))
                
                assignment_items.append(PydanticAssignment(
                    type=assignment.type,
                    name=assignment.name,
                    due_date=assignment.due_date,
                    weight=assignment.weight,
                    team_size=assignment.team_size,
                    description=assignment.description,
                    resources=resources if resources else None
                ))
            
            assignments = Assignments(assignments=assignment_items)
            result["Assignments"] = assignments.dict(exclude_none=True)
        
        # Get Tests
        tests_model = session.query(TestsCollectionModel).filter_by(course_id=course.id).first()
        if tests_model:
            test_items = []
            for test in tests_model.tests:
                resources = []
                for resource in test.resources:
                    resources.append(Resource(
                        name=resource.name,
                        link=resource.link
                    ))
                
                test_items.append(PydanticTest(
                    name=test.name,
                    test_date=test.test_date,
                    time=test.time,
                    location=test.location,
                    duration=test.duration,
                    format=test.format,
                    coverage=test.coverage,
                    weight=test.weight,
                    resources=resources if resources else None
                ))
            
            tests = Tests(tests=test_items)
            result["Tests"] = tests.dict(exclude_none=True)
        
        return {"success": True, "data": result}
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    
    finally:
        session.close()

def get_all_course_ids() -> Dict[str, Any]:
    """
    Retrieve all course IDs from the database
    
    Returns:
        Dictionary with success status and a list of course IDs
    """
    session = get_session()
    
    try:
        course_ids = [course.course_id for course in session.query(CourseInformationModel.course_id).all()]
        return {"success": True, "course_ids": course_ids}
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    
    finally:
        session.close()

# Initialize the database when the module is imported
init_db()
