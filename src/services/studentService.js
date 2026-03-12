const Student = require('../models/Student');
const User = require('../models/User');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');

const getStudents = async (filters = {}, options = {}) => {
  const query = Student.find(filters)
    .populate('programId', 'name duration fee')
    .populate('enrollmentAdvisor', 'name email')
    .populate('leadId', 'status')
    .sort({ enrollmentDate: -1 });
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query.lean();
};

const getStudentsPaginated = async (filters = {}, { page = 1, limit = 10 } = {}) => {
  const skip = Math.max(0, (Number(page) || 1) - 1) * Math.max(1, Math.min(100, Number(limit) || 10));
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const [data, total] = await Promise.all([
    getStudents(filters, { skip, limit: safeLimit }),
    Student.countDocuments(filters)
  ]);
  return { data, total };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id)
    .populate('programId', 'name description duration fee')
    .populate('enrollmentAdvisor', 'name email')
    .populate('leadId', 'firstName lastName status')
    .populate('userId', 'name email');
  if (!student) throw new Error('Student not found');
  return student;
};

const createStudent = async (data) => {
  const student = await Student.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '',
    programId: data.programId,
    enrollmentAdvisor: data.enrollmentAdvisor,
    enrollmentDate: data.enrollmentDate || new Date(),
    leadId: data.leadId || null,
    status: data.status || 'ACTIVE'
  });
  return student;
};

const updateStudent = async (id, data, performedBy = null) => {
  const student = await Student.findById(id);
  if (!student) throw new Error('Student not found');
  const allowed = [
    'firstName', 'lastName', 'email', 'phone',
    'programId', 'status', 'userId'
  ];
  allowed.forEach((key) => {
    if (data[key] !== undefined) student[key] = data[key];
  });
  await student.save();
  if (performedBy) {
    await Activity.create({
      studentId: student._id,
      activityType: 'STUDENT_UPDATE',
      description: 'Student record updated',
      performedBy
    });
  }
  return student;
};

const deleteStudent = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new Error('Student not found');
  return student;
};

const createPortalUserForStudent = async (studentId, performedBy) => {
  const student = await Student.findById(studentId).populate('userId');
  if (!student) throw new Error('Student not found');
  if (student.userId) throw new Error('Student already has a portal account');

  const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'Student@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const user = await User.create({
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    passwordHash,
    role: 'STUDENT',
    studentId: student._id,
    status: 'ACTIVE'
  });

  student.userId = user._id;
  await student.save();

  await Activity.create({
    studentId: student._id,
    activityType: 'PORTAL_ACCOUNT_CREATED',
    description: `Portal login created for student. User ID: ${user._id}`,
    performedBy
  });

  return { user, defaultPassword };
};

module.exports = {
  getStudents,
  getStudentsPaginated,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  createPortalUserForStudent
};
