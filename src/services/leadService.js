const Lead = require('../models/Lead');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { LEAD_STATUS } = require('../models/Lead');

async function pickRoundRobinAdvisorId() {
  const advisors = await User.find({ role: 'ADVISOR', status: 'ACTIVE' })
    .select('_id')
    .sort({ createdAt: 1 })
    .lean();

  if (!advisors.length) return null;

  const lastLead = await Lead.findOne({ assignedAdvisor: { $ne: null } })
    .select('assignedAdvisor')
    .sort({ createdAt: -1 })
    .lean();

  const lastId = lastLead?.assignedAdvisor?.toString();
  const idx = lastId ? advisors.findIndex((a) => a._id.toString() === lastId) : -1;
  const next = advisors[(idx + 1) % advisors.length];
  return next?._id || null;
}

const getLeads = async (filters = {}, options = {}) => {
  const query = Lead.find(filters)
    .populate('interestedProgram', 'name')
    .populate('assignedAdvisor', 'name email')
    .sort({ updatedAt: -1 });
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query.lean();
};

const getLeadsPaginated = async (filters = {}, { page = 1, limit = 10 } = {}) => {
  const skip = Math.max(0, (Number(page) || 1) - 1) * Math.max(1, Math.min(100, Number(limit) || 10));
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const [data, total] = await Promise.all([
    getLeads(filters, { skip, limit: safeLimit }),
    Lead.countDocuments(filters)
  ]);
  return { data, total };
};

const getLeadById = async (id) => {
  const lead = await Lead.findById(id)
    .populate('interestedProgram', 'name description duration fee')
    .populate('assignedAdvisor', 'name email');
  if (!lead) throw new Error('Lead not found');
  return lead;
};

const createLead = async (data) => {
  let assignedAdvisor = data.assignedAdvisor || null;
  if (!assignedAdvisor) {
    try {
      assignedAdvisor = await pickRoundRobinAdvisorId();
    } catch (e) {
      assignedAdvisor = null;
    }
  }
  const lead = await Lead.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '',
    interestedProgram: data.interestedProgram || null,
    source: data.source || 'website',
    assignedAdvisor,
    status: 'NEW_LEAD',
    notes: data.notes || ''
  });
  return lead;
};

const updateLead = async (id, data, performedBy = null) => {
  const lead = await Lead.findById(id);
  if (!lead) throw new Error('Lead not found');
  if (data.assignedAdvisor === '') data.assignedAdvisor = null;
  const requestedStatus = data.status;
  const isEnrollTransition = requestedStatus === 'ENROLLED' && lead.status !== 'ENROLLED';
  const allowed = [
    'firstName', 'lastName', 'email', 'phone',
    'interestedProgram', 'source', 'assignedAdvisor', 'notes', 'status'
  ];
  allowed.forEach((key) => {
    if (isEnrollTransition && key === 'status') return;
    if (data[key] !== undefined) lead[key] = data[key];
  });

  // If status is being set to ENROLLED via update, run the enrollment flow
  // so a Student record is created and linked to this lead.
  if (isEnrollTransition) {
    // Persist any other changes (notes/advisor/program etc.) before enrollment.
    await lead.save();
    const { lead: enrolledLead } = await enrollLead(lead._id, performedBy || lead.assignedAdvisor);
    if (performedBy) {
      await Activity.create({
        leadId: enrolledLead._id,
        activityType: 'STATUS_UPDATE',
        description: `Lead status changed to ${requestedStatus}`,
        performedBy
      });
    }
    return enrolledLead;
  }

  if (requestedStatus === 'ENROLLED' && !lead.assignedAdvisor) {
    throw new Error('A student cannot be marked enrolled without an assigned advisor');
  }

  await lead.save();
  if (performedBy && requestedStatus) {
    await Activity.create({
      leadId: lead._id,
      activityType: 'STATUS_UPDATE',
      description: `Lead status changed to ${requestedStatus}`,
      performedBy
    });
  }
  return lead;
};

const deleteLead = async (id) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new Error('Lead not found');
  return lead;
};

const enrollLead = async (leadId, performedBy) => {
  const lead = await Lead.findById(leadId)
    .populate('interestedProgram');
  if (!lead) throw new Error('Lead not found');
  if (lead.status === 'ENROLLED') throw new Error('Lead is already enrolled');
  if (!lead.interestedProgram) throw new Error('Lead has no program assigned');
  if (!lead.assignedAdvisor) throw new Error('A student cannot be enrolled without an assigned advisor');
  const existingStudent = await Student.findOne({ leadId });
  if (existingStudent) throw new Error('Student already created for this lead');

  const student = await Student.create({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone || '',
    programId: lead.interestedProgram._id,
    enrollmentAdvisor: lead.assignedAdvisor || performedBy,
    enrollmentDate: new Date(),
    leadId: lead._id,
    status: 'ACTIVE'
  });

  lead.status = 'ENROLLED';
  await lead.save();

  await Activity.create({
    studentId: student._id,
    leadId: lead._id,
    activityType: 'ENROLLMENT',
    description: `Lead enrolled as student. Student ID: ${student._id}`,
    performedBy
  });

  return { lead, student };
};

module.exports = {
  getLeads,
  getLeadsPaginated,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  enrollLead,
  LEAD_STATUS
};
