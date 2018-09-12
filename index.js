const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dbConfig = require("./knexfile");
const db = knex(dbConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());

const secret = 'secret';
function generateToken(user) {
    const payload = {
        username: user.username,
        department: user.department, 
    };
    const options = {
        expiresIn: '1h',
        jwtid: '123456',
    };
    return jwt.sign(payload, secret, options); 
}




server.get("/", (req, res) => {
    res.send('hallo, it be working mon!')
})

server.post("/api/register", (req, res) => {
    const credentials = req.body; 
    const hash = bcrypt.hashSync(credentials.password, 10);
    credentials.password = hash; 
    
    db('users')
        .insert(credentials)
        .then(ids => { 
            const id = ids[0];
            res.status(201).json(id); 
        })
        .catch(err => {
            res.status(500).json({error: "Could not register the given user."})
        })
})

server.post("/api/login", (req, res) => {
    const credentials = req.body; 

    db('users')
        .where({username: credentials.username})
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(credentials.password, user.password)) {
                const token = generateToken(user); 
                res.status(201).json({token});
            } else {
                res.status(401).json({error: "Thieves abounds!"})}
            }) 
        .catch(err => {
            res.status(500).json({error: "Could not login with given information."});
        })

})


const port = 9800;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
