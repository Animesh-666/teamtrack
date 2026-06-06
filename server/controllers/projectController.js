import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

const isLeaderOrAdmin = (user) => {
  if (!user || !user.role) return false;
  const roleUpper = user.role.trim().toUpperCase();
  return roleUpper === "ADMIN" || roleUpper === "TEAM LEADER" || roleUpper === "LEADER";
};

export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, dueDate, status, members } = req.body;
    const project = await Project.create({
      name, description, startDate, 
      endDate: endDate || dueDate,
      dueDate: dueDate || endDate,
      status: status || "active",
      createdBy: req.user._id,
      members: members || [],
    });
    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar role");
    
    if (members?.length > 0) {
      const notifications = members.map((memberId) => ({
        userId: memberId,
        message: `You've been added to the project "${project.name}"`,
        type: "project_created",
      }));
      await Notification.insertMany(notifications);
    }
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    if (status && status !== "all") filter.status = status.toLowerCase();
    
    if (!isLeaderOrAdmin(req.user)) {
      filter.$and = [{ $or: [{ members: req.user._id }, { createdBy: req.user._id }] }];
    }
    
    const projects = await Project.find(filter)
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar role")
      .sort({ createdAt: -1 });
      
    res.json({ projects, data: projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("members", "name email avatar role");
    if (!project) return res.status(404).json({ message: "Project not found" });
    const tasks = await Task.find({ projectId: project._id });
    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.body.userId } }, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $pull: { members: req.params.userId } }, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};