const express = require('express')

const app = express()
const port = 8000

app.set('view engine', 'hbs') // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets')) // path folder assets
app.use(express.urlencoded({extended: false}))


let isLogin = true

let dataProject = []

app.get('/', function(request, response){
console.log(dataProject);

    let data =  dataProject.map(function(item){
        return {
            ...item,
            isLogin,
            duration: getDistanceTime(new Date(item.Startdate),new Date(item.Enddate))
        }

   })

console.log(data);
    response.render('index', {isLogin, dataProject: data})
})

app.get('/contact', function(request, response){
    response.render('contact')
})

app.get('/add-project', function(request, response){
    
    response.render('add-project', {isLogin, dataProject} )
})

app.post('/add-project', function(request, response) {

    let title = request.body.inputTitle
    let Startdate = request.body.Startdate
    let Enddate = request.body.Enddate
    let content = request.body.inputContent


    let project = {
        title,
        Startdate,
        Enddate,
        content,
    }
    
    dataProject.push(project)
    response.redirect('/')
})


app.get('/myproject-detail/:index', function(request, response){
    let index = request.params.index

    let data = dataProject[index] 
    data.duration = getDistanceTime(new Date(data.Startdate),new Date(data.Enddate)) 
    data.startdate = new Date (data.startdate)
    data.enddate = new Date(data.enddate)

    response.render('myproject-detail',{data})
})

app.get('/update-project/:index', function(request, response){
    let index = request.params.index

    let data = {
        title: dataProject[index].title,
        startdate: dataProject[index].startdate,
        enddate: dataProject[index].enddate,
        content: dataProject[index].content

    }

    response.render('update-project', {index, data})
})

app.post('/update-project/:index', function(request, response){

    let index = request.params.index

    dataProject[index].title = request.body.inputTitle
    dataProject[index].startdate = request.body.Startdate
    dataProject[index].enddate = request.body.Enddate
    dataProject[index].content = request.body.inputContent


    response.redirect('/')
})

app.get('/delete-project/:index', function(request, response){
    let index = request.params.index
    dataProject.splice(index, 1)

    response.redirect('/')
})



function getDistanceTime(Startdate, Enddate){

    let stDate = Startdate
    let enDate = Enddate
  
    let distance = enDate - stDate
    console.log(distance);
  
    let milisecond = 1000 // 1 detik 1000 milisecond
    let secondInHours = 3600 // 1 jam sama dengan 3600 detik
    let hoursInDay = 24 // 1 hari 24 jam
    let dayInMonth = 30
    let monthInYear = 12
  
    let distanceYear = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth * monthInYear))
    let distanceMonth = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth))
    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay))
  
  
    if(distanceYear > 0){
  
      return `${distanceYear} year`
    } else if(distanceMonth > 0){
        return `${distanceMonth} month`
    } else {
        return `${distanceDay} day`
    }
     
  }


app.listen(port, function(){
    console.log(`server running on port ${port}`);
})