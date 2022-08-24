const express = require('express')

const app = express()
const port = 8000

app.set('view engine', 'hbs') // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets')) // path folder assets
app.use(express.urlencoded({extended: false}))

const db = require('./connection/db')

let isLogin = true


app.get('/', function(request, response){


    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        client.query('SELECT * FROM tb_projects', function(err, result){
            if (err) throw err // menampilkan error dari query
            console.log(result.rows);
            let data = result.rows

            let dataProject = data.map(function(item){
                return {
                    ...item,
                    duration: getDistanceTime(item.start_date, item.end_date),
                    isLogin,
                    
                }

            })
            
            response.render('index', {isLogin, dataProject})
 
        }) 
      

    })
 
    
})

app.get('/contact', function(request, response){
    response.render('contact')
})

app.get('/add-project', function(request, response){
    
   


  
})

app.post('/add-project', function(request, response) {
 
})


app.get('/myproject-detail/:index', function(request, response){

    response.render('myproject-detail')
})

app.get('/update-project/:index', function(request, response){

})

app.post('/update-project/:index', function(request, response){

})

app.get('/delete-project/:index', function(request, response){

})



function getDistanceTime(startdate, enddate){

    let stDate = startdate
    let enDate = enddate
  
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