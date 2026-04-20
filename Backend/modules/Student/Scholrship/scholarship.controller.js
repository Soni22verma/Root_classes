import { Result } from '../Result/result.model.js';
import User from '../student.model.js';
import Scholarship from './scholarship.model.js';

export const handleApplyScholarship = async (req, res) => {
    try {
        const { studentId, phone, email, lookingForCategory, studentClass, program } = req.body;

        console.log(req.body, " this is request body");

        const student = await User.findById(studentId);
        console.log(student, " this is is my student");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ✅ ELIGIBILITY CHECK: Check if student has 70% or more in any test
        const studentResults = await Result.find({ studentId });
        
        if (!studentResults || studentResults.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not eligible for scholarship. Please take at least one test first."
            });
        }

        const isEligible = studentResults.some(result => result.percentage >= 70);
        
        if (!isEligible) {
            const highestPercentage = Math.max(...studentResults.map(r => r.percentage));
            return res.status(403).json({
                success: false,
                message: `You are not eligible for scholarship. You need 70% or more marks. Your highest score is ${highestPercentage}%.`,
                data: {
                    requiredPercentage: 70,
                    yourHighestPercentage: highestPercentage,
                    allTestResults: studentResults.map(r => ({
                        testId: r.testId,
                        percentage: r.percentage,
                        obtainedMarks: r.obtainedMarks,
                        totalMarks: r.totalMarks
                    }))
                }
            });
        }

        const existingApplication = await Scholarship.findOne({ studentId });
        console.log(existingApplication, "existing application");

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for scholarship. Multiple applications are not allowed."
            });
        }

        if (!program || !studentClass || !lookingForCategory || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newApplication = await Scholarship.create({
            studentId,
            program,
            studentClass,
            lookingForCategory,
            email: email.toLowerCase(),
            phone
        });

        const updatedStudent = await User.findByIdAndUpdate(
            studentId,
            { scholarshipApplied: newApplication._id },
            { new: true }
        );

        const qualifyingTest = studentResults.find(result => result.percentage >= 70);

        return res.status(201).json({
            success: true,
            message: "Scholarship application submitted successfully",
            data: newApplication,
            student: updatedStudent,
            qualificationDetails: {
                eligible: true,
                qualifyingTest: {
                    testId: qualifyingTest?.testId,
                    percentage: qualifyingTest?.percentage,
                    obtainedMarks: qualifyingTest?.obtainedMarks,
                    totalMarks: qualifyingTest?.totalMarks
                }
            }
        });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for scholarship"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};