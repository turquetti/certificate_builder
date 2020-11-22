const fs = require('fs');
const path = require('path');
const express = require('express');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');


const app = express();

// //middleware/routing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// //hbs setup
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

//server config
app.get('/', (req,res) => {
    const test = {
			name: 'Gabriela',
			surname: 'Nunes',
			course: 'Curso Teste',
			date: '23 de novembro de 2020'
        };
	res.render('index', test);
});

//createPDF function
async function createPDF(certificate){
	let templateHtml = fs.readFileSync(path.join(process.cwd(), 'views/index.hbs'), 'utf8');
	let template = handlebars.compile(templateHtml);
	let html = template(certificate);

	let options = {
		width: '1230px',
		headerTemplate: "<p></p>",
		footerTemplate: "<p></p>",
		displayHeaderFooter: false,
		printBackground: true,
	};

	const browser = await puppeteer.launch({
		args: ['--no-sandbox'],
		headless: true
	});

	let page = await browser.newPage();
	
	await page.setContent(`data:html_template;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
    });

	const pdf = await page.pdf(options);
	await browser.close();
	return pdf
}

//post 
app.post('/certificado', (req,res) => {
    createPDF(req.body).then(pdf => {
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
		res.send(pdf)
    })
});

app.listen(5000, () => {
	console.log("App at http://localhost:5000/certificado")
});
