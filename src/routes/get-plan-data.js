import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const getPlanData = {
    path: '/api/get-plan-data',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, plan_id } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ [ {active_fitness_plan_name, active_diet_plan_id, active_routine_id} ] ] = await db.query(`SELECT plan_name as active_fitness_plan_name, active_diet_plan_id, active_routine_id FROM fitness_plans WHERE plan_id = ${plan_id}`);
                const [ dietPlans  ] = await db.query(`SELECT fitness_plan_diet_plans.diet_plan_id as diet_plan_id, data as diet_plan_data, diet_plans.plan_name as plan_name FROM fitness_plan_diet_plans INNER JOIN diet_plans ON fitness_plan_diet_plans.diet_plan_id=diet_plans.plan_id WHERE fitness_plan_diet_plans.plan_id = ${plan_id}`);
                const [ routines ] = await db.query(`SELECT fitness_plan_workout_routines.routine_id as routine_id, data as routine_data, workout_routines.routine_name as routine_name FROM fitness_plan_workout_routines INNER JOIN workout_routines ON fitness_plan_workout_routines.routine_id=workout_routines.routine_id WHERE fitness_plan_workout_routines.plan_id = ${plan_id}`);
                const mealPlans = dietPlans.map(({diet_plan_id, plan_name, diet_plan_data}) => ({
                    id: diet_plan_id,
                    name: plan_name,
                    data: diet_plan_data.dayPlanArr
                }));
                const workoutRoutines = routines.map(({routine_id, routine_name, routine_data}) => ({
                    id: routine_id,
                    name: routine_name,
                    data: routine_data.dayPlanArr
                }));
                return res.status(200).json({
                    activeFitnessPlan: {
                        id: plan_id,
                        name: active_fitness_plan_name,
                        activeMealPlanId: active_diet_plan_id,
                        activeWorkoutRoutineId: active_routine_id,
                        mealPlans,
                        workoutRoutines
                    }
                 });
            });
        } catch (error) {
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}