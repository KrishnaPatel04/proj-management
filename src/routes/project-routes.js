const Router = require('express')

const {
    getProjects,
    getProjectById,
    getProjectMembers,
    createProject,
    deleteMember,
    deleteProject,
    updateMemberRole,
    addMembersToProject,
    updateProject
} = require('../controllers/project-controllers');
const validate = require("../middlewares/validator-middle")
const { createProjectValidator, addMembersToProjectValidator } = require("../validators/index")
const { verifyJWT, validateProjectPermission } = require('../middlewares/auth.middleware');
const { AvailableUserRole, UserRolesEnum } = require('../utils/constants');

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject)
router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )

router.route("/:projectId/members")
    .get(getProjectMembers)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]),
        addMembersToProjectValidator(),
        validate,
        addMembersToProject)

router.route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember)

module.exports = router;
