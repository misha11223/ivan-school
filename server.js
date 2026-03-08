
const express=require("express")
const fs=require("fs")
const bodyParser=require("body-parser")
const app=express()

app.use(bodyParser.json())
app.use(express.static("public"))

const DB="db.json"

function load(){
 if(!fs.existsSync(DB)){
  fs.writeFileSync(DB,JSON.stringify({users:[],schedule:[]}))
 }
 return JSON.parse(fs.readFileSync(DB))
}

function save(data){
 fs.writeFileSync(DB,JSON.stringify(data,null,2))
}

app.post("/register",(req,res)=>{
 const {email,password,nick,payinfo}=req.body
 const db=load()

 db.users.push({
  id:Date.now(),
  email,password,nick,payinfo,
  role:"teacher"
 })

 save(db)
 res.sendStatus(200)
})

app.post("/login",(req,res)=>{
 const {email,password}=req.body
 const db=load()

 if(email==="admin" && password==="TT09rd1995@@"){
  return res.json({id:0,role:"admin",nick:"admin"})
 }

 const user=db.users.find(u=>u.email===email && u.password===password)
 if(!user) return res.status(401).send("error")

 res.json(user)
})

app.post("/create",(req,res)=>{
 const {nick,student,day,time}=req.body
 const db=load()

 const teacher=db.users.find(u=>u.nick===nick)
 if(!teacher) return res.status(400).send("teacher not found")

 db.schedule.push({
  id:Date.now(),
  teacher_id:teacher.id,
  student,day,time,
  status:"ожидание"
 })

 save(db)
 res.sendStatus(200)
})

app.get("/lessons/:id",(req,res)=>{
 const db=load()
 const lessons=db.schedule.filter(l=>l.teacher_id==req.params.id)
 res.json(lessons)
})

app.post("/status",(req,res)=>{
 const {id,status}=req.body
 const db=load()
 const lesson=db.schedule.find(l=>l.id==id)
 if(lesson) lesson.status=status
 save(db)
 res.sendStatus(200)
})

app.post("/delete",(req,res)=>{
 const {id}=req.body
 const db=load()
 db.schedule=db.schedule.filter(l=>l.id!=id)
 save(db)
 res.sendStatus(200)
})

app.get("/report",(req,res)=>{
 const db=load()

 const report=db.users
 .filter(u=>u.role==="teacher")
 .map(t=>{

   const lessons=db.schedule.filter(l=>l.teacher_id===t.id)
   const done=lessons.filter(l=>l.status==="провел")

   return {
     nick:t.nick,
     lessons:done.length,
     pay:done.length*700,
     payinfo:t.payinfo || "",
     id:t.id
   }
 })

 res.json(report)
})

app.get("/teacherLessons/:id",(req,res)=>{
 const db=load()
 const lessons=db.schedule.filter(l=>l.teacher_id==req.params.id)
 res.json(lessons)
})

app.post("/reset",(req,res)=>{
 const db=load()

 db.schedule.forEach(l=>{
   l.status="ожидание"
 })

 save(db)
 res.sendStatus(200)
})

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>console.log("server started on "+PORT))
