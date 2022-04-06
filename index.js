const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { capitalizeFirstLetter } = require("./date");
const { stringify } = require("nodemon/lib/utils");
const PORT = process.env.PORT || 3000;
const date = require(__dirname + "\\date.js");

const app = new express();
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB")


const taskSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    addTime: { 
        type: Date, 
        default: Date.now
    },
})

const Task = mongoose.model("Task", taskSchema)

function createTaskObj(content){
    if (content === '') return undefined;
    const newTask = new Task({
        content,
    });
    newTask.save()
    return newTask
}

const listSchema = {
    name: {
        type:String,
        unique: true,
    },
    items: [taskSchema],
    
}
const list = mongoose.model("List", listSchema)


const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "There are entry input for user first name, please check it"]
    },
    lastname: {
        type: String,
        required: [true, "There are entry input for user last name, please check it"]
    },
    username: {
        type: String,
        required: [true, "There are entry input for user username, please check it"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "There are entry input for user password, please check it"]
        // set: Data.prototype.saltySha1 // some function called before saving the data
    },
    emailaddress:{
        type: String,
        required: [true, "There are entry input for user email, please check it"],
        unique: true
    },
    // todolist: [taskSchema],

    customlist: [listSchema]
})



const User = mongoose.model("User", userSchema)

function createNewUser(firstname, lastname, username, password, emailaddress){
    let newUser = new User({
        firstname,
        lastname,
        username,
        password,
        emailaddress,
    });
    newUser.save()
}

    
    
// });
app.get("/", (req, res) => {
    res.redirect("/home")
})

app.post("/", (req, res) => {
    let task = createTaskObj(req.body.newItem)
    let lowercaseURL = String(req.body.addButton).toLowerCase()
    
    if (task === undefined) return;
    
    User.findOneAndUpdate(
        {username: "ronpieces", 'customlist.name': lowercaseURL}, 
        {$push: {'customlist.$.items': task}},
        {},
        (err, success) => {
            if (err) {
                console.log(err);
            }else{
                console.log("update successfull");   
                res.redirect(`/${lowercaseURL}`);
            }
        }
    )
});


app.post("/delete", (req, res) => {
    const url = String(req.rawHeaders[37]).split("/").at(-1);
    // if (req.route.path != "/"){
        User.updateOne(
            {"username": "ronpieces", "customlist.items._id": req.body.checkbox}, //itemsID
            {$pull: {"customlist.$.items": {_id: req.body.checkbox}}},
            (err, success) => {
                if (err) {
                    console.log(err);
                }else{
                    console.log("delete successfully");
                    res.redirect(`${url}`)
                }
            }
        )
        
    
})

app.get("/:id", (req, res) => {
    if (req.params.id == "favicon.ico") return;
    const capitalizePath = capitalizeFirstLetter(req.params.id)
    const listObj = list({
        name: req.params.id,
        items: []
    })

    User.findOne(
        {'username': "ronpieces"},
        (err, results) => {
            var itemObj;
            // {$push: {'customlist': listObj}},
            if (err){
                console.log(err);
            }else{
                
                for (let i = 0; i<results.customlist.length; i++){
                    if (results.customlist[i].name == req.params.id){
                        itemObj = results.customlist[i]
                        break
                    } 
                }
                if (itemObj == null) {
                    User.updateOne({username: "ronpieces"}, {$push : {customlist: {name: req.params.id, items: []}}}, (err) => {
                        if (err){
                            console.log(err);
                        }else{
                            console.log("Successfully update");
                        }
                    })
                }else{
                    res.render("home", {
                        "pageTitle": `${capitalizePath} List`,
                        "title" : capitalizePath,
                        "items": itemObj
                    })
                }
            }
        })
    
})



app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(PORT, (req, res) => {
    console.log(`using http://localhost:${PORT}`);
});



//for post project

// const postSchema = mongoose.Schema({
//     content: String,
//     postTime: { type: Date, default: Date.now },
//     //updated: { type: Date, default: Date.now },
//     // comments: [postSchema]
// })


//old logic

// createNewUser("Ron", "Pieces", "ronpieces", "Roncen@12", "chatzalo1@gmail.com");

// const userItems = ["Exercise", "Eat Slow", "Running"];
// const workItems = [];
// app.get("/", (req, res) => {
//     let dayName = date.getDay();
//     User.find({"username": "ronpieces"}, (err, docs) =>{
//         if (err){
//             console.log(err);
//         }else{
//             res.render("home", {"pageTitle": "To Do List","title": dayName, "items": docs[0].todolist})
//         }
//     })


// }
    // else{
    //     User.updateOne(
    //         {username: "ronpieces"},
    //         {$pull: 
    //             {todolist:
    //                 {_id: req.body.checkbox}
    //             }
    //         },
    //         (err, success) => {
    //             if (err) {
    //                 console.log(err);
    //             }else{
    //                 console.log(success);
    //             }
    //         }
    //     )
    //     res.redirect("/")
    // }