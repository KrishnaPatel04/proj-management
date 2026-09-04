const Router=require('express')
const healthCheck=require('../controllers/healthcheck-controller')
const router=Router();


router.route('/').get(healthCheck);
//export default router;
module.exports=router
