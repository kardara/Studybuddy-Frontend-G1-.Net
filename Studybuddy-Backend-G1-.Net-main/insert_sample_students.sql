-- Insert sample students for testing the AdminStudents page
-- This script adds sample users with Student role to the database

-- First, let's check if we already have users
IF NOT EXISTS (SELECT * FROM Users WHERE Role = 'Student')
BEGIN
    -- Insert sample students
    INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role, IsActive, IsBlocked, CreatedAt, UpdatedAt)
    VALUES 
    ('john.doe@example.com', 'AQAAAAEAACcQAAAAEJ4QaJ5g3K5nM3O2w7zY4X1R2S3T4U5V6W7X8Y9Z0', 'John', 'Doe', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('jane.smith@example.com', 'AQAAAAEAACcQAAAAEJ4QaJ5g3K5nM3O2w7zY4X1R2S3T4U5V6W7X8Y9Z0', 'Jane', 'Smith', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('mike.wilson@example.com', 'AQAAAAEAACcQAAAAEJ4QaJ5g3K5nM3O2w7zY4X1R2S3T4U5V6W7X8Y9Z0', 'Mike', 'Wilson', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('sarah.johnson@example.com', 'AQAAAAEAACcQAAAAEJ4QaJ5g3K5nM3O2w7zY4X1R2S3T4U5V6W7X8Y9Z0', 'Sarah', 'Johnson', 'Student', 1, 0, GETDATE(), GETDATE()),
    ('admin@studybuddy.com', 'AQAAAAEAACcQAAAAEJ4QaJ5g3K5nM3O2w7zY4X1R2S3T4U5V6W7X8Y9Z0', 'Admin', 'User', 'Admin', 1, 0, GETDATE(), GETDATE());
    
    PRINT 'Sample students inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Students already exist in the database.';
END

-- Verify the inserted data
SELECT UserId, Email, FirstName, LastName, Role, IsActive, IsBlocked, CreatedAt
FROM Users
WHERE Role IN ('Student', 'Admin')
ORDER BY Role, CreatedAt;