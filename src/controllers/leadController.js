const leadService = require('../services/leadService');
const { validationResult } = require('express-validator');

const getLeads = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.assignedAdvisor) filters.assignedAdvisor = req.query.assignedAdvisor;
    if (req.user.role === 'ADVISOR') {
      filters.assignedAdvisor = req.user._id;
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const { data, total } = await leadService.getLeadsPaginated(filters, { page, limit });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ success: true, data, total, page, limit, totalPages });
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (req.user.role === 'ADVISOR' && lead.assignedAdvisor?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const lead = await leadService.createLead(req.body);
    res.status(201).json({ success: true, data: lead, message: 'Lead created' });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (lead.status === 'ENROLLED') {
      return res.status(400).json({ success: false, message: 'Enrolled lead cannot be edited' });
    }
    if (req.user.role === 'ADVISOR' && (lead.assignedAdvisor?._id || lead.assignedAdvisor)?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
    }
    const payload = { ...req.body };
    if (req.user.role !== 'ADMIN') {
      delete payload.assignedAdvisor;
    }
    const updated = await leadService.updateLead(req.params.id, payload, req.user._id);
    res.status(200).json({ success: true, data: updated, message: 'Lead updated' });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (lead.status === 'ENROLLED') {
      return res.status(400).json({ success: false, message: 'Enrolled lead cannot be deleted' });
    }
    if (req.user.role === 'ADVISOR' && (lead.assignedAdvisor?._id || lead.assignedAdvisor)?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lead' });
    }
    await leadService.deleteLead(req.params.id);
    res.status(200).json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    next(error);
  }
};

const enrollLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (req.user.role === 'ADVISOR' && lead.assignedAdvisor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to enroll this lead' });
    }
    const { lead: updatedLead, student } = await leadService.enrollLead(req.params.id, req.user._id);
    res.status(201).json({
      success: true,
      data: { lead: updatedLead, student },
      message: 'Lead enrolled. Student record created.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  enrollLead
};
