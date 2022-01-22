const express = require('express')
const { response } = require('express')
const app = express()
const port = 3000
app.listen(port, () => console.log(`the app is listening on port ${port}!`))

const {Sequelize, Op, Model, DataTypes} = require('sequelize')

//parameters for sequelize to connect to database
const sequelize = new Sequelize({
    database : 'school_storage',
    username : 'me',
    password : 'password',
    host : 'localhost',
    dialect : 'postgres',
    storage : './database.postgres',
    port: 5432,
})

//checks if the sequelize was connected to the database
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((err)=>{
    console.log('Unable to connect to the database:', err);
})

//makes campuses model with the table 'campuses'
const Campuses = sequelize.define('campuses', 
                                {name: {type : Sequelize.TEXT,
                                    allowNull : false},
                                imageURL: {type:Sequelize.TEXT,
                                    defaultValue : "no url"},
                                address : {type:Sequelize.TEXT,
                                    allowNull : false},
                                description : {type : Sequelize.TEXT}
                                })


//student module with table 'students'
const Students = sequelize.define('students',
                                {firstName: {type: Sequelize.TEXT,
                                    allowNull: false,},
                                lastName: {type: Sequelize.TEXT,
                                    allowNull: false,},
                                email: {type: Sequelize.TEXT,
                                    allowNull: false,
                                    validate: {
                                        isEmail : true
                                    }},
                                imageURL: {type:Sequelize.TEXT,
                                    defaultValue : "no url"},
                                gpa: {type: Sequelize.DOUBLE(),
                                validate:{
                                    min: 0,
                                    max: 4,
                                    }},
                                })

//sets the parameters, such as the table and it's contents to the database
sequelize.sync({ force: true})
    .then(()=>{
        console.log(`Databse & tables created`)

        Campuses.bulkCreate([
            { name: 'Lucretia Marcigliano Campus', address : '50 P Avenue, Brooklyn, NY 11223'},
            { name: 'Lafayette Educational Campus', address : '2630 Benson Ave, Brooklyn, NY 11214'},
            { name: 'Central Michigan University Fort Hamilton Center', address : '218 Marshall Dr, Brooklyn, NY 11209'},
            { name: 'Touro College, School for Lifelong Education', address : '1273 53rd St, Brooklyn, NY 11219'},
        ]).then(function() {
            return Campuses.findAll();
        }).then(function(campuses) {
            console.log(campuses)
        })

        Students.bulkCreate([
            {firstName: 'Josh', lastName: 'Soromo', email: 'yahoo@gmail.com', gpa: 5,},
            {firstName: 'Drake', lastName: 'Dano', email: 'drake@dano.com'},
            {firstName: 'Pomo', lastName: 'Frodo', email: 'email@email.com'},
            {firstName: 'Past', lastName: 'Future', email: 'present@email.com'},
        ]).then(function(){
            return Students.findAll();
        }).then(function(students) {
            console.log(students)
        })

    })

//route for the home page
app.get("/", (req, res) => {
    res.send("hey")
})

//route for all campuses
app.get('/campuses', function(req, res) {
    Campuses.findAll().then(campuses => res.json(campuses))
})

//route for all students
app.get('/students', function(req, res) {
    Students.findAll().then(students => res.json(students))
})

//












app.get('/campuses/:id', function(req, res){
    Campuses.findAll({where : {id : req.params.id} }).then(campuses => res.json(campuses))
})

