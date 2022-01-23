const express = require('express')
const { response } = require('express')
const { options } = require('pg/lib/defaults')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
app.use(bodyParser.json())
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
                                {name: {
                                    type : Sequelize.TEXT,
                                    allowNull : false,
                                },
                                imageURL: {
                                    type:Sequelize.TEXT,
                                    defaultValue : "no url",
                                },
                                address : {
                                    type:Sequelize.TEXT,
                                    allowNull : false,
                                },
                                description : {
                                    type : Sequelize.TEXT,
                                }
                                })


//student module with table 'students'
const Students = sequelize.define('students',
                                {firstName: {
                                    type: Sequelize.TEXT,
                                    allowNull: false,
                                },
                                lastName: {
                                    type: Sequelize.TEXT,
                                    allowNull: false,
                                },
                                email: {
                                    type: Sequelize.TEXT,
                                    allowNull: false,
                                    validate: {
                                        isEmail : true
                                    }
                                },
                                imageURL: {
                                    type:Sequelize.TEXT,
                                    defaultValue : "no url"
                                },
                                gpa: {
                                    type: Sequelize.DOUBLE(),
                                    validate:{
                                        min: 0,
                                        max: 4,
                                    }
                                },
                                campusid:{
                                    type: Sequelize.INTEGER,
                                    allowNull : false,
                                }
                                })

//route for the home page
app.get("/", (req, res) => {
    res.send("nothing here")
})

//route for all campuses
app.get('/campuses', function(req, res) {
    Campuses.findAll().then(campuses => res.json(campuses))
})

//route for all students
app.get('/students', function(req, res) {
    Students.findAll().then(students => res.json(students))
})

//create new student through the post request
app.post('/students', function(req, res) {
    Students.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        campusid: req.body.campusid,
        gpa: req.body.gpa,
        imageURL : req.body.imageURL,
    }).then(function(student) {
        res.send(student)
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})


//create new campus through the post request
app.post('/campuses', function(req, res) {
    Campuses.create({
        name: req.body.name,
        address: req.body.address,
        imageURL: req.body.imageURL,
        description: req.body.description,
    }).then(function(campus) {
        res.send(campus)
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})


//delete student
app.delete('/students/:id', function(req,res) {
    Students.findByPk(req.params.id).then(function(student){
        student.destroy()
    }).then((student) => {
        res.sendStatus(200)
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})

//delete campus
app.delete('/campuses/:id', function(req,res) {
    Campuses.findByPk(req.params.id).then(function(campus){
        campus.destroy()
    }).then((campus) => {
        res.sendStatus(200)
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})

//find a student
app.get('/students/:id', function(req, res) {
    Students.findAll({where: {id: req.params.id}}).then(students => {
        Campuses.findAll({where: {id: students[0].campusid}}).then(campuses => {
            return res.json([].concat(students, campuses))
        }).catch(function(err) { //if there is no campus linked to the student
            res.json(students)
        })
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})

//find a campus
app.get('/campuses/:id', function(req, res) {
    Campuses.findAll({where: {id: req.params.id}}).then(campuses => {
        Students.findAll({where: {campusid: campuses[0].id}}).then(students => {
            return res.json([].concat(campuses, students))
        }).catch(function(err) { //if there are no students linked the campus
            res.json(campuses)
        })
    }).catch(function(err) {
        console.log(err)
        res.send(err)
    })
})


