-- Add sample users to the database for testing
USE [db33783];

-- Check if users already exist
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email LIKE '%@example.com')
BEGIN
    -- Insert sample users
    INSERT INTO Users (Email, PasswordHash, FirstName, LastName, PhoneNumber, Role, IsActive, IsBlocked, CreatedAt, UpdatedAt)
    VALUES 
    ('admin@studybuddy.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'Admin', 'User', '123-456-7890', 'Admin', 1, 0, GETDATE(), GETDATE()),
    ('john.doe@example.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'John', 'Doe', '555-0101', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('jane.smith@example.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'Jane', 'Smith', '555-0102', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('mike.wilson@example.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'Mike', 'Wilson', '555-0103', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('sarah.johnson@example.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'Sarah', 'Johnson', '555-0104', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('david.brown@example.com', '$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5K8y2qK3mK', 'David', 'Brown', '555-0105', 'Student', 1, 0, GETDATE(), GETDATE());

    -- Add some sample courses
    INSERT INTO Courses (Title, Description, Category, Status, CreatedBy, CreatedAt, UpdatedAt)
    VALUES 
    ('Introduction to Programming', 'Learn the basics of programming with Python', 'Programming', 'Published', 1, GETDATE(), GETDATE()),
    ('Web Development Fundamentals', 'Build modern web applications with HTML, CSS, and JavaScript', 'Web Development', 'Published', 1, GETDATE(), GETDATE()),
    ('Data Science Basics', 'Introduction to data analysis and machine learning', 'Data Science', 'Published', 1, GETDATE(), GETDATE());

    -- Add some enrollments
    INSERT INTO Enrollments (StudentId, CourseId, Status, ProgressPercentage)
    VALUES 
    (2, 1, 'Active', 25.0),
    (3, 1, 'Active', 75.0),
    (4, 2, 'Active', 50.0),
    (5, 3, 'Active', 10.0);

    PRINT 'Sample users and data inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Sample data already exists.';
END

-- Display the results
SELECT UserId, Email, FirstName, LastName, Role, IsActive, IsBlocked, CreatedAt
FROM Users
ORDER BY Role, CreatedAt;