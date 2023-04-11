import { getConnectionToDB } from '../db';
import jwt from 'jsonwebtoken';

export const saveUserProgress = {
    path: '/api/save-user-progress',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, weight,water,food,excercise } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`INSERT INTO 
                    tracking_history (user_id, date, weight, water, food, excercise)
                    VALUES ('${user_id}', CURDATE(), ${weight ? weight : 'NULL'}, ${water ? water : 'NULL'}, '${JSON.stringify({ data : food })}', ${excercise ? excercise : 'NULL'})
                    ON DUPLICATE KEY UPDATE
                    weight = ${weight ? weight : 'NULL'}, water = ${water ? water : 'NULL'}, food = '${JSON.stringify({ data: food })}', excercise = ${excercise ? excercise : 'NULL'}
                    `);
                if(result.affectedRows === 1) return res.status(200).json({ message: 'Success!' });
                else return res.status(500).json({ message: 'Something went wrong!' });
            });
        } catch (error) {
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}