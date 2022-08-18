const express = require('express')

const app = express()
const port = 8000

app.set('view engine', 'hbs') // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets')) // path folder assets
app.use(express.urlencoded({extended: false}))

app.get('/', function(request, response){
    response.render('index')
})

app.get('/contact', function(request, response){
    response.render('contact')
})

let isLogin = true

app.get('/add-project', function(request, response){
    response.render('add-project', {isLogin})
})
app.get('/myproject-detail', function(request, response){
    response.render('myproject-detail', {isLogin})
})

app.get('/myproject-detail/:id', function(request, response){
    let id = request.params.id
    console.log(id);

    response.render('myproject-detail', {
        id,
        title: 'Selamat Datang',
        startdate: '23-05-2022',
        enddate: '01-09-2022',
        content: 'lorem ipsum',
        technologies : 'javascript, node js',
    })

})

app.get('/add-project', function(request, response){
    response.render('add-project')
})

app.post('/add-project', function(request, response){
    console.log(request.body);
    let title = request.body.inputTitle
    let content = request.body.inputContent

    console.log(title);
    console.log(content);

    response.redirect('/add-project')
})

app.listen(port, function(){
    console.log(`server running on port ${port}`);
})