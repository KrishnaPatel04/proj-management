const User = require("../models/user-model")
const Project = require("../models/project-models")
const Task = require('../models/task-models')
const SubTask = require('../models/subtask-models')
const ApiResponse = require('../utils/api-response')
const ApiError = require('../utils/api-error')
const asyncHandler = require('../utils/asyn-handler')
const mongoose = require('mongoose')
const { UserRolesEnum, AvailableUserRole } = require("../utils/constants")


const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullname")

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
})

const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body
    const { projectId } = req.params
    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    const files = req.files || []
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments
    })

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"))
})

const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ])

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task[0], "Task fetched successfully"))
})

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { title, description, assignedTo, status } = req.body

    const files = req.files || []
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const updateData = { title, description, status }
    if (assignedTo) {
        updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo)
    }
    if (attachments.length > 0) {
        updateData.attachments = attachments
    }

    const task = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true }
    )

    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"))
})

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    const task = await Task.findByIdAndDelete(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    await SubTask.deleteMany({ task: new mongoose.Types.ObjectId(taskId) })

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task deleted successfully"))
})

const createSubTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { title } = req.body

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    const subTask = await SubTask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    })

    return res
        .status(201)
        .json(new ApiResponse(201, subTask, "Subtask created successfully"))
})

const updateSubTask = asyncHandler(async (req, res) => {
    const { subTaskId } = req.params
    const { title, isCompleted } = req.body

    const subTask = await SubTask.findByIdAndUpdate(
        subTaskId,
        { title, isCompleted },
        { new: true }
    )

    if (!subTask) {
        throw new ApiError(404, "Subtask not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "Subtask updated successfully"))
})

const deleteSubTask = asyncHandler(async (req, res) => {
    const { subTaskId } = req.params

    const subTask = await SubTask.findByIdAndDelete(subTaskId)
    if (!subTask) {
        throw new ApiError(404, "Subtask not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "Subtask deleted successfully"))
})

module.exports = {
    getTasks, createTask, getTaskById, updateSubTask, updateTask,
    deleteTask, createSubTask, deleteSubTask
}