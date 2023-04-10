import { getConnectionToDB } from '../db';
import jwt from 'jsonwebtoken';

export const updateUsermetrics = {
    path: '/api/update-user-metrics',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, weight, height, weightGoal, gender } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`UPDATE users SET weight = ${weight}, height = ${height}, weight_goal = ${weightGoal}, gender = '${gender}' WHERE user_id = '${user_id}'`);
                if(result.affectedRows === 1) return res.status(200).json({ message: 'Success!' });
                else return res.status(500).json({ message: 'Something went wrong!' });
            });
        } catch (error) {
            console.log(error);
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}