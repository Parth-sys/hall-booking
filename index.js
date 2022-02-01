require("dotenv").config();
const express = require('express');
const cors=require('cors')
const bodyParser = require("body-parser");

const uniqid = require('uniqid');



const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

let rooms = [];
let roomNo = 100;
let bookings = [];
let date_regex = /^(0[1-9]|[0-2])\/(0[1-9]|1\d|2\d3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get('/', function (req, res) {
    return ({
        output: "Express"
    });
});

app.get("/getRooms", function (req, res) {
    res.json({
        output: rooms
    });
});

app.get("/getbookings", function (req, res) {
    res.json({
        output: bookings
    });
});

app.post("/createRoom", function (req, res) {
    
    let room = {};
    room.id = uniqid();
    room.roomNo = roomNo;
    room.bookings = [];

    if (req.body.noSeats) {
        room.noSeats = req.body.noSeats
    } else {
        res.status(400).json({ output: "please specify no of seats for room" })
    }

    if (req.body.amenities) {
        room.amenities = req.body.amenities
    } else {
        res.status(400).json({ output: "please specify all amenities for room in Array format" });

    }


    if (req.body.price) {
        room.price = req.body.price
    } else {
        res.status(400).json({ output: "please specify price per hour for room" });

    }
    rooms.push(room)
    roomNo++;
    res.status(200).json({ output: "Room created " })
});


app.post("/createBook", function (req, res) {

    let booking = {};
    booking.id = uniqid();
    //customer Name
    if (req.body.custName) {
        booking.custName = req.body.custName
    } else {
        res.status(400).json({ output: "please specify custName" });

    }
    //date
    if (req.body.date) {
        if (date_regex.test(req.body.date)) {

            booking.date = req.body.date
        }

        else {
            res.status(400).json({ output: "please specify date in MM/DD/YYYY" });

        }
    }
    else {
        res.status(400).json({ output: "please specify date for booking" });
    }

    //start Time
    if (req.body.startTime) {
        if (time_regex.test(req.body.startTime)) {

            booking.startTime = req.body.startTime
        }

        else {
            res.status(400).json({ output: "please specify time in hh:min(24-hr format) where minutes should be 00 only" });

        }
    }
    else {
        res.status(400).json({ output: "please specify startingTime for booking" });
    }

    if (req.body.endTime) {
        if (time_regex.test(req.body.endTime)) {

            booking.endTime = req.body.endTime
        }

        else {
            res.status(400).json({ output: "please specify time in hh:min(24-hr format) where minutes should be 00 only" });

        }
    }
    else {
        res.status(400).json({ output: "please specify EndingTime for booking" });
    }


    const AvailableRooms = rooms.filter(room => {
        if (room.bookings.length == 0) {
            return true;
        }
        else {

            room.bookings.filter(book => {

                if ((book.date == req.body.date)) {
                    if ((parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.startTime).substring(0, 1))) && (parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.endTime).substring(0, 1)))) {

                        if ((parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.startTime).substring(0, 1))) &&
                            (parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.endTime).substring(0, 1)))) {
                            return true;

                        }
                    }
                }

                else {
                    return true;
                }

            })

        }

    });

    if (AvailableRooms.length == 0) {
        res.status(400).json({ output: "No  Available Rooms on selected date and time" })

    }
    else {
        roomRec = AvailableRooms[0];
        let count = 0;
    
    rooms.forEach(element => {
        if (element.roomNo == roomRec.roomNo) {
            rooms[count].bookings.push({
                custName: req.body.custName,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                date: req.body.date
            })
        }
        count++;
    });

    let bookingRec = req.body;
    bookingRec.roomNo = roomRec.roomNo;
    bookingRec.cost = parseInt(roomRec.price) * (parseInt((bookingRec.endTime).substring(0, 1)) - parseInt((bookingRec.startTime).substring(0, 1)));
    bookings.push(bookingRec);
    res.status(200).json({ output: "room booked successfully" })
}
});


app.listen(port, () => {
    console.log("server is live", port)
})