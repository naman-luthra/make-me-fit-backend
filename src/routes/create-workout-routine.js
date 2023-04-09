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
            const { user_id, goal, equipment } = req.body;
            const { authorization } = req.headers;
            if(!authorization) return res.status(401).json({ message: 'Authorization header not found!' });
            const token = authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
                if(err) return res.status(401).json({ message: 'Unable to verify!' });
                const { user_id: user_id_decoded  } = decoded;
                if( user_id !== user_id_decoded ) return res.status(403).json({ message: 'Not Authorised!' });
                const db = await getConnectionToDB();
                const [ result ] = await db.query(`SELECT age, gender, weight, height FROM users WHERE user_id = '${user_id}'`);
                if(result.length === 0) return res.status(404).json({ message: 'User not found!' });
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Write a 7 day workout routine with 3 to 4 excercises in a day in .csv format but use | instead of , having day_number, exercise, reps, sets, muscle_group given that the user is looking for ${goal}. The person is a ${result[0].age} years old ${result[0].gender}, ${result[0].weight}Kg, ${result[0].height}cm and has access to ${equipment}`,
                    suffix: "",
                    temperature: 0.7,
                    max_tokens: 2512,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                }).then((response) => response.data);
                console.log(`Write a 7 day workout routine with 3 to 4 excercises in a day in .csv format but use | instead of , having day_number, exercise, reps, sets, muscle_group given that the user is looking for ${goal}. The person is a ${result[0].age} years old ${result[0].gender}, ${result[0].weight}Kg, ${result[0].height}cm and has access to ${equipment}`);
                console.log(response.choices[0].text);
                const [ {insertId} ] = await db.query(`INSERT INTO workout_routines (data) VALUES ("${response.choices[0].text}")`);
                return res.status(200).json({workoutRoutineId: insertId, workoutRoutine: response.choices[0].text});
            });
        } catch (error) {
            if(error) return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
};