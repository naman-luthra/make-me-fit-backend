import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnectionToDB } from '../db';

export const signIn = {
    path: '/api/signin',
    method: 'post',
    handler: async (req, res)=>{
        try {
            const { email, password } = req.body;
            const db = await getConnectionToDB();
            const [ result ] = await db.query(`SELECT user_id, first_name, last_name, password, new_user FROM users WHERE email = '${email}'`);
            if(result.length === 0) return res.sendStatus(404);
            const { user_id, first_name: firstName, last_name: lastName, password: passwordHash, new_user: newUser } = result[0];
            const isCorrect = await bcrypt.compare(password, passwordHash);
            if(isCorrect){
                jwt.sign({
                    user_id,
                    email,
                    firstName,
                    lastName,
                    newUser
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d',
                },
                (err, token)=>{
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.status(200).json({ token });
                });
            }
        else res.sendStatus(401);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}
