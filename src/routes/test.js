export const test = {
    path: '/api/test',
    method: 'get',
    handler: async (req, res)=>{
        res.json({ message: 'Hello World!' });
    }
}