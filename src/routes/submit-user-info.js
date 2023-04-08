import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const submitUserInfo = {
    path: '/api/submit-user-info',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, age, gender, weight, height, diet, activity, weightGoal, activityGoal } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`UPDATE users SET new_user = FALSE, age = ${age}, gender = "${gender}", weight = ${weight}, height = ${height}, dietary_preference = "${diet}", activity_level = "${activity}", weight_goal = ${weightGoal}, activity_goal = "${activityGoal}" WHERE user_id = '${user_id}'`);
                if(result.affectedRows === 1) return res.status(200).json({ message: 'Success!' });
                else return res.status(500).json({ message: 'Something went wrong!' });
            }); 
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}