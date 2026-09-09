import Student from "../models/Student.js";

export async function createStudent(req, res) {
  try {
    const {
      name,
      fatherName,
      phoneNumber,
      email,
      address,
      seatNumber,
      monthlyFee,
      enrollmentStatus
    } = req.body;

    // Validate required fields
    if (!name || !fatherName || !phoneNumber || monthlyFee === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Name, father's name, phone number and monthly fee are required"
      });
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.trim();

    // Check if student already exists
    const existingStudent = await Student.findOne({
      phoneNumber: normalizedPhone
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "A student with this mobile number already exists"
      });
    }

    // Create student
    const student = await Student.create({
      name: name.trim(),
      fatherName: fatherName.trim(),
      phoneNumber: normalizedPhone,
      email: email?.trim() || undefined,
      address: address?.trim() || undefined,
      seatNumber: seatNumber?.trim() || undefined,
      monthlyFee,
      enrollmentStatus: enrollmentStatus || "active",
      enrollmentDate:
        enrollmentStatus === "inactive" || enrollmentStatus === "pending"
          ? undefined
          : new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
    });
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create student"
    });
  }
}

export async function getStudents(req, res) {
  try {
    const students = await Student.find()
      .sort({ createdAt: -1 })
      .select("-fcmTokens");

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
}

export async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id).select("-fcmTokens");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student"
    });
  }
}

export async function updateStudent(req, res) {
  try {
    const {
      name,
      fatherName,
      phoneNumber,
      email,
      address,
      seatNumber,
      monthlyFee,
      enrollmentStatus
    } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check duplicate phone number
    if (phoneNumber !== undefined) {
      const normalizedPhone = phoneNumber.trim();

      if (normalizedPhone !== student.phoneNumber) {
        const existingStudent = await Student.findOne({
          phoneNumber: normalizedPhone,
          _id: { $ne: student._id }
        });

        if (existingStudent) {
          return res.status(409).json({
            success: false,
            message: "Another student already uses this mobile number"
          });
        }

        student.phoneNumber = normalizedPhone;
      }
    }

    // Update fields
    if (name !== undefined) {
      student.name = name.trim();
    }

    if (fatherName !== undefined) {
      student.fatherName = fatherName.trim();
    }

    if (email !== undefined) {
      student.email = email.trim() || undefined;
    }

    if (address !== undefined) {
      student.address = address.trim() || undefined;
    }

    if (seatNumber !== undefined) {
      student.seatNumber = seatNumber.trim() || undefined;
    }

    if (monthlyFee !== undefined) {
      student.monthlyFee = monthlyFee;
    }

    if (enrollmentStatus !== undefined) {
      student.enrollmentStatus = enrollmentStatus;

      if (enrollmentStatus === "active" && !student.enrollmentDate) {
        student.enrollmentDate = new Date();
      }
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student
    });
  } catch (error) {
    console.error("Update student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
}

export async function updateEnrollmentStatus(req, res) {
  try {
    const { status } = req.body;

    // Validate status
    if (!["pending", "active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status"
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    student.enrollmentStatus = status;

    // Set enrollment date when student becomes active
    if (status === "active" && !student.enrollmentDate) {
      student.enrollmentDate = new Date();
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student marked as ${status}`,
      student
    });
  } catch (error) {
    console.error("Enrollment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update enrollment status"
    });
  }
}