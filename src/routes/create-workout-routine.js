import { Configuration, OpenAIApi } from 'openai';
import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const createWorkoutRoutine = {
    path: '/api/create-workout-routine',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { user_id, workoutRoutineName, fitnessPlanId, workoutRoutineId, goal, equipment } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`SELECT dob, gender, weight, height FROM users WHERE user_id = '${user_id}'`);
                if(result.length === 0) return res.status(404).json({ message: 'User not found!' });
                if(workoutRoutineId)
                    await db.query(`DELETE FROM workout_routines WHERE routine_id = ${workoutRoutineId}`);
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Write a 7 day workout routine with 3 to 4 excercises in a day in .csv format but use | instead of , having day_number, exercise, reps, sets, muscle_group given that the user is looking for ${goal}. The person is a ${new Date().getFullYear() - result[0].dob.getFullYear()} years old ${result[0].gender}, ${result[0].weight}Kg, ${result[0].height}cm and has access to ${equipment}`,
                    suffix: "",
                    temperature: 0.7,
                    max_tokens: 2512,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                }).then((response) => response.data);
                const workoutRoutineTable =  response.choices[0].text.split('\n').map((item)=>item.split('|'));
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
                const [ {insertId} ] = await db.query(`INSERT INTO workout_routines (routine_name, data) VALUES ("${workoutRoutineName}", '${JSON.stringify({dayPlanArr: workoutRoutineObj})}')`);
                if(fitnessPlanId){
                    await db.query(`INSERT INTO fitness_plan_workout_routines (plan_id, routine_id) VALUES (${fitnessPlanId}, ${insertId})`);
                    if(workoutRoutineId)
                        await db.query(`DELETE FROM fitness_plan_workout_routines WHERE routine_id = ${workoutRoutineId}`);
                }
                return res.status(200).json({id: insertId, name: workoutRoutineName, data: workoutRoutineObj});
            });
        } catch (error) {
            console.log(error);
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
};