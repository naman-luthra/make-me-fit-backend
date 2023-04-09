import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const createFitnessPlan = {
    path: '/api/create-fitness-plan',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, planName, mealPlanId, workoutRoutineId } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ {insertId} ] = await db.query(`INSERT INTO fitness_plans (plan_name, start_date) VALUES ("${planName}", CURDATE())`);
                await db.query(`INSERT INTO user_fitness_plans (user_id, plan_id) VALUES ('${user_id}', ${insertId})`);
                await db.query(`INSERT INTO fitness_plan_diet_plans (plan_id, diet_plan_id) VALUES (${insertId}, ${mealPlanId})`);
                await db.query(`INSERT INTO fitness_plan_workout_routines (plan_id, routine_id) VALUES (${insertId}, ${workoutRoutineId})`);
                await db.query(`UPDATE users SET active_plan_id = ${insertId} WHERE user_id = '${user_id}'`);
                return res.status(200).json({fitnessPlanId: insertId});
            });
        } catch (error) {
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
};