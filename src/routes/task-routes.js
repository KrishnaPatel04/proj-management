const Router = require('express')

const {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
} = require('../controllers/task-controllers')
const { verifyJWT, validateProjectPermission } = require('../middlewares/auth-middleware')
const upload = require('../middlewares/multer-middle')
const { AvailableUserRole, UserRolesEnum } = require('../utils/constants')

const router = Router()

router.use(verifyJWT)

router
    .route('/:projectId')
    .get(validateProjectPermission(AvailableUserRole), getTasks)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array('attachments', 5),
        createTask
    )

router
    .route('/:projectId/t/:taskId')
    .get(validateProjectPermission(AvailableUserRole), getTaskById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array('attachments', 5),
        updateTask
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteTask
    )

router
    .route('/:projectId/t/:taskId/subtasks')
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createSubTask
    )

router
    .route('/:projectId/st/:subTaskId')
    .put(validateProjectPermission(AvailableUserRole), updateSubTask)
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteSubTask
    )

module.exports = router
