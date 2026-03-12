const studentService = require('../services/studentService');

const getStudents = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.programId) filters.programId = req.query.programId;
    if (req.user.role === 'ADVISOR') {
      filters.enrollmentAdvisor = req.user._id;
    }
    if (req.user.role === 'STUDENT' && req.user.studentId) {
      filters._id = req.user.studentId;
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const { data, total } = await studentService.getStudentsPaginated(filters, { page, limit });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ success: true, data, total, page, limit, totalPages });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (req.user.role === 'ADVISOR' && student.enrollmentAdvisor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
    }
    if (req.user.role === 'STUDENT' && req.user.studentId?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student, message: 'Student created' });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const existing = await studentService.getStudentById(req.params.id);
    if (req.user.role === 'ADVISOR' && existing.enrollmentAdvisor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this student' });
    }
    const student = await studentService.updateStudent(req.params.id, req.body, req.user._id);
    res.status(200).json({ success: true, data: student, message: 'Student updated' });
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const existing = await studentService.getStudentById(req.params.id);
    if (req.user.role === 'ADVISOR' && existing.enrollmentAdvisor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this student' });
    }
    await studentService.deleteStudent(req.params.id);
    res.status(200).json({ success: true, message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
};

const createPortalUser = async (req, res, next) => {
  try {
    const { user, defaultPassword } = await studentService.createPortalUserForStudent(
      req.params.id,
      req.user._id
    );
    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.status(201).json({
      success: true,
      data: { user: userObj, defaultPassword },
      message: 'Portal account created. Share the default password with the student.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  createPortalUser
};
