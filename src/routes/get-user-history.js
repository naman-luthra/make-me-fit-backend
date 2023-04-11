import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const getUserHistory = {
    path: '/api/get-user-history',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`SELECT date, weight, water, excercise, food  FROM tracking_history WHERE user_id = '${user_id}'`);
                return res.status(200).json({ message: 'Success!', userHistory: result.map(day=>({
                    date: day.date,
                    weight: day.weight,
                    water: day.water,
                    excercise: day.excercise,
                    food: day.food.data
                }))});
            });
        } catch (error) {
            console.log(error);
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}