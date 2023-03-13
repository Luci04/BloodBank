import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { hospital } from './Schema/hospital.js';
import { receiver } from './Schema/receiver.js';
import { bloodSample } from './Schema/bloodSample.js';
import { request } from './Schema/request.js';
import response from './service/response.js';


const app = express();

dotenv.config();

app.use(bodyParser.json());

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGOLINK)
    .then(() => {
        console.log('Mongodb Database is Connected');
    }).catch(err => console('Error', { err }));


//Main Routes

app.get('/', (req, res) => {
    res.send("Server is Working");
})

//Register Hospital
app.post("/register-hospital", (req, res) => {
    const { name, password, username } = req.body;

    const newHospital = hospital({
        name, password, username
    })

    newHospital.save()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            if (err.code === 11000) {
                res.status(response.already_exists.code).send({ 'Error': response.value_already_exists('UserName').message })
            } else {
                res.status(404).send({ 'Error': err.message })
            }

        })

})

//Register Receiver

app.post("/register-receiver", (req, res) => {
    const { name, password, username } = req.body;

    const newReceiver = receiver({
        name, password, username
    })

    newReceiver.save()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            if (err.code === 11000) {
                res.status(response.already_exists.code).send({ 'Error': response.value_already_exists('UserName').message })
            } else {
                res.status(404).send({ 'Error': err.message })
            }

        })

})


//login Account based on type passed

app.get('/login', (req, res) => {
    const { username, password, type } = req.body;  //Allthough type functionnality be maintained over Server only

    const selectModel = type === 'receiver' ? receiver : hospital;

    selectModel.findOne({ username })
        .then((data) => {
            if (!data || data.length === 0) {
                res.status(response.does_not_exist.code).send({ 'Error': 'No User Exits' })
            } else {
                if (data.password === password) {
                    res.send(data);
                } else {
                    res.status(response.does_not_exist.code).send({ 'Error': 'Password Do not Match' })
                }
            }
        })
        .catch((err) => {
            res.status(response.does_not_exist.code).send({ 'Error': err.message })
        })
})

//Add Available Sample from Hospital End 

app.post('/hospital/addsample', (req, res) => {
    const { hospitalId, hospitalName, bloodType } = req.body;

    hospital.findOne({ _id: hospitalId }).then(hospitaldata => {
        if (!hospitaldata) {
            res.status(response.false_value().code).send({ 'Error': response.false_value("hospitalId").message })
        } else {
            const newSample = new bloodSample({
                bloodType,
                hospitalId,
                hospitalName
            });

            newSample.save()
                .then((data) => {
                    res.send(data);
                })
                .catch((err) => {
                    res.status(404).send({ 'Error': err.message });
                });
        }
    })
        .catch(err => {
            res.status(404).send({ 'Error': err.message })
        });

})

//Get All Sample Available 

app.get('/getallsamples', (req, res) => {
    bloodSample.find({}, { hospitalId: false })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(404).send({ 'Error': err.message })
        })
})

//Get all blood Sample Available in a Hospital

app.get('/getallhospitalsamples', (req, res) => {

    const { hospitalId } = req.body;

    bloodSample.find({ hospitalId })
        .then((data) => {
            if (!data || data.length === 0) {
                res.status(400).send({ 'Error': "Hospital Not Present" })
            } else {
                res.send(data);
            }
        })
        .catch((err) => {
            res.status(404).send({ 'Error': err.message })
        })
})

//Update a Sample Details

app.put('/updatesample', (req, res) => {

    const { id, bloodType, hospitalId, hospitalName } = req.body;

    if (!id) {
        res.status(404).send({ 'Error': 'Invalid Request ID' })
    } else {

        hospital.findById({ _id: hospitalId })
            .then((hos) => {
                if (!hos || hos.length === 0) {
                    res.status(400).send({ 'Error': "Hospital Not Present" })
                } else {
                    bloodSample.findOneAndUpdate({ _id: id }, { bloodType, hospitalName }, { new: true })
                        .then((data) => {
                            res.send(data)
                        })
                        .catch((err) => {
                            res.status(404).send({ 'Error': err.message })
                        })

                }
            })
            .catch((err) => {
                res.status(404).send({ 'Error': err.message })
            })
    }
})


//Delete A Blood sample 

app.delete('/deletesample', (req, res) => {
    const { id, hospitalId } = req.body

    if (!id || !hospitalId) {
        res.status(404).send({ 'Error': "Please Provide Proper Details" })
    } else {
        hospital.findById({ _id: hospitalId })
            .then((hos) => {
                if (!hos || hos.length === 0) {
                    res.status(404).send({ 'Error': "Hospital Not Present" })
                } else {
                    bloodSample.findOneAndDelete({ _id: id })
                        .then((data) => {
                            if (!data) {
                                res.status(404).send({ 'Error': "No Data Found" })
                            } else {
                                res.send(data);
                            }
                        })
                        .catch((err) => {
                            res.status(404).send({ 'Error': err.message })
                        })
                }
            })
            .catch((err) => {
                res.status(404).send({ 'Error': err.message })
            })
    }
})

//Request a Sample from Receiver for Blood

app.post('/requestblood', (req, res) => {

    const { receiverId, hospitalId, bloodType } = req.body;

    receiver.findById({ _id: receiverId }).then((data) => {
        if (!data || data.length === 0) {
            res.status(404).send({ 'Error': 'No User Exits' })
        } else {
            const newRequest = request({
                receiverId,
                bloodType,
                hospitalId
            })

            newRequest.save()
                .then((data) => {
                    res.send(data);
                })
                .catch(err => {
                    res.status(404).send({ 'Error': err.message })
                })
        }
    }).catch((err) => {
        res.status(404).send({ 'Error': err.message })
    })
})

//Listing All the Request for Hospital

app.get('/allrequests', (req, res) => {
    const { hospitalId } = req.body;

    hospital.findById({ _id: hospitalId }).then((hos) => {
        if (hos) {
            request.find({ hospitalId })
                .then((data) => {
                    res.send(data);
                })
                .catch((err) => {
                    res.status(404).send({ 'Error': err.message })
                });
        } else {
            res.status(404).send({ 'Error': 'No Hospital Found' })
        }
    })
})


//Listen on Port 

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})