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
                const [ resultUsers ] = await db.query(`SELECT age, gender, weight, height, dietary_preference, activity_level, weight_goal, activity_goal, active_plan_id, new_user FROM users WHERE user_id = '${user_id}'`);
                if(resultUsers.length === 0) return res.status(404).json({ message: 'User not found!' });
                const [ resultPlans ] = await db.query(`SELECT plan_id FROM user_fitness_plans WHERE user_id = '${user_id}'`);
                if(resultUsers[0].active_plan_id === null){
                    return res.status(200).json({
                        bodyMetrics: {
                            age: resultUsers[0].age,
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
                        mealPlan:null,
                        workoutRoutine:null
                    });
                }
                const [ [ { diet_plan_id, description: diet_plan_data } ] ] = await db.query(`SELECT fitness_plan_diet_plans.diet_plan_id as diet_plan_id, description FROM fitness_plan_diet_plans INNER JOIN diet_plans ON fitness_plan_diet_plans.diet_plan_id=diet_plans.plan_id WHERE fitness_plan_diet_plans.plan_id = ${resultUsers[0].active_plan_id}`);
                const [ [ { routine_id, data: routine_data } ] ] = await db.query(`SELECT fitness_plan_workout_routines.routine_id as routine_id, data FROM fitness_plan_workout_routines INNER JOIN workout_routines ON fitness_plan_workout_routines.routine_id=workout_routines.routine_id WHERE fitness_plan_workout_routines.plan_id = ${resultUsers[0].active_plan_id}`);
                const mealPlanTable =  diet_plan_data.split('\n').map((item)=>item.split('|'));
                const mealPlanObj = ['1','2','3','4','5','6','7'].map((day)=>{
                    const dayPlan = {};
                    mealPlanTable.forEach((item)=>{
                        if(item[0]===day){
                            dayPlan[item[1].toLowerCase()] = {
                                name: item[2],
                                calories: item[3],
                            };
                        }
                    });
                    return dayPlan;
                });
                const mealPlan = {
                    id: diet_plan_id,
                    data: mealPlanObj
                };
                const workoutRoutineTable =  routine_data.split('\n').map((item)=>item.split('|'));
                const workoutRoutineObj = ['1','2','3','4','5','6','7'].map((day)=>{
                    const dayPlan = [];
                    workoutRoutineTable.forEach((item)=>{
                        if(item[0]===day){
                            dayPlan.push({
                                name: item[1],
                                sets: item[2],
                                reps: item[3],
                                muscleGroup: item[4],
                            });
                        }
                    });
                    return dayPlan;
                });
                const workoutRoutine = {
                    id: routine_id,
                    data: workoutRoutineObj
                };
                return res.status(200).json({
                    bodyMetrics: {
                        age: resultUsers[0].age,
                        gender: resultUsers[0].gender,
                        weight: resultUsers[0].weight,
                        height: resultUsers[0].height,
                        diet: resultUsers[0].dietary_preference,
                        activity: resultUsers[0].activity_level,
                        weightGoal: resultUsers[0].weight_goal,
                        activityGoal: resultUsers[0].activity_goal
                    },
                    activeFitnessPlan: resultUsers[0].active_plan_id,
                    fitnessPlans: resultPlans,
                    mealPlan,
                    workoutRoutine
                 });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
};