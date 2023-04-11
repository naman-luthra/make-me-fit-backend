import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const getUserData = {
    path: '/api/get-user-data',
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
                const [ resultUsers ] = await db.query(`SELECT image, dob, gender, weight, height, dietary_preference, activity_level, weight_goal, activity_goal, active_plan_id, new_user FROM users WHERE user_id = '${user_id}'`);
                if(resultUsers.length === 0) return res.status(404).json({ message: 'User not found!' });
                const [ resultHistory ] = await db.query(`SELECT weight, water, excercise, food FROM tracking_history WHERE user_id = '${user_id}' and date = CURDATE()`);
                const todayHistory = resultHistory.length === 0 ? null : {
                    weight: resultHistory[0].weight,
                    water: resultHistory[0].water,
                    excercise: resultHistory[0].excercise,
                    food: resultHistory[0].food.data,
                };
                const [ resultPlans ] = await db.query(`SELECT fitness_plans.plan_id as plan_id, fitness_plans.plan_name as plan_name FROM user_fitness_plans INNER JOIN fitness_plans ON fitness_plans.plan_id = user_fitness_plans.plan_id WHERE user_id = '${user_id}'`);
                if(resultUsers[0].active_plan_id === null){
                    return res.status(200).json({
                        bodyMetrics: {
                            dob: resultUsers[0].dob,
                            gender: resultUsers[0].gender,
                            weight: resultUsers[0].weight,
                            height: resultUsers[0].height,
                            diet: resultUsers[0].dietary_preference,
                            activity: resultUsers[0].activity_level,
                            weightGoal: resultUsers[0].weight_goal,
                            activityGoal: resultUsers[0].activity_goal
                        },
                        newUser: resultUsers[0].new_user,
                        activeFitnessPlan: null,
                        fitnessPlans: resultPlans,
                        image: resultUsers[0].image.data,
                        todayHistory,
                    });
                }
                const [ [ {active_fitness_plan_name, active_diet_plan_id, active_routine_id} ] ] = await db.query(`SELECT plan_name as active_fitness_plan_name, active_diet_plan_id, active_routine_id FROM fitness_plans WHERE plan_id = ${resultUsers[0].active_plan_id}`);
                const [ dietPlans  ] = await db.query(`SELECT fitness_plan_diet_plans.diet_plan_id as diet_plan_id, data as diet_plan_data, diet_plans.plan_name as plan_name FROM fitness_plan_diet_plans INNER JOIN diet_plans ON fitness_plan_diet_plans.diet_plan_id=diet_plans.plan_id WHERE fitness_plan_diet_plans.plan_id = ${resultUsers[0].active_plan_id}`);
                const [ routines ] = await db.query(`SELECT fitness_plan_workout_routines.routine_id as routine_id, data as routine_data, workout_routines.routine_name as routine_name FROM fitness_plan_workout_routines INNER JOIN workout_routines ON fitness_plan_workout_routines.routine_id=workout_routines.routine_id WHERE fitness_plan_workout_routines.plan_id = ${resultUsers[0].active_plan_id}`);
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
                    bodyMetrics: {
                        dob: resultUsers[0].dob,
                        gender: resultUsers[0].gender,
                        weight: resultUsers[0].weight,
                        height: resultUsers[0].height,
                        diet: resultUsers[0].dietary_preference,
                        activity: resultUsers[0].activity_level,
                        weightGoal: resultUsers[0].weight_goal,
                        activityGoal: resultUsers[0].activity_goal
                    },
                    activeFitnessPlan: {
                        id: resultUsers[0].active_plan_id,
                        name: active_fitness_plan_name,
                        activeMealPlanId: active_diet_plan_id,
                        activeWorkoutRoutineId: active_routine_id,
                        mealPlans,
                        workoutRoutines
                    }, 
                    fitnessPlans: resultPlans,
                    newUser: resultUsers[0].new_user,
                    image: resultUsers[0].image.data,
                    todayHistory,
                 });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
};