const Program = require('../models/Program');

const getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    next(error);
  }
};

const getProgramById = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

const createProgram = async (req, res, next) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ success: true, data: program, message: 'Program created' });
  } catch (error) {
    next(error);
  }
};

const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, data: program, message: 'Program updated' });
  } catch (error) {
    next(error);
  }
};

const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, message: 'Program deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
};
